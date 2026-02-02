"use client";

import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { getDepartments } from "@/api/departmentApi";
import { updateEmployee, getEmployeeById } from "@/api/employeeApi";
import { Loader2, Briefcase, Hash, MapPin, Calendar, Activity, ChevronDown, UserCircle, Save } from "lucide-react";

interface EditEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    employeeId: number | null;
}

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    employeeId,
}) => {
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(false);
    const [departments, setDepartments] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        employeeCode: "",
        title: "",
        address: "",
        dob: "",
        status: "active",
        departmentId: "",
    });

    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen && employeeId) {
            fetchInitialData();
        }
    }, [isOpen, employeeId]);

    const fetchInitialData = async () => {
        try {
            setFetchingData(true);
            setError("");

            const [departmentsData, employeeData] = await Promise.all([
                getDepartments(),
                getEmployeeById(String(employeeId))
            ]);

            setDepartments(departmentsData);

            if (employeeData) {
                setFormData({
                    employeeCode: employeeData.employeeCode || "",
                    title: employeeData.title || "",
                    address: employeeData.address || "",
                    dob: employeeData.dob ? new Date(employeeData.dob).toISOString().split('T')[0] : "",
                    status: employeeData.status || "active",
                    departmentId: employeeData.departmentId?.toString() || "",
                });
            }
        } catch (err: any) {
            console.error("Failed to fetch edit data:", err);
            setError("Connectivity error. Could not retrieve record details.");
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

        if (!formData.employeeCode || !formData.title || !formData.departmentId) {
            setError("Required Fields Missing: Identification Code, Job Title, or Department.");
            return;
        }

        try {
            setLoading(true);
            await updateEmployee(String(employeeId), {
                ...formData,
                departmentId: Number(formData.departmentId),
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Failed to update employee:", err);
            setError(err.response?.data?.message || "Internal system failure while updating record.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Modify Employee File" maxWidth="max-w-2xl">
            <form onSubmit={handleSubmit} className="px-2 py-4">
                {error && (
                    <div className="mb-6 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-100 flex items-center gap-3">
                        <Activity className="h-4 w-4 flex-shrink-0" />
                        <p className="uppercase tracking-wider flex-1 text-center">{error}</p>
                    </div>
                )}

                {fetchingData ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-[#1B1555] opacity-20" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Syncing Data...</span>
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row gap-12 items-start">
                        {/* Visual Context */}
                        <div className="flex flex-col items-center space-y-4 md:w-48 sticky top-0">
                            <div className="h-40 w-40 rounded-full bg-gray-50 border-[6px] border-white shadow-2xl flex items-center justify-center text-[#16BCF8]/20 bg-gradient-to-tr from-gray-50 to-white">
                                <UserCircle className="h-24 w-24" />
                            </div>
                            <div className="text-center space-y-1">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Updating Record</p>
                                <p className="text-[9px] text-[#16BCF8] font-bold uppercase tracking-tight">#{formData.employeeCode}</p>
                            </div>
                        </div>

                        {/* Fields (One Row Each) */}
                        <div className="flex-1 w-full space-y-5">

                            {/* Employee Code */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                    <Hash size={12} className="text-[#16BCF8]" /> Identification Code *
                                </label>
                                <input
                                    type="text"
                                    name="employeeCode"
                                    value={formData.employeeCode}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-200 p-3.5 text-sm font-semibold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30"
                                    required
                                />
                            </div>

                            {/* Job Title */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                    <Briefcase size={12} className="text-[#16BCF8]" /> Professional Title *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-200 p-3.5 text-sm font-semibold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30"
                                    required
                                />
                            </div>

                            {/* Department */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                    <Briefcase size={12} className="text-[#16BCF8]" /> Department *
                                </label>
                                <div className="relative">
                                    <select
                                        name="departmentId"
                                        value={formData.departmentId}
                                        onChange={handleChange}
                                        className="w-full appearance-none rounded-xl border border-gray-200 p-3.5 text-sm font-bold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30 pr-10"
                                        required
                                    >
                                        <option value="">Choose department...</option>
                                        {departments.map((dept) => (
                                            <option key={dept.id} value={dept.id}>
                                                {dept.departmentName}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <ChevronDown size={18} />
                                    </div>
                                </div>
                            </div>

                            {/* DOB */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                    <Calendar size={12} className="text-[#16BCF8]" /> Date of Birth
                                </label>
                                <input
                                    type="date"
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-200 p-3.5 text-sm font-semibold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30"
                                />
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                    <Activity size={12} className="text-[#16BCF8]" /> Employment Status
                                </label>
                                <div className="relative">
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full appearance-none rounded-xl border border-gray-200 p-3.5 text-sm font-bold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30 pr-10"
                                    >
                                        <option value="active">Active Service</option>
                                        <option value="inactive">Inactive / On-Hold</option>
                                        <option value="suspended">Contract Suspended</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <ChevronDown size={18} />
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                    <MapPin size={12} className="text-[#16BCF8]" /> Residential Address
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full rounded-xl border border-gray-200 p-3.5 text-sm font-semibold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30 resize-none"
                                />
                            </div>

                        </div>
                    </div>
                )}

                <div className="mt-12 flex items-center justify-end gap-3 border-t border-gray-100 pt-8 px-2">
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
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EditEmployeeModal;
