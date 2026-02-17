"use client";

import { useEffect, useState, useMemo } from "react";
import DataTable from "@/components/layout/DataTable";
import { usePermission } from "@/hooks/usePermission";
import { getDepartments, deleteDepartment, createDepartment, updateDepartment, getDepartmentById } from "@/api/departmentApi";
import { Edit, Trash2, Briefcase, AlignLeft, Shield, CheckCircle2, Loader2, Save, Activity, Plus } from "lucide-react";
import Modal from "@/components/layout/Modal";
import DeleteConfirmModal from "@/components/layout/ConfirmDeleteModel";
import MessageBox, { MessageBoxType } from "@/components/MessageBox";

// Define the Department type based on your API response
interface Department {
    id: number;
    departmentName: string;
    description: string;
}

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
    const [deptToDelete, setDeptToDelete] = useState<Department | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        departmentName: "",
        description: "",
    });

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
        fetchDepartments();
    }, []);

    useEffect(() => {
        if (isEditModalOpen && selectedDepartmentId) {
            fetchDepartmentDetails();
        }
    }, [isEditModalOpen, selectedDepartmentId]);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const response = await getDepartments();
            setDepartments(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error("Failed to fetch departments:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartmentDetails = async () => {
        if (!selectedDepartmentId) return;
        try {
            setIsFetching(true);
            const response = await getDepartmentById(String(selectedDepartmentId));
            const dept = response.department;
            if (dept) {
                setFormData({
                    departmentName: dept.departmentName || "",
                    description: dept.description || "",
                });
            }
        } catch (err) {
            console.error("Failed to fetch department:", err);
            setMsgBox({
                isOpen: true,
                title: "Error",
                message: "Failed to load department details.",
                type: "error",
            });
        } finally {
            setIsFetching(false);
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddDepartment = () => {
        setFormData({ departmentName: "", description: "" });
        setIsAddModalOpen(true);
    };

    const handleEdit = (department: Department) => {
        setSelectedDepartmentId(department.id);
        setIsEditModalOpen(true);
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await createDepartment(formData);
            setIsAddModalOpen(false);
            setMsgBox({
                isOpen: true,
                title: "Success",
                message: "A new department has been established.",
                type: "success",
            });
            fetchDepartments();
        } catch (error: any) {
            setMsgBox({
                isOpen: true,
                title: "Error",
                message: error.response?.data?.message || "Failed to create department.",
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDepartmentId) return;
        try {
            setIsSubmitting(true);
            await updateDepartment(String(selectedDepartmentId), formData);
            setIsEditModalOpen(false);
            setMsgBox({
                isOpen: true,
                title: "Success",
                message: "Department details have been updated.",
                type: "success",
            });
            fetchDepartments();
        } catch (error: any) {
            setMsgBox({
                isOpen: true,
                title: "Error",
                message: error.response?.data?.message || "Failed to update department.",
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (dept: Department) => {
        setDeptToDelete(dept);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deptToDelete) return;
        try {
            setLoading(true);
            await deleteDepartment(String(deptToDelete.id));
            setMsgBox({
                isOpen: true,
                title: "Success",
                message: `Department "${deptToDelete.departmentName}" has been deleted.`,
                type: "success",
            });
            fetchDepartments();
        } catch (error: any) {
            setMsgBox({
                isOpen: true,
                title: "Error",
                message: error.response?.data?.message || "Failed to delete department.",
                type: "error",
            });
        } finally {
            setLoading(false);
            setDeptToDelete(null);
        }
    };

    const performDelete = async (id: number) => {
        try {
            setMsgBox(prev => ({ ...prev, loading: true }));
            await deleteDepartment(String(id));
            setMsgBox({
                isOpen: true,
                title: "Deleted!",
                message: "Department and all associated data have been removed.",
                type: "success",
            });
            fetchDepartments();
        } catch (error: any) {
            console.error("Failed to delete department:", error);
            setMsgBox({
                isOpen: true,
                title: "Deletion Failed",
                message: error.response?.data?.message || "Could not delete department.",
                type: "error",
            });
        }
    };


    const { hasPermission } = usePermission();

    const canAdd = hasPermission("Departments", "add", true);
    const canEdit = hasPermission("Departments", "edit", true);
    const canDelete = hasPermission("Departments", "delete", true);

    const columns = useMemo(
        () => [
            {
                label: "Department Name",
                key: "departmentName",
                render: (row: Department) => (
                    <span className="font-semibold text-gray-900">{row.departmentName}</span>
                )
            },
            {
                label: "Description",
                key: "description",
                render: (row: Department) => (
                    <span className="text-gray-600 text-sm line-clamp-2">{row.description}</span>
                )
            },
            {
                label: "Actions",
                key: "actions",
                align: "center",
                render: (row: Department) => (
                    <div className="flex items-center justify-center gap-2">
                        {canEdit && (
                            <button
                                onClick={() => handleEdit(row)}
                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit Department"
                            >
                                <Edit className="h-4 w-4" />
                            </button>
                        )}
                        {canDelete && (
                            <button
                                onClick={() => handleDelete(row)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Delete Department"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                ),
            },
        ],
        [departments, canEdit, canDelete]
    );

    return (
        <div className="p-6 space-y-6">
            <DataTable
                title="All Departments"
                columns={columns}
                data={departments}
                loading={loading}
                onAddClick={canAdd ? handleAddDepartment : undefined}
                addButtonLabel="Add Department"
            />

            {/* Add Department Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Department" maxWidth="max-w-lg">
                <form onSubmit={handleAddSubmit} className="px-2">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                <Briefcase size={12} className="text-[#16BCF8]" /> Department Name *
                            </label>
                            <input
                                type="text"
                                name="departmentName"
                                value={formData.departmentName}
                                onChange={handleFormChange}
                                placeholder="Ex: Human Resources"
                                className="w-full rounded-xl border border-gray-200 p-3.5 text-sm font-bold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                <AlignLeft size={12} className="text-[#16BCF8]" /> Description *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleFormChange}
                                placeholder="Briefly describe the department's mandate..."
                                rows={4}
                                className="w-full rounded-xl border border-gray-200 p-4 text-sm font-semibold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30 resize-none"
                                required
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-6 px-2">
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
                            Add
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Department Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Department" maxWidth="max-w-lg">
                {isFetching ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-[#1B1555] opacity-20" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Syncing Record...</span>
                    </div>
                ) : (
                    <form onSubmit={handleEditSubmit} className="px-2">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                    <Briefcase size={12} className="text-[#16BCF8]" /> Department Name *
                                </label>
                                <input
                                    type="text"
                                    name="departmentName"
                                    value={formData.departmentName}
                                    onChange={handleFormChange}
                                    placeholder="Enter department name"
                                    className="w-full rounded-xl border border-gray-200 p-3.5 text-sm font-bold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                    <AlignLeft size={12} className="text-[#16BCF8]" /> Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleFormChange}
                                    placeholder="Update department mandate..."
                                    rows={4}
                                    className="w-full rounded-xl border border-gray-200 p-4 text-sm font-semibold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30 resize-none"
                                    required
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-6 px-2">
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
                                Edit
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                itemName={deptToDelete?.departmentName}
                message={`Are you sure you want to delete the "${deptToDelete?.departmentName}" department? This will also remove all associated employees and history history.`}
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
