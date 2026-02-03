"use client";

import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { updateTemplate, IdCardTemplate } from "@/api/idTemplateApi";
import { Loader2, Layout, Image as ImageIcon, CheckCircle2, Shield, FileText, Ruler } from "lucide-react";

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
    const [error, setError] = useState("");

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
        }
    }, [template]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
        if (e.target.files && e.target.files[0]) {
            setFiles((prev) => ({ ...prev, [side]: e.target.files![0] }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!template) return;

        if (!formData.name || !formData.width || !formData.height) {
            setError("Required: Name, Width, and Height.");
            return;
        }

        try {
            setLoading(true);
            const data = new FormData();
            data.append("name", formData.name);
            data.append("description", formData.description);
            data.append("width", formData.width);
            data.append("height", formData.height);
            data.append("status", formData.status);

            if (files.front) {
                data.append("frontBackground", files.front);
            }
            if (files.back) {
                data.append("backBackground", files.back);
            }

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

    if (!template) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit ID Card Template" maxWidth="max-w-2xl">
            <form onSubmit={handleSubmit} className="px-2 py-4">
                {error && (
                    <div className="mb-6 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-100 flex items-center gap-3">
                        <Shield className="h-4 w-4 flex-shrink-0" />
                        <p className="uppercase tracking-wider flex-1 text-center">{error}</p>
                    </div>
                )}

                <div className="space-y-6">
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

                    {/* File Uploads Info */}
                    <div className="rounded-lg bg-blue-50 p-4 text-xs text-blue-800">
                        Leave file inputs empty if you do not want to change the existing background images.
                    </div>

                    {/* File Uploads */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                <ImageIcon size={12} className="text-[#16BCF8]" /> New Front Background
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, "front")}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#1B1555] file:text-white hover:file:bg-[#16BCF8]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                <ImageIcon size={12} className="text-[#16BCF8]" /> New Back Background
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

                <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-6 px-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl px-6 py-3 text-sm font-black text-gray-400 uppercase tracking-widest transition-all hover:bg-gray-100 active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-3 rounded-xl bg-[#1B1555] px-10 py-3 text-sm font-black text-white uppercase tracking-[0.15em] shadow-2xl shadow-[#1B1555]/30 transition-all hover:bg-[#16BCF8] hover:shadow-[#16BCF8]/40 hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={16} />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EditIdTemplateModal;
