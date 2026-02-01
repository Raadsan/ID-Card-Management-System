"use client";

import { useEffect, useState, useMemo } from "react";
import DataTable from "@/components/DataTable";
import { getRoles, deleteRole } from "@/api/roleApi";
import { Edit, Trash2 } from "lucide-react";

// Define the Role type based on your API response
interface Role {
    id: number;
    name: string;
    description: string;
}

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const data = await getRoles();
            console.log("Fetched roles data:", data);

            if (Array.isArray(data)) {
                setRoles(data);
            } else {
                console.error("Unexpected API response format:", data);
                setRoles([]);
            }
        } catch (error) {
            console.error("Failed to fetch roles:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (role: Role) => {
        console.log("Edit role:", role);
        alert(`Edit role: ${role.name}`);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this role?")) {
            try {
                await deleteRole(String(id));
                fetchRoles();
            } catch (error) {
                console.error("Failed to delete role:", error);
                alert("Failed to delete role");
            }
        }
    };

    const handleAddRole = () => {
        console.log("Add new role clicked");
        alert("Add New Role functionality needs implementation");
    };

    const columns = useMemo(
        () => [
            {
                label: "ID",
                key: "id",
            },
            {
                label: "Role Name",
                key: "name",
            },
            {
                label: "Description",
                key: "description",
            },
            {
                label: "Actions",
                key: "actions",
                render: (row: Role) => (
                    <div className="flex items-center gap-2">
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
        []
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
            </div>

            <DataTable
                title="All Roles"
                columns={columns}
                data={roles}
                loading={loading}
                onAddClick={handleAddRole}
                addButtonLabel="Add Role"
            />
        </div>
    );
}
