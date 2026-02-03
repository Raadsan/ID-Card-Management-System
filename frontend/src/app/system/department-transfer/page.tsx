"use client";

import { useEffect, useState, useMemo } from "react";
import DataTable from "@/components/DataTable";
import { getDepartmentTransfers, deleteDepartmentTransfer } from "@/api/department_transfareApi";
import { Edit, Trash2, Calendar, User, ArrowRightLeft, Briefcase, FileText } from "lucide-react";
import AddTransferModal from "@/components/AddTransferModal";
import EditTransferModal from "@/components/EditTransferModal";
import MessageBox, { MessageBoxType } from "@/components/MessageBox";

// Define the DepartmentTransfer type based on your API response
interface Transfer {
    id: number;
    transferDate: string;
    reason?: string;
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
    authorizedBy?: {
        fullName: string;
        photo?: string;
    };
}


export default function DepartmentTransferPage() {
    const [transfers, setTransfers] = useState<Transfer[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTransferId, setSelectedTransferId] = useState<number | null>(null);

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
        fetchTransfers();
    }, []);

    const fetchTransfers = async () => {
        try {
            setLoading(true);
            const data = await getDepartmentTransfers();
            if (Array.isArray(data)) {
                setTransfers(data);
            } else {
                setTransfers([]);
            }
        } catch (error) {
            console.error("Failed to fetch transfers:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (transfer: Transfer) => {
        setSelectedTransferId(transfer.id);
        setIsEditModalOpen(true);
    };

    const handleDelete = (id: number) => {
        const transfer = transfers.find(t => t.id === id);
        setMsgBox({
            isOpen: true,
            title: "Security Verification",
            message: `Are you sure you want to delete the transfer record for "${transfer?.employee?.user?.fullName}"? This action is permanent.`,
            type: "confirm",
            onConfirm: () => performDelete(id),
        });
    };

    const performDelete = async (id: number) => {
        try {
            setMsgBox(prev => ({ ...prev, loading: true }));
            await deleteDepartmentTransfer(String(id));
            setMsgBox({
                isOpen: true,
                title: "Record Purged",
                message: "Department transfer history has been successfully removed.",
                type: "success",
            });
            fetchTransfers();
        } catch (error: any) {
            setMsgBox({
                isOpen: true,
                title: "Action Failed",
                message: error.response?.data?.message || "Internal error occurred while attempting to delete the record.",
                type: "error",
            });
        }
    };

    const handleAddTransfer = () => {
        setIsAddModalOpen(true);
    };

    const columns = useMemo(
        () => [
            {
                label: "Transfer Event",
                key: "event",
                render: (row: Transfer) => (
                    <div className="flex items-center gap-3 py-1">
                        <div className="h-10 w-10 rounded-xl bg-[#16BCF8]/5 flex items-center justify-center text-[#16BCF8]">
                            <ArrowRightLeft size={16} />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1.5 font-bold text-[#1B1555] tracking-tight">
                                <Calendar size={12} className="opacity-50" />
                                <span>{new Date(row.transferDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                label: "Personnel Information",
                key: "employee",
                render: (row: Transfer) => (
                    <div className="flex items-center gap-4">
                        <div className="relative h-11 w-11 flex-shrink-0 group">
                            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-[#16BCF8] to-[#1B1555] opacity-20 blur group-hover:opacity-40 transition-opacity"></div>
                            <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-white shadow-sm">
                                <img
                                    src={row.employee?.user?.photo ? `http://localhost:5000/uploads/${row.employee.user.photo}` : "/placeholder-user.png"}
                                    alt={row.employee?.user?.fullName}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/placeholder-user.png";
                                    }}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-[#1B1555] tracking-tight">{row.employee?.user?.fullName}</span>
                        </div>
                    </div>
                ),
            },
            {
                label: "From Department",
                key: "fromDepartment",
                render: (row: Transfer) => (
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-rose-400"></div>
                            <span className="text-xs text-gray-500 opacity-80">{row.fromDepartment?.departmentName || "---"}</span>
                        </div>
                    </div>
                ),
            },
            {
                label: "To Department",
                key: "toDepartment",
                render: (row: Transfer) => (
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
                            <span className="text-xs text-gray-500 opacity-80">{row.toDepartment?.departmentName || "---"}</span>
                        </div>
                    </div>
                ),
            },
            {
                label: "Authorized By",
                key: "authorizedBy",
                render: (row: Transfer) => (
                    <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500 border border-gray-200 uppercase">
                            {row.authorizedBy?.fullName?.charAt(0) || "S"}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-[#1B1555]">{row.authorizedBy?.fullName || "---"}</span>
                        </div>
                    </div>
                ),
            },
            {
                label: "Reason",
                key: "reason",
                render: (row: Transfer) => (
                    <div className="max-w-xs flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-gray-500">
                            <FileText size={12} className="text-[#16BCF8]/40" />
                            <span className="text-[11px] font-semibold italic line-clamp-1">{row.reason || "No documentation provided."}</span>
                        </div>
                    </div>
                ),
            },
        ],
        [transfers]
    );

    return (
        <div className="p-6 space-y-6 bg-gray-50/30 min-h-screen">
            <DataTable
                title="Department Transfer"
                columns={columns}
                data={transfers}
                loading={loading}
                onAddClick={handleAddTransfer}
                addButtonLabel="Transfer user department"
            />

            <AddTransferModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    setMsgBox({
                        isOpen: true,
                        title: "Migration Successful",
                        message: "The personnel transfer has been authorized and executed successfully.",
                        type: "success",
                    });
                    fetchTransfers();
                }}
            />

            <EditTransferModal
                isOpen={isEditModalOpen}
                transferId={selectedTransferId}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedTransferId(null);
                }}
                onSuccess={() => {
                    setMsgBox({
                        isOpen: true,
                        title: "Registry Modified",
                        message: "The transfer record has been successfully updated in the system registry.",
                        type: "success",
                    });
                    fetchTransfers();
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
