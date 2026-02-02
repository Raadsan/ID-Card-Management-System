"use client";

import React from "react";
import Modal from "./Modal";
import { User, Briefcase, Calendar, MapPin, Mail, Phone, Shield, Hash, Activity } from "lucide-react";

interface ViewEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: any;
}

const ViewEmployeeModal: React.FC<ViewEmployeeModalProps> = ({ isOpen, onClose, employee }) => {
    if (!employee) return null;

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const calculateAge = (dob: string) => {
        if (!dob) return "N/A";
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return `${age} years`;
    };

    const SectionHeader = ({ icon: Icon, title, colorClass }: any) => (
        <div className={`flex items-center gap-2 mb-4 text-gray-700`}>
            <Icon className="h-4 w-4" />
            <h3 className="text-sm font-bold">{title}</h3>
        </div>
    );

    const InfoCard = ({ label, value, highlight = false }: any) => (
        <div className="bg-white rounded-lg p-3 border border-gray-50 shadow-sm">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{label}</span>
            <span className={`text-sm font-semibold ${highlight ? 'text-blue-600' : 'text-gray-700'}`}>
                {value || "N/A"}
            </span>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Employee Profile: ${employee.user?.fullName}`} maxWidth="max-w-4xl">
            <div className="space-y-6">

                {/* Personal Information Section */}
                <div className="bg-[#f8faff] rounded-xl p-5 border border-blue-50">
                    <SectionHeader icon={User} title="Personal Information" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoCard label="Full Name" value={employee.user?.fullName} />
                        <InfoCard label="Email" value={employee.user?.email} />
                        <InfoCard label="Phone" value={employee.user?.phone} />
                        <InfoCard label="Age" value={calculateAge(employee.dob)} highlight={true} />
                        <InfoCard label="Gender" value={employee.user?.gender} />
                        <InfoCard label="Date of Birth" value={formatDate(employee.dob)} />
                    </div>
                </div>

                {/* Professional Information Section */}
                <div className="bg-[#fff9fc] rounded-xl p-5 border border-pink-50">
                    <SectionHeader icon={Briefcase} title="Professional Information" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoCard label="Employee Code" value={employee.employeeCode} />
                        <InfoCard label="Job Title" value={employee.title} highlight={true} />
                        <InfoCard label="Department" value={employee.department?.departmentName} />
                        <InfoCard label="System Role" value={employee.user?.role?.name} />
                        <InfoCard label="Status" value={employee.status} />
                        <InfoCard label="Join Date" value={formatDate(employee.createdAt)} />
                    </div>
                </div>

                {/* Location & Contact Section */}
                <div className="bg-[#f9fff9] rounded-xl p-5 border border-green-50">
                    <SectionHeader icon={MapPin} title="Location & Additional Details" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <InfoCard label="Office Address" value={employee.address} />
                        </div>
                        {employee.department?.description && (
                            <div className="md:col-span-2">
                                <InfoCard label="Department Overview" value={employee.department.description} />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        onClick={onClose}
                        className="rounded-xl border border-gray-200 bg-white px-8 py-2.5 text-sm font-bold text-gray-700 transition-all hover:bg-gray-50 active:scale-95 shadow-sm"
                    >
                        Close Profile
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ViewEmployeeModal;
