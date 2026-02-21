"use client";

import { useEffect, useState, useMemo } from "react";
import DataTable from "@/components/layout/DataTable";
import { usePermission } from "@/hooks/usePermission";
import { getEmployees, deleteEmployee, createEmployee, updateEmployee, getEmployeeById } from "@/api/employeeApi";
import { getCategories } from "@/api/categoryApi";
import { getDepartments } from "@/api/departmentApi";
import {
    Edit, Trash2, Eye, UserCircle, Briefcase,
    MapPin, Calendar, Activity, ChevronDown,
    Loader2, Plus, Save, Camera, Tag, Globe,
    Mail, Phone, User as UserIcon
} from "lucide-react";
import Modal from "@/components/layout/Modal";
import ViewEmployeeModal from "@/components/ViewEmployeeModal";
import DeleteConfirmModal from "@/components/layout/ConfirmDeleteModel";
import MessageBox, { MessageBoxType } from "@/components/MessageBox";
import { getImageUrl } from "@/utils/url";
import Swal from "sweetalert2";
import { removeBackground } from "@imgly/background-removal";
import countryList from 'react-select-country-list';

// Updated Employee interface
interface Employee {
    id: number;
    fullName: string;
    email: string;
    phone?: string;
    address?: string;
    dob?: string;
    nationality?: string;
    gender?: string;
    photo?: string;
    status: string;
    title?: string;
    departmentId: number;
    sectionId?: number;
    categoryId?: number;
    department?: {
        id: number;
        departmentName: string;
    };
    section?: {
        id: number;
        name: string;
    };
    category?: {
        id: number;
        name: string;
    };
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
    const [isRemovingBg, setIsRemovingBg] = useState(false);

    // Dropdown Data
    const [departments, setDepartments] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        dob: "",
        nationality: "Somalia",
        gender: "Male",
        status: "active",
        title: "",
        departmentId: "",
        sectionId: "",
        categoryId: "",
    });

    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const countryOptions = useMemo(() => countryList().getData(), []);

    // MessageBox State
    const [msgBox, setMsgBox] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: MessageBoxType;
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
        if (isAddModalOpen || isEditModalOpen) {
            fetchDropdownData();
        }
    }, [isAddModalOpen, isEditModalOpen]);

    useEffect(() => {
        if (isEditModalOpen && selectedEmployeeId) {
            fetchEditData();
        }
    }, [isEditModalOpen, selectedEmployeeId]);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const data = await getEmployees();
            setEmployees(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch employees:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdownData = async () => {
        try {
            setIsFetching(true);
            const [depts, cats] = await Promise.all([
                getDepartments(),
                getCategories(),
            ]);
            setDepartments(depts || []);
            setCategories(cats.categories || []);
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
            const employeeData = await getEmployeeById(String(selectedEmployeeId));

            if (employeeData) {
                setFormData({
                    fullName: employeeData.fullName || "",
                    email: employeeData.email || "",
                    phone: employeeData.phone || "",
                    address: employeeData.address || "",
                    dob: employeeData.dob ? new Date(employeeData.dob).toISOString().split('T')[0] : "",
                    nationality: employeeData.nationality || "",
                    gender: employeeData.gender || "Male",
                    status: employeeData.status || "active",
                    title: employeeData.title || "",
                    departmentId: employeeData.departmentId?.toString() || "",
                    sectionId: employeeData.sectionId?.toString() || "",
                    categoryId: employeeData.categoryId?.toString() || "",
                });
                setPhotoPreview(getImageUrl(employeeData.photo));
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

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const result = await Swal.fire({
            title: "Background Removal",
            text: "Do you want to remove the background from this photo?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, remove it!",
            cancelButtonText: "Keep original",
            confirmButtonColor: "#16BCF8",
            cancelButtonColor: "#1B1555",
            customClass: {
                popup: 'rounded-3xl border-none shadow-2xl',
                confirmButton: 'rounded-xl px-6 py-3 font-bold text-sm uppercase tracking-widest',
                cancelButton: 'rounded-xl px-6 py-3 font-bold text-sm uppercase tracking-widest'
            }
        });

        if (result.isConfirmed) {
            try {
                setIsRemovingBg(true);
                const blob = await removeBackground(file);
                const processedFile = new File([blob], file.name, { type: "image/png" });
                setPhotoFile(processedFile);
                setPhotoPreview(URL.createObjectURL(processedFile));
            } catch (error) {
                console.error("Background removal failed:", error);
                setMsgBox({
                    isOpen: true,
                    title: "Processing Error",
                    message: "Failed to remove background. Using original photo.",
                    type: "error"
                });
                setPhotoFile(file);
                setPhotoPreview(URL.createObjectURL(file));
            } finally {
                setIsRemovingBg(false);
            }
        } else {
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleAddEmployee = () => {
        setFormData({
            fullName: "",
            email: "",
            phone: "",
            address: "",
            dob: "",
            nationality: "Somalia",
            gender: "Male",
            status: "active",
            title: "",
            departmentId: "",
            sectionId: "",
            categoryId: "",
        });
        setPhotoFile(null);
        setPhotoPreview(null);
        setIsAddModalOpen(true);
    };

    const handleEdit = (employee: Employee) => {
        setSelectedEmployeeId(employee.id);
        setIsEditModalOpen(true);
    };

    const prepareFormData = () => {
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                data.append(key, value);
            }
        });
        if (photoFile) {
            data.append("photo", photoFile);
        }
        return data;
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const data = prepareFormData();
            await createEmployee(data);
            setIsAddModalOpen(false);
            setMsgBox({
                isOpen: true,
                title: "Success",
                message: "New employee record has been created.",
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
            const data = prepareFormData();
            await updateEmployee(String(selectedEmployeeId), data);
            setIsEditModalOpen(false);
            setMsgBox({
                isOpen: true,
                title: "Success",
                message: "Employee profile updated successfully.",
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
                message: `Employee "${employeeToDelete.fullName}" has been deleted.`,
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
            setIsDeleteModalOpen(false);
        }
    };

    const { hasPermission } = usePermission();

    const canAdd = hasPermission("Employees", "add", true);
    const canEdit = hasPermission("Employees", "edit", true);
    const canDelete = hasPermission("Employees", "delete", true);

    const columns = useMemo(
        () => [
            {
                label: "FullName",
                key: "fullName",
                render: (row: Employee) => (
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100 bg-gray-50 flex items-center justify-center">
                            {getImageUrl(row.photo) ? (
                                <img
                                    src={getImageUrl(row.photo) || ""}
                                    className="h-full w-full object-cover"
                                    onError={(e) => { (e.target as any).src = "/placeholder-user.png"; }}
                                />
                            ) : (
                                <UserIcon className="h-5 w-5 text-gray-400" />
                            )}
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 leading-tight">{row.fullName}</div>
                            <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{row.email}</div>
                        </div>
                    </div>
                ),
            },
            {
                label: "Position",
                key: "title",
                render: (row: Employee) => (
                    <div className="flex flex-col">
                        <span className="text-gray-700 font-bold text-sm tracking-tight">{row.title || "-"}</span>
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] text-[#16BCF8] font-black uppercase tracking-widest">{row.department?.departmentName}</span>
                            {row.section && (
                                <>
                                    <span className="text-[10px] text-gray-300">•</span>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{row.section.name}</span>
                                </>
                            )}
                        </div>
                    </div>
                )
            },
            {
                label: "Category",
                key: "category",
                render: (row: Employee) => (
                    <span className="px-3 py-1 bg-violet-50 text-violet-600 rounded-lg text-[10px] font-black uppercase border border-violet-100">
                        {row.category?.name || "Uncategorized"}
                    </span>
                ),
            },
            {
                label: "Status",
                key: "status",
                align: "center",
                render: (row: Employee) => (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${row.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
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
                        <button onClick={() => handleView(row)} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"><Eye className="h-4 w-4" /></button>
                        {canEdit && <button onClick={() => handleEdit(row)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"><Edit className="h-4 w-4" /></button>}
                        {canDelete && <button onClick={() => handleDelete(row)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 className="h-4 w-4" /></button>}
                    </div>
                ),
            },
        ],
        [employees, canEdit, canDelete]
    );

    return (
        <div className="p-6 space-y-6">
            <DataTable
                title="Personnel Management"
                columns={columns}
                data={employees}
                loading={loading}
                onAddClick={canAdd ? handleAddEmployee : undefined}
                addButtonLabel="Register Employee"
            />

            {/* Registration/Edit Modal */}
            <Modal isOpen={isAddModalOpen || isEditModalOpen} onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} title={isAddModalOpen ? "New Employee Registration" : "Edit Profile"} maxWidth="max-w-5xl">
                <form onSubmit={isAddModalOpen ? handleAddSubmit : handleEditSubmit} className="space-y-8 p-4">
                    {/* Header: Photo Upload & Basic Info */}
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="relative group">
                            <div className="h-32 w-32 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-[#16BCF8] shrink-0">
                                {photoPreview ? (
                                    <img src={photoPreview} className="h-full w-full object-cover" />
                                ) : (
                                    <Camera size={24} className="text-gray-300" />
                                )}
                                {isRemovingBg && (
                                    <div className="absolute inset-0 bg-[#1B1555]/60 flex flex-col items-center justify-center text-white p-2">
                                        <Loader2 className="animate-spin mb-2" size={24} />
                                        <span className="text-[10px] font-black uppercase text-center">Removing Background...</span>
                                    </div>
                                )}
                            </div>
                            <input type="file" onChange={handleFileChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                            <div className="absolute -bottom-2 -right-2 bg-[#1B1555] p-2 rounded-xl text-white shadow-xl">
                                <Plus size={14} />
                            </div>
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-2 mb-1"><UserCircle size={12} className="text-[#16BCF8]" /> Full Name</label>
                                <input name="fullName" value={formData.fullName} onChange={handleFormChange} placeholder="John Doe" className="w-full rounded-xl border border-gray-100 p-3 text-sm font-bold bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-[#16BCF8]/5 focus:border-[#16BCF8] outline-none transition-all" required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-2 mb-1"><Mail size={12} className="text-[#16BCF8]" /> Email Address</label>
                                <input type="email" name="email" value={formData.email} onChange={handleFormChange} placeholder="john@example.com" className="w-full rounded-xl border border-gray-100 p-3 text-sm font-bold bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-[#16BCF8]/5 focus:border-[#16BCF8] outline-none transition-all" required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-2 mb-1"><Phone size={12} className="text-[#16BCF8]" /> Phone Number</label>
                                <input name="phone" value={formData.phone} onChange={handleFormChange} placeholder="+252..." className="w-full rounded-xl border border-gray-100 p-3 text-sm font-bold bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-[#16BCF8]/5 focus:border-[#16BCF8] outline-none transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-2 mb-1"><Globe size={12} className="text-[#16BCF8]" /> Nationality</label>
                                <select
                                    name="nationality"
                                    value={formData.nationality}
                                    onChange={handleFormChange}
                                    className="w-full rounded-xl border border-gray-100 p-3 text-sm font-bold bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-[#16BCF8]/5 focus:border-[#16BCF8] outline-none transition-all"
                                >
                                    <option value="">Select Nationality</option>
                                    {countryOptions.map((country: any) => (
                                        <option key={country.value} value={country.label}>
                                            {country.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 flex items-center gap-1.5"><Briefcase size={12} className="text-[#16BCF8]" /> Department</label>
                            <select name="departmentId" value={formData.departmentId} onChange={handleFormChange} className="w-full rounded-xl border border-gray-100 p-3 text-sm font-bold bg-gray-50/50 focus:bg-white outline-none" required>
                                <option value="">Choose Dept...</option>
                                {departments.map(d => <option key={d.id} value={d.id}>{d.departmentName}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 flex items-center gap-1.5"><Briefcase size={12} className="text-[#16BCF8]" /> Section</label>
                            <select name="sectionId" value={formData.sectionId} onChange={handleFormChange} className="w-full rounded-xl border border-gray-100 p-3 text-sm font-bold bg-gray-50/50 focus:bg-white outline-none" disabled={!formData.departmentId}>
                                <option value="">Choose Section...</option>
                                {departments
                                    .find(d => d.id.toString() === formData.departmentId)
                                    ?.sections?.map((s: any) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))
                                }
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 flex items-center gap-1.5"><Tag size={12} className="text-[#16BCF8]" /> Category</label>
                            <select name="categoryId" value={formData.categoryId} onChange={handleFormChange} className="w-full rounded-xl border border-gray-100 p-3 text-sm font-bold bg-gray-50/50 focus:bg-white outline-none">
                                <option value="">Choose Cat...</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 flex items-center gap-1.5"><Activity size={12} className="text-[#16BCF8]" /> Job Title</label>
                            <input name="title" value={formData.title} onChange={handleFormChange} placeholder="Manager" className="w-full rounded-xl border border-gray-100 p-3 text-sm font-bold bg-gray-50/50 focus:bg-white outline-none" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 flex items-center gap-1.5"><Calendar size={12} className="text-[#16BCF8]" /> Date of Birth</label>
                            <input type="date" name="dob" value={formData.dob} onChange={handleFormChange} className="w-full rounded-xl border border-gray-100 p-3 text-sm font-bold bg-gray-50/50 focus:bg-white outline-none" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 flex items-center gap-1.5"><UserIcon size={12} className="text-[#16BCF8]" /> Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleFormChange} className="w-full rounded-xl border border-gray-100 p-3 text-sm font-bold bg-gray-50/50 focus:bg-white outline-none">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-1 flex items-center gap-1.5"><Activity size={12} className="text-[#16BCF8]" /> Status</label>
                            <select name="status" value={formData.status} onChange={handleFormChange} className="w-full rounded-xl border border-gray-100 p-3 text-sm font-bold bg-gray-50/50 focus:bg-white outline-none">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1 flex items-center gap-1.5"><MapPin size={12} className="text-[#16BCF8]" /> Address</label>
                        <textarea name="address" value={formData.address} onChange={handleFormChange} rows={2} className="w-full rounded-xl border border-gray-100 p-3 text-sm font-bold bg-gray-50/50 focus:bg-white outline-none resize-none" />
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-50">
                        <button type="button" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-all">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="px-10 py-3 bg-[#1B1555] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-500/10 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50">
                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {isEditModalOpen ? "Update Record" : "Save Record"}
                        </button>
                    </div>
                </form>
            </Modal>

            <ViewEmployeeModal isOpen={isViewModalOpen} onClose={() => { setIsViewModalOpen(false); setSelectedEmployee(null); }} employee={selectedEmployee} />

            <DeleteConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} itemName={employeeToDelete?.fullName} />

            <MessageBox isOpen={msgBox.isOpen} onClose={() => setMsgBox(prev => ({ ...prev, isOpen: false }))} title={msgBox.title} message={msgBox.message} type={msgBox.type} />
        </div>
    );
}

