"use client";

import { useEffect, useState, useMemo } from "react";
import DataTable from "@/components/DataTable";
import { getUsers, deleteUser } from "@/api/userApi";
import { Edit, Trash2, Mail, Phone, ShieldCheck } from "lucide-react";
import AddUserModal from "@/components/AddUserModal";
import EditUserModal from "@/components/EditUserModal";
import MessageBox, { MessageBoxType } from "@/components/MessageBox";

// Define the User type based on your API response
interface User {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    photo?: string;
    gender?: string;
    status: string;
    role: { id: number; name: string };
    createdAt: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

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
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getUsers();
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user: User) => {
        setSelectedUserId(user.id);
        setIsEditModalOpen(true);
    };

    const handleDelete = (id: number) => {
        const user = users.find(u => u.id === id);
        setMsgBox({
            isOpen: true,
            title: "Security Verification",
            message: `Are you sure you want to permanently delete user "${user?.fullName}"? This will terminate all their system access.`,
            type: "confirm",
            onConfirm: () => performDelete(id),
        });
    };

    const performDelete = async (id: number) => {
        try {
            setMsgBox(prev => ({ ...prev, loading: true }));
            await deleteUser(String(id));
            setMsgBox({
                isOpen: true,
                title: "Action Complete",
                message: "User account has been successfully purged from the system.",
                type: "success",
            });
            fetchUsers();
        } catch (error: any) {
            setMsgBox({
                isOpen: true,
                title: "Operation Failed",
                message: error.response?.data?.message || "Critical error occurred during deletion.",
                type: "error",
            });
        }
    };

    const handleAddUser = () => {
        setIsAddModalOpen(true);
    };

    const columns = useMemo(
        () => [
            {
                label: "Account Information",
                key: "account",
                render: (row: User) => (
                    <div className="flex items-center gap-4 py-1">
                        <div className="relative h-11 w-11 flex-shrink-0 group">
                            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-[#16BCF8] to-[#1B1555] opacity-20 blur group-hover:opacity-40 transition-opacity"></div>
                            <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-white shadow-sm">
                                <img
                                    src={row.photo ? `http://localhost:5000/uploads/${row.photo}` : "/placeholder-user.png"}
                                    alt={row.fullName}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/placeholder-user.png";
                                    }}
                                />
                            </div>
                            <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white shadow-sm ${row.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-[#1B1555] tracking-tight leading-tight">{row.fullName}</span>
                            <div className="flex items-center gap-1.5 text-gray-400">
                                <Mail size={12} className="opacity-70" />
                                <span className="text-[11px] font-medium tracking-tight uppercase">{row.email}</span>
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                label: "System Authority",
                key: "role",
                render: (row: User) => (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                            <ShieldCheck size={14} className="text-[#16BCF8]" />
                            <span className="text-[11px] font-bold uppercase tracking-widest text-[#1B1555]">
                                {row.role?.name || "Member"}
                            </span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium">Global Permissions Attached</span>
                    </div>
                ),
            },
            {
                label: "Connectivity",
                key: "contact",
                render: (row: User) => (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <div className="p-1 rounded bg-gray-50">
                                <Phone size={11} className="text-gray-400" />
                            </div>
                            <span className="text-xs font-semibold text-gray-600 tracking-tighter">
                                {row.phone || "No Registry"}
                            </span>
                        </div>
                    </div>
                ),
            },
            {
                label: "Account Status",
                key: "status",
                align: "center",
                render: (row: User) => (
                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] shadow-sm border ${row.status === 'active'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                        {row.status || 'Active'}
                    </span>
                ),
            },
            {
                label: "Management",
                key: "actions",
                align: "center",
                render: (row: User) => (
                    <div className="flex items-center justify-center gap-1.5">
                        <button
                            onClick={() => handleEdit(row)}
                            className="p-2 text-gray-400 hover:text-[#16BCF8] hover:bg-[#16BCF8]/5 rounded-xl transition-all"
                            title="Edit Account"
                        >
                            <Edit className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => handleDelete(row.id)}
                            className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all"
                            title="Purge Account"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ),
            },
        ],
        [users]
    );

    return (
        <div className="p-6 space-y-6 bg-gray-50/30 min-h-screen">
            <DataTable
                title="System User Directory"
                columns={columns}
                data={users}
                loading={loading}
                onAddClick={handleAddUser}
                addButtonLabel="Register User"
            />

            <AddUserModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    setMsgBox({
                        isOpen: true,
                        title: "Security Clearance",
                        message: "New user account created successfully. Credentials have been registered.",
                        type: "success",
                    });
                    fetchUsers();
                }}
            />

            <EditUserModal
                isOpen={isEditModalOpen}
                userId={selectedUserId}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedUserId(null);
                }}
                onSuccess={() => {
                    setMsgBox({
                        isOpen: true,
                        title: "Registry Updated",
                        message: "User profile modifications have been successfully committed to the database.",
                        type: "success",
                    });
                    fetchUsers();
                }}
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
