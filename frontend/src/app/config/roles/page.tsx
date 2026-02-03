"use client";

import { useEffect, useState, useMemo } from "react";
import DataTable from "@/components/layout/DataTable";
import { getRoles, deleteRole, createRole, updateRole, getRoleById } from "@/api/roleApi";
import { Edit, Trash2, Shield, Info, Activity, Plus, AlignLeft, CheckCircle2, Loader2, Save } from "lucide-react";
import Modal from "@/components/layout/Modal";
import DeleteConfirmModal from "@/components/layout/ConfirmDeleteModel";
import MessageBox, { MessageBoxType } from "@/components/MessageBox";

// Define the Role type based on your API response
interface Role {
    id: number;
    name: string;
    description: string;
    createdAt?: string;
}

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

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
        onConfirm?: () => void;
        loading?: boolean;
    }>({
        isOpen: false,
        title: "",
        message: "",
        type: "info",
    });

    useEffect(() => {
        fetchRoles();
    }, []);

    useEffect(() => {
        if (isEditModalOpen && selectedRoleId) {
            fetchRoleDetails();
        }
    }, [isEditModalOpen, selectedRoleId]);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const data = await getRoles();
            if (Array.isArray(data)) {
                setRoles(data);
            } else {
                setRoles([]);
            }
        } catch (error) {
            console.error("Failed to fetch roles:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoleDetails = async () => {
        if (!selectedRoleId) return;
        try {
            setIsFetching(true);
            const data = await getRoleById(String(selectedRoleId));
            setFormData({
                name: data.name || "",
                description: data.description || "",
            });
        } catch (err) {
            console.error("Failed to fetch role details:", err);
            setMsgBox({
                isOpen: true,
                title: "Error",
                message: "Failed to load role details.",
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

    const handleAddRole = () => {
        setFormData({ name: "", description: "" });
        setIsAddModalOpen(true);
    };

    const handleEdit = (role: Role) => {
        setSelectedRoleId(role.id);
        setIsEditModalOpen(true);
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await createRole(formData);
            setIsAddModalOpen(false);
            setMsgBox({
                isOpen: true,
                title: "Success",
                message: "A new role has been added.",
                type: "success",
            });
            fetchRoles();
        } catch (error: any) {
            setMsgBox({
                isOpen: true,
                title: "Error",
                message: error.response?.data?.message || "Failed to add role.",
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRoleId) return;
        try {
            setIsSubmitting(true);
            await updateRole(String(selectedRoleId), formData);
            setIsEditModalOpen(false);
            setMsgBox({
                isOpen: true,
                title: "Success",
                message: "Role changes have been saved.",
                type: "success",
            });
            fetchRoles();
        } catch (error: any) {
            setMsgBox({
                isOpen: true,
                title: "Error",
                message: error.response?.data?.message || "Failed to update role.",
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (role: Role) => {
        setRoleToDelete(role);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!roleToDelete) return;

        try {
            setLoading(true);
            await deleteRole(String(roleToDelete.id));
            setMsgBox({
                isOpen: true,
                title: "Success",
                message: `Role "${roleToDelete.name}" has been deleted.`,
                type: "success",
            });
            fetchRoles();
        } catch (error: any) {
            setMsgBox({
                isOpen: true,
                title: "Error",
                message: error.response?.data?.message || "Failed to delete role.",
                type: "error",
            });
        } finally {
            setLoading(false);
            setRoleToDelete(null);
        }
    };

    const performDelete = async (id: number) => {
        try {
            setMsgBox(prev => ({ ...prev, loading: true }));
            await deleteRole(String(id));
            setMsgBox({
                isOpen: true,
                title: "Authority Revoked",
                message: "The role has been successfully purged from the security registry.",
                type: "success",
            });
            fetchRoles();
        } catch (error: any) {
            setMsgBox({
                isOpen: true,
                title: "Operation Restricted",
                message: error.response?.data?.message || "Critical failure while attempting to delete authority record.",
                type: "error",
            });
        }
    };


    const columns = useMemo(
        () => [
            {
                label: "ID",
                key: "id",
                render: (row: Role) => (
                    <span className="text-[10px] font-black tracking-widest text-[#1B1555]/40 tabular-nums">
                        #{row.id.toString().padStart(3, '0')}
                    </span>
                )
            },
            {
                label: "Name",
                key: "name",
                render: (row: Role) => (
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-[#16BCF8]/5 flex items-center justify-center text-[#16BCF8]">
                            <Shield size={14} />
                        </div>
                        <span className="font-bold text-[#1B1555] tracking-tight">{row.name}</span>
                    </div>
                )
            },
            {
                label: "Description",
                key: "description",
                render: (row: Role) => (
                    <div className="flex flex-col gap-0.5 max-w-md">
                        <span className="text-xs font-semibold text-gray-600 line-clamp-1">{row.description || "No specific mandate defined."}</span>

                    </div>
                )
            },

            //  {
            //                 label: "Actions",
            //                 key: "actions",
            //                 render: (row: User) => (
            //                     <div className="flex items-center gap-2">
            //                         <button
            //                             onClick={() => handleEdit(row)}
            //                             className="rounded p-1 text-blue-600 hover:bg-blue-50"
            //                             title="Edit User"
            //                         >
            //                             <Edit className="h-4 w-4" />
            //                         </button>
            //                         <button
            //                             onClick={() => handleDelete(row.id)}
            //                             className="rounded p-1 text-red-600 hover:bg-red-50"
            //                             title="Delete User"
            //                         >
            //                             <Trash2 className="h-4 w-4" />
            //                         </button>
            //                     </div>
            //                 ),
            //             },
            {
                label: "Actions",
                key: "actions",
                align: "center",
                render: (row: Role) => (
                    <div className="flex items-center justify-center gap-1.5">
                        <button
                            onClick={() => handleEdit(row)}
                            className="rounded p-1 text-blue-600 hover:bg-blue-50"
                            title="Edit Role"
                        >
                            <Edit className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => handleDelete(row)}
                            className="rounded p-1 text-red-600 hover:bg-red-50"
                            title="Delete Role"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ),
            },
        ],
        [roles]
    );

    return (
        <div className="p-6 space-y-6 bg-gray-50/30 min-h-screen">
            <DataTable
                title="Recent Status Roles"
                columns={columns}
                data={roles}
                loading={loading}
                onAddClick={handleAddRole}
                addButtonLabel="Add Role"
            />

            {/* Add Role Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Role" maxWidth="max-w-xl">
                <form onSubmit={handleAddSubmit} className="px-2 py-4">
                    <div className="space-y-6">
                        <div className="flex justify-center mb-8">
                            <div className="h-20 w-20 rounded-2xl bg-gray-50 flex items-center justify-center text-[#16BCF8]/20 border-2 border-dashed border-gray-100">
                                <Shield size={40} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                <Shield size={12} className="text-[#16BCF8]" /> Role Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleFormChange}
                                placeholder="Ex: Supervisor"
                                className="w-full rounded-xl border border-gray-200 p-4 text-sm font-bold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                <AlignLeft size={12} className="text-[#16BCF8]" /> Role Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleFormChange}
                                placeholder="Briefly describe the responsibilities of this role..."
                                rows={5}
                                className="w-full rounded-xl border border-gray-200 p-4 text-sm font-semibold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30 resize-none"
                            />
                        </div>
                    </div>
                    <div className="mt-10 flex items-center justify-end gap-3 border-t border-gray-100 pt-8 px-2">
                        <button
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                            className="rounded-xl px-8 py-3.5 text-sm font-black text-gray-400 uppercase tracking-widest transition-all hover:bg-gray-100 active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-3 rounded-xl bg-[#1B1555] px-12 py-3.5 text-sm font-black text-white uppercase tracking-[0.15em] shadow-2xl shadow-[#1B1555]/30 transition-all hover:bg-[#16BCF8] hover:shadow-[#16BCF8]/40 hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 size={16} />}
                            Save Role
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Role Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Role" maxWidth="max-w-xl">
                {isFetching ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-[#1B1555] opacity-20" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Syncing Role Info...</span>
                    </div>
                ) : (
                    <form onSubmit={handleEditSubmit} className="px-2 py-4">
                        <div className="space-y-6">
                            <div className="flex justify-center mb-8">
                                <div className="h-20 w-20 rounded-2xl bg-[#16BCF8]/5 flex items-center justify-center text-[#16BCF8] border-2 border-[#16BCF8]/10">
                                    <Activity size={32} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                    <Shield size={12} className="text-[#16BCF8]" /> Role Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleFormChange}
                                    placeholder="Enter role name"
                                    className="w-full rounded-xl border border-gray-200 p-4 text-sm font-bold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                    <AlignLeft size={12} className="text-[#16BCF8]" /> Role Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleFormChange}
                                    placeholder="Update role responsibilities..."
                                    rows={5}
                                    className="w-full rounded-xl border border-gray-200 p-4 text-sm font-semibold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30 resize-none"
                                />
                            </div>
                        </div>
                        <div className="mt-10 flex items-center justify-end gap-3 border-t border-gray-100 pt-8 px-2">
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="rounded-xl px-8 py-3.5 text-sm font-black text-gray-400 uppercase tracking-widest transition-all hover:bg-gray-100 active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center gap-3 rounded-xl bg-[#1B1555] px-12 py-3.5 text-sm font-black text-white uppercase tracking-[0.15em] shadow-2xl shadow-[#1B1555]/30 transition-all hover:bg-[#16BCF8] hover:shadow-[#16BCF8]/40 hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
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
                itemName={roleToDelete?.name}
                message={`Are you sure you want to delete the "${roleToDelete?.name}" role? This may impact users currently assigned to this authority.`}
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
