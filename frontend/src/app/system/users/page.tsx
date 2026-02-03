"use client";

import { useEffect, useState, useMemo } from "react";
import DataTable from "@/components/layout/DataTable";
import { getUsers, deleteUser, createUser, updateUser } from "@/api/userApi";
import { getRoles } from "@/api/roleApi";
import { Edit, Trash2, UserPlus, Mail, Phone, Shield, Lock, X, Save } from "lucide-react";
import Modal from "@/components/layout/Modal";
import DeleteConfirmModal from "@/components/layout/ConfirmDeleteModel";
import MessageBox, { MessageBoxType } from "@/components/MessageBox";

// Define the User type based on your API response
interface User {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    photo?: string;
    role: { id: number; name: string };
    createdAt: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        roleId: "",
        password: ""
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
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [usersData, rolesData] = await Promise.all([
                getUsers(),
                getRoles()
            ]);
            setUsers(usersData);
            setRoles(rolesData);
        } catch (error) {
            console.error("Failed to fetch initial data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getUsers();
            console.log("Fetched users data:", data);
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user: User) => {
        setFormData({
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            roleId: String(user.role?.id || ""),
            password: ""
        });
        setUserToEdit(user);
        setShowEditModal(true);
    };

    const handleDelete = (user: User) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;

        try {
            setLoading(true);
            await deleteUser(String(userToDelete.id));
            setMsgBox({
                isOpen: true,
                title: "Success",
                message: `User ${userToDelete.fullName} has been deleted successfully.`,
                type: "success"
            });
            fetchUsers();
        } catch (error) {
            console.error("Failed to delete user:", error);
            setMsgBox({
                isOpen: true,
                title: "Error",
                message: "Failed to delete user. Please try again.",
                type: "error"
            });
        } finally {
            setLoading(false);
            setUserToDelete(null);
        }
    };

    const handleAddUser = () => {
        setFormData({
            fullName: "",
            email: "",
            phone: "",
            roleId: "",
            password: ""
        });
        setShowAddModal(true);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createUser({
                ...formData,
                roleId: Number(formData.roleId)
            });
            setShowAddModal(false);
            setMsgBox({
                isOpen: true,
                title: "Success",
                message: "User has been successfully registered.",
                type: "success"
            });
            fetchInitialData();
        } catch (error: any) {
            setMsgBox({
                isOpen: true,
                title: "Registration Failed",
                message: error.response?.data?.message || "An error occurred during user creation.",
                type: "error"
            });
        }
    };

    const handleEditUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userToEdit) return;

        try {
            setLoading(true);
            const updateData: any = {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                roleId: Number(formData.roleId)
            };

            // Only include password if it's provided
            if (formData.password) {
                updateData.password = formData.password;
            }

            await updateUser(String(userToEdit.id), updateData);
            setShowEditModal(false);
            setMsgBox({
                isOpen: true,
                title: "Success",
                message: "User information has been updated.",
                type: "success"
            });
            fetchInitialData();
        } catch (error: any) {
            setMsgBox({
                isOpen: true,
                title: "Update Failed",
                message: error.response?.data?.message || "An error occurred during user update.",
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    const columns = useMemo(
        () => [
            {
                label: "ID",
                key: "id",

            },
            {
                label: "Full Name",
                key: "fullName",
            },
            {
                label: "Email",
                key: "email",
            },
            {
                label: "Phone",
                key: "phone",
            },
            {
                label: "Role",
                key: "role",
                render: (row: User) => {
                    const roleName = row.role?.name || "N/A";
                    return (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                            {roleName}
                        </span>
                    );
                },
            },
            {
                label: "Actions",
                key: "actions",
                render: (row: User) => (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleEdit(row)}
                            className="rounded p-1 text-blue-600 hover:bg-blue-50"
                            title="Edit User"
                        >
                            <Edit className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => handleDelete(row)}
                            className="rounded p-1 text-red-600 hover:bg-red-50"
                            title="Delete User"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ),
            },
        ],
        []
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
            </div>

            <DataTable
                title="All Users"
                columns={columns}
                data={users}
                loading={loading}
                onAddClick={handleAddUser}
                addButtonLabel="Add User"
            />

            {/* Add User Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => {
                    setShowAddModal(false);
                    setFormData({
                        fullName: "",
                        email: "",
                        phone: "",
                        roleId: "",
                        password: ""
                    });
                }}
                title="Add New User"
                maxWidth="max-w-xl"
            >
                <form onSubmit={handleAddUserSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <UserPlus size={12} className="text-secondary" />
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleFormChange}
                                placeholder="Enter full name"
                                className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-secondary/20 transition-all shadow-sm"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Mail size={12} className="text-secondary" />
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleFormChange}
                                placeholder="name@example.com"
                                autoComplete="off"
                                className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-secondary/20 transition-all shadow-sm"
                                required
                            />
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Phone size={12} className="text-secondary" />
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleFormChange}
                                placeholder="+252..."
                                className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-secondary/20 transition-all shadow-sm"
                                required
                            />
                        </div>

                        {/* Role Selection */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Shield size={12} className="text-secondary" />
                                Security Role
                            </label>
                            <select
                                name="roleId"
                                value={formData.roleId}
                                onChange={handleFormChange}
                                className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-secondary/20 transition-all shadow-sm cursor-pointer"
                                required
                            >
                                <option value="">Select a role</option>
                                {roles.map(role => (
                                    <option key={role.id} value={role.id}>{role.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Password */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Lock size={12} className="text-secondary" />
                                System Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleFormChange}
                                placeholder="••••••••"
                                autoComplete="new-password"
                                className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-secondary/20 transition-all shadow-sm"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end items-center gap-4">
                        <button
                            type="button"
                            onClick={() => setShowAddModal(false)}
                            className="px-6 py-2.5 text-xs font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-3 rounded-xl bg-[#1B1555] text-white px-8 py-3 rounded-xl flex items-center gap-2 font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-secondary/20 active:scale-95"
                        >
                            <Save size={16} />
                            Add User
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit User Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setUserToEdit(null);
                }}
                title="Edit User"
                maxWidth="max-w-xl"
            >
                <form onSubmit={handleEditUserSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <UserPlus size={12} className="text-secondary" />
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleFormChange}
                                placeholder="Enter full name"
                                className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-secondary/20 transition-all shadow-sm"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Mail size={12} className="text-secondary" />
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleFormChange}
                                placeholder="name@example.com"
                                autoComplete="off"
                                className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-secondary/20 transition-all shadow-sm"
                                required
                            />
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Phone size={12} className="text-secondary" />
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleFormChange}
                                placeholder="+252..."
                                className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-secondary/20 transition-all shadow-sm"
                                required
                            />
                        </div>

                        {/* Role Selection */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Shield size={12} className="text-secondary" />
                                Security Role
                            </label>
                            <select
                                name="roleId"
                                value={formData.roleId}
                                onChange={handleFormChange}
                                className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-secondary/20 transition-all shadow-sm cursor-pointer"
                                required
                            >
                                <option value="">Select a role</option>
                                {roles.map(role => (
                                    <option key={role.id} value={role.id}>{role.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Password */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Lock size={12} className="text-secondary" />
                                System Password (Leave blank to keep current)
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleFormChange}
                                placeholder="••••••••"
                                autoComplete="new-password"
                                className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-secondary/20 transition-all shadow-sm"
                                minLength={6}
                            />
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end items-center gap-4">
                        <button
                            type="button"
                            onClick={() => {
                                setShowEditModal(false);
                                setUserToEdit(null);
                            }}
                            className="px-6 py-2.5 text-xs font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-3 rounded-xl bg-[#1B1555] text-white px-8 py-3 rounded-xl flex items-center gap-2 font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-secondary/20 active:scale-95"
                        >
                            <Save size={16} />
                            Update User
                        </button>
                    </div>
                </form>
            </Modal>

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                itemName={userToDelete?.fullName}
                message={`Are you sure you want to delete ${userToDelete?.fullName}? This action will permanently remove the user from the system.`}
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
