"use client";

import React, { useState, useEffect } from "react";
import Modal from "./layout/Modal";
import { updateTemplate, IdCardTemplate } from "@/api/idTemplateApi";
import { Loader2, Layout, Image as ImageIcon, CheckCircle2, Shield, FileText, Ruler, User, MapPin, CreditCard, ChevronRight, ChevronLeft, QrCode, Type, Bold, ArrowLeftRight } from "lucide-react";
import { UPLOAD_URL } from "@/api/axios";


interface EditIdTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    template: IdCardTemplate | null;
}



const EditIdTemplateModal: React.FC<EditIdTemplateModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    template,
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
    const [previewUrls, setPreviewUrls] = useState<{ front: string | null; back: string | null }>({
        front: null,
        back: null
    });

    const [error, setError] = useState("");
    const [activeSide, setActiveSide] = useState<"front" | "back">("front");

    // Layout Editor State
    const [scale, setScale] = useState(0.5);
    const [positions, setPositions] = useState({
        photo: { x: 50, y: 155, width: 275, height: 325, objectFit: 'cover' as 'cover' | 'fill' | 'contain' },
        fullName: { x: 360, y: 245, fontSize: 24, color: "#000000", fontWeight: "bold", textAlign: "left", letterSpacing: 0 },
        title: { x: 360, y: 315, fontSize: 18, color: "#000000", fontWeight: "normal", textAlign: "left", letterSpacing: 2.1 },
        department: { x: 360, y: 385, fontSize: 18, color: "#000000", fontWeight: "normal", textAlign: "left", letterSpacing: 0 },
        idNumber: { x: 160, y: 505, fontSize: 24, color: "#1B1555", fontWeight: "bold", textAlign: "left", letterSpacing: 0 },
        issueDate: { x: 360, y: 420, fontSize: 18, color: "#000000", fontWeight: "normal", textAlign: "left", letterSpacing: 0 },
        expiryDate: { x: 360, y: 455, fontSize: 18, color: "#000000", fontWeight: "normal", textAlign: "left", letterSpacing: 0 },
        qrCode: { x: 125, y: 125, width: 100, height: 100 }
    });

    useEffect(() => {
        if (template) {
            setFormData({
                name: template.name,
                description: template.description || "",
                width: String(template.width),
                height: String(template.height),
                status: template.status,
            });
            // Reset files when switching templates
            setFiles({ front: null, back: null });
            setPreviewUrls({ front: null, back: null });
            setCurrentStep(1);

            // Set positions if available
            if (template.layout) {
                const layoutData = typeof template.layout === 'string' ? JSON.parse(template.layout) : template.layout;
                // Merge with defaults to ensure all keys exist
                setPositions(prev => ({
                    ...prev,
                    ...layoutData
                }));
            }
        }
    }, [template]);

    // DRAG AND DROP / RESIZE LOGIC
    const [isDragging, setIsDragging] = useState<string | null>(null);
    const [isResizing, setIsResizing] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent, element: keyof typeof positions) => {
        e.preventDefault();
        setIsDragging(element);
        setDragOffset({
            x: e.clientX - (positions[element] as any).x * scale,
            y: e.clientY - (positions[element] as any).y * scale
        });
    };

    const handleResizeStart = (e: React.MouseEvent, element: string) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(element);
        setDragOffset({ x: e.clientX, y: 0 });
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
            } else if (isResizing) {
                const deltaX = (e.clientX - dragOffset.x) / scale;
                const field = isResizing as keyof typeof positions;
                const currentSpacing = (positions[field] as any).letterSpacing || 0;

                // Sensitivity for letter spacing adjustment
                const newSpacing = Math.max(-5, Math.min(20, currentSpacing + deltaX * 0.1));

                setPositions(prev => ({
                    ...prev,
                    [isResizing]: {
                        ...prev[isResizing as keyof typeof positions],
                        letterSpacing: parseFloat(newSpacing.toFixed(2))
                    }
                }));
                setDragOffset(prev => ({ ...prev, x: e.clientX }));
            }
        };

        const handleMouseUp = () => {
            setIsDragging(null);
            setIsResizing(null);
        };

        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, dragOffset, scale, positions]);

    // Clean up only on component unmount
    useEffect(() => {
        return () => {
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

            // Revoke old URL for THIS side only
            if (previewUrls[side]) {
                URL.revokeObjectURL(previewUrls[side]!);
            }

            setFiles((prev) => ({ ...prev, [side]: file }));
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

    const getImageUrl = (path?: string) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;

        // If it already starts with uploads/, we need to be careful with double /uploads/uploads
        if (path.startsWith('uploads/')) {
            const rootUrl = UPLOAD_URL.replace('/uploads', '');
            return `${rootUrl}/${path}`;
        }

        return `${UPLOAD_URL}/${path}`;
    };

    const handleNext = () => {
        setError("");
        if (!formData.name || !formData.width || !formData.height) {
            setError("Required: Name, Width, and Height.");
            return;
        }
        setCurrentStep(2);
    };

    const handleSubmit = async () => {
        setError("");
        if (!template) return;

        try {
            setLoading(true);
            const data = new FormData();
            data.append("name", formData.name);
            data.append("description", formData.description);
            data.append("width", formData.width);
            data.append("height", formData.height);
            data.append("status", formData.status);
            data.append("layout", JSON.stringify(positions));

            if (files.front) data.append("frontBackground", files.front);
            if (files.back) data.append("backBackground", files.back);

            await updateTemplate(template.id, data);
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Failed to update template:", err);
            setError(err.response?.data?.error || "Internal error. Failed to update template.");
        } finally {
            setLoading(false);
        }
    };

    const onCloseModal = () => {
        setCurrentStep(1);
        onClose();
    }

    if (!template) return null;

    const getPreviewBackground = (side: 'front' | 'back') => {
        if (side === 'front' && previewUrls.front) return previewUrls.front;
        if (side === 'back' && previewUrls.back) return previewUrls.back;
        if (side === 'front') return getImageUrl(template.frontBackground);
        if (side === 'back') return getImageUrl(template.backBackground);
        return null;
    }

    return (
        <Modal isOpen={isOpen} onClose={onCloseModal} title={currentStep === 1 ? "Edit ID Template - Basic Info" : "Configure Layout"} maxWidth={currentStep === 1 ? "max-w-2xl" : "max-w-6xl"}>
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
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                    <Layout size={12} className="text-[#16BCF8]" /> Template Name *
                                </label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full rounded-xl border border-gray-200 p-3 text-sm font-bold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                    <CheckCircle2 size={12} className="text-[#16BCF8]" /> Status
                                </label>
                                <select name="status" value={formData.status} onChange={handleChange} className="w-full rounded-xl border border-gray-200 p-3 text-sm font-bold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30">
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                    <Ruler size={12} className="text-[#16BCF8]" /> Width (px) *
                                </label>
                                <input type="number" name="width" value={formData.width} onChange={handleChange} className="w-full rounded-xl border border-gray-200 p-3 text-sm font-bold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                    <Ruler size={12} className="text-[#16BCF8]" /> Height (px) *
                                </label>
                                <input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full rounded-xl border border-gray-200 p-3 text-sm font-bold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                <FileText size={12} className="text-[#16BCF8]" /> Description
                            </label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows={2} className="w-full rounded-xl border border-gray-200 p-3 text-sm font-semibold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30 resize-none" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                    <ImageIcon size={12} className="text-[#16BCF8]" /> New Front Background
                                </label>
                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "front")} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#1B1555] file:text-white hover:file:bg-[#16BCF8]" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                    <ImageIcon size={12} className="text-[#16BCF8]" /> New Back Background
                                </label>
                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "back")} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#1B1555] file:text-white hover:file:bg-[#16BCF8]" />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: Layout Editor */}
                {currentStep === 2 && (
                    <div className="flex-1 overflow-hidden flex flex-col lg:flex-row border-t border-gray-100">
                        {/* Controls Sidebar */}
                        <div className="w-full lg:w-1/3 shrink-0 min-w-[320px] bg-white border-r border-gray-200 overflow-y-auto p-4 space-y-5 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                                <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 border-b border-gray-100 pb-2"><User className="w-3 h-3 text-blue-500" /> Photo Placeholder</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {['x', 'y', 'width', 'height'].map((field) => (
                                        <div key={field}>
                                            <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">{field}</label>
                                            <input type="number" value={(positions.photo as any)[field]} onChange={e => handlePositionChange('photo', field, +e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm font-mono focus:border-blue-500" />
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-2">
                                    <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">Image Fit</label>
                                    <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200">
                                        {['cover', 'fill', 'contain'].map((fit) => (
                                            <button
                                                key={fit}
                                                onClick={() => handlePositionChange('photo', 'objectFit', fit)}
                                                className={`flex-1 py-1 rounded text-[10px] font-black uppercase transition-all ${((positions.photo as any).objectFit || 'cover') === fit ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                                            >
                                                {fit}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                                <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 border-b border-gray-100 pb-2"><FileText className="w-3 h-3 text-green-500" /> Full Name Text</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {['x', 'y', 'fontSize'].map((field) => (
                                        <div key={field}>
                                            <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">{field === 'fontSize' ? 'Size' : field}</label>
                                            <input type="number" value={(positions.fullName as any)[field]} onChange={e => handlePositionChange('fullName', field, +e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm font-mono focus:border-green-500" />
                                        </div>
                                    ))}
                                    <div>
                                        <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">Style</label>
                                        <div className="flex items-center gap-2">
                                            <input type="color" value={positions.fullName.color} onChange={e => handlePositionChange('fullName', 'color', e.target.value)} className="h-9 w-12 p-0.5 border rounded cursor-pointer" />
                                            <button onClick={() => handlePositionChange('fullName', 'fontWeight', positions.fullName.fontWeight === 'bold' ? 'normal' : 'bold')} className={`p-2 rounded border ${positions.fullName.fontWeight === 'bold' ? 'bg-green-100 border-green-200 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                                                <Bold size={14} />
                                            </button>
                                            <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200">
                                                {['left', 'center', 'right'].map((align) => (
                                                    <button
                                                        key={align}
                                                        onClick={() => handlePositionChange('fullName', 'textAlign', align)}
                                                        className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${positions.fullName.textAlign === align ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
                                                    >
                                                        {align[0]}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                                <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 border-b border-gray-100 pb-2"><User className="w-3 h-3 text-indigo-500" /> Job Title Text</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {['x', 'y', 'fontSize'].map((field) => (
                                        <div key={field}>
                                            <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">{field === 'fontSize' ? 'Size' : field}</label>
                                            <input type="number" value={(positions.title as any)[field]} onChange={e => handlePositionChange('title', field, +e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm font-mono focus:border-indigo-500" />
                                        </div>
                                    ))}
                                    <div>
                                        <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">Style</label>
                                        <div className="flex items-center gap-2">
                                            <input type="color" value={positions.title.color} onChange={e => handlePositionChange('title', 'color', e.target.value)} className="h-9 w-12 p-0.5 border rounded cursor-pointer" />
                                            <button onClick={() => handlePositionChange('title', 'fontWeight', positions.title.fontWeight === 'bold' ? 'normal' : 'bold')} className={`p-2 rounded border ${positions.title.fontWeight === 'bold' ? 'bg-indigo-100 border-indigo-200 text-indigo-700' : 'bg-gray-50 text-gray-400'}`}>
                                                <Bold size={14} />
                                            </button>
                                            <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200">
                                                {['left', 'center', 'right'].map((align) => (
                                                    <button
                                                        key={align}
                                                        onClick={() => handlePositionChange('title', 'textAlign', align)}
                                                        className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${positions.title.textAlign === align ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
                                                    >
                                                        {align[0]}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                                <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 border-b border-gray-100 pb-2"><MapPin className="w-3 h-3 text-purple-500" /> Department Text</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {['x', 'y', 'fontSize'].map((field) => (
                                        <div key={field}>
                                            <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">{field === 'fontSize' ? 'Size' : field}</label>
                                            <input type="number" value={(positions.department as any)[field]} onChange={e => handlePositionChange('department', field, +e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm font-mono focus:border-purple-500" />
                                        </div>
                                    ))}
                                    <div>
                                        <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">Style</label>
                                        <div className="flex items-center gap-2">
                                            <input type="color" value={positions.department.color} onChange={e => handlePositionChange('department', 'color', e.target.value)} className="h-9 w-12 p-0.5 border rounded cursor-pointer" />
                                            <button onClick={() => handlePositionChange('department', 'fontWeight', positions.department.fontWeight === 'bold' ? 'normal' : 'bold')} className={`p-2 rounded border ${positions.department.fontWeight === 'bold' ? 'bg-purple-100 border-purple-200 text-purple-700' : 'bg-gray-50 text-gray-400'}`}>
                                                <Bold size={14} />
                                            </button>
                                            <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200">
                                                {['left', 'center', 'right'].map((align) => (
                                                    <button
                                                        key={align}
                                                        onClick={() => handlePositionChange('department', 'textAlign', align)}
                                                        className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${positions.department.textAlign === align ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
                                                    >
                                                        {align[0]}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                                <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 border-b border-gray-100 pb-2"><FileText className="w-3 h-3 text-blue-400" /> Issue Date Text</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {['x', 'y', 'fontSize'].map((field) => (
                                        <div key={field}>
                                            <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">{field === 'fontSize' ? 'Size' : field}</label>
                                            <input type="number" value={(positions.issueDate as any)[field]} onChange={e => handlePositionChange('issueDate', field, +e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm font-mono focus:border-blue-400" />
                                        </div>
                                    ))}
                                    <div>
                                        <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">Style</label>
                                        <div className="flex items-center gap-2">
                                            <input type="color" value={positions.issueDate.color} onChange={e => handlePositionChange('issueDate', 'color', e.target.value)} className="h-9 w-12 p-0.5 border rounded cursor-pointer" />
                                            <button onClick={() => handlePositionChange('issueDate', 'fontWeight', positions.issueDate.fontWeight === 'bold' ? 'normal' : 'bold')} className={`p-2 rounded border ${positions.issueDate.fontWeight === 'bold' ? 'bg-blue-100 border-blue-200 text-blue-700' : 'bg-gray-50 text-gray-400'}`}>
                                                <Bold size={14} />
                                            </button>
                                            <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200">
                                                {['left', 'center', 'right'].map((align) => (
                                                    <button
                                                        key={align}
                                                        onClick={() => handlePositionChange('issueDate', 'textAlign', align)}
                                                        className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${positions.issueDate.textAlign === align ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
                                                    >
                                                        {align[0]}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                                <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 border-b border-gray-100 pb-2"><FileText className="w-3 h-3 text-pink-500" /> Expiry Date Text</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {['x', 'y', 'fontSize'].map((field) => (
                                        <div key={field}>
                                            <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">{field === 'fontSize' ? 'Size' : field}</label>
                                            <input type="number" value={(positions.expiryDate as any)[field]} onChange={e => handlePositionChange('expiryDate', field, +e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm font-mono focus:border-pink-500" />
                                        </div>
                                    ))}
                                    <div>
                                        <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">Style</label>
                                        <div className="flex items-center gap-2">
                                            <input type="color" value={positions.expiryDate.color} onChange={e => handlePositionChange('expiryDate', 'color', e.target.value)} className="h-9 w-12 p-0.5 border rounded cursor-pointer" />
                                            <button onClick={() => handlePositionChange('expiryDate', 'fontWeight', positions.expiryDate.fontWeight === 'bold' ? 'normal' : 'bold')} className={`p-2 rounded border ${positions.expiryDate.fontWeight === 'bold' ? 'bg-pink-100 border-pink-200 text-pink-700' : 'bg-gray-50 text-gray-400'}`}>
                                                <Bold size={14} />
                                            </button>
                                            <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200">
                                                {['left', 'center', 'right'].map((align) => (
                                                    <button
                                                        key={align}
                                                        onClick={() => handlePositionChange('expiryDate', 'textAlign', align)}
                                                        className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${positions.expiryDate.textAlign === align ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
                                                    >
                                                        {align[0]}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                                <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 border-b border-gray-100 pb-2"><CreditCard className="w-3 h-3 text-orange-500" /> ID Number Text</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {['x', 'y', 'fontSize'].map((field) => (
                                        <div key={field}>
                                            <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">{field === 'fontSize' ? 'Size' : field}</label>
                                            <input type="number" value={(positions.idNumber as any)[field]} onChange={e => handlePositionChange('idNumber', field, +e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm font-mono focus:border-orange-500" />
                                        </div>
                                    ))}
                                    <div>
                                        <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">Style</label>
                                        <div className="flex items-center gap-2">
                                            <input type="color" value={positions.idNumber.color} onChange={e => handlePositionChange('idNumber', 'color', e.target.value)} className="h-9 w-12 p-0.5 border rounded cursor-pointer" />
                                            <button onClick={() => handlePositionChange('idNumber', 'fontWeight', positions.idNumber.fontWeight === 'bold' ? 'normal' : 'bold')} className={`p-2 rounded border ${positions.idNumber.fontWeight === 'bold' ? 'bg-orange-100 border-orange-200 text-orange-700' : 'bg-gray-50 text-gray-400'}`}>
                                                <Bold size={14} />
                                            </button>
                                            <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200">
                                                {['left', 'center', 'right'].map((align) => (
                                                    <button
                                                        key={align}
                                                        onClick={() => handlePositionChange('idNumber', 'textAlign', align)}
                                                        className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${positions.idNumber.textAlign === align ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
                                                    >
                                                        {align[0]}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                                <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 border-b border-gray-100 pb-2"><QrCode className="w-3 h-3 text-gray-800" /> Back QR Code</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {['x', 'y', 'width', 'height'].map((field) => (
                                        <div key={field}>
                                            <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">{field}</label>
                                            <input type="number" value={(positions.qrCode as any)[field]} onChange={e => handlePositionChange('qrCode', field, +e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm font-mono focus:border-gray-800" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="flex-1 flex flex-col bg-gray-200/30">
                            <div className="p-3 bg-white border-b border-gray-200 flex justify-between items-center z-10 transition-shadow duration-200 sticky top-0 shadow-sm">
                                <div className="flex items-center gap-6">
                                    <h3 className="font-bold text-[#1B1555] text-sm uppercase tracking-wider">Id Template Design</h3>

                                    {/* Tab Switcher */}
                                    <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
                                        <button
                                            onClick={() => setActiveSide("front")}
                                            className={`px-6 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${activeSide === "front" ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                                        >
                                            Front
                                        </button>
                                        <button
                                            onClick={() => setActiveSide("back")}
                                            className={`px-6 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${activeSide === "back" ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                                        >
                                            Back
                                        </button>
                                    </div>

                                    <div className="h-4 w-[1px] bg-gray-200"></div>

                                    <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-inner">
                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">Zoom</span>
                                        <input
                                            type="range"
                                            min="0.2"
                                            max="1.2"
                                            step="0.01"
                                            value={scale}
                                            onChange={(e) => setScale(parseFloat(e.target.value))}
                                            className="w-32 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        />
                                        <span className="text-[10px] font-black text-blue-600 w-8 text-right underline">{Math.round(scale * 100)}%</span>
                                    </div>
                                </div>
                                <div className="text-[10px] font-black text-blue-500/60 uppercase bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 shadow-sm animate-pulse">
                                    {activeSide === "front" ? "Front Side Active" : "Back Side Active"}
                                </div>
                            </div>

                            {/* Canvas Area */}
                            <div className="flex-1 overflow-auto bg-[#F1F5F9] relative custom-scrollbar">
                                <div className="min-h-full min-w-full flex items-center justify-center p-8 lg:p-20">
                                    <div className="flex flex-col items-center gap-8">

                                        {/* FRONT CARD */}
                                        {activeSide === "front" && (
                                            <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
                                                <div className="flex items-center gap-2 px-6 py-2 bg-white rounded-full shadow-lg border border-blue-100 ring-4 ring-blue-50/50">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                                    <span className="text-[11px] font-black text-[#1B1555] uppercase tracking-[0.25em]">Front Workspace</span>
                                                </div>

                                                {/* Visual size wrapper for scaled card */}
                                                <div
                                                    style={{
                                                        width: `${Number(formData.width) * scale}px`,
                                                        height: `${Number(formData.height) * scale}px`,
                                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                                    }}
                                                    className="relative"
                                                >
                                                    <div
                                                        className="absolute shadow-[0_32px_64px_-12px_rgba(0,0,0,0.18)] ring-1 ring-gray-100 overflow-hidden bg-white rounded-2xl"
                                                        style={{
                                                            width: `${formData.width}px`,
                                                            height: `${formData.height}px`,
                                                            transform: `scale(${scale})`,
                                                            transformOrigin: 'top left',
                                                        }}
                                                    >
                                                        {getPreviewBackground('front') && <img src={getPreviewBackground('front')!} alt="Front" className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0" />}
                                                        <div className="relative z-10 w-full h-full">
                                                            <div
                                                                onMouseDown={(e) => handleMouseDown(e, 'photo')}
                                                                className="absolute border-2 border-dashed border-blue-500 bg-blue-500/10 flex items-center justify-center text-blue-600 font-black text-sm cursor-move select-none backdrop-blur-[2px] transition-colors hover:bg-blue-500/20"
                                                                style={{ left: `${positions.photo.x}px`, top: `${positions.photo.y}px`, width: `${positions.photo.width}px`, height: `${positions.photo.height}px` }}
                                                            >
                                                                <div className="flex flex-col items-center w-full h-full relative">
                                                                    <div className="absolute inset-0 bg-blue-500/5 flex items-center justify-center">
                                                                        <User size={scale > 0.5 ? 40 : 20} className="opacity-40" />
                                                                    </div>
                                                                    {/* Sample Image Preview */}
                                                                    <img
                                                                        src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop"
                                                                        alt="Sample"
                                                                        className={`w-full h-full opacity-30 pointer-events-none transition-all`}
                                                                        style={{ objectFit: (positions.photo as any).objectFit || 'cover' }}
                                                                    />
                                                                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] uppercase font-black tracking-widest text-[#1B1555] bg-white/80 px-2 py-0.5 rounded shadow-sm backdrop-blur-sm whitespace-nowrap">Photo Box</span>
                                                                </div>
                                                            </div>

                                                            <div
                                                                onMouseDown={(e) => handleMouseDown(e, 'fullName')}
                                                                className="absolute whitespace-nowrap px-1 py-1 border-2 border-dashed border-transparent hover:border-green-500/50 cursor-move select-none rounded-xl group/field transition-all"
                                                                style={{
                                                                    left: `${positions.fullName.x}px`,
                                                                    top: `${positions.fullName.y}px`,
                                                                    fontSize: `${positions.fullName.fontSize}px`,
                                                                    color: positions.fullName.color,
                                                                    fontFamily: 'Outfit, sans-serif',
                                                                    fontWeight: positions.fullName.fontWeight as any,
                                                                    textTransform: 'uppercase',
                                                                    textAlign: (positions.fullName as any).textAlign || 'left'
                                                                }}
                                                            >
                                                                <span className="absolute -top-7 left-0 text-[10px] font-black text-white bg-green-500 px-2 py-0.5 rounded shadow-sm opacity-0 group-hover/field:opacity-100 transition-opacity uppercase tracking-widest">FULL NAME</span>
                                                                Johnathan Doe
                                                            </div>

                                                            <div
                                                                onMouseDown={(e) => handleMouseDown(e, 'title')}
                                                                className="absolute whitespace-nowrap px-1 py-1 border-2 border-dashed border-transparent hover:border-indigo-500/50 cursor-move select-none rounded-xl group/field transition-all"
                                                                style={{ left: `${positions.title.x}px`, top: `${positions.title.y}px`, fontSize: `${positions.title.fontSize}px`, color: positions.title.color, fontFamily: 'Outfit, sans-serif', fontWeight: positions.title.fontWeight as any, textTransform: 'uppercase', textAlign: (positions.title as any).textAlign || 'left' }}
                                                            >
                                                                <span className="absolute -top-7 left-0 text-[10px] font-black text-white bg-indigo-500 px-2 py-0.5 rounded shadow-sm opacity-0 group-hover/field:opacity-100 transition-opacity uppercase tracking-widest">TITLE / POSITION</span>
                                                                Senior Software Engineer
                                                            </div>

                                                            <div
                                                                onMouseDown={(e) => handleMouseDown(e, 'department')}
                                                                className="absolute whitespace-nowrap px-1 py-1 border-2 border-dashed border-transparent hover:border-purple-500/50 cursor-move select-none rounded-xl group/field transition-all"
                                                                style={{ left: `${positions.department.x}px`, top: `${positions.department.y}px`, fontSize: `${positions.department.fontSize}px`, color: positions.department.color, fontFamily: 'Outfit, sans-serif', fontWeight: positions.department.fontWeight as any, textTransform: 'uppercase', textAlign: (positions.department as any).textAlign || 'left' }}
                                                            >
                                                                <span className="absolute -top-7 left-0 text-[10px] font-black text-white bg-purple-500 px-2 py-0.5 rounded shadow-sm opacity-0 group-hover/field:opacity-100 transition-opacity uppercase tracking-widest">DEPARTMENT</span>
                                                                Human Resources Dept
                                                            </div>

                                                            <div
                                                                onMouseDown={(e) => handleMouseDown(e, 'issueDate')}
                                                                className="absolute whitespace-nowrap px-1 py-1 border-2 border-dashed border-transparent hover:border-blue-400/50 cursor-move select-none rounded-xl group/field transition-all"
                                                                style={{ left: `${positions.issueDate.x}px`, top: `${positions.issueDate.y}px`, fontSize: `${positions.issueDate.fontSize}px`, color: positions.issueDate.color, fontFamily: 'Outfit, sans-serif', fontWeight: positions.issueDate.fontWeight as any, textTransform: 'uppercase', textAlign: (positions.issueDate as any).textAlign || 'left' }}
                                                            >
                                                                <span className="absolute -top-7 left-0 text-[10px] font-black text-white bg-blue-400 px-2 py-0.5 rounded shadow-sm opacity-0 group-hover/field:opacity-100 transition-opacity uppercase tracking-widest text-[8px]">Issue Date</span>
                                                                ISSUE: 01/01/2026
                                                            </div>

                                                            <div
                                                                onMouseDown={(e) => handleMouseDown(e, 'expiryDate')}
                                                                className="absolute whitespace-nowrap px-1 py-1 border-2 border-dashed border-transparent hover:border-pink-500/50 cursor-move select-none rounded-xl group/field transition-all"
                                                                style={{ left: `${positions.expiryDate.x}px`, top: `${positions.expiryDate.y}px`, fontSize: `${positions.expiryDate.fontSize}px`, color: positions.expiryDate.color, fontFamily: 'Outfit, sans-serif', fontWeight: positions.expiryDate.fontWeight as any, textTransform: 'uppercase', textAlign: (positions.expiryDate as any).textAlign || 'left' }}
                                                            >
                                                                <span className="absolute -top-7 left-0 text-[10px] font-black text-white bg-pink-500 px-2 py-0.5 rounded shadow-sm opacity-0 group-hover/field:opacity-100 transition-opacity uppercase tracking-widest text-[8px]">EXPIRY DATE</span>
                                                                EXP: 31/12/2026
                                                            </div>

                                                            <div onMouseDown={(e) => handleMouseDown(e, 'idNumber')} className="absolute whitespace-nowrap px-1 py-1 border-2 border-dashed border-transparent hover:border-orange-500/50 cursor-move select-none rounded-xl group/field transition-all" style={{ left: `${positions.idNumber.x}px`, top: `${positions.idNumber.y}px`, fontSize: `${positions.idNumber.fontSize}px`, color: positions.idNumber.color, fontFamily: 'monospace', fontWeight: positions.idNumber.fontWeight as any, letterSpacing: '1px', textAlign: (positions.idNumber as any).textAlign || 'left' }}>
                                                                <span className="absolute -top-7 left-0 text-[10px] font-black text-white bg-orange-500 px-2 py-0.5 rounded shadow-sm opacity-0 group-hover/field:opacity-100 transition-opacity uppercase tracking-widest">SERIAL / ID NO</span>
                                                                EMP-0001
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* BACK CARD */}
                                        {activeSide === "back" && (
                                            <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
                                                <div className="flex items-center gap-2 px-6 py-2 bg-white rounded-full shadow-lg border border-gray-100 ring-4 ring-gray-50/50">
                                                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em]">Back Workspace</span>
                                                </div>

                                                {/* Visual size wrapper for scaled card */}
                                                <div
                                                    style={{
                                                        width: `${Number(formData.width) * scale}px`,
                                                        height: `${Number(formData.height) * scale}px`,
                                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                                    }}
                                                    className="relative"
                                                >
                                                    <div
                                                        className="absolute shadow-[0_32px_64px_-12px_rgba(0,0,0,0.18)] ring-1 ring-gray-100 overflow-hidden bg-white rounded-2xl"
                                                        style={{
                                                            width: `${formData.width}px`,
                                                            height: `${formData.height}px`,
                                                            transform: `scale(${scale})`,
                                                            transformOrigin: 'top left',
                                                        }}
                                                    >
                                                        {getPreviewBackground('back') && <img src={getPreviewBackground('back')!} alt="Back" className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0" />}
                                                        <div className="relative z-10 w-full h-full">
                                                            <div onMouseDown={(e) => handleMouseDown(e, 'qrCode')} className="absolute border-2 border-dashed border-gray-400 bg-gray-50/50 flex flex-col items-center justify-center text-gray-600 font-black text-xs cursor-move select-none backdrop-blur-[2px] rounded-2xl transition-all hover:bg-gray-100/50 shadow-sm" style={{ left: `${positions.qrCode.x}px`, top: `${positions.qrCode.y}px`, width: `${positions.qrCode.width}px`, height: `${positions.qrCode.height}px` }}><QrCode size={Math.min(positions.qrCode.width, positions.qrCode.height) * 0.4} className="mb-2 text-gray-400 opacity-60" /><span className="text-[9px] font-black uppercase opacity-60 tracking-widest">Dynamic QR Code</span></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Bottom Spacer to ensure full scrollability over the footer */}
                                        <div className="h-64 w-full invisible pointer-events-none"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-auto px-6 py-4 border-t border-gray-100 flex justify-between bg-white relative z-20">
                    {currentStep === 2 && (
                        <button
                            onClick={() => setCurrentStep(1)}
                            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-bold text-gray-600 transition-all hover:bg-gray-50 shadow-sm"
                        >
                            <ChevronLeft size={16} /> Back to Setup
                        </button>
                    )}
                    <div className="flex gap-3 ml-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl px-6 py-2.5 text-sm font-black text-gray-400 uppercase tracking-widest transition-all hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        {currentStep === 1 ? (
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-2 rounded-xl bg-[#1B1555] px-8 py-2.5 text-sm font-black text-white uppercase tracking-[0.1em] shadow-lg shadow-[#1B1555]/20 transition-all hover:bg-[#16BCF8] hover:-translate-y-0.5"
                            >
                                <ChevronRight size={16} /> Next Step
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex items-center gap-2 rounded-xl bg-green-600 px-8 py-2.5 text-sm font-black text-white uppercase tracking-[0.1em] shadow-lg shadow-green-600/20 transition-all hover:bg-green-500 hover:-translate-y-0.5"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Save Changes
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default EditIdTemplateModal;
