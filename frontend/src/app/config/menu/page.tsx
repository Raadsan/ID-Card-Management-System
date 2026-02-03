"use client";

import { useEffect, useState, useMemo } from "react";
import DataTable from "@/components/layout/DataTable";
import { getMenus, deleteMenu, createMenu, updateMenu, getMenuById } from "@/api/menuApi";
import { Edit, Trash2, Layout, ExternalLink, Box, Plus, Link as LinkIcon, Smile, ChevronDown, Loader2, Save } from "lucide-react";
import Modal from "@/components/layout/Modal";
import DeleteConfirmModal from "@/components/layout/ConfirmDeleteModel";
import MessageBox, { MessageBoxType } from "@/components/MessageBox";

// Define the Menu type based on your API response
interface Menu {
    id: number;
    title: string;
    url?: string;
    icon?: string;
    isCollapsible: boolean;
}

export default function MenuPage() {
    const [menus, setMenus] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null);
    const [menuToDelete, setMenuToDelete] = useState<Menu | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        url: "",
        icon: "",
        isCollapsible: false,
    });
    const [subMenus, setSubMenus] = useState<{ id?: number; title: string; url: string }[]>([]);

    // MessageBox State
    const [msgBox, setMsgBox] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: MessageBoxType;
        onConfirm?: () => void;
        loading?: boolean;
    }>({
        isOpen: false,
        title: "",
        message: "",
        type: "info",
    });

    useEffect(() => {
        fetchMenus();
    }, []);

    useEffect(() => {
        if (isEditModalOpen && selectedMenuId) {
            fetchMenuDetails();
        }
    }, [isEditModalOpen, selectedMenuId]);

    const fetchMenus = async () => {
        try {
            setLoading(true);
            const data = await getMenus();
            if (Array.isArray(data)) {
                setMenus(data);
            } else {
                setMenus([]);
            }
        } catch (error) {
            console.error("Failed to fetch menus:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMenuDetails = async () => {
        if (!selectedMenuId) return;
        try {
            setIsFetching(true);
            const data = await getMenuById(String(selectedMenuId));
            setFormData({
                title: data.title || "",
                url: data.url || "",
                icon: data.icon || "",
                isCollapsible: data.isCollapsible || false,
            });
            setSubMenus(data.subMenus || []);
        } catch (err) {
            console.error("Failed to fetch menu details:", err);
            setMsgBox({
                isOpen: true,
                title: "Error",
                message: "Failed to load menu details.",
                type: "error",
            });
        } finally {
            setIsFetching(false);
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubMenuChange = (index: number, field: "title" | "url", value: string) => {
        const updated = [...subMenus];
        updated[index][field] = value;
        setSubMenus(updated);
    };

    const addSubMenu = () => {
        setSubMenus([...subMenus, { title: "", url: "" }]);
    };

    const removeSubMenu = (index: number) => {
        setSubMenus(subMenus.filter((_, i) => i !== index));
    };

    const handleAddMenu = () => {
        setFormData({ title: "", url: "", icon: "", isCollapsible: false });
        setSubMenus([]);
        setIsAddModalOpen(true);
    };

    const handleEdit = (menu: Menu) => {
        setSelectedMenuId(menu.id);
        setIsEditModalOpen(true);
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await createMenu({
                ...formData,
                subMenus: formData.isCollapsible ? subMenus : []
            });
            setIsAddModalOpen(false);
            setMsgBox({
                isOpen: true,
                title: "Success",
                message: "A new navigation menu has been created.",
                type: "success",
            });
            fetchMenus();
        } catch (error: any) {
            setMsgBox({
                isOpen: true,
                title: "Error",
                message: error.response?.data?.message || "Failed to create menu.",
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMenuId) return;
        try {
            setIsSubmitting(true);
            await updateMenu(String(selectedMenuId), {
                ...formData,
                subMenus: formData.isCollapsible ? subMenus : []
            });
            setIsEditModalOpen(false);
            setMsgBox({
                isOpen: true,
                title: "Success",
                message: "Menu changes have been updated.",
                type: "success",
            });
            fetchMenus();
        } catch (error: any) {
            setMsgBox({
                isOpen: true,
                title: "Error",
                message: error.response?.data?.message || "Failed to update menu.",
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (menu: Menu) => {
        setMenuToDelete(menu);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!menuToDelete) return;
        try {
            setLoading(true);
            await deleteMenu(String(menuToDelete.id));
            setMsgBox({
                isOpen: true,
                title: "Success",
                message: `Menu "${menuToDelete.title}" has been deleted.`,
                type: "success",
            });
            fetchMenus();
        } catch (error: any) {
            setMsgBox({
                isOpen: true,
                title: "Error",
                message: error.response?.data?.message || "Failed to delete menu item.",
                type: "error",
            });
        } finally {
            setLoading(false);
            setMenuToDelete(null);
        }
    };

    const performDelete = async (id: number) => {
        try {
            setMsgBox(prev => ({ ...prev, loading: true }));
            await deleteMenu(String(id));
            setMsgBox({
                isOpen: true,
                title: "Registry Purged",
                message: "The navigation node has been successfully removed from the system registry.",
                type: "success",
            });
            fetchMenus();
        } catch (error: any) {
            setMsgBox({
                isOpen: true,
                title: "Operation Restricted",
                message: error.response?.data?.message || "Internal failure aborted the purge operation.",
                type: "error",
            });
        }
    };

    const columns = useMemo(
        () => [
            {
                label: "ID",
                key: "id",
                render: (row: Menu) => (
                    <span className="text-[10px] font-black tracking-widest text-[#1B1555]/40 tabular-nums">
                        #{row.id.toString().padStart(3, '0')}
                    </span>
                )
            },
            {
                label: "Title",
                key: "title",
                render: (row: Menu) => (
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-[#16BCF8]/5 flex items-center justify-center text-[#16BCF8]">
                            <Layout size={14} />
                        </div>
                        <span className="font-bold text-[#1B1555] tracking-tight">{row.title}</span>
                    </div>
                )
            },
            {
                label: "URL",
                key: "url",
                render: (row: Menu) => (
                    <div className="flex items-center gap-2">
                        {row.url ? (
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-50 border border-gray-100">
                                <ExternalLink size={10} className="text-gray-400" />
                                <span className="text-[10px] font-bold text-gray-500 font-mono">{row.url}</span>
                            </div>
                        ) : (
                            <span className="text-[10px] font-bold text-gray-300 uppercase italic">No url</span>
                        )}
                    </div>
                ),
            },
            {
                label: "Icon",
                key: "icon",
                render: (row: Menu) => (
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-gray-100 flex items-center justify-center border border-gray-200">
                            <Box size={10} className="text-gray-400" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                            {row.icon || "Default"}
                        </span>
                    </div>
                ),
            },
            {
                label: "isCollapsible",
                key: "isCollapsible",
                render: (row: Menu) => (
                    <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${row.isCollapsible
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-gray-50 text-gray-400 border border-gray-100'
                        }`}>
                        <div className={`h-1 w-1 rounded-full ${row.isCollapsible ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                        {row.isCollapsible ? "Yes" : "No"}
                    </div>
                ),
            },
            {
                label: "Actions",
                key: "actions",
                align: "center",
                render: (row: Menu) => (
                    <div className="flex items-center justify-center gap-1.5">
                        <button
                            onClick={() => handleEdit(row)}
                            className="rounded p-1 text-blue-600 hover:bg-blue-50"
                            title="Edit Menu"
                        >
                            <Edit className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => handleDelete(row)}
                            className="rounded p-1 text-red-600 hover:bg-red-50"
                            title="Delete Menu"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ),
            },
        ],
        [menus]
    );

    return (
        <div className="p-6 space-y-6 bg-gray-50/30 min-h-screen">
            <DataTable
                title="System Menu Registry"
                columns={columns}
                data={menus}
                loading={loading}
                onAddClick={handleAddMenu}
                addButtonLabel="Add Menu"
            />

            {/* Add Menu Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Menu" maxWidth="max-w-2xl">
                <form onSubmit={handleAddSubmit} className="px-4 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#1B1555]/60 flex items-center gap-2">
                                <Layout size={12} /> Menu Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleFormChange}
                                placeholder="Ex: Dashboard"
                                className="w-full rounded-xl border border-gray-200 p-4 text-sm font-bold bg-gray-50/50 focus:border-[#16BCF8] focus:ring-4 focus:ring-[#16BCF8]/5 outline-none transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#1B1555]/60 flex items-center gap-2">
                                <Smile size={12} /> Lucide Icon Name
                            </label>
                            <input
                                type="text"
                                name="icon"
                                value={formData.icon}
                                onChange={handleFormChange}
                                placeholder="Ex: home, users, settings"
                                className="w-full rounded-xl border border-gray-200 p-4 text-sm font-bold bg-gray-50/50 focus:border-[#16BCF8] focus:ring-4 focus:ring-[#16BCF8]/5 outline-none transition-all"
                            />
                        </div>
                        <div className={`space-y-2 transition-all ${formData.isCollapsible ? 'opacity-50 pointer-events-none' : ''}`}>
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#1B1555]/60 flex items-center gap-2">
                                <LinkIcon size={12} /> Target URL
                            </label>
                            <input
                                type="text"
                                name="url"
                                value={formData.url}
                                onChange={handleFormChange}
                                placeholder="/system/dashboard"
                                className="w-full rounded-xl border border-gray-200 p-4 text-sm font-bold bg-gray-50/50 focus:border-[#16BCF8] focus:ring-4 focus:ring-[#16BCF8]/5 outline-none transition-all"
                                disabled={formData.isCollapsible}
                            />
                        </div>
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
                                    onChange={handleFormChange}
                                    className="peer sr-only"
                                />
                                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#16BCF8] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                            </label>
                        </div>
                    </div>

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
                                        className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-10 flex items-center justify-end gap-3 border-t border-gray-100 pt-8">
                        <button
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                            className="px-8 py-3.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-100 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-3 bg-[#1B1555] text-white px-10 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-[#1B1555]/20 hover:bg-[#16BCF8] hover:shadow-[#16BCF8]/30 transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            Save Menu
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Menu Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Menu" maxWidth="max-w-2xl">
                {isFetching ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 size={40} className="animate-spin text-[#16BCF8]/20" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1B1555]/40">Syncing Parameters...</span>
                    </div>
                ) : (
                    <form onSubmit={handleEditSubmit} className="px-4 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#1B1555]/60 flex items-center gap-2">
                                    <Layout size={12} /> Menu Title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleFormChange}
                                    placeholder="Ex: Dashboard"
                                    className="w-full rounded-xl border border-gray-200 p-4 text-sm font-bold bg-gray-50/50 focus:border-[#16BCF8] focus:ring-4 focus:ring-[#16BCF8]/5 outline-none transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#1B1555]/60 flex items-center gap-2">
                                    <Smile size={12} /> Lucide Icon Name
                                </label>
                                <input
                                    type="text"
                                    name="icon"
                                    value={formData.icon}
                                    onChange={handleFormChange}
                                    placeholder="Ex: home, users, settings"
                                    className="w-full rounded-xl border border-gray-200 p-4 text-sm font-bold bg-gray-50/50 focus:border-[#16BCF8] focus:ring-4 focus:ring-[#16BCF8]/5 outline-none transition-all"
                                />
                            </div>
                            <div className={`space-y-2 transition-all ${formData.isCollapsible ? 'opacity-50 pointer-events-none' : ''}`}>
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#1B1555]/60 flex items-center gap-2">
                                    <LinkIcon size={12} /> Target URL
                                </label>
                                <input
                                    type="text"
                                    name="url"
                                    value={formData.url}
                                    onChange={handleFormChange}
                                    placeholder="/system/dashboard"
                                    className="w-full rounded-xl border border-gray-200 p-4 text-sm font-bold bg-gray-50/50 focus:border-[#16BCF8] focus:ring-4 focus:ring-[#16BCF8]/5 outline-none transition-all"
                                    disabled={formData.isCollapsible}
                                />
                            </div>
                            <div className="flex items-center gap-4 bg-[#1B1555]/5 p-4 rounded-xl border border-[#1B1555]/10 mt-6">
                                <div className="flex-1">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#1B1555]">Collapsible Menu</h4>
                                    <p className="text-[9px] font-bold text-gray-500 uppercase mt-0.5">Toggle hierarchical state</p>
                                </div>
                                <label className="relative inline-flex cursor-pointer items-center">
                                    <input
                                        type="checkbox"
                                        name="isCollapsible"
                                        checked={formData.isCollapsible}
                                        onChange={handleFormChange}
                                        className="peer sr-only"
                                    />
                                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#16BCF8] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                                </label>
                            </div>
                        </div>

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
                                            className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-10 flex items-center justify-end gap-3 border-t border-gray-100 pt-8">
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-8 py-3.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-100 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center gap-3 bg-[#1B1555] text-white px-10 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-[#1B1555]/20 hover:bg-[#16BCF8] hover:shadow-[#16BCF8]/30 transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                Update Changes
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                itemName={menuToDelete?.title}
                message={`Are you sure you want to delete "${menuToDelete?.title}"? This will permanently remove its entire hierarchy.`}
            />

            <MessageBox
                isOpen={msgBox.isOpen}
                onClose={() => setMsgBox(prev => ({ ...prev, isOpen: false }))}
                onConfirm={msgBox.onConfirm}
                title={msgBox.title}
                message={msgBox.message}
                type={msgBox.type}
                loading={msgBox.loading}
            />
        </div>
    );
}
