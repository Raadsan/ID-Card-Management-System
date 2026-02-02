"use client";

import React, { useState } from "react";
import Modal from "./Modal";
import { createMenu } from "@/api/menuApi";
import { Loader2, Plus, Trash2, Layout, Link as LinkIcon, Smile, ChevronDown } from "lucide-react";

interface AddMenuModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddMenuModal: React.FC<AddMenuModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        title: "",
        url: "",
        icon: "",
        isCollapsible: false,
    });
    const [subMenus, setSubMenus] = useState<{ title: string; url: string }[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const addSubMenu = () => {
        setSubMenus([...subMenus, { title: "", url: "" }]);
    };

    const handleSubMenuChange = (index: number, field: "title" | "url", value: string) => {
        const updated = [...subMenus];
        updated[index][field] = value;
        setSubMenus(updated);
    };

    const removeSubMenu = (index: number) => {
        setSubMenus(subMenus.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await createMenu({
                ...formData,
                subMenus: formData.isCollapsible ? subMenus : []
            });
            onSuccess();
            onClose();
            // Reset form
            setFormData({ title: "", url: "", icon: "", isCollapsible: false });
            setSubMenus([]);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to create menu item");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Define Navigation Node" maxWidth="max-w-2xl">
            <form onSubmit={handleSubmit} className="px-4 py-6">
                {error && (
                    <div className="mb-6 rounded-xl bg-red-50 p-4 text-[10px] font-black uppercase tracking-widest text-red-600 border border-red-100">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#1B1555]/60 flex items-center gap-2">
                            <Layout size={12} /> Menu Title
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Ex: Dashboard"
                            className="w-full rounded-xl border border-gray-200 p-4 text-sm font-bold bg-gray-50/50 focus:border-[#16BCF8] focus:ring-4 focus:ring-[#16BCF8]/5 outline-none transition-all"
                            required
                        />
                    </div>

                    {/* Icon */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#1B1555]/60 flex items-center gap-2">
                            <Smile size={12} /> Lucide Icon Name
                        </label>
                        <input
                            type="text"
                            name="icon"
                            value={formData.icon}
                            onChange={handleChange}
                            placeholder="Ex: home, users, settings"
                            className="w-full rounded-xl border border-gray-200 p-4 text-sm font-bold bg-gray-50/50 focus:border-[#16BCF8] focus:ring-4 focus:ring-[#16BCF8]/5 outline-none transition-all"
                        />
                    </div>

                    {/* URL */}
                    <div className={`space-y-2 transition-all ${formData.isCollapsible ? 'opacity-50 pointer-events-none' : ''}`}>
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#1B1555]/60 flex items-center gap-2">
                            <LinkIcon size={12} /> Target URL
                        </label>
                        <input
                            type="text"
                            name="url"
                            value={formData.url}
                            onChange={handleChange}
                            placeholder="/system/dashboard"
                            className="w-full rounded-xl border border-gray-200 p-4 text-sm font-bold bg-gray-50/50 focus:border-[#16BCF8] focus:ring-4 focus:ring-[#16BCF8]/5 outline-none transition-all"
                            disabled={formData.isCollapsible}
                        />
                    </div>

                    {/* Collapsible Toggle */}
                    <div className="flex items-center gap-4 bg-[#1B1555]/5 p-4 rounded-xl border border-[#1B1555]/10 mt-6">
                        <div className="flex-1">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#1B1555]">Collapsible Menu</h4>
                            <p className="text-[9px] font-bold text-gray-500 uppercase mt-0.5">Allow nested sub-items</p>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                            <input
                                type="checkbox"
                                name="isCollapsible"
                                checked={formData.isCollapsible}
                                onChange={handleChange}
                                className="peer sr-only"
                            />
                            <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#16BCF8] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                        </label>
                    </div>
                </div>

                {/* Submenus Section */}
                {formData.isCollapsible && (
                    <div className="mt-8 space-y-4 border-t border-gray-100 pt-8 animate-in fade-in slide-in-from-top-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#1B1555] flex items-center gap-2">
                                <ChevronDown size={14} /> Sub-Navigation Items
                            </label>
                            <button
                                type="button"
                                onClick={addSubMenu}
                                className="text-[9px] font-black uppercase tracking-widest text-[#16BCF8] hover:bg-[#16BCF8]/10 px-3 py-1.5 rounded-lg transition-all"
                            >
                                + Add Sub-Item
                            </button>
                        </div>

                        {subMenus.length === 0 ? (
                            <div className="bg-gray-50 border-2 border-dashed border-gray-100 rounded-2xl p-8 text-center">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No sub-items defined yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {subMenus.map((sm, index) => (
                                    <div key={index} className="flex gap-3 group">
                                        <input
                                            type="text"
                                            placeholder="Sub Title"
                                            value={sm.title}
                                            onChange={(e) => handleSubMenuChange(index, "title", e.target.value)}
                                            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-xs font-bold bg-white focus:border-[#16BCF8] outline-none transition-all shadow-sm"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Sub URL"
                                            value={sm.url}
                                            onChange={(e) => handleSubMenuChange(index, "url", e.target.value)}
                                            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-xs font-bold bg-white focus:border-[#16BCF8] outline-none transition-all shadow-sm"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeSubMenu(index)}
                                            className="p-3 text-red-100 group-hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-10 flex items-center justify-end gap-3 border-t border-gray-100 pt-8">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-8 py-3.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-100 rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-3 bg-[#1B1555] text-white px-10 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-[#1B1555]/20 hover:bg-[#16BCF8] hover:shadow-[#16BCF8]/30 transition-all disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                        Establish Navigation
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AddMenuModal;
