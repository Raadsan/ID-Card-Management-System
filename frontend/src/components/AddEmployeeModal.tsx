"use client";

import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { getUsers } from "@/api/userApi";
import { getDepartments } from "@/api/departmentApi";
import { createEmployee } from "@/api/employeeApi";
import { Loader2, Briefcase, Hash, MapPin, Calendar, Activity, ChevronDown, UserCircle } from "lucide-react";

interface AddEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        userId: "",
        departmentId: "",
        employeeCode: "",
        title: "",
        address: "",
        dob: "",
        status: "active",
    });

    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            fetchRequiredData();
        }
    }, [isOpen]);

    const fetchRequiredData = async () => {
        try {
            setFetchingData(true);
            const [usersData, departmentsData] = await Promise.all([
                getUsers(),
                getDepartments(),
            ]);

            const availableUsers = Array.isArray(usersData)
                ? usersData.filter((u: any) => !u.employee)
                : [];

            setUsers(availableUsers);
            setDepartments(departmentsData);
        } catch (err) {
            console.error("Failed to fetch data for modal:", err);
            setError("Authentication or Network error. Failed to load data.");
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

        if (!formData.userId || !formData.departmentId || !formData.employeeCode || !formData.title) {
            setError("Required Fields: User, Department, Code, and Job Title.");
            return;
        }

        try {
            setLoading(true);
            await createEmployee({
                ...formData,
                userId: Number(formData.userId),
                departmentId: Number(formData.departmentId),
            });

            setFormData({
                userId: "",
                departmentId: "",
                employeeCode: "",
                title: "",
                address: "",
                dob: "",
                status: "active",
            });

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Failed to create employee:", err);
            setError(err.response?.data?.message || "Internal error. Please verify input data.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Register New Employee" maxWidth="max-w-2xl">
            <form onSubmit={handleSubmit} className="px-2 py-4">
                {error && (
                    <div className="mb-6 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-100 flex items-center gap-3">
                        <Activity className="h-4 w-4 flex-shrink-0" />
                        <p className="uppercase tracking-wider flex-1 text-center">{error}</p>
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-12 items-start">
                    {/* Visual Identifier Section */}
                    <div className="flex flex-col items-center space-y-4 md:w-48 sticky top-0">
                        <div className="h-40 w-40 rounded-full bg-gray-50 border-[6px] border-white shadow-2xl flex items-center justify-center text-gray-100">
                            <UserCircle className="h-24 w-24" />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Employee Profile</p>
                            <p className="text-[9px] text-gray-300 font-medium">Link with User Account</p>
                        </div>
                    </div>

                    {/* Data Entry Section (Single Row Each) */}
                    <div className="flex-1 w-full space-y-5">

                        {/* User Link - Single Row */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                <UserCircle size={12} className="text-[#16BCF8]" /> Linked User *
                            </label>
                            <div className="relative group">
                                <select
                                    name="userId"
                                    value={formData.userId}
                                    onChange={handleChange}
                                    disabled={fetchingData}
                                    className="w-full appearance-none rounded-xl border border-gray-200 p-3.5 text-sm font-bold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30 pr-10 disabled:opacity-50"
                                    required
                                >
                                    <option value="">Choose system user...</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.fullName} ({user.email})
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    {fetchingData ? <Loader2 size={16} className="animate-spin" /> : <ChevronDown size={18} />}
                                </div>
                            </div>
                        </div>

                        {/* Department - Single Row */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                <Briefcase size={12} className="text-[#16BCF8]" /> Department *
                            </label>
                            <div className="relative group">
                                <select
                                    name="departmentId"
                                    value={formData.departmentId}
                                    onChange={handleChange}
                                    disabled={fetchingData}
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

                        {/* Employee Code - Single Row */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                <Hash size={12} className="text-[#16BCF8]" /> Identification Code *
                            </label>
                            <input
                                type="text"
                                name="employeeCode"
                                value={formData.employeeCode}
                                onChange={handleChange}
                                placeholder="Ex: EMP-109"
                                className="w-full rounded-xl border border-gray-200 p-3.5 text-sm font-semibold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30"
                                required
                            />
                        </div>

                        {/* Job Title - Single Row */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                <Briefcase size={12} className="text-[#16BCF8]" /> Professional Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Ex: Senior Analyst"
                                className="w-full rounded-xl border border-gray-200 p-3.5 text-sm font-semibold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30"
                                required
                            />
                        </div>

                        {/* DOB - Single Row */}
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

                        {/* Status - Single Row */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                <Activity size={12} className="text-[#16BCF8]" /> Employment Status
                            </label>
                            <div className="relative group">
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
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-[#16BCF8] transition-all">
                                    <ChevronDown size={18} />
                                </div>
                            </div>
                        </div>

                        {/* Address - Single Row */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                <MapPin size={12} className="text-[#16BCF8]" /> Residential Address
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Enter full residential details..."
                                className="w-full rounded-xl border border-gray-200 p-3.5 text-sm font-semibold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30 resize-none"
                            />
                        </div>

                    </div>
                </div>

                {/* Submit Actions */}
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
                                Processing...
                            </>
                        ) : (
                            "Commit Registration"
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AddEmployeeModal;
