"use client";

import { useEffect, useState, useMemo } from "react";
import DataTable from "@/components/layout/DataTable";
import { getUsers, deleteUser, createUser, updateUser } from "@/api/userApi";
import { getRoles } from "@/api/roleApi";
import { Edit, Trash2, UserPlus, Mail, Phone, Shield, Lock, X, Save, Image as ImageIcon, UserCircle } from "lucide-react";
import Modal from "@/components/layout/Modal";
import DeleteConfirmModal from "@/components/layout/ConfirmDeleteModel";
import MessageBox, { MessageBoxType } from "@/components/MessageBox";
import { UPLOAD_URL } from "@/api/axios";

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
    const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

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

    const getImageUrl = (path: string | null | undefined) => {
        if (!path) return null;
        if (path.startsWith('http') || path.startsWith('data:')) return path;

        // If it already starts with uploads/, we need to be careful with double /uploads/uploads
        if (path.startsWith('uploads/')) {
            const rootUrl = UPLOAD_URL.replace('/uploads', '');
            return `${rootUrl}/${path}`;
        }

        return `${UPLOAD_URL}/${path}`;
    };

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
        setSelectedPhoto(null);
        setPhotoPreview(getImageUrl(user.photo));
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
        setSelectedPhoto(null);
        setPhotoPreview(null);
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append("fullName", formData.fullName);
            data.append("email", formData.email);
            data.append("phone", formData.phone);
            data.append("roleId", formData.roleId);
            data.append("password", formData.password);
            if (selectedPhoto) {
                data.append("photo", selectedPhoto);
            }

            await createUser(data);
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
            const data = new FormData();
            data.append("fullName", formData.fullName);
            data.append("email", formData.email);
            data.append("phone", formData.phone);
            data.append("roleId", formData.roleId);
            if (formData.password) {
                data.append("password", formData.password);
            }
            if (selectedPhoto) {
                data.append("photo", selectedPhoto);
            }

            await updateUser(String(userToEdit.id), data);
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
                label: "Photo",
                key: "photo",
                render: (row: User) => (
                    <div className="h-10 w-10 rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                        {row.photo ? (
                            <img
                                src={getImageUrl(row.photo) || ''}
                                alt=""
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <UserPlus size={16} className="text-gray-400" />
                        )}
                    </div>
                )
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

                        {/* Photo Upload */}
                        <div className="space-y-4 md:col-span-2 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <ImageIcon size={12} className="text-secondary" />
                                Profile Photo
                            </label>
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className="h-24 w-24 rounded-2xl overflow-hidden border-2 border-white shadow-xl bg-gray-100 flex items-center justify-center relative group">
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <UserCircle size={32} className="text-gray-300" />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ImageIcon className="text-white w-6 h-6" />
                                    </div>
                                </div>
                                <div className="flex-1 space-y-3">
                                    <p className="text-[10px] text-gray-500 font-medium">Upload a professional portrait photo. Formats: JPG, PNG. Max size: 2MB.</p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-secondary file:text-white hover:file:bg-secondary/90 cursor-pointer"
                                    />
                                </div>
                            </div>
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

                        {/* Photo Upload */}
                        <div className="space-y-4 md:col-span-2 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <ImageIcon size={12} className="text-secondary" />
                                Profile Photo
                            </label>
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className="h-24 w-24 rounded-2xl overflow-hidden border-2 border-white shadow-xl bg-gray-100 flex items-center justify-center relative group">
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <UserCircle size={32} className="text-gray-300" />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ImageIcon className="text-white w-6 h-6" />
                                    </div>
                                </div>
                                <div className="flex-1 space-y-3">
                                    <p className="text-[10px] text-gray-500 font-medium whitespace-pre-wrap">Upload a professional portrait photo. Formats: JPG, PNG. Max size: 2MB.</p>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                            className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-secondary file:text-white hover:file:bg-secondary/90 cursor-pointer"
                                        />
                                        {photoPreview && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPhotoPreview(null);
                                                    setSelectedPhoto(null);
                                                }}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
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
