"use client";

import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, User, FileText, MapPin, CreditCard, RefreshCw, LayoutTemplate, Users, Download, Loader2 } from "lucide-react";
import { getEmployees } from "@/api/employeeApi";
import { getAllTemplates, IdCardTemplate } from "@/api/idTemplateApi";

interface Employee {
    id: number;
    user: {
        id: number;
        fullName: string;
        email: string;
        phone?: string;
        photo?: string;
    };
    department: {
        id: number;
        departmentName: string;
    };
    title?: string;
}

interface GenerateIdModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SERVER_URL = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5000';

export default function GenerateIdModal({ isOpen, onClose }: GenerateIdModalProps) {

    const [currentStep, setCurrentStep] = useState(1);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [templates, setTemplates] = useState<IdCardTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFront, setShowFront] = useState(true);

    // Form Data
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

    // Positions State (Loaded from Template, Read-Only here)
    const [positions, setPositions] = useState({
        photo: { x: 100, y: 100, width: 150, height: 150 },
        fullName: { x: 175, y: 280, fontSize: 24, color: "#000000" },
        department: { x: 175, y: 320, fontSize: 18, color: "#666666" },
        idNumber: { x: 175, y: 360, fontSize: 16, color: "#000000" }
    });

    // Zoom State
    const [scale, setScale] = useState(0.8);

    // Derived State
    const selectedEmployee = employees.find(e => e.id.toString() === selectedEmployeeId) || null;
    const selectedTemplate = templates.find(t => t.id.toString() === selectedTemplateId) || null;

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    // Load layout when template changes
    useEffect(() => {
        if (selectedTemplate && selectedTemplate.layout) {
            try {
                const layoutData = typeof selectedTemplate.layout === 'string' ? JSON.parse(selectedTemplate.layout) : selectedTemplate.layout;
                setPositions(prev => ({ ...prev, ...layoutData }));
            } catch (e) {
                console.error("Error parsing template layout", e);
            }
        }
    }, [selectedTemplate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [employeesData, templatesData] = await Promise.all([
                getEmployees(),
                getAllTemplates()
            ]);
            setEmployees(Array.isArray(employeesData) ? employeesData : []);
            setTemplates(Array.isArray(templatesData) ? templatesData.filter((t: IdCardTemplate) => t.status === 'active') : []);
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
        setShowFront(true);
        onClose();
    };

    const getImageUrl = (path?: string) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        // Construct full URL
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        // If it looks like a raw filename (no slashes), assume it goes to /uploads/
        if (!cleanPath.includes('/') && !cleanPath.includes('\\')) {
            return `${SERVER_URL}/uploads/${cleanPath}`;
        }
        return `${SERVER_URL}/${cleanPath}`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
            <div className={`bg-white rounded-2xl shadow-2xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${currentStep === 1 ? 'max-w-2xl h-auto' : 'max-w-5xl h-[85vh]'
                }`}>
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-white">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Create ID Card</h2>
                        <p className="text-sm text-gray-500 mt-1 font-medium">Step {currentStep} of 2 • {
                            currentStep === 1 ? 'Select Info' : 'Preview & Generate'
                        }</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                    >
                        <X className="h-6 w-6" />
                    </button>
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
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.user.fullName} — {emp.department.departmentName}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                        <ChevronRight className="w-5 h-5 rotate-90" />
                                    </div>
                                </div>
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

                            {/* Preview Selected Info */}
                            {selectedEmployee && selectedTemplate && (
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                    <div className="bg-blue-100 p-2 rounded-lg">
                                        <RefreshCw className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-blue-900">Ready to Preview</p>
                                        <p className="text-sm text-blue-700 mt-1">
                                            Creating card for <span className="font-bold">{selectedEmployee.user.fullName}</span> using <span className="font-bold">{selectedTemplate.name}</span> layout.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 2: Preview Only */}
                    {currentStep === 2 && (
                        <div className="flex-1 flex flex-col h-full">
                            {/* Toolbar (Zoom & Toggle) */}
                            <div className="px-6 py-3 bg-white border-b border-gray-200 flex justify-between items-center z-10 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <h3 className="font-bold text-gray-800 text-sm hidden md:block">Live Preview</h3>
                                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                                        <span className="text-xs font-bold text-gray-500 uppercase">Zoom</span>
                                        <input
                                            type="range"
                                            min="0.3"
                                            max="1.5"
                                            step="0.1"
                                            value={scale}
                                            onChange={(e) => setScale(parseFloat(e.target.value))}
                                            className="w-24 md:w-32 h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        />
                                        <span className="text-xs font-mono text-gray-600 w-8">{Math.round(scale * 100)}%</span>
                                    </div>
                                </div>
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setShowFront(true)}
                                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${showFront ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        Front
                                    </button>
                                    <button
                                        onClick={() => setShowFront(false)}
                                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${!showFront ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        Back
                                    </button>
                                </div>
                            </div>

                            {/* Canvas Area */}
                            <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-[url('https://repo.sourcelink.com/static/transparent-bg.png')] bg-gray-100">
                                <div
                                    className="relative shadow-2xl transition-all duration-300 ring-4 ring-black/5 bg-white scale-container"
                                    style={{
                                        transform: `scale(${scale})`,
                                        transformOrigin: 'center',
                                        width: `${selectedTemplate?.width}px`,
                                        height: `${selectedTemplate?.height}px`,
                                        backgroundImage: `url(${getImageUrl(
                                            showFront ? selectedTemplate?.frontBackground : selectedTemplate?.backBackground
                                        )})`,
                                        backgroundSize: '100% 100%',
                                        backgroundPosition: 'center',
                                        backgroundColor: 'white'
                                    }}
                                >
                                    {showFront && (
                                        <>
                                            {/* Layers */}
                                            <div
                                                className="absolute overflow-hidden"
                                                style={{
                                                    left: `${positions.photo.x}px`,
                                                    top: `${positions.photo.y}px`,
                                                    width: `${positions.photo.width}px`,
                                                    height: `${positions.photo.height}px`,
                                                }}
                                            >
                                                {selectedEmployee?.user.photo ? (
                                                    <img
                                                        src={getImageUrl(selectedEmployee.user.photo) || ''}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs border border-dashed border-gray-400">
                                                        P/H
                                                    </div>
                                                )}
                                            </div>
                                            <div
                                                className="absolute whitespace-nowrap"
                                                style={{
                                                    left: `${positions.fullName.x}px`,
                                                    top: `${positions.fullName.y}px`,
                                                    fontSize: `${positions.fullName.fontSize}px`,
                                                    color: positions.fullName.color,
                                                    fontFamily: 'Arial, sans-serif',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {selectedEmployee?.user.fullName}
                                            </div>
                                            <div
                                                className="absolute whitespace-nowrap"
                                                style={{
                                                    left: `${positions.department.x}px`,
                                                    top: `${positions.department.y}px`,
                                                    fontSize: `${positions.department.fontSize}px`,
                                                    color: positions.department.color,
                                                    fontFamily: 'Arial, sans-serif'
                                                }}
                                            >
                                                {selectedEmployee?.department.departmentName}
                                            </div>
                                            <div
                                                className="absolute whitespace-nowrap"
                                                style={{
                                                    left: `${positions.idNumber.x}px`,
                                                    top: `${positions.idNumber.y}px`,
                                                    fontSize: `${positions.idNumber.fontSize}px`,
                                                    color: positions.idNumber.color,
                                                    fontFamily: 'Courier New, monospace',
                                                    letterSpacing: '1px'
                                                }}
                                            >
                                                EMP-{selectedEmployee?.id.toString().padStart(4, '0')}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-white">
                    {currentStep === 2 && (
                        <button
                            onClick={handleBack}
                            className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
                        >
                            <ChevronLeft className="w-4 h-4" /> Back to Selection
                        </button>
                    )}

                    {currentStep === 1 ? (
                        <button
                            onClick={handleNext}
                            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 flex items-center gap-2"
                        >
                            Next Step <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={() => alert('Generate API call here')}
                            className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg hover:shadow-green-500/30 flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" /> Create ID Card
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
