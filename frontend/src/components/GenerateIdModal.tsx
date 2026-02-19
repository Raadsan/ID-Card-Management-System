"use client";

import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, User, FileText, MapPin, CreditCard, RefreshCw, LayoutTemplate, Users, Download, Loader2, Calendar, QrCode } from "lucide-react";
import { getEmployees } from "@/api/employeeApi";
import { getAllTemplates, IdCardTemplate } from "@/api/idTemplateApi";
import { createIdGenerate, getAllIdGenerates, IdGenerate } from "@/api/generateIdApi";
import { getImageUrl } from "@/utils/url";
import { IdCardPreview, DEFAULT_POSITIONS, IdTemplatePositions } from "./IdTemplateLayout";


interface Employee {
    id: number;
    fullName: string;
    email: string;
    phone?: string;
    photo?: string;
    department: {
        id: number;
        departmentName: string;
    };
    status: string;
    title?: string;
    transfers: any[];
    idGenerates: any[];
}

interface GenerateIdModalProps {
    isOpen: boolean;
    onClose: () => void;
}



const ID_TEXT_STYLE = {
    fontFamily: '"Outfit", sans-serif',
    letterSpacing: "0.5px",
    fontSize: "14px",
    textTransform: "uppercase" as const
};

export default function GenerateIdModal({ isOpen, onClose }: GenerateIdModalProps) {

    const [currentStep, setCurrentStep] = useState(1);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [generatedIds, setGeneratedIds] = useState<IdGenerate[]>([]);
    const [templates, setTemplates] = useState<IdCardTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showFront, setShowFront] = useState(true);

    // Form Data
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
    const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [expiryDate, setExpiryDate] = useState<string>("");


    const [positions, setPositions] = useState<IdTemplatePositions>(DEFAULT_POSITIONS);

    // Zoom State
    const [scale, setScale] = useState(0.8);

    // Derived State
    const filteredEmployees = employees.filter(emp => {
        // 1. Only include active employees
        if (emp.status !== "active") return false;

        // 2. Only display employees who don't have ANY id-card records yet
        // (This includes 'created', 'ready_to_print', 'printed', and 'replaced')
        const hasIdHistory = emp.idGenerates && emp.idGenerates.length > 0;

        // 3. Remove employees who have transferred departments
        const hasTransferHistory = emp.transfers && emp.transfers.length > 0;

        return !hasIdHistory && !hasTransferHistory;
    });

    const selectedEmployee = employees.find(e => e.id.toString() === selectedEmployeeId) || null;
    const selectedTemplate = templates.find(t => t.id.toString() === selectedTemplateId) || null;

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    useEffect(() => {
        if (selectedTemplate && selectedTemplate.layout) {
            try {
                const layoutData = typeof selectedTemplate.layout === 'string' ? JSON.parse(selectedTemplate.layout) : selectedTemplate.layout;
                setPositions(prev => {
                    const merged: IdTemplatePositions = { ...prev };
                    Object.keys(layoutData).forEach(key => {
                        if ((prev as any)[key]) {
                            (merged as any)[key] = { ...((prev as any)[key] as any), ...layoutData[key] };
                        } else {
                            (merged as any)[key] = layoutData[key];
                        }
                    });
                    // Fallback for barcode/qrCode naming differences
                    if (layoutData.barcode && !layoutData.qrCode) {
                        merged.qrCode = { ...merged.qrCode, ...layoutData.barcode };
                    }
                    return merged;
                });
            } catch (e) {
                console.error("Error parsing template layout", e);
            }
        }
    }, [selectedTemplate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [employeesData, templatesData, generatedData] = await Promise.all([
                getEmployees(),
                getAllTemplates(),
                getAllIdGenerates()
            ]);
            setEmployees(Array.isArray(employeesData) ? employeesData : []);
            setTemplates(Array.isArray(templatesData) ? templatesData.filter((t: IdCardTemplate) => t.status === 'active') : []);
            setGeneratedIds(Array.isArray(generatedData) ? generatedData : []);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (!selectedEmployeeId) {
            alert("Please select an employee");
            return;
        }
        if (!selectedTemplateId) {
            alert("Please select a template");
            return;
        }
        setCurrentStep(2);
    };

    const handleBack = () => {
        setCurrentStep(1);
    };

    const handleClose = () => {
        setCurrentStep(1);
        setSelectedEmployeeId("");
        setSelectedTemplateId("");
        setSubmitting(false);
        setShowFront(true);
        onClose();
    };

    const handleGenerate = async () => {
        if (!selectedEmployeeId || !selectedTemplateId) return;

        try {
            setSubmitting(true);
            await createIdGenerate({
                employeeId: Number(selectedEmployeeId),
                templateId: Number(selectedTemplateId),
                issueDate,
                expiryDate
            });
            handleClose();
        } catch (error: any) {
            console.error("Failed to generate ID:", error);
            alert(error.response?.data?.message || "Failed to generate ID card");
        } finally {
            setSubmitting(false);
        }
    };



    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
            <div className={`bg-white rounded-2xl shadow-2xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${currentStep === 1 ? 'max-w-2xl h-auto' : 'max-w-5xl h-[85vh]'
                }`}>
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Create ID Card</h2>
                            <p className="text-[10px] text-gray-500 mt-0.5 font-bold uppercase tracking-widest">
                                Step {currentStep} of 2 • {currentStep === 1 ? 'Primary Information' : 'Final Preview & Security Check'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleClose}
                            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 group"
                        >
                            <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-100 h-1">
                    <div
                        className="h-full bg-blue-600 transition-all duration-500 ease-out"
                        style={{ width: `${(currentStep / 2) * 100}%` }}
                    />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col bg-gray-50/50">

                    {/* STEP 1: Selection Dropdowns */}
                    {currentStep === 1 && (
                        <>
                            <div className="p-8 space-y-8">
                                {/* Employee Select */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
                                        <Users className="w-4 h-4 text-blue-500" /> Select Employee
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={selectedEmployeeId}
                                            onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                            className="w-full pl-4 pr-10 py-3 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer text-gray-700 shadow-sm hover:border-gray-400"
                                        >
                                            <option value="">-- Choose Employee --</option>
                                            {filteredEmployees.map(emp => (
                                                <option key={emp.id} value={emp.id}>
                                                    {emp.fullName} — {emp.department.departmentName}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                            <ChevronRight className="w-5 h-5 rotate-90" />
                                        </div>
                                    </div>
                                    {filteredEmployees.length === 0 && !loading && (
                                        <p className="text-xs text-amber-600 font-medium">All employees already have generated ID cards.</p>
                                    )}
                                </div>

                                {/* Template Select */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
                                        <LayoutTemplate className="w-4 h-4 text-purple-500" /> Select Template
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={selectedTemplateId}
                                            onChange={(e) => setSelectedTemplateId(e.target.value)}
                                            className="w-full pl-4 pr-10 py-3 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all appearance-none cursor-pointer text-gray-700 shadow-sm hover:border-gray-400"
                                        >
                                            <option value="">-- Choose Template --</option>
                                            {templates.map(tpl => (
                                                <option key={tpl.id} value={tpl.id}>
                                                    {tpl.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                            <ChevronRight className="w-5 h-5 rotate-90" />
                                        </div>
                                    </div>
                                </div>

                                {/* Date Inputs */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
                                            <Calendar className="w-4 h-4 text-amber-500" /> Issue Date
                                        </label>
                                        <input
                                            type="date"
                                            value={issueDate}
                                            onChange={(e) => setIssueDate(e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all text-gray-700 shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
                                            <Calendar className="w-4 h-4 text-red-500" /> Expiry Date
                                        </label>
                                        <input
                                            type="date"
                                            value={expiryDate}
                                            onChange={(e) => setExpiryDate(e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all text-gray-700 shadow-sm font-medium"
                                        />
                                    </div>
                                </div>

                                {/* Preview Selected Info */}
                                {selectedEmployee && selectedTemplate && (
                                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                        <div className="bg-blue-100 p-2 rounded-lg">
                                            <RefreshCw className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-blue-900">Ready to Preview</p>
                                            <p className="text-sm text-blue-700 mt-1">
                                                Creating card for <span className="font-bold">{selectedEmployee.fullName}</span> using <span className="font-bold">{selectedTemplate.name}</span> layout.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* Footer Buttons for Step 1 */}
                            <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-white">
                                <button
                                    onClick={handleClose}
                                    className="px-6 py-3 bg-gray-100 text-gray-500 font-bold rounded-xl hover:bg-gray-200 transition-all border border-gray-200 shadow-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 flex items-center gap-2"
                                >
                                    Next Step <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </>
                    )}

                    {/* STEP 2 LAYOUT (Full Preview - Matches ViewIdModal Visuals) */}
                    {currentStep === 2 && (
                        <div className="flex-1 flex flex-col h-full bg-gray-50">
                            {/* Header (Matches ViewIdModal) */}
                            <div className="p-5 border-b border-gray-100 bg-white flex justify-between items-center px-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                        <CreditCard className="w-4 h-4" />
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-sm">Design Preview</h3>
                                </div>
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setShowFront(true)}
                                        className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${showFront ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                    >
                                        Front
                                    </button>
                                    <button
                                        onClick={() => setShowFront(false)}
                                        className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${!showFront ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                    >
                                        Back
                                    </button>
                                </div>
                            </div>

                            {/* Main Canvas Area */}
                            <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-[url('https://repo.sourcelink.com/static/transparent-bg.png')] min-h-[400px] relative">
                                <div className="relative group">
                                    {/* Floating Zoom Slider Overlay */}
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center gap-3">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Zoom</span>
                                        <input
                                            type="range"
                                            min="0.3"
                                            max="1.5"
                                            step="0.05"
                                            value={scale}
                                            onChange={(e) => setScale(parseFloat(e.target.value))}
                                            className="w-24 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        />
                                        <span className="text-[10px] font-mono font-bold text-blue-600">{Math.round(scale * 100)}%</span>
                                    </div>

                                    {/* Manual Card Render (Copied from ViewIdModal) */}
                                    <div
                                        className="relative shadow-2xl ring-4 ring-black/5 bg-white overflow-hidden transition-transform duration-300 transform-gpu"
                                        style={{
                                            transform: `scale(${scale})`,
                                            width: `${selectedTemplate?.width || 350}px`,
                                            height: `${selectedTemplate?.height || 500}px`,
                                            backgroundImage: `url(${getImageUrl(showFront ? selectedTemplate?.frontBackground : selectedTemplate?.backBackground)})`,
                                            backgroundSize: '100% 100%',
                                            backgroundPosition: 'center',
                                            backgroundColor: 'white'
                                        }}
                                    >
                                        {showFront && (
                                            <>
                                                {/* Photo */}
                                                <div
                                                    className="absolute overflow-hidden"
                                                    style={{
                                                        left: `${positions.photo.x}px`,
                                                        top: `${positions.photo.y}px`,
                                                        width: `${positions.photo.width}px`,
                                                        height: `${positions.photo.height}px`,
                                                    }}
                                                >
                                                    <img
                                                        src={getImageUrl(selectedEmployee?.photo) || '/placeholder-user.png'}
                                                        alt=""
                                                        className="w-full h-full"
                                                        style={{ objectFit: (positions.photo as any).objectFit || 'cover' }}
                                                    />
                                                </div>

                                                {/* Full Name */}
                                                <div
                                                    className="absolute whitespace-nowrap overflow-hidden"
                                                    style={{
                                                        ...ID_TEXT_STYLE,
                                                        left: `${positions.fullName.x}px`,
                                                        top: `${positions.fullName.y}px`,
                                                        fontSize: `${(positions.fullName as any).fontSize || 24}px`,
                                                        fontWeight: (positions.fullName as any).fontWeight || 'normal',
                                                        textAlign: (positions.fullName as any).textAlign || 'left',
                                                        color: positions.fullName.color,
                                                        maxWidth: `${(selectedTemplate?.width || 350) - positions.fullName.x - 20}px`,
                                                        textOverflow: 'ellipsis',
                                                        letterSpacing: '2px',
                                                    }}
                                                >
                                                    {selectedEmployee?.fullName}
                                                </div>

                                                {/* Title */}
                                                <div
                                                    className="absolute whitespace-nowrap overflow-hidden"
                                                    style={{
                                                        ...ID_TEXT_STYLE,
                                                        left: `${positions.title.x}px`,
                                                        top: `${positions.title.y}px`,
                                                        fontSize: `${(positions.title as any).fontSize || 18}px`,
                                                        fontWeight: (positions.title as any).fontWeight || 'normal',
                                                        textAlign: (positions.title as any).textAlign || 'left',
                                                        color: (positions.title as any).color || '#000000',
                                                        maxWidth: `${(selectedTemplate?.width || 350) - positions.title.x - 20}px`,
                                                        textOverflow: 'ellipsis'
                                                    }}
                                                >
                                                    {selectedEmployee?.title || 'Staff'}
                                                </div>

                                                {/* Department */}
                                                <div
                                                    className="absolute whitespace-nowrap overflow-hidden"
                                                    style={{
                                                        ...ID_TEXT_STYLE,
                                                        left: `${positions.department.x}px`,
                                                        top: `${positions.department.y}px`,
                                                        fontSize: `${(positions.department as any).fontSize || 18}px`,
                                                        fontWeight: (positions.department as any).fontWeight || 'normal',
                                                        textAlign: (positions.department as any).textAlign || 'left',
                                                        color: positions.department.color,
                                                        maxWidth: `${(selectedTemplate?.width || 350) - positions.department.x - 20}px`,
                                                        textOverflow: 'ellipsis'
                                                    }}
                                                >
                                                    {selectedEmployee?.department.departmentName}
                                                </div>

                                                {/* Issue Date */}
                                                <div
                                                    className="absolute whitespace-nowrap overflow-hidden"
                                                    style={{
                                                        ...ID_TEXT_STYLE,
                                                        left: `${(positions as any).issueDate?.x || 0}px`,
                                                        top: `${(positions as any).issueDate?.y || 0}px`,
                                                        fontSize: `${(positions as any).issueDate?.fontSize || 16}px`,
                                                        fontWeight: (positions as any).issueDate?.fontWeight || 'normal',
                                                        textAlign: (positions as any).issueDate?.textAlign || 'left',
                                                        color: (positions as any).issueDate?.color || '#000000',
                                                        maxWidth: `${(selectedTemplate?.width || 350) - ((positions as any).issueDate?.x || 0) - 20}px`,
                                                        textOverflow: 'ellipsis'
                                                    }}
                                                >
                                                    ISSUE: {issueDate ? new Date(issueDate).toLocaleDateString() : '01/01/2026'}
                                                </div>

                                                {/* Expiry Date */}
                                                <div
                                                    className="absolute whitespace-nowrap overflow-hidden"
                                                    style={{
                                                        ...ID_TEXT_STYLE,
                                                        left: `${positions.expiryDate.x}px`,
                                                        top: `${positions.expiryDate.y}px`,
                                                        fontSize: `${(positions.expiryDate as any).fontSize || 16}px`,
                                                        fontWeight: (positions.expiryDate as any).fontWeight || 'normal',
                                                        textAlign: (positions.expiryDate as any).textAlign || 'left',
                                                        color: (positions.expiryDate as any).color || '#000000',
                                                        maxWidth: `${(selectedTemplate?.width || 350) - positions.expiryDate.x - 20}px`,
                                                        textOverflow: 'ellipsis'
                                                    }}
                                                >
                                                    EXP: {expiryDate ? new Date(expiryDate).toLocaleDateString() : '31/12/2026'}
                                                </div>

                                                {/* ID Number (Centered under photo logic) */}
                                                <div
                                                    className="absolute whitespace-nowrap overflow-hidden"
                                                    style={{
                                                        ...ID_TEXT_STYLE,
                                                        left: `${positions.photo.x}px`,
                                                        top: `${positions.idNumber.y}px`,
                                                        width: `${positions.photo.width}px`,
                                                        fontSize: `22px`,
                                                        fontWeight: 'bold',
                                                        textAlign: 'center',
                                                        fontFamily: 'monospace',
                                                        color: positions.idNumber.color,
                                                        maxWidth: `${positions.photo.width}px`,
                                                        textOverflow: 'ellipsis'
                                                    }}
                                                >
                                                    S/N: SPA01{selectedEmployee?.id.toString().padStart(4, '0') || '0000'}/26
                                                </div>
                                            </>
                                        )}

                                        {/* Back Side - QR Code Placeholder */}
                                        {!showFront && positions.qrCode && (
                                            <div
                                                className="absolute overflow-hidden flex items-center justify-center p-1 bg-white border border-dashed border-gray-300"
                                                style={{
                                                    left: `${positions.qrCode.x}px`,
                                                    top: `${positions.qrCode.y}px`,
                                                    width: `${positions.qrCode.width}px`,
                                                    height: `${positions.qrCode.height}px`,
                                                }}
                                            >
                                                <div className="flex flex-col items-center justify-center text-center opacity-50">
                                                    <QrCode className="w-8 h-8 text-gray-400 mb-1" />
                                                    <span className="text-[6px] font-bold text-gray-400 uppercase">QR Will Generate</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-white">
                                <div className="flex gap-3 mr-auto">
                                    <button
                                        onClick={handleBack}
                                        className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
                                    >
                                        <ChevronLeft className="w-4 h-4" /> Go Back
                                    </button>
                                </div>

                                <button
                                    onClick={handleClose}
                                    className="px-6 py-3 bg-gray-100 text-gray-500 font-bold rounded-xl hover:bg-gray-200 transition-all border border-gray-200 shadow-sm"
                                >
                                    Close
                                </button>

                                <button
                                    onClick={handleGenerate}
                                    disabled={submitting}
                                    className="px-8 py-3 bg-[#1B1555]  text-white font-bold rounded-xl hover:bg-[#16BCF8] transition-all shadow-lg hover:shadow-green-500/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-4 h-4" /> Create ID Card
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}</div>
            </div>
        </div >
    );
}
