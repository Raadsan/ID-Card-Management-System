"use client";

import React from "react";
import Modal from "@/components/layout/Modal";
import { IdCardTemplate } from "@/api/idTemplateApi";
import { X, Layout, FileText, Ruler, CheckCircle2, Calendar, Image as ImageIcon } from "lucide-react";

interface ViewIdTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    template: IdCardTemplate | null;
}

const ViewIdTemplateModal: React.FC<ViewIdTemplateModalProps> = ({
    isOpen,
    onClose,
    template,
}) => {
    if (!template) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Template Details" maxWidth="max-w-3xl">
            <div className="px-2 py-4 space-y-8">
                {/* Header Section */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="h-14 w-14 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#1B1555] border border-gray-100">
                        <Layout size={28} />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-[#1B1555]">{template.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                            <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${template.status === "active"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-gray-50 text-gray-600 border-gray-200"
                                    }`}
                            >
                                {template.status}
                            </span>
                            <span className="text-xs text-gray-400 font-medium">ID: #{template.id}</span>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Description */}
                    <div className="col-span-1 md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                            <FileText size={12} /> Description
                        </label>
                        <p className="text-sm font-medium text-gray-700 leading-relaxed bg-white p-3 rounded-xl border border-gray-100">
                            {template.description || <span className="text-gray-400 italic">No description provided</span>}
                        </p>
                    </div>

                    {/* Dimensions */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                            <Ruler size={12} /> Dimensions
                        </label>
                        <div className="flex items-center gap-3 text-sm font-bold text-[#1B1555] bg-white p-3 rounded-xl border border-gray-100">
                            <div>
                                <span className="text-gray-400 font-normal mr-1">W:</span>
                                {template.width}px
                            </div>
                            <div className="h-4 w-px bg-gray-200"></div>
                            <div>
                                <span className="text-gray-400 font-normal mr-1">H:</span>
                                {template.height}px
                            </div>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                            <Calendar size={12} /> Last Updated
                        </label>
                        <div className="text-sm font-medium text-gray-700 bg-white p-3 rounded-xl border border-gray-100">
                            {formatDate(template.updatedAt)}
                        </div>
                    </div>
                </div>

                {/* Images Section */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                        <ImageIcon size={12} /> Template Backgrounds
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Front Image */}
                        <div className="space-y-2">
                            <span className="text-xs font-bold text-gray-500 block text-center">Front Side</span>
                            <div
                                className="relative w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-sm group"
                                style={{ aspectRatio: `${template.width} / ${template.height}` }}
                            >
                                <img
                                    src={`http://localhost:5000/${template.frontBackground}`}
                                    alt="Front Background"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                            </div>
                        </div>

                        {/* Back Image */}
                        <div className="space-y-2">
                            <span className="text-xs font-bold text-gray-500 block text-center">Back Side</span>
                            {template.backBackground ? (
                                <div
                                    className="relative w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-sm group"
                                    style={{ aspectRatio: `${template.width} / ${template.height}` }}
                                >
                                    <img
                                        src={`http://localhost:5000/${template.backBackground}`}
                                        alt="Back Background"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                                </div>
                            ) : (
                                <div
                                    className="w-full rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-400 gap-2"
                                    style={{ aspectRatio: `${template.width} / ${template.height}` }}
                                >
                                    <ImageIcon size={24} className="opacity-20" />
                                    <span className="text-xs font-medium">No back image</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ViewIdTemplateModal;
