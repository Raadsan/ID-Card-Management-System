"use client";

import { useEffect, useState, useMemo } from "react";
import DataTable from "@/components/DataTable";
import { getDepartments, deleteDepartment } from "@/api/departmentApi";
import { Edit, Trash2 } from "lucide-react";

// Define the Department type based on your API response
interface Department {
    id: number;
    departmentName: string;
    description: string;
}

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const response = await getDepartments();
            console.log("Fetched departments response:", response); // Debug log

            // API returns object with departments array
            if (response && response.departments) {
                setDepartments(response.departments);
            } else if (Array.isArray(response)) {
                setDepartments(response);
            } else {
                console.error("Unexpected API response format:", response);
                setDepartments([]);
            }
        } catch (error) {
            console.error("Failed to fetch departments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (department: Department) => {
        console.log("Edit department:", department);
        alert(`Edit department: ${department.departmentName}`);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this department?")) {
            try {
                await deleteDepartment(String(id));
                fetchDepartments();
            } catch (error) {
                console.error("Failed to delete department:", error);
                alert("Failed to delete department");
            }
        }
    };

    const handleAddDepartment = () => {
        console.log("Add new department clicked");
        alert("Add New Department functionality needs implementation");
    };

    const columns = useMemo(
        () => [
            {
                label: "Department Name",
                key: "departmentName",
            },
            {
                label: "Description",
                key: "description",
            },
            {
                label: "Actions",
                key: "actions",
                render: (row: Department) => (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleEdit(row)}
                            className="rounded p-1 text-blue-600 hover:bg-blue-50"
                            title="Edit Department"
                        >
                            <Edit className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => handleDelete(row.id)}
                            className="rounded p-1 text-red-600 hover:bg-red-50"
                            title="Delete Department"
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
                title="All Departments"
                columns={columns}
                data={departments}
                loading={loading}
                onAddClick={handleAddDepartment}
                addButtonLabel="Add Department"
            />
        </div>
    );
}
