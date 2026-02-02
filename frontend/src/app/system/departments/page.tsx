"use client";

import { useEffect, useState, useMemo } from "react";
import DataTable from "@/components/DataTable";
import { getDepartments, deleteDepartment } from "@/api/departmentApi";
import { Edit, Trash2 } from "lucide-react";
import MessageBox, { MessageBoxType } from "@/components/MessageBox";
import AddDepartmentModal from "@/components/AddDepartmentModal";
import EditDepartmentModal from "@/components/EditDepartmentModal";

// Define the Department type based on your API response
interface Department {
    id: number;
    departmentName: string;
    description: string;
}

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

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

    const handleEdit = (department: Department) => {
        setSelectedDepartment(department);
        setIsEditModalOpen(true);
    };

    const handleDelete = (id: number) => {
        const dept = departments.find(d => d.id === id);
        setMsgBox({
            isOpen: true,
            title: "Delete Department",
            message: `Are you sure you want to delete the "${dept?.departmentName}" department? This will also remove all associated employees and history history.`,
            type: "confirm",
            onConfirm: () => performDelete(id),
        });
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

    const handleAddDepartment = () => {
        setIsAddModalOpen(true);
    };

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
                        <button
                            onClick={() => handleEdit(row)}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Department"
                        >
                            <Edit className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => handleDelete(row.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Department"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ),
            },
        ],
        [departments]
    );

    return (
        <div className="p-6 space-y-6">
            <DataTable
                title="All Departments"
                columns={columns}
                data={departments}
                loading={loading}
                onAddClick={handleAddDepartment}
                addButtonLabel="Add Department"
            />

            <AddDepartmentModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    setMsgBox({
                        isOpen: true,
                        title: "Success",
                        message: "New department has been created successfully.",
                        type: "success",
                    });
                    fetchDepartments();
                }}
            />

            <EditDepartmentModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedDepartment(null);
                }}
                departmentId={selectedDepartment?.id || null}
                onSuccess={() => {
                    setMsgBox({
                        isOpen: true,
                        title: "Updated",
                        message: "Department details have been updated.",
                        type: "success",
                    });
                    fetchDepartments();
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
