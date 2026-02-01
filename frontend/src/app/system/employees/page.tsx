"use client";

import { useEffect, useState, useMemo } from "react";
import DataTable from "@/components/DataTable";
import { getEmployees, deleteEmployee } from "@/api/employeeApi";
import { Edit, Trash2 } from "lucide-react";

// Define the Employee type based on your API response
interface Employee {
    id: number;
    employeeCode: string;
    title: string;
    status: string;
    department?: {
        id: number;
        departmentName: string;
    };
    user?: {
        id: number;
        fullName: string;
        email: string;
        photo?: string;
    };
}

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const data = await getEmployees();
            console.log("Fetched employees data:", data);

            if (Array.isArray(data)) {
                setEmployees(data);
            } else {
                console.error("Unexpected API response format:", data);
                setEmployees([]);
            }
        } catch (error) {
            console.error("Failed to fetch employees:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (employee: Employee) => {
        console.log("Edit employee:", employee);
        alert(`Edit employee: ${employee.user?.fullName || employee.employeeCode}`);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this employee?")) {
            try {
                await deleteEmployee(String(id));
                fetchEmployees();
            } catch (error) {
                console.error("Failed to delete employee:", error);
                alert("Failed to delete employee");
            }
        }
    };

    const handleAddEmployee = () => {
        console.log("Add new employee clicked");
        alert("Add New Employee functionality needs implementation");
    };

    const columns = useMemo(
        () => [
            {
                label: "ID",
                key: "id", // Using database ID as requested
            },
            {
                label: "Full Name",
                key: "fullName",
                render: (row: Employee) => row.user?.fullName || "N/A",
            },
            {
                label: "Title",
                key: "title",
            },
            {
                label: "Department",
                key: "department",
                render: (row: Employee) => (
                    <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                        {row.department?.departmentName || "N/A"}
                    </span>
                ),
            },
            {
                label: "Photo",
                key: "photo",
                render: (row: Employee) => {
                    const photoUrl = row.user?.photo
                        ? `http://localhost:5000/uploads/${row.user.photo}`
                        : "/placeholder-user.png";

                    return (
                        <div className="relative h-10 w-10 overflow-hidden rounded-full border border-gray-200">
                            <img
                                src={photoUrl}
                                alt={row.user?.fullName || "Employee"}
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
                label: "Status",
                key: "status",
                render: (row: Employee) => (
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${row.status === 'active'
                            ? 'bg-green-50 text-green-700 ring-green-600/20'
                            : 'bg-red-50 text-red-700 ring-red-600/20'
                        }`}>
                        {row.status}
                    </span>
                ),
            },
            {
                label: "Actions",
                key: "actions",
                render: (row: Employee) => (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleEdit(row)}
                            className="rounded p-1 text-blue-600 hover:bg-blue-50"
                            title="Edit Employee"
                        >
                            <Edit className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => handleDelete(row.id)}
                            className="rounded p-1 text-red-600 hover:bg-red-50"
                            title="Delete Employee"
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
                title="All Employees"
                columns={columns}
                data={employees}
                loading={loading}
                onAddClick={handleAddEmployee}
                addButtonLabel="Add Employee"
            />
        </div>
    );
}
