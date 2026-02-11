"use client";

import { useEffect, useState, useMemo } from "react";
import DataTable from "@/components/layout/DataTable";
import { getEmployees, deleteEmployee, createEmployee, updateEmployee, getEmployeeById } from "@/api/employeeApi";
import { getUsers } from "@/api/userApi";
import { getDepartments } from "@/api/departmentApi";
import { Edit, Trash2, Eye, UserCircle, Briefcase, Hash, MapPin, Calendar, Activity, ChevronDown, Loader2, Plus, Save, CheckCircle2 } from "lucide-react";
import Modal from "@/components/layout/Modal";
import ViewEmployeeModal from "@/components/ViewEmployeeModal";
import DeleteConfirmModal from "@/components/layout/ConfirmDeleteModel";
import MessageBox, { MessageBoxType } from "@/components/MessageBox";
import { UPLOAD_URL } from "@/api/axios";

// Define the Employee type based on your API response
interface Employee {
    id: number;
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

    // Dropdown Data
    const [users, setUsers] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        userId: "",
        departmentId: "",
        title: "",
        address: "",
        dob: "",
        status: "active",
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
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (isAddModalOpen) {
            fetchDropdownData();
        }
    }, [isAddModalOpen]);

    useEffect(() => {
        if (isEditModalOpen && selectedEmployeeId) {
            fetchEditData();
        }
    }, [isEditModalOpen, selectedEmployeeId]);

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

    const fetchDropdownData = async () => {
        try {
            setIsFetching(true);
            const [usersData, departmentsData] = await Promise.all([
                getUsers(),
                getDepartments(),
            ]);

            const availableUsers = Array.isArray(usersData)
                ? usersData.filter((u: any) => !u.employee)
                : [];

            setUsers(availableUsers);
            setDepartments(departmentsData);
        } catch (err) {
            console.error("Failed to fetch dropdown data:", err);
        } finally {
            setIsFetching(false);
        }
    };

    const fetchEditData = async () => {
        if (!selectedEmployeeId) return;
        try {
            setIsFetching(true);
            const [departmentsData, employeeData] = await Promise.all([
                getDepartments(),
                getEmployeeById(String(selectedEmployeeId))
            ]);

            setDepartments(departmentsData);

            if (employeeData) {
                setFormData({
                    userId: employeeData.userId?.toString() || "",
                    departmentId: employeeData.departmentId?.toString() || "",
                    title: employeeData.title || "",
                    address: employeeData.address || "",
                    dob: employeeData.dob ? new Date(employeeData.dob).toISOString().split('T')[0] : "",
                    status: employeeData.status || "active",
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

    const handleAddEmployee = () => {
        setFormData({
            userId: "",
            departmentId: "",
            title: "",
            address: "",
            dob: "",
            status: "active",
        });
        setIsAddModalOpen(true);
    };

    const handleEdit = (employee: Employee) => {
        setSelectedEmployeeId(employee.id);
        setIsEditModalOpen(true);
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await createEmployee({
                ...formData,
                userId: Number(formData.userId),
                departmentId: Number(formData.departmentId),
            });
            setIsAddModalOpen(false);
            setMsgBox({
                isOpen: true,
                title: "Success",
                message: "New employee record has been established.",
                type: "success",
            });
            fetchEmployees();
        } catch (error: any) {
            setMsgBox({
                isOpen: true,
                title: "Error",
                message: error.response?.data?.message || "Failed to add employee.",
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEmployeeId) return;
        try {
            setIsSubmitting(true);
            await updateEmployee(String(selectedEmployeeId), {
                ...formData,
                departmentId: Number(formData.departmentId),
            });
            setIsEditModalOpen(false);
            setMsgBox({
                isOpen: true,
                title: "Success",
                message: "Employee profile synchronized successfully.",
                type: "success",
            });
            fetchEmployees();
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

    const handleView = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsViewModalOpen(true);
    };

    const handleDelete = (employee: Employee) => {
        setEmployeeToDelete(employee);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!employeeToDelete) return;
        try {
            setLoading(true);
            await deleteEmployee(String(employeeToDelete.id));
            setMsgBox({
                isOpen: true,
                title: "Success",
                message: `Employee record for "${employeeToDelete.user?.fullName}" has been deleted.`,
                type: "success",
            });
            fetchEmployees();
        } catch (error: any) {
            setMsgBox({
                isOpen: true,
                title: "Error",
                message: error.response?.data?.message || "Failed to delete employee record.",
                type: "error",
            });
        } finally {
            setLoading(false);
            setEmployeeToDelete(null);
        }
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
                                src={row.user?.photo ? `${UPLOAD_URL}/${row.user.photo}` : "/placeholder-user.png"}
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
                    <select
                        value={row.status}
                        onChange={async (e) => {
                            const newStatus = e.target.value;
                            try {
                                await updateEmployee(String(row.id), { status: newStatus });
                                setMsgBox({
                                    isOpen: true,
                                    title: "Success",
                                    message: `Employee status updated to ${newStatus}.`,
                                    type: "success",
                                });
                                fetchEmployees();
                            } catch (error: any) {
                                setMsgBox({
                                    isOpen: true,
                                    title: "Error",
                                    message: error.response?.data?.message || "Failed to update status.",
                                    type: "error",
                                });
                            }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border cursor-pointer transition-all ${row.status === 'active'
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                            }`}
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
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
                            onClick={() => handleDelete(row)}
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


            {/* Add Employee Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Employee" maxWidth="max-w-5xl">
                <form onSubmit={handleAddSubmit} className="px-2 py-4">
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                <UserCircle size={12} className="text-[#16BCF8]" />  User Name
                            </label>
                            <div className="relative group">
                                <select
                                    name="userId"
                                    value={formData.userId}
                                    onChange={handleFormChange}
                                    disabled={isFetching}
                                    className="w-full appearance-none rounded-xl border border-gray-200 p-3.5 text-sm font-bold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30 pr-10 disabled:opacity-50"
                                    required
                                >
                                    <option value="">Choose system user...</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.fullName} ({user.email})
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    {isFetching ? <Loader2 size={16} className="animate-spin" /> : <ChevronDown size={18} />}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                <Briefcase size={12} className="text-[#16BCF8]" /> Department
                            </label>
                            <div className="relative group">
                                <select
                                    name="departmentId"
                                    value={formData.departmentId}
                                    onChange={handleFormChange}
                                    disabled={isFetching}
                                    className="w-full appearance-none rounded-xl border border-gray-200 p-3.5 text-sm font-bold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30 pr-10"
                                    required
                                >
                                    <option value="">Choose department...</option>
                                    {departments.map((dept) => (
                                        <option key={dept.id} value={dept.id}>
                                            {dept.departmentName}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    {isFetching ? <Loader2 size={16} className="animate-spin" /> : <ChevronDown size={18} />}
                                </div>
                            </div>
                        </div>


                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                <Briefcase size={12} className="text-[#16BCF8]" /> Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleFormChange}
                                placeholder="Ex: Senior Analyst"
                                className="w-full rounded-xl border border-gray-200 p-3.5 text-sm font-semibold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                <Calendar size={12} className="text-[#16BCF8]" /> Date of Birth
                            </label>
                            <input
                                type="date"
                                name="dob"
                                value={formData.dob}
                                onChange={handleFormChange}
                                className="w-full rounded-xl border border-gray-200 p-3.5 text-sm font-semibold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                <Activity size={12} className="text-[#16BCF8]" /> Employment Status
                            </label>
                            <div className="relative group">
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleFormChange}
                                    className="w-full appearance-none rounded-xl border border-gray-200 p-3.5 text-sm font-bold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30 pr-10"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-[#16BCF8] transition-all">
                                    <ChevronDown size={18} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                <MapPin size={12} className="text-[#16BCF8]" /> Employee Address
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleFormChange}
                                rows={2}
                                placeholder="Enter full residential details..."
                                className="w-full rounded-xl border border-gray-200 p-3.5 text-sm font-semibold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30 resize-none"
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-6 px-2">
                        <button
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                            className="rounded-xl px-8 py-3 text-sm font-black text-gray-400 uppercase tracking-widest transition-all hover:bg-gray-100 active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || isFetching}
                            className="flex items-center gap-3 rounded-xl bg-[#1B1555] px-12 py-3 text-sm font-black text-white uppercase tracking-[0.15em] shadow-lg shadow-[#1B1555]/20 transition-all hover:bg-[#1B1555]/90 hover:shadow-[#1B1555]/40 hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus size={16} />}
                            Save Employee
                        </button>
                    </div>
                </form>
            </Modal>

            <ViewEmployeeModal
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setSelectedEmployee(null);
                }}
                employee={selectedEmployee}
            />

            {/* Edit Employee Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Employee" maxWidth="max-w-5xl">
                {isFetching ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-[#1B1555] opacity-20" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Syncing Data...</span>
                    </div>
                ) : (
                    <form onSubmit={handleEditSubmit} className="px-2 py-4">
                        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5">

                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                    <Briefcase size={12} className="text-[#16BCF8]" />  Title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleFormChange}
                                    className="w-full rounded-xl border border-gray-200 p-3.5 text-sm font-semibold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                    <Briefcase size={12} className="text-[#16BCF8]" /> Department
                                </label>
                                <div className="relative">
                                    <select
                                        name="departmentId"
                                        value={formData.departmentId}
                                        onChange={handleFormChange}
                                        className="w-full appearance-none rounded-xl border border-gray-200 p-3.5 text-sm font-bold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30 pr-10"
                                        required
                                    >
                                        <option value="">Choose department...</option>
                                        {departments.map((dept) => (
                                            <option key={dept.id} value={dept.id}>
                                                {dept.departmentName}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <ChevronDown size={18} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                    <Calendar size={12} className="text-[#16BCF8]" /> Date of Birth
                                </label>
                                <input
                                    type="date"
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleFormChange}
                                    className="w-full rounded-xl border border-gray-200 p-3.5 text-sm font-semibold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                    <Activity size={12} className="text-[#16BCF8]" /> Employment Status
                                </label>
                                <div className="relative">
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleFormChange}
                                        className="w-full appearance-none rounded-xl border border-gray-200 p-3.5 text-sm font-bold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30 pr-10"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <ChevronDown size={18} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.05em] text-[#1B1555]/60 flex items-center gap-2">
                                    <MapPin size={12} className="text-[#16BCF8]" /> Employee Address
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleFormChange}
                                    rows={2}
                                    className="w-full rounded-xl border border-gray-200 p-3.5 text-sm font-semibold transition-all focus:border-[#16BCF8] focus:outline-none focus:ring-4 focus:ring-[#16BCF8]/5 bg-gray-50/30 resize-none"
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-6 px-2">
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="rounded-xl px-8 py-3 text-sm font-black text-gray-400 uppercase tracking-widest transition-all hover:bg-gray-100 active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || isFetching}
                                className="flex items-center gap-3 rounded-xl bg-[#1B1555] px-12 py-3 text-sm font-black text-white uppercase tracking-[0.15em] shadow-lg shadow-[#1B1555]/20 transition-all hover:bg-[#1B1555]/90 hover:shadow-[#1B1555]/40 hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
                                Update Changes
                            </button>
                        </div>
                    </form >
                )
                }
            </Modal >

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                itemName={employeeToDelete?.user?.fullName}
                message={`Are you sure you want to delete the employee record for "${employeeToDelete?.user?.fullName}"? This action cannot be undone.`}
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
        </div >
    );
}

