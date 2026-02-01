"use client";

import { useEffect, useState, useMemo } from "react";
import DataTable from "@/components/DataTable";
import { getUsers, deleteUser } from "@/api/userApi";
import { Edit, Trash2 } from "lucide-react";

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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

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
        console.log("Edit user:", user);
        // alert(`Edit user: ${user.fullName}`);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await deleteUser(String(id));
                fetchUsers();
            } catch (error) {
                console.error("Failed to delete user:", error);
                alert("Failed to delete user");
            }
        }
    };

    const handleAddUser = () => {
        console.log("Add new user clicked");
        alert("Add New User functionality needs implementation");
    };

    const columns = useMemo(
        () => [
            {
                label: "Photo",
                key: "photo",
                render: (row: User) => {
                    const photoUrl = row.photo
                        ? `http://localhost:5000/uploads/${row.photo}`
                        : "/placeholder-user.png";

                    return (
                        <div className="relative h-10 w-10 overflow-hidden rounded-full border border-gray-200">
                            <img
                                src={photoUrl}
                                alt={row.fullName}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/placeholder-user.png";
                                }}
                            />
                        </div>
                    );
                },
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
                            onClick={() => handleDelete(row.id)}
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
        </div>
    );
}
