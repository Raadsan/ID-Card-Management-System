"use client";

import React, { useState, useEffect } from "react";
import Modal from "./layout/Modal";
import { createTemplate } from "@/api/idTemplateApi";
import { Loader2, Layout, Image as ImageIcon, CheckCircle2, Shield, FileText, Ruler, User, MapPin, CreditCard, ChevronRight, ChevronLeft } from "lucide-react";

interface AddIdTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddIdTemplateModal: React.FC<AddIdTemplateModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        width: "1000",
        height: "600",
        status: "active",
    });
    const [files, setFiles] = useState<{ front: File | null; back: File | null }>({
        front: null,
        back: null,
    });
    // Local preview URLs for the images selected from disk
    const [previewUrls, setPreviewUrls] = useState<{ front: string | null; back: string | null }>({
        front: null,
        back: null
    });

    const [error, setError] = useState("");

    // Layout Editor State
    const [showFront, setShowFront] = useState(true);
    const [scale, setScale] = useState(0.5);
    const [positions, setPositions] = useState({
        photo: { x: 100, y: 100, width: 150, height: 150 },
        fullName: { x: 50, y: 300, fontSize: 24, color: "#000000" },
        department: { x: 50, y: 340, fontSize: 18, color: "#666666" },
        idNumber: { x: 50, y: 380, fontSize: 16, color: "#000000" }
    });

    // Clean up object URLs when modal closes or files change
    useEffect(() => {
        return () => {
            if (previewUrls.front) URL.revokeObjectURL(previewUrls.front);
            if (previewUrls.back) URL.revokeObjectURL(previewUrls.back);
        };
    }, [previewUrls]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFiles((prev) => ({ ...prev, [side]: file }));

            // Create preview URL
            const url = URL.createObjectURL(file);
            setPreviewUrls(prev => ({ ...prev, [side]: url }));
        }
    };

    const handlePositionChange = (element: keyof typeof positions, field: string, value: any) => {
        setPositions(prev => ({
            ...prev,
            [element]: {
                ...prev[element],
                [field]: value
            }
        }));
    };

    const handleNext = () => {
        setError("");
        if (!formData.name || !formData.width || !formData.height) {
            setError("Required: Name, Width, and Height.");
            return;
        }
        if (!files.front) {
            setError("Front background image is required to proceed layout.");
            return;
        }
        setCurrentStep(2);
    };

    const handleSubmit = async () => {
        setError("");

        try {
            setLoading(true);
            const data = new FormData();
            data.append("name", formData.name);
            data.append("description", formData.description);
            data.append("width", formData.width);
            data.append("height", formData.height);
            data.append("status", formData.status);

            // Append Layout Configuration
            data.append("layout", JSON.stringify(positions));

            if (files.front) data.append("frontBackground", files.front);
            if (files.back) data.append("backBackground", files.back);

            await createTemplate(data);

            // Reset form
            setFormData({ name: "", description: "", width: "1000", height: "600", status: "active" });
            setFiles({ front: null, back: null });
            setPreviewUrls({ front: null, back: null });
            setCurrentStep(1);

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Failed to create template:", err);
            setError(err.response?.data?.error || "Internal error. Failed to create template.");
        } finally {
            setLoading(false);
        }
    };

    const onCloseModal = () => {
        setCurrentStep(1);
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={onCloseModal} title={currentStep === 1 ? "New ID Template - Basic Info" : "Configure Layout"} maxWidth={currentStep === 1 ? "max-w-2xl" : "max-w-6xl"}>
            <div className={`flex flex-col ${currentStep === 2 ? 'h-[80vh]' : ''}`}>
                {error && (
                    <div className="mb-4 mx-4 mt-4 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-100 flex items-center gap-3">
                        <Shield className="h-4 w-4 flex-shrink-0" />
                        <p className="uppercase tracking-wider flex-1 text-center">{error}</p>
                    </div>
                )}

                {/* STEP 1: Basic Info */}
                {currentStep === 1 && (
                    <div className="px-4 py-4 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                    <Layout size={12} className="text-[#16BCF8]" /> Template Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="E.g. Standard Staff ID"
                                    className="w-full rounded-xl border border-gray-200 p-3 text-sm font-bold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30"
                                    required
                                />
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                    <CheckCircle2 size={12} className="text-[#16BCF8]" /> Status
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-200 p-3 text-sm font-bold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            {/* Width */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                    <Ruler size={12} className="text-[#16BCF8]" /> Width (px) *
                                </label>
                                <input
                                    type="number"
                                    name="width"
                                    value={formData.width}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-200 p-3 text-sm font-bold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30"
                                    required
                                />
                            </div>

                            {/* Height */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                    <Ruler size={12} className="text-[#16BCF8]" /> Height (px) *
                                </label>
                                <input
                                    type="number"
                                    name="height"
                                    value={formData.height}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-200 p-3 text-sm font-bold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30"
                                    required
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                <FileText size={12} className="text-[#16BCF8]" /> Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={2}
                                className="w-full rounded-xl border border-gray-200 p-3 text-sm font-semibold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30 resize-none"
                            />
                        </div>

                        {/* File Uploads */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                    <ImageIcon size={12} className="text-[#16BCF8]" /> Front Background *
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, "front")}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#1B1555] file:text-white hover:file:bg-[#16BCF8]"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                    <ImageIcon size={12} className="text-[#16BCF8]" /> Back Background
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, "back")}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#1B1555] file:text-white hover:file:bg-[#16BCF8]"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: Layout Editor */}
                {currentStep === 2 && (
                    <div className="flex-1 overflow-hidden flex flex-col lg:flex-row border-t border-gray-100">
                        {/* Controls Sidebar */}
                        <div className="w-full lg:w-1/3 bg-white border-r border-gray-200 overflow-y-auto p-4 space-y-5 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
                            <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800 border border-blue-100">
                                <strong>Tip:</strong> Adjust the coordinates below to position elements on your template. Use the preview to verify.
                            </div>

                            {/* Photo Settings */}
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                                <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <User className="w-3 h-3 text-blue-500" /> Photo Placeholder
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {['x', 'y', 'width', 'height'].map((field) => (
                                        <div key={field}>
                                            <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">{field}</label>
                                            <input type="number" value={(positions.photo as any)[field]} onChange={e => handlePositionChange('photo', field, +e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm font-mono focus:border-blue-500 focus:ring-0" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Full Name Settings */}
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                                <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <FileText className="w-3 h-3 text-green-500" /> Full Name Text
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {['x', 'y', 'fontSize'].map((field) => (
                                        <div key={field}>
                                            <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">{field === 'fontSize' ? 'Size' : field}</label>
                                            <input type="number" value={(positions.fullName as any)[field]} onChange={e => handlePositionChange('fullName', field, +e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm font-mono focus:border-green-500 focus:ring-0" />
                                        </div>
                                    ))}
                                    <div>
                                        <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">Color</label>
                                        <div className="flex items-center gap-2">
                                            <input type="color" value={positions.fullName.color} onChange={e => handlePositionChange('fullName', 'color', e.target.value)} className="h-9 w-12 p-0.5 border rounded cursor-pointer" />
                                            <span className="text-xs font-mono text-gray-500">{positions.fullName.color}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Department Settings */}
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                                <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <MapPin className="w-3 h-3 text-purple-500" /> Department Text
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {['x', 'y', 'fontSize'].map((field) => (
                                        <div key={field}>
                                            <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">{field === 'fontSize' ? 'Size' : field}</label>
                                            <input type="number" value={(positions.department as any)[field]} onChange={e => handlePositionChange('department', field, +e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm font-mono focus:border-purple-500 focus:ring-0" />
                                        </div>
                                    ))}
                                    <div>
                                        <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">Color</label>
                                        <div className="flex items-center gap-2">
                                            <input type="color" value={positions.department.color} onChange={e => handlePositionChange('department', 'color', e.target.value)} className="h-9 w-12 p-0.5 border rounded cursor-pointer" />
                                            <span className="text-xs font-mono text-gray-500">{positions.department.color}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ID Number Settings */}
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                                <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <CreditCard className="w-3 h-3 text-orange-500" /> ID Number Text
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {['x', 'y', 'fontSize'].map((field) => (
                                        <div key={field}>
                                            <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">{field === 'fontSize' ? 'Size' : field}</label>
                                            <input type="number" value={(positions.idNumber as any)[field]} onChange={e => handlePositionChange('idNumber', field, +e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm font-mono focus:border-orange-500 focus:ring-0" />
                                        </div>
                                    ))}
                                    <div>
                                        <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">Color</label>
                                        <div className="flex items-center gap-2">
                                            <input type="color" value={positions.idNumber.color} onChange={e => handlePositionChange('idNumber', 'color', e.target.value)} className="h-9 w-12 p-0.5 border rounded cursor-pointer" />
                                            <span className="text-xs font-mono text-gray-500">{positions.idNumber.color}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Preview Area */}
                        <div className="flex-1 flex flex-col bg-gray-100/50">
                            {/* Toolbar */}
                            <div className="p-3 bg-white border-b border-gray-200 flex justify-between items-center z-10 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <h3 className="font-bold text-gray-800 text-sm">Preview</h3>
                                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Zoom</span>
                                        <input
                                            type="range"
                                            min="0.3"
                                            max="1.5"
                                            step="0.1"
                                            value={scale}
                                            onChange={(e) => setScale(parseFloat(e.target.value))}
                                            className="w-24 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        />
                                    </div>
                                </div>
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    <button onClick={() => setShowFront(true)} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${showFront ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>Front</button>
                                    <button onClick={() => setShowFront(false)} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${!showFront ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>Back</button>
                                </div>
                            </div>

                            {/* Canvas */}
                            <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-[url('https://repo.sourcelink.com/static/transparent-bg.png')]">
                                <div
                                    className="relative shadow-2xl transition-all duration-300 ring-4 ring-black/5 bg-white scale-container"
                                    style={{
                                        width: `${formData.width}px`,
                                        height: `${formData.height}px`,
                                        transform: `scale(${scale})`,
                                        transformOrigin: 'center',
                                        backgroundImage: `url(${showFront ? previewUrls.front : previewUrls.back})`,
                                        backgroundSize: '100% 100%',
                                        backgroundPosition: 'center',
                                    }}
                                >
                                    {showFront ? (
                                        <>
                                            <div
                                                className="absolute border border-dashed border-blue-400 bg-blue-400/10 flex items-center justify-center text-blue-600 font-bold text-xs"
                                                style={{
                                                    left: `${positions.photo.x}px`,
                                                    top: `${positions.photo.y}px`,
                                                    width: `${positions.photo.width}px`,
                                                    height: `${positions.photo.height}px`,
                                                }}
                                            >
                                                PHOTO
                                            </div>
                                            <div
                                                className="absolute whitespace-nowrap border border-dashed border-transparent hover:border-green-400"
                                                style={{
                                                    left: `${positions.fullName.x}px`,
                                                    top: `${positions.fullName.y}px`,
                                                    fontSize: `${positions.fullName.fontSize}px`,
                                                    color: positions.fullName.color,
                                                    fontFamily: 'Arial, sans-serif',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                Johnathan Doe
                                            </div>
                                            <div
                                                className="absolute whitespace-nowrap border border-dashed border-transparent hover:border-purple-400"
                                                style={{
                                                    left: `${positions.department.x}px`,
                                                    top: `${positions.department.y}px`,
                                                    fontSize: `${positions.department.fontSize}px`,
                                                    color: positions.department.color,
                                                    fontFamily: 'Arial, sans-serif'
                                                }}
                                            >
                                                Software Engineering
                                            </div>
                                            <div
                                                className="absolute whitespace-nowrap border border-dashed border-transparent hover:border-orange-400"
                                                style={{
                                                    left: `${positions.idNumber.x}px`,
                                                    top: `${positions.idNumber.y}px`,
                                                    fontSize: `${positions.idNumber.fontSize}px`,
                                                    color: positions.idNumber.color,
                                                    fontFamily: 'Courier New, monospace',
                                                    letterSpacing: '1px'
                                                }}
                                            >
                                                EMP-1024
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-lg uppercase tracking-widest">
                                            Back Side Preview
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Buttons */}
                <div className="mt-auto px-6 py-4 border-t border-gray-100 flex justify-between bg-white">
                    {currentStep === 2 && (
                        <button
                            onClick={() => setCurrentStep(1)}
                            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-bold text-gray-600 transition-all hover:bg-gray-50 active:scale-95 shadow-sm"
                        >
                            <ChevronLeft size={16} /> Back to Setup
                        </button>
                    )}

                    <div className="flex gap-3 ml-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl px-6 py-2.5 text-sm font-black text-gray-400 uppercase tracking-widest transition-all hover:bg-gray-100 active:scale-95"
                        >
                            Cancel
                        </button>

                        {currentStep === 1 ? (
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-2 rounded-xl bg-[#1B1555] px-8 py-2.5 text-sm font-black text-white uppercase tracking-[0.1em] shadow-lg shadow-[#1B1555]/20 transition-all hover:bg-[#16BCF8] hover:shadow-[#16BCF8]/40 hover:-translate-y-0.5 active:scale-95"
                            >
                                Next Step <ChevronRight size={16} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex items-center gap-2 rounded-xl bg-green-600 px-8 py-2.5 text-sm font-black text-white uppercase tracking-[0.1em] shadow-lg shadow-green-600/20 transition-all hover:bg-green-500 hover:shadow-green-500/40 hover:-translate-y-0.5 active:scale-95"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                Save Template
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default AddIdTemplateModal;
