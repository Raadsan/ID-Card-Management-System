"use client";

import { useState, useEffect, useRef } from "react";
import { getMe, updateUser } from "@/api/userApi";
import { Camera, Mail, Phone, Shield, User, Loader2, Save, Trash2, ShieldCheck } from "lucide-react";
import MessageBox, { MessageBoxType } from "@/components/MessageBox";

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [msgBox, setMsgBox] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: MessageBoxType;
    }>({
        isOpen: false,
        title: "",
        message: "",
        type: "info",
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await getMe();
            setUser(data);
            if (data.photo) {
                setPreviewImage(`http://localhost:5000/uploads/${data.photo}`);
            }
        } catch (error) {
            console.error("Failed to fetch profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!user) return;

        try {
            setSaving(true);
            const formData = new FormData();
            formData.append("fullName", user.fullName);
            formData.append("email", user.email);
            formData.append("phone", user.phone || "");

            if (selectedFile) {
                formData.append("photo", selectedFile);
            }

            await updateUser(user.id, formData);

            setMsgBox({
                isOpen: true,
                title: "Information Synchronized",
                message: "Your professional profile has been securely updated in the system registry.",
                type: "success",
            });

            fetchProfile();
        } catch (error: any) {
            console.error("Failed to update profile:", error);
            setMsgBox({
                isOpen: true,
                title: "Update Failed",
                message: error.response?.data?.message || "An unexpected error occurred while saving.",
                type: "error",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-[#1B1555] opacity-20" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Loading Registry...</span>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 bg-gray-50/30 min-h-screen">
            <div className="max-w-4xl mx-auto animate-in fade-in duration-700">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-[#1B1555] flex items-center justify-center text-white shadow-xl shadow-[#1B1555]/20">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-[#1B1555] tracking-tight">System Identity</h1>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Manage your administrative credentials</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Panel: Profile Visual */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#1B1555] to-[#16BCF8]"></div>

                            <div className="relative mb-6">
                                <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-[#16BCF8] to-[#1B1555] opacity-30 blur group-hover:opacity-50 transition-all duration-500"></div>
                                <div className="relative h-44 w-44 overflow-hidden rounded-full border-4 border-white shadow-2xl">
                                    <img
                                        src={previewImage || "/placeholder-user.png"}
                                        alt="Profile"
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 bg-[#1B1555]/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                                    >
                                        <Camera className="text-white h-10 w-10" />
                                    </button>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                />
                            </div>

                            <h2 className="text-xl font-black text-[#1B1555] tracking-tight truncate w-full">{user.fullName}</h2>
                            <div className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full bg-[#16BCF8]/10 border border-[#16BCF8]/20">
                                <Shield size={12} className="text-[#16BCF8]" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#16BCF8]">{user.role?.name}</span>
                            </div>

                            <div className="w-full h-px bg-gray-100 my-8"></div>

                            <div className="w-full space-y-5">
                                <div className="flex items-center gap-4 text-left">
                                    <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#16BCF8]/10 group-hover:text-[#16BCF8] transition-colors">
                                        <Mail size={16} />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Email Address</span>
                                        <span className="text-sm font-bold text-[#1B1555] truncate">{user.email}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-left">
                                    <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#16BCF8]/10 group-hover:text-[#16BCF8] transition-colors">
                                        <Phone size={16} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Mobile Phone</span>
                                        <span className="text-sm font-bold text-[#1B1555]">{user.phone || "Not Set"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Edit Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 relative h-full">
                            <h3 className="text-[11px] font-black text-[#1B1555] uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                                <span className="h-1.5 w-10 rounded-full bg-[#16BCF8]"></span>
                                Registry Parameters
                            </h3>

                            <div className="space-y-8">
                                {/* Full Name */}
                                <div className="group space-y-2.5">
                                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#1B1555]/50 flex items-center gap-2 group-focus-within:text-[#16BCF8] transition-colors">
                                        <User size={14} /> Full Participant Name
                                    </label>
                                    <input
                                        type="text"
                                        value={user.fullName}
                                        onChange={(e) => setUser({ ...user, fullName: e.target.value })}
                                        className="w-full rounded-2xl border border-gray-100 p-4 text-sm font-bold text-[#1B1555] transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/50 hover:bg-white"
                                    />
                                </div>

                                {/* Email */}
                                <div className="group space-y-2.5">
                                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#1B1555]/50 flex items-center gap-2 group-focus-within:text-[#16BCF8] transition-colors">
                                        <Mail size={14} /> System Access Email
                                    </label>
                                    <input
                                        type="email"
                                        value={user.email}
                                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                                        className="w-full rounded-2xl border border-gray-100 p-4 text-sm font-bold text-[#1B1555] transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/50 hover:bg-white"
                                    />
                                </div>

                                {/* Phone */}
                                <div className="group space-y-2.5">
                                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#1B1555]/50 flex items-center gap-2 group-focus-within:text-[#16BCF8] transition-colors">
                                        <Phone size={14} /> Contact Information
                                    </label>
                                    <input
                                        type="text"
                                        value={user.phone || ""}
                                        onChange={(e) => setUser({ ...user, phone: e.target.value })}
                                        placeholder="Ex: +252 61..."
                                        className="w-full rounded-2xl border border-gray-100 p-4 text-sm font-bold text-[#1B1555] transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/50 hover:bg-white"
                                    />
                                </div>
                            </div>

                            <div className="mt-16 pt-10 border-t border-gray-50 flex items-center justify-between">
                                <button
                                    onClick={fetchProfile}
                                    className="flex items-center gap-2 px-6 py-4 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-rose-500 hover:bg-rose-50 transition-all"
                                >
                                    <Trash2 size={16} /> Discard Changes
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-4 rounded-2xl bg-[#1B1555] px-12 py-5 text-[10px] font-black text-white uppercase tracking-[0.3em] shadow-2xl shadow-[#1B1555]/40 transition-all hover:bg-[#16BCF8] hover:shadow-[#16BCF8]/40 hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Synchronizing...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Sync Registry
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <MessageBox
                isOpen={msgBox.isOpen}
                onClose={() => setMsgBox(prev => ({ ...prev, isOpen: false }))}
                title={msgBox.title}
                message={msgBox.message}
                type={msgBox.type}
            />
        </div>
    );
}
