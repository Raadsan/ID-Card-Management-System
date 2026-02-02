"use client";

import React, { useState } from "react";
import Modal from "./Modal";
import { createRole } from "@/api/roleApi";
import { Loader2, Shield, AlignLeft, CheckCircle2 } from "lucide-react";

interface AddRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddRoleModal: React.FC<AddRoleModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
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

        if (!formData.name) {
            setError("Required: Role Name is mandatory.");
            return;
        }

        try {
            setLoading(true);
            await createRole(formData);
            setFormData({ name: "", description: "" });
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Failed to create role:", err);
            setError(err.response?.data?.message || "Internal system error. Failed to create role.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create System Role" maxWidth="max-w-xl">
            <form onSubmit={handleSubmit} className="px-2 py-4">
                {error && (
                    <div className="mb-6 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-100 flex items-center gap-3">
                        <Shield className="h-4 w-4 flex-shrink-0" />
                        <p className="uppercase tracking-wider text-center flex-1">{error}</p>
                    </div>
                )}

                <div className="space-y-6">
                    {/* Header Icon */}
                    <div className="flex justify-center mb-8">
                        <div className="h-20 w-20 rounded-2xl bg-gray-50 flex items-center justify-center text-[#16BCF8]/20 border-2 border-dashed border-gray-100">
                            <Shield size={40} />
                        </div>
                    </div>

                    {/* Role Name - Full Row */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                            <Shield size={12} className="text-[#16BCF8]" /> Role Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Ex: Supervisor"
                            className="w-full rounded-xl border border-gray-200 p-4 text-sm font-bold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30"
                            required
                        />
                    </div>

                    {/* Description - Full Row */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                            <AlignLeft size={12} className="text-[#16BCF8]" /> Role Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Briefly describe the responsibilities of this role..."
                            rows={5}
                            className="w-full rounded-xl border border-gray-200 p-4 text-sm font-semibold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30 resize-none"
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
                                Define Role
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AddRoleModal;
