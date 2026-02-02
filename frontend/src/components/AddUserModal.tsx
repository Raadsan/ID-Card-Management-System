"use client";

import React, { useState, useEffect, useRef } from "react";
import Modal from "./Modal";
import { createUser } from "@/api/userApi";
import { getRoles } from "@/api/roleApi";
import { Loader2, User, Mail, Phone, Lock, Camera, Shield, Users, ChevronDown } from "lucide-react";

interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState<any[]>([]);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        gender: "male",
        roleId: "",
    });

    const [photo, setPhoto] = useState<File | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            fetchRoles();
        }
    }, [isOpen]);

    const fetchRoles = async () => {
        try {
            const data = await getRoles();
            setRoles(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch roles:", err);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhoto(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.fullName || !formData.email || !formData.password || !formData.roleId) {
            setError("Required: Full Name, Email, Password, and Role.");
            return;
        }

        try {
            setLoading(true);

            const submitData = new FormData();
            submitData.append("fullName", formData.fullName);
            submitData.append("email", formData.email);
            submitData.append("phone", formData.phone);
            submitData.append("password", formData.password);
            submitData.append("gender", formData.gender);
            submitData.append("roleId", formData.roleId);

            if (photo) {
                submitData.append("photo", photo);
            }

            await createUser(submitData);

            // Reset form
            setFormData({
                fullName: "",
                email: "",
                phone: "",
                password: "",
                gender: "male",
                roleId: "",
            });
            setPhoto(null);
            setPreviewUrl(null);

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Failed to create user:", err);
            setError(err.response?.data?.message || "Internal system error. Please review your data.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create System User" maxWidth="max-w-2xl">
            <form onSubmit={handleSubmit} className="px-2 py-4">
                {error && (
                    <div className="mb-6 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-100 flex items-center gap-3">
                        <Shield className="h-4 w-4 flex-shrink-0" />
                        <p className="uppercase tracking-wider text-center flex-1">{error}</p>
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-12 items-start">
                    {/* Section: Profile Image */}
                    <div className="flex flex-col items-center space-y-4 md:w-48 sticky top-0">
                        <div className="relative group">
                            <div className="h-40 w-40 overflow-hidden rounded-full border-[6px] border-gray-50 shadow-2xl flex items-center justify-center transition-all group-hover:border-[#16BCF8]/20 bg-white">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                                ) : (
                                    <User className="h-20 w-20 text-gray-100" />
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-2 right-2 h-11 w-11 rounded-full bg-[#1B1555] text-white flex items-center justify-center shadow-2xl border-2 border-white transition-all hover:bg-[#16BCF8] hover:scale-110 active:scale-95"
                            >
                                <Camera size={20} />
                            </button>
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Profile Avatar</p>
                            <p className="text-[9px] text-gray-300 font-medium italic">Max size: 2MB</p>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />
                    </div>

                    {/* Section: Data Fields (Full width rows) */}
                    <div className="flex-1 w-full space-y-5">
                        {/* Full Name - Single Row */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                <User size={12} className="text-[#16BCF8]" /> Full Name *
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Ex: Ahmed Mohamed"
                                className="w-full rounded-xl border border-gray-200 p-3.5 text-sm font-semibold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30"
                                required
                            />
                        </div>

                        {/* Email - Single Row */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                <Mail size={12} className="text-[#16BCF8]" /> Official Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="user@raadsan.com"
                                className="w-full rounded-xl border border-gray-200 p-3.5 text-sm font-semibold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30"
                                required
                            />
                        </div>

                        {/* Phone - Single Row */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                <Phone size={12} className="text-[#16BCF8]" /> Primary Phone
                            </label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+252 ..."
                                className="w-full rounded-xl border border-gray-200 p-3.5 text-sm font-semibold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30"
                            />
                        </div>

                        {/* Password - Single Row */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                <Lock size={12} className="text-[#16BCF8]" /> System Password *
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full rounded-xl border border-gray-200 p-3.5 text-sm font-semibold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30"
                                required
                            />
                        </div>

                        {/* Role - Single Row */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                <Shield size={12} className="text-[#16BCF8]" /> Authority Rank *
                            </label>
                            <div className="relative group">
                                <select
                                    name="roleId"
                                    value={formData.roleId}
                                    onChange={handleChange}
                                    className="w-full appearance-none rounded-xl border border-gray-200 p-3.5 text-sm font-bold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30 cursor-pointer pr-10"
                                    required
                                >
                                    <option value="">Select Account Authority</option>
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-[#16BCF8] transition-colors">
                                    <ChevronDown size={18} />
                                </div>
                            </div>
                        </div>

                        {/* Gender - Single Row */}
                        <div className="space-y-3 pt-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                <Users size={12} className="text-[#16BCF8]" /> Biological Gender
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData(p => ({ ...p, gender: 'male' }))}
                                    className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border-2 transition-all duration-300 ${formData.gender === 'male'
                                            ? 'border-[#16BCF8] bg-[#16BCF8]/10 text-[#16BCF8] font-black shadow-lg shadow-[#16BCF8]/10 translate-y-[-2px]'
                                            : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
                                        }`}
                                >
                                    Male
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData(p => ({ ...p, gender: 'female' }))}
                                    className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border-2 transition-all duration-300 ${formData.gender === 'female'
                                            ? 'border-[#16BCF8] bg-[#16BCF8]/10 text-[#16BCF8] font-black shadow-lg shadow-[#16BCF8]/10 translate-y-[-2px]'
                                            : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
                                        }`}
                                >
                                    Female
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
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
                        disabled={loading}
                        className="flex items-center gap-3 rounded-xl bg-[#1B1555] px-12 py-3.5 text-sm font-black text-white uppercase tracking-[0.15em] shadow-2xl shadow-[#1B1555]/30 transition-all hover:bg-[#16BCF8] hover:shadow-[#16BCF8]/40 hover:translate-y-[-2px] active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Validating...
                            </>
                        ) : (
                            "Finalize Registration"
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AddUserModal;
