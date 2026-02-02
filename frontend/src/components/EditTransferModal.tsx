"use client";

import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { getEmployees } from "@/api/employeeApi";
import { getDepartments } from "@/api/departmentApi";
import { getDepartmentTransferById, updateDepartmentTransfer } from "@/api/department_transfareApi";
import { Loader2, ArrowRightLeft, User, Briefcase, Calendar, MessageSquare, Shield, Save, Activity, ChevronDown } from "lucide-react";

interface EditTransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    transferId: number | null;
}

const EditTransferModal: React.FC<EditTransferModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    transferId,
}) => {
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(false);
    const [employees, setEmployees] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        employeeId: "",
        fromDepartmentId: "",
        toDepartmentId: "",
        transferDate: "",
        reason: "",
    });
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen && transferId) {
            fetchInitialData();
        }
    }, [isOpen, transferId]);

    const fetchInitialData = async () => {
        try {
            setFetchingData(true);
            setError("");

            const [empsData, deptsData, transferData] = await Promise.all([
                getEmployees(),
                getDepartments(),
                getDepartmentTransferById(String(transferId))
            ]);

            setEmployees(Array.isArray(empsData) ? empsData : []);
            setDepartments(Array.isArray(deptsData) ? deptsData : []);

            if (transferData) {
                setFormData({
                    employeeId: transferData.employeeId?.toString() || "",
                    fromDepartmentId: transferData.fromDepartmentId?.toString() || "",
                    toDepartmentId: transferData.toDepartmentId?.toString() || "",
                    transferDate: transferData.transferDate ? new Date(transferData.transferDate).toISOString().split('T')[0] : "",
                    reason: transferData.reason || "",
                });
            }
        } catch (err) {
            console.error("Failed to fetch transfer data:", err);
            setError("Connectivity error. Could not retrieve transfer record details.");
        } finally {
            setFetchingData(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.employeeId || !formData.toDepartmentId || !formData.transferDate) {
            setError("Required: Employee, Target Department, and Effective Date.");
            return;
        }

        try {
            setLoading(true);
            await updateDepartmentTransfer(String(transferId), {
                employeeId: Number(formData.employeeId),
                fromDepartmentId: Number(formData.fromDepartmentId),
                toDepartmentId: Number(formData.toDepartmentId),
                transferDate: formData.transferDate,
                reason: formData.reason,
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Failed to update transfer:", err);
            setError(err.response?.data?.message || "Internal system error. Update failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Modify Transfer Record" maxWidth="max-w-2xl">
            <form onSubmit={handleSubmit} className="px-2 py-4">
                {error && (
                    <div className="mb-6 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-100 flex items-center gap-3">
                        <Shield className="h-4 w-4 flex-shrink-0" />
                        <p className="uppercase tracking-wider text-center flex-1">{error}</p>
                    </div>
                )}

                {fetchingData ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-[#1B1555] opacity-20" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Syncing Record...</span>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Activity Icon */}
                        <div className="flex justify-center mb-8">
                            <div className="h-20 w-20 rounded-2xl bg-[#16BCF8]/5 flex items-center justify-center text-[#16BCF8] border-2 border-[#16BCF8]/10">
                                <Activity size={32} />
                            </div>
                        </div>

                        {/* Employee Selection (Disabled during edit?) - Usually yes */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                <User size={12} className="text-[#16BCF8]" /> Assigned Employee
                            </label>
                            <div className="w-full rounded-xl border border-gray-200 p-4 text-sm font-bold text-gray-500 bg-gray-50/50">
                                {employees.find(emp => emp.id.toString() === formData.employeeId)?.user?.fullName || "Not Specified"}
                            </div>
                        </div>

                        {/* Current & Target Departments - Dynamic Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* From Department (ReadOnly) */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                    <Briefcase size={12} className="text-rose-400" /> Origin Department
                                </label>
                                <div className="w-full rounded-xl border border-rose-100 p-4 text-sm font-bold text-rose-600 bg-rose-50/30">
                                    {departments.find(d => d.id.toString() === formData.fromDepartmentId)?.departmentName || "---"}
                                </div>
                            </div>

                            {/* To Department */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                    <Briefcase size={12} className="text-[#16BCF8]" /> Destination Department *
                                </label>
                                <div className="relative group">
                                    <select
                                        name="toDepartmentId"
                                        value={formData.toDepartmentId}
                                        onChange={handleChange}
                                        className="w-full appearance-none rounded-xl border border-gray-200 p-4 text-sm font-bold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30 cursor-pointer pr-10"
                                        required
                                    >
                                        <option value="">Select target...</option>
                                        {departments.map((dept) => (
                                            <option key={dept.id} value={dept.id}>
                                                {dept.departmentName}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-[#16BCF8] transition-colors">
                                        <ChevronDown size={18} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Transfer Date - Full Row */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                <Calendar size={12} className="text-[#16BCF8]" /> Effective Transfer Date *
                            </label>
                            <input
                                type="date"
                                name="transferDate"
                                value={formData.transferDate}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-gray-200 p-4 text-sm font-bold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30"
                                required
                            />
                        </div>

                        {/* Reason - Full Row */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                <MessageSquare size={12} className="text-[#16BCF8]" /> Clinical / Operational Reason
                            </label>
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                placeholder="Update the reason for this migration..."
                                rows={4}
                                className="w-full rounded-xl border border-gray-200 p-4 text-sm font-semibold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30 resize-none"
                            />
                        </div>
                    </div>
                )}

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
                        disabled={loading || fetchingData}
                        className="flex items-center gap-3 rounded-xl bg-[#1B1555] px-12 py-3.5 text-sm font-black text-white uppercase tracking-[0.15em] shadow-2xl shadow-[#1B1555]/30 transition-all hover:bg-[#16BCF8] hover:shadow-[#16BCF8]/40 hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Applying...
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                Commit Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EditTransferModal;
