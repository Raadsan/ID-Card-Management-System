"use client";

import { useEffect, useState, useMemo } from "react";
import DataTable from "@/components/DataTable";
import { getEmployees, deleteEmployee } from "@/api/employeeApi";
import { Edit, Trash2, Eye } from "lucide-react";
import AddEmployeeModal from "@/components/AddEmployeeModal";
import ViewEmployeeModal from "@/components/ViewEmployeeModal";
import EditEmployeeModal from "@/components/EditEmployeeModal";
import MessageBox, { MessageBoxType } from "@/components/MessageBox";

// Define the Employee type based on your API response
interface Employee {
    id: number;
    employeeCode: string;
    title: string;
    status: string;
    department?: {
        id: number;
        departmentName: string;
        description?: string;
    };
    user?: {
        id: number;
        fullName: string;
        email: string;
        phone?: string;
        gender?: string;
        photo?: string;
        role?: {
            name: string;
        };
    };
    dob?: string;
    address?: string;
    createdAt: string;
}

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

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
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const data = await getEmployees();
            if (Array.isArray(data)) {
                setEmployees(data);
            } else {
                setEmployees([]);
            }
        } catch (error) {
            console.error("Failed to fetch employees:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsEditModalOpen(true);
    };

    const handleView = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsViewModalOpen(true);
    };

    const handleDelete = (id: number) => {
        const employee = employees.find(e => e.id === id);
        setMsgBox({
            isOpen: true,
            title: "Delete Employee",
            message: `Are you sure you want to delete ${employee?.user?.fullName || "this record"}? This action cannot be undone.`,
            type: "confirm",
            onConfirm: () => performDelete(id),
        });
    };

    const performDelete = async (id: number) => {
        try {
            setMsgBox(prev => ({ ...prev, loading: true }));
            await deleteEmployee(String(id));
            setMsgBox({
                isOpen: true,
                title: "Deleted!",
                message: "Employee records have been permanently removed.",
                type: "success",
            });
            fetchEmployees();
        } catch (error: any) {
            setMsgBox({
                isOpen: true,
                title: "Error",
                message: error.response?.data?.message || "Failed to delete employee",
                type: "error",
            });
        }
    };

    const handleAddEmployee = () => {
        setIsAddModalOpen(true);
    };

    const columns = useMemo(
        () => [
            {
                label: "ID",
                key: "id",
                width: "60px",
                align: "center",
            },
            {
                label: "Full Name",
                key: "fullName",
                render: (row: Employee) => (
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full overflow-hidden border border-gray-200">
                            <img
                                src={row.user?.photo ? `http://localhost:5000/uploads/${row.user.photo}` : "/placeholder-user.png"}
                                alt={row.user?.fullName || "User"}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/placeholder-user.png";
                                }}
                            />
                        </div>
                        <span className="font-semibold text-gray-900">{row.user?.fullName || "N/A"}</span>
                    </div>
                ),
            },
            {
                label: "Title",
                key: "title",
                render: (row: Employee) => (
                    <span className="text-gray-600 font-medium">{row.title || "-"}</span>
                )
            },
            {
                label: "Department",
                key: "department",
                render: (row: Employee) => (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold border border-gray-200/50">
                        {row.department?.departmentName || "N/A"}
                    </span>
                ),
            },
            {
                label: "Status",
                key: "status",
                align: "center",
                render: (row: Employee) => (
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${row.status === 'active'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-rose-50 text-rose-600 border border-rose-100'
                        }`}>
                        {row.status}
                    </span>
                ),
            },
            {
                label: "Actions",
                key: "actions",
                align: "center",
                render: (row: Employee) => (
                    <div className="flex items-center justify-center gap-2">
                        <button
                            onClick={() => handleView(row)}
                            className="p-1.5 text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                            title="View Employee"
                        >
                            <Eye className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => handleEdit(row)}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Employee"
                        >
                            <Edit className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => handleDelete(row.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Employee"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ),
            },
        ],
        [employees]
    );

    return (
        <div className="p-6 space-y-6">
            <DataTable
                title="All Employees"
                columns={columns}
                data={employees}
                loading={loading}
                onAddClick={handleAddEmployee}
                addButtonLabel="Add Employee"
            />

            <AddEmployeeModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    setMsgBox({
                        isOpen: true,
                        title: "Success",
                        message: "New employee has been added successfully.",
                        type: "success",
                    });
                    fetchEmployees();
                }}
            />

            <ViewEmployeeModal
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setSelectedEmployee(null);
                }}
                employee={selectedEmployee}
            />

            <EditEmployeeModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedEmployee(null);
                }}
                employeeId={selectedEmployee?.id || null}
                onSuccess={() => {
                    setMsgBox({
                        isOpen: true,
                        title: "Updated",
                        message: "Employee profile has been updated.",
                        type: "success",
                    });
                    fetchEmployees();
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

