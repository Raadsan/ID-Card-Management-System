"use client";

import { useEffect, useState, useMemo } from "react";
import DataTable from "@/components/DataTable";
import { getRoles, deleteRole } from "@/api/roleApi";
import { Edit, Trash2, Shield, Info, Activity } from "lucide-react";
import AddRoleModal from "@/components/AddRoleModal";
import EditRoleModal from "@/components/EditRoleModal";
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
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

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

    const handleEdit = (role: Role) => {
        setSelectedRoleId(role.id);
        setIsEditModalOpen(true);
    };

    const handleDelete = (id: number) => {
        const role = roles.find(r => r.id === id);
        setMsgBox({
            isOpen: true,
            title: "Security Clearance Required",
            message: `Are you absolutely certain you want to delete the "${role?.name}" role? This may impact users currently assigned to this authority.`,
            type: "confirm",
            onConfirm: () => performDelete(id),
        });
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

    const handleAddRole = () => {
        setIsAddModalOpen(true);
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
                                        onClick={() => handleDelete(row.id)}
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
                title="Security Roles & Authorities"
                columns={columns}
                data={roles}
                loading={loading}
                onAddClick={handleAddRole}
                addButtonLabel="Define New Role"
            />

            <AddRoleModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    setMsgBox({
                        isOpen: true,
                        title: "Authority Established",
                        message: "New system role has been successfully registered and is ready for assignment.",
                        type: "success",
                    });
                    fetchRoles();
                }}
            />

            <EditRoleModal
                isOpen={isEditModalOpen}
                roleId={selectedRoleId}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedRoleId(null);
                }}
                onSuccess={() => {
                    setMsgBox({
                        isOpen: true,
                        title: "Registry Synchronized",
                        message: "Authority mandate has been successfully updated in the master registry.",
                        type: "success",
                    });
                    fetchRoles();
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
