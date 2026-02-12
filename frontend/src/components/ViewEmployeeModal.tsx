"use client";

import { useState, useEffect } from "react";
import React from "react";
import Modal from "./layout/Modal";
import { User, Briefcase, Calendar, MapPin, Mail, Phone, Shield, Hash, Activity, CreditCard, LayoutTemplate, Printer, QrCode, Image as ImageIcon } from "lucide-react";
import { getAllIdGenerates, IdGenerate } from "@/api/generateIdApi";
import { UPLOAD_URL } from "@/api/axios";
import { QRCodeSVG } from "qrcode.react";

interface ViewEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: any;
}

const ID_TEXT_STYLE = {
    fontFamily: '"Outfit", sans-serif',
    fontWeight: "700",
    letterSpacing: "0.5px",
    fontSize: "14px",
    textTransform: "uppercase" as const
};

const ViewEmployeeModal: React.FC<ViewEmployeeModalProps> = ({ isOpen, onClose, employee }) => {
    const [idCard, setIdCard] = useState<IdGenerate | null>(null);

    useEffect(() => {
        const fetchIdCard = async () => {
            if (isOpen && employee?.id) {
                try {
                    const allIds = await getAllIdGenerates();
                    const foundId = allIds.find(id => id.employeeId === employee.id);
                    setIdCard(foundId || null);
                } catch (error) {
                    console.error("Error fetching employee ID card:", error);
                }
            }
        };
        fetchIdCard();
    }, [isOpen, employee?.id]);

    if (!employee) return null;

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getImageUrl = (path: string | null) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        if (path.startsWith('uploads/')) {
            const rootUrl = UPLOAD_URL.replace('/uploads', '');
            return `${rootUrl}/${path}`;
        }
        return `${UPLOAD_URL}/${path}`;
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

    const InfoBox = ({ label, value, isAccent = false, className = "" }: any) => (
        <div className={`bg-white p-3 rounded-xl border border-gray-100 shadow-sm ${className}`}>
            <div className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">{label}</div>
            <div className={`text-sm font-bold truncate ${isAccent ? 'text-blue-500' : 'text-[#1B1555]'}`}>
                {value || 'N/A'}
            </div>
        </div>
    );

    const positions = idCard?.template?.layout ? (
        typeof idCard.template.layout === 'string'
            ? JSON.parse(idCard.template.layout)
            : idCard.template.layout
    ) : null;

    const renderIdCard = (isFront: boolean) => {
        if (!idCard || !positions) return null;
        const width = idCard.template?.width || 350;
        const height = idCard.template?.height || 500;

        const getPosStyles = (pos: any) => {
            if (!pos) return {};
            return {
                left: `${(pos.x / width) * 100}%`,
                top: `${(pos.y / height) * 100}%`,
                width: pos.width ? `${(pos.width / width) * 100}%` : 'auto',
                height: pos.height ? `${(pos.height / height) * 100}%` : 'auto',
                fontSize: `${((pos.fontSize || 14) / width) * 100}cqw`,
                color: pos.color || '#000000',
            };
        };

        return (
            <div className="space-y-2 w-full">
                <span className="text-xs font-bold text-gray-500 block text-center uppercase tracking-wider">{isFront ? 'Front Side' : 'Back Side'}</span>
                <div
                    className="relative w-full rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-xl"
                    style={{
                        aspectRatio: `${width} / ${height}`,
                        containerType: 'size'
                    }}
                >
                    <img
                        src={getImageUrl(isFront ? idCard.template?.frontBackground : idCard.template?.backBackground) || ''}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    {isFront && (
                        <>
                            {positions.photo && (
                                <div className="absolute overflow-hidden" style={getPosStyles(positions.photo)}>
                                    <img
                                        src={getImageUrl(employee.user?.photo) || '/placeholder-user.png'}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <div className="absolute whitespace-nowrap overflow-hidden font-bold" style={{ ...getPosStyles(positions.fullName), textOverflow: 'ellipsis' }}>
                                {employee.user?.fullName}
                            </div>
                            <div className="absolute whitespace-nowrap overflow-hidden" style={{ ...getPosStyles(positions.title), textOverflow: 'ellipsis' }}>
                                {employee.title || 'Staff'}
                            </div>
                            <div className="absolute whitespace-nowrap overflow-hidden" style={{ ...getPosStyles(positions.department), textOverflow: 'ellipsis' }}>
                                {employee.department?.departmentName || 'N/A'}
                            </div>
                            <div className="absolute whitespace-nowrap overflow-hidden" style={{ ...getPosStyles(positions.expiryDate), textOverflow: 'ellipsis' }}>
                                EXP: {idCard.expiryDate ? new Date(idCard.expiryDate).toLocaleDateString() : 'N/A'}
                            </div>
                            <div className="absolute whitespace-nowrap overflow-hidden font-bold text-center" style={{ ...getPosStyles(positions.idNumber), textOverflow: 'ellipsis' }}>
                                S/N: SPA01{employee.id?.toString().padStart(4, '0')}/26
                            </div>
                        </>
                    )}
                    {!isFront && positions.qrCode && (
                        <div className="absolute overflow-hidden flex items-center justify-center p-[1cqw] bg-white shadow-inner" style={getPosStyles(positions.qrCode)}>
                            <QRCodeSVG
                                value={`${window.location.origin}/verify/${idCard.qrCode}`}
                                width="100%"
                                height="100%"
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="View Employee Profile" maxWidth="max-w-5xl">
            <div className="px-8 py-8 space-y-10">
                {/* Personal Information Block */}
                <div className="bg-indigo-50/20 p-8 rounded-2xl border border-indigo-100/50 space-y-6">
                    <div className="flex items-center gap-3 text-[#1B1555] font-black uppercase tracking-[0.15em] text-[12px]">
                        <User size={16} className="text-indigo-400" /> Personal Information
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InfoBox label="Full Name" value={employee.user?.fullName} className="p-4" />
                        <InfoBox label="Email" value={employee.user?.email} className="p-4" />
                        <InfoBox label="Phone" value={employee.user?.phone} className="p-4" />
                        <InfoBox label="Age" value={calculateAge(employee.dob)} isAccent className="p-4" />
                        <InfoBox label="Gender" value={employee.user?.gender} className="p-4" />
                        <InfoBox label="Date of Birth" value={formatDate(employee.dob)} className="p-4" />
                    </div>
                </div>

                {/* Professional Information Block */}
                <div className="bg-rose-50/20 p-8 rounded-2xl border border-rose-100/50 space-y-6">
                    <div className="flex items-center gap-3 text-[#1B1555] font-black uppercase tracking-[0.15em] text-[12px]">
                        <Briefcase size={16} className="text-rose-400" /> Professional Information
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InfoBox label="Job Title" value={employee.title} isAccent className="p-4" />
                        <InfoBox label="Department" value={employee.department?.departmentName} className="p-4" />
                        <InfoBox label="System Role" value={employee.user?.role?.name} className="p-4" />
                        <InfoBox label="Status" value={employee.status} className="p-4" />
                        <InfoBox label="Join Date" value={formatDate(employee.createdAt)} className="p-4" />
                    </div>
                </div>

                {/* Location Block */}
                <div className="bg-emerald-50/20 p-8 rounded-2xl border border-emerald-100/50 space-y-6">
                    <div className="flex items-center gap-3 text-[#1B1555] font-black uppercase tracking-[0.15em] text-[12px]">
                        <MapPin size={16} className="text-emerald-400" /> Location & Additional Details
                    </div>
                    <div className="space-y-6">
                        <InfoBox label="Office Address" value={employee.address} className="w-full p-4" />
                        <InfoBox label="Department Overview" value="Information regarding the specific department and reporting lines." className="w-full p-4" />
                    </div>
                </div>

                {/* Template Backgrounds Block */}
                <div className="bg-gray-50/50 p-8 rounded-2xl border border-gray-100 space-y-8">
                    <div className="flex items-center gap-3 text-gray-500 font-black uppercase tracking-[0.15em] text-[12px]">
                        <ImageIcon size={16} /> Template Backgrounds
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                        {renderIdCard(true)}
                        {renderIdCard(false)}
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={onClose}
                        className="px-10 py-3 bg-white border border-gray-200 text-gray-400 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
                    >
                        Close profile
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ViewEmployeeModal;
