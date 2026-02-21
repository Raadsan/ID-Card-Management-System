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

    const InfoBox = ({ label, value, icon, className = "" }: any) => (
        <div className={`space-y-1.5 ${className}`}>
            <label className="text-[11px] font-bold uppercase text-[#1B1555]/60 flex items-center gap-2 mb-1">
                {icon} {label}
            </label>
            <div className="w-full rounded-xl border border-gray-100 p-3.5 text-sm font-bold bg-gray-50/30 text-[#1B1555] backdrop-blur-[2px] transition-all hover:border-[#16BCF8]/30">
                {value || '—'}
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
            <div className="space-y-3 w-full group">
                <span className="text-[10px] font-black text-gray-400 block text-center uppercase tracking-widest">{isFront ? 'ID Front View' : 'ID Back View'}</span>
                <div
                    className="relative w-full rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-lg transition-transform hover:scale-[1.02]"
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
                                        src={getImageUrl(employee.photo) || '/placeholder-user.png'}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <div className="absolute whitespace-nowrap overflow-hidden " style={{ ...getPosStyles(positions.fullName), textOverflow: 'ellipsis' }}>
                                {employee.fullName}
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
                            <div
                                className="absolute whitespace-nowrap overflow-visible barcode text-center"
                                style={{
                                    ...getPosStyles(positions.idNumber),
                                    fontSize: '5cqw',
                                    color: positions.idNumber.color || '#000000',
                                    fontWeight: 'normal',
                                    lineHeight: '1.2',
                                }}
                            >
                                SPA01{employee.id?.toString().padStart(4, '0')}/26
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
        <Modal isOpen={isOpen} onClose={onClose} title="Employee Details Profile" maxWidth="max-w-5xl">
            <div className="px-2 py-4 space-y-8 h-full">
                {/* Personal Information Block */}
                <div className="bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-2.5 text-[#16BCF8] font-bold text-sm">
                        <User size={18} /> Personal Information
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
                        <InfoBox label="Full Name" value={employee.fullName} />
                        <InfoBox label="Email Address" value={employee.email} />
                        <InfoBox label="Phone Number" value={employee.phone} />
                        <InfoBox label="Gender" value={employee.gender} />
                        <InfoBox label="Date of Birth" value={formatDate(employee.dob)} />
                        <InfoBox label="Current Age" value={calculateAge(employee.dob)} />
                    </div>
                </div>

                {/* Professional Information Block */}
                <div className="bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-2.5 text-[#16BCF8] font-bold text-sm">
                        <Briefcase size={18} /> Professional Information
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
                        <InfoBox label="Job Title" value={employee.title} />
                        <InfoBox label="Department" value={employee.department?.departmentName} />
                        <InfoBox label="Section" value={employee.section?.name} />
                        <InfoBox label="Category" value={employee.category?.name} />
                        <InfoBox label="Join Date" value={formatDate(employee.createdAt)} />
                        <InfoBox label="Employment Status" value={employee.status} />
                    </div>
                </div>

                {/* Location & Template Block */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6 h-full font-bold">
                            <div className="flex items-center gap-2.5 text-[#16BCF8] font-bold text-sm">
                                <MapPin size={18} /> Office Location
                            </div>
                            <InfoBox label="Nationality" value={employee.nationality} />
                            <InfoBox label="Home Address" value={employee.address} className="h-full" />
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-[#1B1555]/[0.02] p-6 rounded-3xl border border-gray-100 space-y-6">
                            <div className="flex items-center gap-2.5 text-gray-400 font-bold text-xs uppercase tracking-widest">
                                <ImageIcon size={18} /> ID Card Visual Preview
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {renderIdCard(true)}
                                {renderIdCard(false)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white py-4 -mx-2 px-2 border-t border-gray-50/50">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-gray-100/50 text-gray-500 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-all active:scale-95"
                    >
                        Close Profile
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="px-8 py-3 bg-[#1B1555] text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-[#16BCF8] transition-all active:scale-95 shadow-xl shadow-indigo-500/10 flex items-center gap-2"
                    >
                        <Printer size={16} /> Print Details
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ViewEmployeeModal;
