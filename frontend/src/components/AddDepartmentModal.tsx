"use client";

import React, { useState } from "react";
import Modal from "./Modal";
import { createDepartment } from "@/api/departmentApi";
import { Loader2, Briefcase, AlignLeft, Shield, CheckCircle2 } from "lucide-react";

interface AddDepartmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddDepartmentModal: React.FC<AddDepartmentModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        departmentName: "",
        description: "",
    });
    const [error, setError] = useState("");

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.departmentName || !formData.description) {
            setError("Required: Department Name and Core Description.");
            return;
        }

        try {
            setLoading(true);
            await createDepartment(formData);
            setFormData({ departmentName: "", description: "" });
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Failed to create department:", err);
            setError(err.response?.data?.message || "Internal error. Failed to register department.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Register New Department" maxWidth="max-w-xl">
            <form onSubmit={handleSubmit} className="px-2 py-4">
                {error && (
                    <div className="mb-6 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-100 flex items-center gap-3">
                        <Shield className="h-4 w-4 flex-shrink-0" />
                        <p className="uppercase tracking-wider flex-1 text-center">{error}</p>
                    </div>
                )}

                <div className="space-y-6">
                    {/* Header Icon */}
                    <div className="flex justify-center mb-8">
                        <div className="h-20 w-20 rounded-2xl bg-gray-50 flex items-center justify-center text-[#16BCF8]/20 border-2 border-dashed border-gray-100">
                            <Briefcase size={40} />
                        </div>
                    </div>

                    {/* Department Name - Full Row */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                            <Briefcase size={12} className="text-[#16BCF8]" /> Department Name *
                        </label>
                        <input
                            type="text"
                            name="departmentName"
                            value={formData.departmentName}
                            onChange={handleChange}
                            placeholder="Ex: Human Resources"
                            className="w-full rounded-xl border border-gray-200 p-4 text-sm font-bold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30"
                            required
                        />
                    </div>

                    {/* Description - Full Row */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                            <AlignLeft size={12} className="text-[#16BCF8]" /> Core Responsibilities *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Briefly describe the department's mandate..."
                            rows={5}
                            className="w-full rounded-xl border border-gray-200 p-4 text-sm font-semibold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30 resize-none"
                            required
                        />
                    </div>
                </div>

                <div className="mt-10 flex items-center justify-end gap-3 border-t border-gray-100 pt-8 px-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl px-8 py-3.5 text-sm font-black text-gray-400 uppercase tracking-widest transition-all hover:bg-gray-100 active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-3 rounded-xl bg-[#1B1555] px-12 py-3.5 text-sm font-black text-white uppercase tracking-[0.15em] shadow-2xl shadow-[#1B1555]/30 transition-all hover:bg-[#16BCF8] hover:shadow-[#16BCF8]/40 hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={16} />
                                Establish Department
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AddDepartmentModal;
