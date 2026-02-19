"use client";

import { useEffect, useState, useMemo } from "react";
import DataTable from "@/components/layout/DataTable";
import { usePermission } from "@/hooks/usePermission";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/api/categoryApi";
import { Edit, Trash2, Tag, AlignLeft, Shield, CheckCircle2, Loader2, Save, Plus } from "lucide-react";
import Modal from "@/components/layout/Modal";
import DeleteConfirmModal from "@/components/layout/ConfirmDeleteModel";
import MessageBox, { MessageBoxType } from "@/components/MessageBox";

interface Category {
    id: number;
    name: string;
    description: string;
}

export default function CategoryPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });

    // MessageBox State
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
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await getCategories();
            setCategories(Array.isArray(response.categories) ? response.categories : []);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddCategory = () => {
        setFormData({ name: "", description: "" });
        setIsAddModalOpen(true);
    };

    const handleEdit = (category: Category) => {
        setSelectedCategory(category);
        setFormData({
            name: category.name,
            description: category.description || "",
        });
        setIsEditModalOpen(true);
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await createCategory(formData);
            setIsAddModalOpen(false);
            setMsgBox({
                isOpen: true,
                title: "Success",
                message: "A new category has been created.",
                type: "success",
            });
            fetchCategories();
        } catch (error: any) {
            setMsgBox({
                isOpen: true,
                title: "Error",
                message: error.response?.data?.message || "Failed to create category.",
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategory) return;
        try {
            setIsSubmitting(true);
            await updateCategory({ id: selectedCategory.id, ...formData });
            setIsEditModalOpen(false);
            setMsgBox({
                isOpen: true,
                title: "Success",
                message: "Category details have been updated.",
                type: "success",
            });
            fetchCategories();
        } catch (error: any) {
            setMsgBox({
                isOpen: true,
                title: "Error",
                message: error.response?.data?.message || "Failed to update category.",
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (category: Category) => {
        setSelectedCategory(category);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedCategory) return;
        try {
            setLoading(true);
            await deleteCategory(selectedCategory.id);
            setMsgBox({
                isOpen: true,
                title: "Success",
                message: `Category "${selectedCategory.name}" has been deleted.`,
                type: "success",
            });
            fetchCategories();
        } catch (error: any) {
            setMsgBox({
                isOpen: true,
                title: "Error",
                message: error.response?.data?.message || "Failed to delete category.",
                type: "error",
            });
        } finally {
            setLoading(false);
            setIsDeleteModalOpen(false);
            setSelectedCategory(null);
        }
    };

    const { hasPermission } = usePermission();

    // Mapping to "Category" or similar permission if exists, otherwise checking against a default or specific one
    // For now using strings that might match what you'll set in the seeder or role permissions
    const canAdd = hasPermission("Category", "add", true);
    const canEdit = hasPermission("Category", "edit", true);
    const canDelete = hasPermission("Category", "delete", true);

    const columns = useMemo(
        () => [
            {
                label: "Category Name",
                key: "name",
                render: (row: Category) => (
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Tag className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="font-semibold text-gray-900">{row.name}</span>
                    </div>
                )
            },
            {
                label: "Description",
                key: "description",
                render: (row: Category) => (
                    <span className="text-gray-600 text-sm line-clamp-2">{row.description || "No description"}</span>
                )
            },
            {
                label: "Actions",
                key: "actions",
                align: "center",
                render: (row: Category) => (
                    <div className="flex items-center justify-center gap-2">
                        {canEdit && (
                            <button
                                onClick={() => handleEdit(row)}
                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit Category"
                            >
                                <Edit className="h-4 w-4" />
                            </button>
                        )}
                        {canDelete && (
                            <button
                                onClick={() => handleDelete(row)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Delete Category"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                ),
            },
        ],
        [categories, canEdit, canDelete]
    );

    return (
        <div className="p-6 space-y-6">
            <DataTable
                title="System Categories"
                columns={columns}
                data={categories}
                loading={loading}
                onAddClick={canAdd ? handleAddCategory : undefined}
                addButtonLabel="Add Category"
            />

            {/* Add Category Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Category" maxWidth="max-w-lg">
                <form onSubmit={handleAddSubmit} className="px-2">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                <Tag size={12} className="text-[#16BCF8]" /> Category Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleFormChange}
                                placeholder="Ex: Permanent Staff"
                                className="w-full rounded-xl border border-gray-200 p-3.5 text-sm font-bold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                <AlignLeft size={12} className="text-[#16BCF8]" /> Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleFormChange}
                                placeholder="Describe the category..."
                                rows={3}
                                className="w-full rounded-xl border border-gray-200 p-4 text-sm font-semibold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30 resize-none"
                            />
                        </div>
                    </div>
                    <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-6 px-2">
                        <button
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                            className="rounded-xl px-8 py-3 text-sm font-black text-gray-400 uppercase tracking-widest transition-all hover:bg-gray-100 active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-3 rounded-xl bg-[#1B1555] px-12 py-3 text-sm font-black text-white uppercase tracking-[0.15em] shadow-lg shadow-[#1B1555]/20 transition-all hover:bg-[#1B1555]/90 hover:shadow-[#1B1555]/40 hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus size={16} />}
                            Create
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Category Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Category" maxWidth="max-w-lg">
                <form onSubmit={handleEditSubmit} className="px-2">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                <Tag size={12} className="text-[#16BCF8]" /> Category Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleFormChange}
                                placeholder="Enter category name"
                                className="w-full rounded-xl border border-gray-200 p-3.5 text-sm font-bold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                <AlignLeft size={12} className="text-[#16BCF8]" /> Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleFormChange}
                                placeholder="Update description..."
                                rows={3}
                                className="w-full rounded-xl border border-gray-200 p-4 text-sm font-semibold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30 resize-none"
                            />
                        </div>
                    </div>
                    <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-6 px-2">
                        <button
                            type="button"
                            onClick={() => setIsEditModalOpen(false)}
                            className="rounded-xl px-8 py-3 text-sm font-black text-gray-400 uppercase tracking-widest transition-all hover:bg-gray-100 active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-3 rounded-xl bg-[#1B1555] px-12 py-3 text-sm font-black text-white uppercase tracking-[0.15em] shadow-2xl shadow-[#1B1555]/30 transition-all hover:bg-[#16BCF8] hover:shadow-[#16BCF8]/40 hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </Modal>

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                itemName={selectedCategory?.name}
                message={`Are you sure you want to delete the "${selectedCategory?.name}" category? This action cannot be undone.`}
            />

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
