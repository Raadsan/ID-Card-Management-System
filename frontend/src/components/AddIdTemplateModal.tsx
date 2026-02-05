"use client";

import React, { useState, useEffect } from "react";
import Modal from "./layout/Modal";
import { createTemplate } from "@/api/idTemplateApi";
import { Loader2, Layout, Image as ImageIcon, CheckCircle2, Shield, FileText, Ruler, User, MapPin, CreditCard, ChevronRight, ChevronLeft, QrCode, Type, Bold } from "lucide-react";

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
    const [scale, setScale] = useState(0.5);
    const [positions, setPositions] = useState({
        photo: { x: 50, y: 155, width: 275, height: 325 },
        fullName: { x: 360, y: 245, fontSize: 24, color: "#000000", fontWeight: "bold" },
        title: { x: 360, y: 315, fontSize: 18, color: "#000000", fontWeight: "normal" },
        department: { x: 360, y: 385, fontSize: 18, color: "#000000", fontWeight: "normal" },
        idNumber: { x: 160, y: 505, fontSize: 24, color: "#1B1555", fontWeight: "bold" },
        expiryDate: { x: 360, y: 455, fontSize: 18, color: "#000000", fontWeight: "normal" },
        qrCode: { x: 125, y: 125, width: 100, height: 100 }
    });

    // DRAG AND DROP LOGIC
    const [isDragging, setIsDragging] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent, element: keyof typeof positions) => {
        e.preventDefault();
        setIsDragging(element);
        setDragOffset({
            x: e.clientX - (positions[element] as any).x * scale,
            y: e.clientY - (positions[element] as any).y * scale
        });
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                const newX = (e.clientX - dragOffset.x) / scale;
                const newY = (e.clientY - dragOffset.y) / scale;

                setPositions(prev => ({
                    ...prev,
                    [isDragging]: {
                        ...prev[isDragging as keyof typeof positions],
                        x: Math.round(newX),
                        y: Math.round(newY)
                    }
                }));
            }
        };

        const handleMouseUp = () => {
            setIsDragging(null);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset, scale]);

    // Clean up object URLs ONLY on unmount to prevent breaking previews when updating state
    useEffect(() => {
        return () => {
            // Only runs when the modal component is actually destroyed
            if (previewUrls.front) URL.revokeObjectURL(previewUrls.front);
            if (previewUrls.back) URL.revokeObjectURL(previewUrls.back);
        };
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // If we already have a preview URL for this side, revoke it before creating a new one
            // to avoid memory leaks while KEEPING the other side intact.
            if (previewUrls[side]) {
                URL.revokeObjectURL(previewUrls[side]!);
            }

            setFiles((prev) => ({ ...prev, [side]: file }));

            // Create new preview URL
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
            setError("Please upload a front background image to continue.");
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
                                {previewUrls.front && (
                                    <div className="mt-2 relative aspect-video rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm">
                                        <img src={previewUrls.front} alt="Front preview" className="w-full h-full object-contain" />
                                    </div>
                                )}
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
                                {previewUrls.back && (
                                    <div className="mt-2 relative aspect-video rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm">
                                        <img src={previewUrls.back} alt="Back preview" className="w-full h-full object-contain" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: Layout Editor */}
                {currentStep === 2 && (
                    <div className="flex-1 overflow-hidden flex flex-col lg:flex-row border-t border-gray-100">
                        {/* Controls Sidebar */}
                        <div className="w-full lg:w-1/3 shrink-0 min-w-[320px] bg-white border-r border-gray-200 overflow-y-auto p-4 space-y-5 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
                            <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800 border border-blue-100">
                                <strong>Tip:</strong> Drag elements on the cards to position them, or use these controls.
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
                                        <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">Style</label>
                                        <div className="flex items-center gap-2">
                                            <input type="color" value={positions.fullName.color} onChange={e => handlePositionChange('fullName', 'color', e.target.value)} className="h-9 w-12 p-0.5 border rounded cursor-pointer" />
                                            <button onClick={() => handlePositionChange('fullName', 'fontWeight', positions.fullName.fontWeight === 'bold' ? 'normal' : 'bold')} className={`p-2 rounded border ${positions.fullName.fontWeight === 'bold' ? 'bg-green-100 border-green-200 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                                                <Bold size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Job Title Settings */}
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                                <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <User className="w-3 h-3 text-indigo-500" /> Job Title Text
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {['x', 'y', 'fontSize'].map((field) => (
                                        <div key={field}>
                                            <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">{field === 'fontSize' ? 'Size' : field}</label>
                                            <input type="number" value={(positions.title as any)[field]} onChange={e => handlePositionChange('title', field, +e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm font-mono focus:border-indigo-500 focus:ring-0" />
                                        </div>
                                    ))}
                                    <div>
                                        <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">Style</label>
                                        <div className="flex items-center gap-2">
                                            <input type="color" value={positions.title.color} onChange={e => handlePositionChange('title', 'color', e.target.value)} className="h-9 w-12 p-0.5 border rounded cursor-pointer" />
                                            <button onClick={() => handlePositionChange('title', 'fontWeight', positions.title.fontWeight === 'bold' ? 'normal' : 'bold')} className={`p-2 rounded border ${positions.title.fontWeight === 'bold' ? 'bg-indigo-100 border-indigo-200 text-indigo-700' : 'bg-gray-50 text-gray-400'}`}>
                                                <Bold size={14} />
                                            </button>
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
                                        <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">Style</label>
                                        <div className="flex items-center gap-2">
                                            <input type="color" value={positions.department.color} onChange={e => handlePositionChange('department', 'color', e.target.value)} className="h-9 w-12 p-0.5 border rounded cursor-pointer" />
                                            <button onClick={() => handlePositionChange('department', 'fontWeight', positions.department.fontWeight === 'bold' ? 'normal' : 'bold')} className={`p-2 rounded border ${positions.department.fontWeight === 'bold' ? 'bg-purple-100 border-purple-200 text-purple-700' : 'bg-gray-50 text-gray-400'}`}>
                                                <Bold size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Expiry Date Settings */}
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                                <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <Type className="w-3 h-3 text-pink-500" /> Expiry Date Text
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {['x', 'y', 'fontSize'].map((field) => (
                                        <div key={field}>
                                            <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">{field === 'fontSize' ? 'Size' : field}</label>
                                            <input type="number" value={(positions.expiryDate as any)[field]} onChange={e => handlePositionChange('expiryDate', field, +e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm font-mono focus:border-pink-500 focus:ring-0" />
                                        </div>
                                    ))}
                                    <div>
                                        <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">Style</label>
                                        <div className="flex items-center gap-2">
                                            <input type="color" value={positions.expiryDate.color} onChange={e => handlePositionChange('expiryDate', 'color', e.target.value)} className="h-9 w-12 p-0.5 border rounded cursor-pointer" />
                                            <button onClick={() => handlePositionChange('expiryDate', 'fontWeight', positions.expiryDate.fontWeight === 'bold' ? 'normal' : 'bold')} className={`p-2 rounded border ${positions.expiryDate.fontWeight === 'bold' ? 'bg-pink-100 border-pink-200 text-pink-700' : 'bg-gray-50 text-gray-400'}`}>
                                                <Bold size={14} />
                                            </button>
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
                                        <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">Style</label>
                                        <div className="flex items-center gap-2">
                                            <input type="color" value={positions.idNumber.color} onChange={e => handlePositionChange('idNumber', 'color', e.target.value)} className="h-9 w-12 p-0.5 border rounded cursor-pointer" />
                                            <button onClick={() => handlePositionChange('idNumber', 'fontWeight', positions.idNumber.fontWeight === 'bold' ? 'normal' : 'bold')} className={`p-2 rounded border ${positions.idNumber.fontWeight === 'bold' ? 'bg-orange-100 border-orange-200 text-orange-700' : 'bg-gray-50 text-gray-400'}`}>
                                                <Bold size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* QR Code Settings */}
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                                <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <QrCode className="w-3 h-3 text-gray-800" /> Back QR Code
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {['x', 'y', 'width', 'height'].map((field) => (
                                        <div key={field}>
                                            <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">{field}</label>
                                            <input type="number" value={(positions.qrCode as any)[field]} onChange={e => handlePositionChange('qrCode', field, +e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm font-mono focus:border-gray-800 focus:ring-0" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Preview Area */}
                        <div className="flex-1 flex flex-col bg-gray-100/50">
                            {/* Toolbar */}
                            <div className="p-3 bg-white border-b border-gray-200 flex justify-between items-center z-10 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <h3 className="font-bold text-gray-800 text-sm italic underline">Design Preview (Front & Back)</h3>
                                    <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-inner">
                                        <span className="text-[10px] font-black text-blue-500 uppercase">Zoom All</span>
                                        <input
                                            type="range"
                                            min="0.2"
                                            max="1.2"
                                            step="0.05"
                                            value={scale}
                                            onChange={(e) => setScale(parseFloat(e.target.value))}
                                            className="w-32 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        />
                                    </div>
                                </div>
                                <div className="text-[10px] font-black text-gray-400 uppercase bg-white px-4 py-1.5 rounded-full border border-gray-100 shadow-sm">
                                    Scroll down to see the Back side
                                </div>
                            </div>

                            {/* Duo Canvas Area */}
                            <div className="flex-1 overflow-auto p-12 bg-[#F8FAFC]">
                                <div className="flex flex-col items-center gap-20 min-h-full pb-32">

                                    {/* FRONT CARD */}
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="flex items-center gap-2 px-6 py-2 bg-white rounded-full shadow-md border border-blue-100 group">
                                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
                                            <span className="text-[12px] font-black text-[#1B1555] uppercase tracking-[0.2em]">Front Side</span>
                                        </div>

                                        <div
                                            className="relative shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] transition-all duration-300 ring-1 ring-gray-100 overflow-hidden bg-white rounded-2xl"
                                            style={{
                                                width: `${formData.width}px`,
                                                height: `${formData.height}px`,
                                                transform: `scale(${scale})`,
                                                transformOrigin: 'top center',
                                            }}
                                        >
                                            {/* Front Background */}
                                            {previewUrls.front ? (
                                                <img src={previewUrls.front} alt="Front Template" className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0" />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-300 font-bold border-4 border-dashed border-gray-100">Front Image Missing</div>
                                            )}

                                            {/* Front Draggables */}
                                            <div className="relative z-10 w-full h-full">
                                                <div
                                                    onMouseDown={(e) => handleMouseDown(e, 'photo')}
                                                    className="absolute border-2 border-dashed border-blue-500 bg-blue-500/10 flex items-center justify-center text-blue-600 font-black text-sm cursor-move select-none backdrop-blur-[2px]"
                                                    style={{ left: `${positions.photo.x}px`, top: `${positions.photo.y}px`, width: `${positions.photo.width}px`, height: `${positions.photo.height}px` }}
                                                >
                                                    <div className="flex flex-col items-center">
                                                        <User size={scale > 0.5 ? 40 : 20} />
                                                        <span className="text-[10px] uppercase font-black">Photo Box</span>
                                                    </div>
                                                </div>

                                                <div
                                                    onMouseDown={(e) => handleMouseDown(e, 'fullName')}
                                                    className="absolute whitespace-nowrap px-2 py-1 border-2 border-dashed border-transparent hover:border-green-500/50 cursor-move select-none rounded group/field"
                                                    style={{ left: `${positions.fullName.x}px`, top: `${positions.fullName.y}px`, fontSize: `${positions.fullName.fontSize}px`, color: positions.fullName.color, fontFamily: 'Arial, sans-serif', fontWeight: positions.fullName.fontWeight as any }}
                                                >
                                                    <span className="absolute -top-6 left-0 text-[10px] font-black text-green-500 bg-white/80 px-1 rounded opacity-0 group-hover/field:opacity-100 transition-opacity">FULL NAME</span>
                                                    Johnathan Doe
                                                </div>

                                                <div
                                                    onMouseDown={(e) => handleMouseDown(e, 'title')}
                                                    className="absolute whitespace-nowrap px-2 py-1 border-2 border-dashed border-transparent hover:border-indigo-500/50 cursor-move select-none rounded group/field"
                                                    style={{ left: `${positions.title.x}px`, top: `${positions.title.y}px`, fontSize: `${positions.title.fontSize}px`, color: positions.title.color, fontFamily: 'Arial, sans-serif', fontWeight: positions.title.fontWeight as any }}
                                                >
                                                    <span className="absolute -top-6 left-0 text-[10px] font-black text-indigo-500 bg-white/80 px-1 rounded opacity-0 group-hover/field:opacity-100 transition-opacity">TITLE / POSITION</span>
                                                    Senior Software Engineer
                                                </div>

                                                <div
                                                    onMouseDown={(e) => handleMouseDown(e, 'department')}
                                                    className="absolute whitespace-nowrap px-2 py-1 border-2 border-dashed border-transparent hover:border-purple-500/50 cursor-move select-none rounded group/field"
                                                    style={{ left: `${positions.department.x}px`, top: `${positions.department.y}px`, fontSize: `${positions.department.fontSize}px`, color: positions.department.color, fontFamily: 'Arial, sans-serif', fontWeight: positions.department.fontWeight as any }}
                                                >
                                                    <span className="absolute -top-6 left-0 text-[10px] font-black text-purple-500 bg-white/80 px-1 rounded opacity-0 group-hover/field:opacity-100 transition-opacity">DEPARTMENT</span>
                                                    Human Resources Dept
                                                </div>

                                                <div
                                                    onMouseDown={(e) => handleMouseDown(e, 'expiryDate')}
                                                    className="absolute whitespace-nowrap px-2 py-1 border-2 border-dashed border-transparent hover:border-pink-500/50 cursor-move select-none rounded group/field"
                                                    style={{ left: `${positions.expiryDate.x}px`, top: `${positions.expiryDate.y}px`, fontSize: `${positions.expiryDate.fontSize}px`, color: positions.expiryDate.color, fontFamily: 'Arial, sans-serif', fontWeight: positions.expiryDate.fontWeight as any }}
                                                >
                                                    <span className="absolute -top-6 left-0 text-[10px] font-black text-pink-500 bg-white/80 px-1 rounded opacity-0 group-hover/field:opacity-100 transition-opacity">EXPIRY DATE</span>
                                                    EXP: 31/12/2026
                                                </div>

                                                <div
                                                    onMouseDown={(e) => handleMouseDown(e, 'idNumber')}
                                                    className="absolute whitespace-nowrap px-2 py-1 border-2 border-dashed border-transparent hover:border-orange-500/50 cursor-move select-none rounded group/field"
                                                    style={{ left: `${positions.idNumber.x}px`, top: `${positions.idNumber.y}px`, fontSize: `${positions.idNumber.fontSize}px`, color: positions.idNumber.color, fontFamily: 'monospace', fontWeight: positions.idNumber.fontWeight as any, letterSpacing: '1px' }}
                                                >
                                                    <span className="absolute -top-6 left-0 text-[10px] font-black text-orange-500 bg-white/80 px-1 rounded opacity-0 group-hover/field:opacity-100 transition-opacity">SERIAL / ID NO</span>
                                                    EMP-0001
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* BACK CARD */}
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="flex items-center gap-2 px-6 py-2 bg-white rounded-full shadow-md border border-gray-100 group">
                                            <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                                            <span className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">Back Side</span>
                                        </div>

                                        <div
                                            className="relative shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] transition-all duration-300 ring-1 ring-gray-100 overflow-hidden bg-white rounded-2xl"
                                            style={{
                                                width: `${formData.width}px`,
                                                height: `${formData.height}px`,
                                                transform: `scale(${scale})`,
                                                transformOrigin: 'top center',
                                            }}
                                        >
                                            {/* Back Background */}
                                            {previewUrls.back ? (
                                                <img src={previewUrls.back} alt="Back Template" className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0" />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-300 font-bold border-4 border-dashed border-gray-100 uppercase tracking-widest text-xs">Upload Back image in Step 1 to see it here</div>
                                            )}

                                            {/* Back Draggables */}
                                            <div className="relative z-10 w-full h-full">
                                                <div
                                                    onMouseDown={(e) => handleMouseDown(e, 'qrCode')}
                                                    className="absolute border-2 border-dashed border-gray-400 bg-gray-100/40 flex flex-col items-center justify-center text-gray-600 font-black text-xs cursor-move select-none backdrop-blur-[2px] rounded-lg"
                                                    style={{ left: `${positions.qrCode.x}px`, top: `${positions.qrCode.y}px`, width: `${positions.qrCode.width}px`, height: `${positions.qrCode.height}px` }}
                                                >
                                                    <QrCode size={Math.min(positions.qrCode.width, positions.qrCode.height) * 0.4} className="mb-2 text-gray-400" />
                                                    <span className="text-[9px] opacity-60">DYNAMIC QR CODE</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

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
