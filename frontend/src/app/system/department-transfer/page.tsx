"use client";

import { useEffect, useState, useMemo } from "react";
import DataTable from "@/components/layout/DataTable";
import { getDepartmentTransfers, deleteDepartmentTransfer, createDepartmentTransfer, updateDepartmentTransfer, getDepartmentTransferById } from "@/api/department_transfareApi";
import { getEmployees } from "@/api/employeeApi";
import { getDepartments } from "@/api/departmentApi";
import { Edit, Trash2, Calendar, User, ArrowRightLeft, Briefcase, FileText, MessageSquare, Shield, CheckCircle2, Loader2, Save, Activity, ChevronDown, Plus } from "lucide-react";
import Modal from "@/components/layout/Modal";
import DeleteConfirmModal from "@/components/layout/ConfirmDeleteModel";
import MessageBox, { MessageBoxType } from "@/components/MessageBox";
import { UPLOAD_URL } from "@/api/axios";


// Define the DepartmentTransfer type based on your API response
interface Transfer {
    id: number;
    transferDate: string;
    reason?: string;
    employee: {
        id: number;
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedTransferId, setSelectedTransferId] = useState<number | null>(null);
    const [transferToDelete, setTransferToDelete] = useState<Transfer | null>(null);

    // Dropdown Data
    const [employeesList, setEmployeesList] = useState<any[]>([]);
    const [departmentsList, setDepartmentsList] = useState<any[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        employeeId: "",
        fromDepartmentId: "",
        toDepartmentId: "",
        transferDate: new Date().toISOString().split('T')[0],
        reason: "",
    });

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

    useEffect(() => {
        if (isAddModalOpen) {
            fetchDropdownData();
        }
    }, [isAddModalOpen]);

    useEffect(() => {
        if (isEditModalOpen && selectedTransferId) {
            fetchEditData();
        }
    }, [isEditModalOpen, selectedTransferId]);

    const fetchDropdownData = async () => {
        try {
            setIsFetching(true);
            const [empsData, deptsData] = await Promise.all([
                getEmployees(),
                getDepartments()
            ]);
            setEmployeesList(Array.isArray(empsData) ? empsData : []);
            setDepartmentsList(Array.isArray(deptsData) ? deptsData : []);
        } catch (err) {
            console.error("Failed to fetch dropdown data:", err);
        } finally {
            setIsFetching(false);
        }
    };

    const fetchEditData = async () => {
        if (!selectedTransferId) return;
        try {
            setIsFetching(true);
            const [empsData, deptsData, transferData] = await Promise.all([
                getEmployees(),
                getDepartments(),
                getDepartmentTransferById(String(selectedTransferId))
            ]);

            setEmployeesList(Array.isArray(empsData) ? empsData : []);
            setDepartmentsList(Array.isArray(deptsData) ? deptsData : []);

            if (transferData) {
                setFormData({
                    employeeId: transferData.employeeId?.toString() || "",
                    fromDepartmentId: transferData.fromDepartmentId?.toString() || "",
                    toDepartmentId: transferData.toDepartmentId?.toString() || "",
                    transferDate: transferData.transferDate ? new Date(transferData.transferDate).toISOString().split('T')[0] : "",
                    reason: transferData.reason || "",
                });
            }
        } catch (err: any) {
            console.error("Failed to fetch edit data:", err);
        } finally {
            setIsFetching(false);
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const empId = e.target.value;
        const employee = employeesList.find(emp => emp.id.toString() === empId);

        setFormData(prev => ({
            ...prev,
            employeeId: empId,
            fromDepartmentId: employee?.departmentId?.toString() || "",
        }));
    };

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

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.fromDepartmentId === formData.toDepartmentId) {
            setMsgBox({
                isOpen: true,
                title: "Invalid Transfer",
                message: "Target department must be different from origin.",
                type: "error",
            });
            return;
        }

        try {
            setIsSubmitting(true);
            await createDepartmentTransfer({
                employeeId: Number(formData.employeeId),
                fromDepartmentId: Number(formData.fromDepartmentId),
                toDepartmentId: Number(formData.toDepartmentId),
                transferDate: formData.transferDate,
                reason: formData.reason,
            });
            setIsAddModalOpen(false);
            setMsgBox({
                isOpen: true,
                title: "Success",
                message: "Employee transfer recorded successfully.",
                type: "success",
            });
            fetchTransfers();
        } catch (error: any) {
            setMsgBox({
                isOpen: true,
                title: "Error",
                message: error.response?.data?.message || "Failed to record transfer.",
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTransferId) return;
        try {
            setIsSubmitting(true);
            await updateDepartmentTransfer(String(selectedTransferId), {
                employeeId: Number(formData.employeeId),
                fromDepartmentId: Number(formData.fromDepartmentId),
                toDepartmentId: Number(formData.toDepartmentId),
                transferDate: formData.transferDate,
                reason: formData.reason,
            });
            setIsEditModalOpen(false);
            setMsgBox({
                isOpen: true,
                title: "Success",
                message: "Transfer record updated successfully.",
                type: "success",
            });
            fetchTransfers();
        } catch (error: any) {
            setMsgBox({
                isOpen: true,
                title: "Error",
                message: error.response?.data?.message || "Failed to update record.",
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (transfer: Transfer) => {
        setTransferToDelete(transfer);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!transferToDelete) return;
        try {
            setLoading(true);
            await deleteDepartmentTransfer(String(transferToDelete.id));
            setMsgBox({
                isOpen: true,
                title: "Success",
                message: `Transfer record for "${transferToDelete.employee?.user?.fullName}" has been deleted.`,
                type: "success",
            });
            fetchTransfers();
        } catch (error: any) {
            setMsgBox({
                isOpen: true,
                title: "Error",
                message: error.response?.data?.message || "Failed to delete transfer record.",
                type: "error",
            });
        } finally {
            setLoading(false);
            setTransferToDelete(null);
        }
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
        setFormData({
            employeeId: "",
            fromDepartmentId: "",
            toDepartmentId: "",
            transferDate: new Date().toISOString().split('T')[0],
            reason: "",
        });
        setIsAddModalOpen(true);
    };

    const columns = useMemo(
        () => [
            {
                label: "Employee ID",
                key: "employee.id",
                render: (row: Transfer) => (
                    <span className="font-bold text-[#1B1555]">{row.employee?.id}</span>
                ),
            },
            {
                label: "Full Name",
                key: "employee.user.fullName",
                render: (row: Transfer) => (
                    <div className="flex items-center gap-3 text-[#1B1555] font-semibold">
                        <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                            <img
                                src={row.employee?.user?.photo
                                    ? (row.employee.user.photo.startsWith('uploads/')
                                        ? `${UPLOAD_URL.replace('/uploads', '')}/${row.employee.user.photo}`
                                        : `${UPLOAD_URL}/${row.employee.user.photo}`)
                                    : "/placeholder-user.png"}
                                alt=""
                                className="h-full w-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-user.png" }}
                            />
                        </div>
                        <span>{row.employee?.user?.fullName}</span>
                    </div>
                ),
            },
            {
                label: "From Department",
                key: "fromDepartment.departmentName",
                render: (row: Transfer) => (
                    <span className="text-rose-500 font-medium">{row.fromDepartment?.departmentName || "---"}</span>
                ),
            },
            {
                label: "To Department",
                key: "toDepartment.departmentName",
                render: (row: Transfer) => (
                    <span className="text-emerald-500 font-medium">{row.toDepartment?.departmentName || "---"}</span>
                ),
            },
            {
                label: "Reason",
                key: "reason",
                render: (row: Transfer) => (
                    <span className="text-gray-500 italic text-xs">{row.reason || "No documentation"}</span>
                ),
            },
            {
                label: "Actions",
                key: "actions",
                render: (row: Transfer) => (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleEdit(row)}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                        >
                            <Edit className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => handleDelete(row)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ),
            },
        ],
        [transfers]
    );

    return (
        <div className="p-6 space-y-6 bg-gray-50/30 min-h-screen">
            <DataTable
                title="Department Transfers"
                columns={columns}
                data={transfers}
                loading={loading}
                onAddClick={handleAddTransfer}
                addButtonLabel="Transfer Employee"
            />

            {/* Add Transfer Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Transfer" maxWidth="max-w-4xl">
                <form onSubmit={handleAddSubmit} className="px-2 py-4">
                    {isFetching ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="h-12 w-12 animate-spin text-[#1B1555] opacity-20" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Loading Rosters...</span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                <div className="space-y-4">
                                    <div className="flex justify-start mb-2">
                                        <div className="h-14 w-14 rounded-2xl bg-[#16BCF8]/5 flex items-center justify-center text-[#16BCF8] border-2 border-[#16BCF8]/10">
                                            <ArrowRightLeft size={24} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                            <User size={12} className="text-[#16BCF8]" /> Select Employee *
                                        </label>
                                        <div className="relative group">
                                            <select
                                                name="employeeId"
                                                value={formData.employeeId}
                                                onChange={handleEmployeeChange}
                                                className="w-full appearance-none rounded-xl border border-gray-200 p-3 text-sm font-bold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30 cursor-pointer pr-10"
                                                required
                                            >
                                                <option value="">Search employee roster...</option>
                                                {employeesList.map((emp) => (
                                                    <option key={emp.id} value={emp.id}>
                                                        {emp.user?.fullName}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-[#16BCF8] transition-colors">
                                                <ChevronDown size={18} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                            <Calendar size={12} className="text-[#16BCF8]" /> Effective Transfer Date *
                                        </label>
                                        <input
                                            type="date"
                                            name="transferDate"
                                            value={formData.transferDate}
                                            onChange={handleFormChange}
                                            className="w-full rounded-xl border border-gray-200 p-3 text-sm font-bold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                                <Briefcase size={12} className="text-rose-400" /> Origin
                                            </label>
                                            <div className="w-full rounded-xl border border-rose-100 p-3 text-sm font-bold text-rose-600 bg-rose-50/30">
                                                {departmentsList.find(d => d.id.toString() === formData.fromDepartmentId)?.departmentName || "---"}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                                <Briefcase size={12} className="text-[#16BCF8]" /> Destination *
                                            </label>
                                            <div className="relative group">
                                                <select
                                                    name="toDepartmentId"
                                                    value={formData.toDepartmentId}
                                                    onChange={handleFormChange}
                                                    className="w-full appearance-none rounded-xl border border-gray-200 p-3 text-sm font-bold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30 cursor-pointer pr-10"
                                                    required
                                                >
                                                    <option value="">Select target...</option>
                                                    {departmentsList.map((dept) => (
                                                        <option key={dept.id} value={dept.id}>
                                                            {dept.departmentName}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-[#16BCF8] transition-colors">
                                                    <ChevronDown size={18} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                            <MessageSquare size={12} className="text-[#16BCF8]" /> Operational Reason
                                        </label>
                                        <textarea
                                            name="reason"
                                            value={formData.reason}
                                            onChange={handleFormChange}
                                            placeholder="State the reason..."
                                            rows={4}
                                            className="w-full rounded-xl border border-gray-200 p-3 text-sm font-semibold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30 resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-6 px-2">
                        <button
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                            className="rounded-xl px-8 py-3.5 text-sm font-black text-gray-400 uppercase tracking-widest transition-all hover:bg-gray-100 active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || isFetching}
                            className="flex items-center gap-3 rounded-xl bg-[#1B1555] px-12 py-3.5 text-sm font-black text-white uppercase tracking-[0.15em] shadow-2xl shadow-[#1B1555]/30 transition-all hover:bg-[#16BCF8] hover:shadow-[#16BCF8]/40 hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 size={16} />}
                            Save Transfer
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Transfer Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Transfer" maxWidth="max-w-4xl">
                <form onSubmit={handleEditSubmit} className="px-2 py-4">
                    {isFetching ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="h-12 w-12 animate-spin text-[#1B1555] opacity-20" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Syncing Record...</span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                <div className="space-y-4">
                                    <div className="flex justify-start mb-2">
                                        <div className="h-14 w-14 rounded-2xl bg-[#16BCF8]/5 flex items-center justify-center text-[#16BCF8] border-2 border-[#16BCF8]/10">
                                            <Activity size={24} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                            <User size={12} className="text-[#16BCF8]" /> Assigned Employee
                                        </label>
                                        <div className="w-full rounded-xl border border-gray-200 p-3 text-sm font-bold text-gray-500 bg-gray-50/50">
                                            {employeesList.find(emp => emp.id.toString() === formData.employeeId)?.user?.fullName || "Not Specified"}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                            <Calendar size={12} className="text-[#16BCF8]" /> Effective Transfer Date *
                                        </label>
                                        <input
                                            type="date"
                                            name="transferDate"
                                            value={formData.transferDate}
                                            onChange={handleFormChange}
                                            className="w-full rounded-xl border border-gray-200 p-3 text-sm font-bold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                                <Briefcase size={12} className="text-rose-400" /> Origin
                                            </label>
                                            <div className="w-full rounded-xl border border-rose-100 p-3 text-sm font-bold text-rose-600 bg-rose-50/30">
                                                {departmentsList.find(d => d.id.toString() === formData.fromDepartmentId)?.departmentName || "---"}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                                <Briefcase size={12} className="text-[#16BCF8]" /> Destination *
                                            </label>
                                            <div className="relative group">
                                                <select
                                                    name="toDepartmentId"
                                                    value={formData.toDepartmentId}
                                                    onChange={handleFormChange}
                                                    className="w-full appearance-none rounded-xl border border-gray-200 p-3 text-sm font-bold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30 cursor-pointer pr-10"
                                                    required
                                                >
                                                    <option value="">Select target...</option>
                                                    {departmentsList.map((dept) => (
                                                        <option key={dept.id} value={dept.id}>
                                                            {dept.departmentName}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-[#16BCF8] transition-colors">
                                                    <ChevronDown size={18} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                            <MessageSquare size={12} className="text-[#16BCF8]" /> Operational Reason
                                        </label>
                                        <textarea
                                            name="reason"
                                            value={formData.reason}
                                            onChange={handleFormChange}
                                            placeholder="Update the reason..."
                                            rows={4}
                                            className="w-full rounded-xl border border-gray-200 p-3 text-sm font-semibold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30 resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-6 px-2">
                        <button
                            type="button"
                            onClick={() => setIsEditModalOpen(false)}
                            className="rounded-xl px-8 py-3.5 text-sm font-black text-gray-400 uppercase tracking-widest transition-all hover:bg-gray-100 active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || isFetching}
                            className="flex items-center gap-3 rounded-xl bg-[#1B1555] px-12 py-3.5 text-sm font-black text-white uppercase tracking-[0.15em] shadow-2xl shadow-[#1B1555]/30 transition-all hover:bg-[#16BCF8] hover:shadow-[#16BCF8]/40 hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
                            Update Changes
                        </button>
                    </div>
                </form>
            </Modal>

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                itemName={`${transferToDelete?.employee?.user?.fullName}'s Transfer`}
                message={`Are you sure you want to delete the transfer record for "${transferToDelete?.employee?.user?.fullName}"? This action is permanent.`}
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
