"use client";

import { useEffect, useState, useMemo } from "react";
import DataTable from "@/components/DataTable";
import { getDepartmentTransfers, deleteDepartmentTransfer } from "@/api/department_transfareApi";
import { Edit, Trash2 } from "lucide-react";

// Define the DepartmentTransfer type based on your API response
interface Transfer {
    id: number;
    transferDate: string;
    employee: {
        id: number;
        employeeCode: string;
        user: {
            fullName: string;
            photo?: string;
        };
    };
    fromDepartment: {
        departmentName: string;
    };
    toDepartment: {
        departmentName: string;
    };
}

export default function DepartmentTransferPage() {
    const [transfers, setTransfers] = useState<Transfer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransfers();
    }, []);

    const fetchTransfers = async () => {
        try {
            setLoading(true);
            const data = await getDepartmentTransfers();
            console.log("Fetched transfers data:", data);

            if (Array.isArray(data)) {
                setTransfers(data);
            } else {
                console.error("Unexpected API response format:", data);
                setTransfers([]);
            }
        } catch (error) {
            console.error("Failed to fetch transfers:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (transfer: Transfer) => {
        console.log("Edit transfer:", transfer);
        alert(`Edit transfer for: ${transfer.employee?.user?.fullName}`);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this transfer record?")) {
            try {
                await deleteDepartmentTransfer(String(id));
                fetchTransfers();
            } catch (error) {
                console.error("Failed to delete transfer:", error);
                alert("Failed to delete transfer");
            }
        }
    };

    const handleAddTransfer = () => {
        console.log("Add new transfer clicked");
        alert("Add New Transfer functionality needs implementation");
    };

    const columns = useMemo(
        () => [
            {
                label: "Date",
                key: "transferDate",
                render: (row: Transfer) => {
                    if (!row.transferDate) return "N/A";
                    return new Date(row.transferDate).toLocaleDateString();
                },
            },
            {
                label: "Employee",
                key: "employee",
                render: (row: Transfer) => (
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
                            <img
                                src={row.employee?.user?.photo ? `http://localhost:5000/uploads/${row.employee.user.photo}` : "/placeholder-user.png"}
                                alt={row.employee?.user?.fullName || "User"}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/placeholder-user.png";
                                }}
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{row.employee?.user?.fullName || "Unknown"}</span>
                            <span className="text-xs text-gray-500">{row.employee?.employeeCode}</span>
                        </div>
                    </div>
                ),
            },
            {
                label: "From Department",
                key: "fromDepartment",
                render: (row: Transfer) => (
                    <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                        {row.fromDepartment?.departmentName || "N/A"}
                    </span>
                ),
            },
            {
                label: "To Department",
                key: "toDepartment",
                render: (row: Transfer) => (
                    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/10">
                        {row.toDepartment?.departmentName || "N/A"}
                    </span>
                ),
            },
            {
                label: "Actions",
                key: "actions",
                render: (row: Transfer) => (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleEdit(row)}
                            className="rounded p-1 text-blue-600 hover:bg-blue-50"
                            title="Edit Transfer"
                        >
                            <Edit className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => handleDelete(row.id)}
                            className="rounded p-1 text-red-600 hover:bg-red-50"
                            title="Delete Transfer"
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
                title="Department Transfers"
                columns={columns}
                data={transfers}
                loading={loading}
                onAddClick={handleAddTransfer}
                addButtonLabel="New Transfer"
            />
        </div>
    );
}
