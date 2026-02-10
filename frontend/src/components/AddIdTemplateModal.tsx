"use client";

import React, { useState, useEffect } from "react";
import Modal from "./layout/Modal";
import { createTemplate } from "@/api/idTemplateApi";
import { Loader2, Layout, Image as ImageIcon, CheckCircle2, Shield, FileText, Ruler, ChevronRight, ChevronLeft } from "lucide-react";
import { LayoutEditor, DEFAULT_POSITIONS } from "./IdTemplateLayout";

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
    const [activeSide, setActiveSide] = useState<"front" | "back">("front");

    // Layout Editor State
    const [scale, setScale] = useState(0.5);
    const [positions, setPositions] = useState(DEFAULT_POSITIONS);


    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];


            if (previewUrls[side]) {
                URL.revokeObjectURL(previewUrls[side]!);
            }

            setFiles((prev) => ({ ...prev, [side]: file }));

            // Create new preview URL
            const url = URL.createObjectURL(file);
            setPreviewUrls(prev => ({ ...prev, [side]: url }));
        }
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
                    <LayoutEditor
                        positions={positions}
                        setPositions={setPositions}
                        width={formData.width}
                        height={formData.height}
                        previewUrls={{
                            front: previewUrls.front || '',
                            back: previewUrls.back || ''
                        }}
                        activeSide={activeSide}
                        setActiveSide={setActiveSide}
                        scale={scale}
                        setScale={setScale}
                    />
                )}

                {/* Footer Buttons */}
                <div className="mt-auto px-6 py-4 border-t border-gray-100 flex justify-between bg-white relative z-20">
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
                                className="flex items-center gap-2 rounded-xl bg-[#1B1555] px-8 py-2.5 text-sm font-black text-white uppercase tracking-[0.1em] shadow-lg shadow-[#1B1555]/20 transition-all hover:bg-[#16BCF8] hover:shadow-[#16BCF8]/40 hover:-translate-y-0.5 active:scale-95"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                Save Template
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </Modal >
    );
};

export default AddIdTemplateModal;
