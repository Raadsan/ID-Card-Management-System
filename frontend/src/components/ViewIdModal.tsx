"use client";

import { useState, useEffect } from "react";
import { X, User, MapPin, CreditCard, LayoutTemplate, Calendar, Printer, UserCheck, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { IdGenerate } from "@/api/generateIdApi";

interface ViewIdModalProps {
    isOpen: boolean;
    onClose: () => void;
    idCard: IdGenerate | null;
    onPrint?: (id: number) => void;
}

const SERVER_URL = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5000';

export default function ViewIdModal({ isOpen, onClose, idCard, onPrint }: ViewIdModalProps) {
    const [showFront, setShowFront] = useState(true);
    const [scale, setScale] = useState(0.8);
    const [positions, setPositions] = useState({
        photo: { x: 100, y: 100, width: 150, height: 150 },
        fullName: { x: 175, y: 280, fontSize: 24, color: "#000000" },
        department: { x: 175, y: 320, fontSize: 18, color: "#666666" },
        idNumber: { x: 175, y: 360, fontSize: 16, color: "#000000" }
    });

    useEffect(() => {
        if (idCard?.template?.layout) {
            try {
                const layoutData = typeof idCard.template.layout === 'string'
                    ? JSON.parse(idCard.template.layout)
                    : idCard.template.layout;
                setPositions(prev => ({ ...prev, ...layoutData }));
            } catch (e) {
                console.error("Error parsing template layout", e);
            }
        }
    }, [idCard]);

    if (!isOpen || !idCard) return null;

    const getImageUrl = (path: string | null) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${SERVER_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const statusColors = {
        created: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        ready_to_print: 'bg-blue-100 text-blue-700 border-blue-200',
        printed: 'bg-green-100 text-green-700 border-green-200'
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">

                {/* Left Side: Preview Area */}
                <div className="flex-1 bg-gray-50 flex flex-col border-r border-gray-100">
                    <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-blue-600" />
                            <h3 className="font-bold text-gray-800 text-sm">ID Card Preview</h3>
                        </div>
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setShowFront(true)}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${showFront ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                Front
                            </button>
                            <button
                                onClick={() => setShowFront(false)}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${!showFront ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                Back
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-[url('https://repo.sourcelink.com/static/transparent-bg.png')] min-h-[400px]">
                        <div className="relative group">
                            {/* Zoom Slider Overlay */}
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center gap-3">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Zoom</span>
                                <input
                                    type="range"
                                    min="0.3"
                                    max="1.5"
                                    step="0.1"
                                    value={scale}
                                    onChange={(e) => setScale(parseFloat(e.target.value))}
                                    className="w-24 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                                <span className="text-[10px] font-mono font-bold text-blue-600">{Math.round(scale * 100)}%</span>
                            </div>

                            <div
                                className="relative shadow-2xl ring-4 ring-black/5 bg-white overflow-hidden transition-transform duration-300"
                                style={{
                                    transform: `scale(${scale})`,
                                    width: `${idCard.template?.width || 350}px`,
                                    height: `${idCard.template?.height || 500}px`,
                                    backgroundImage: `url(${getImageUrl(showFront ? idCard.template?.frontBackground : idCard.template?.backBackground)})`,
                                    backgroundSize: '100% 100%',
                                    backgroundPosition: 'center',
                                    backgroundColor: 'white'
                                }}
                            >
                                {showFront && (
                                    <>
                                        <div
                                            className="absolute overflow-hidden"
                                            style={{
                                                left: `${positions.photo.x}px`,
                                                top: `${positions.photo.y}px`,
                                                width: `${positions.photo.width}px`,
                                                height: `${positions.photo.height}px`,
                                            }}
                                        >
                                            <img
                                                src={getImageUrl(idCard.employee?.user?.photo) || '/placeholder-user.png'}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div
                                            className="absolute whitespace-nowrap"
                                            style={{
                                                left: `${positions.fullName.x}px`,
                                                top: `${positions.fullName.y}px`,
                                                fontSize: `${positions.fullName.fontSize}px`,
                                                color: positions.fullName.color,
                                                fontFamily: 'Arial, sans-serif',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {idCard.employee?.user.fullName}
                                        </div>
                                        <div
                                            className="absolute whitespace-nowrap"
                                            style={{
                                                left: `${positions.department.x}px`,
                                                top: `${positions.department.y}px`,
                                                fontSize: `${positions.department.fontSize}px`,
                                                color: positions.department.color,
                                                fontFamily: 'Arial, sans-serif'
                                            }}
                                        >
                                            {idCard.employee?.department?.departmentName || 'N/A'}
                                        </div>
                                        <div
                                            className="absolute whitespace-nowrap"
                                            style={{
                                                left: `${positions.idNumber.x}px`,
                                                top: `${positions.idNumber.y}px`,
                                                fontSize: `${positions.idNumber.fontSize}px`,
                                                color: positions.idNumber.color,
                                                fontFamily: 'Courier New, monospace',
                                                letterSpacing: '1px'
                                            }}
                                        >
                                            EMP-{idCard.employee?.id?.toString().padStart(4, '0') || '0000'}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Details Area */}
                <div className="w-full md:w-[400px] flex flex-col bg-white">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900">ID Details</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* Status Badge */}
                        <div className="flex flex-col gap-2">
                            <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-widest text-center ${statusColors[idCard.status]}`}>
                                Status: {idCard.status.replace('_', ' ')}
                            </div>
                        </div>

                        {/* QR Code Section */}
                        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-3xl border border-gray-100">
                            <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                                <QRCodeSVG
                                    value={`${window.location.origin}/verify/${idCard.qrCode}`}
                                    size={150}
                                    level="H"
                                    includeMargin={false}
                                />
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Verify with Camera</p>
                                <p className="text-[10px] font-mono text-gray-400">
                                    {idCard.qrCode.split('-')[0]}...
                                </p>
                            </div>
                        </div>

                        {/* Detailed Information */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <User className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Employee Name</p>
                                    <p className="text-sm font-semibold text-gray-900">{idCard.employee?.user?.fullName || 'N/A'}</p>
                                    <p className="text-xs text-gray-500">{idCard.employee?.title || 'Staff'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <LayoutTemplate className="w-4 h-4 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Template Used</p>
                                    <p className="text-sm font-semibold text-gray-900">{idCard.template?.name}</p>
                                    <p className="text-xs text-gray-500">{idCard.template?.width}x{idCard.template?.height}mm</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-amber-50 rounded-lg">
                                    <Calendar className="w-4 h-4 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Generated Date</p>
                                    <p className="text-sm font-semibold text-gray-900">{new Date(idCard.createdAt).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-amber-50 rounded-lg">
                                    <Calendar className="w-4 h-4 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Issue Date</p>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {idCard.issueDate ? new Date(idCard.issueDate).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-red-50 rounded-lg">
                                    <Calendar className="w-4 h-4 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Expiry Date</p>
                                    <p className="text-sm font-semibold text-gray-900 italic">
                                        {idCard.expiryDate ? new Date(idCard.expiryDate).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-green-50 rounded-lg">
                                    <UserCheck className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Created By</p>
                                    <p className="text-sm font-semibold text-gray-900">{idCard.createdBy?.fullName || 'System Admin'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-100 transition-all shadow-sm"
                        >
                            Close
                        </button>
                        {idCard.status === 'ready_to_print' && (
                            <button
                                onClick={() => onPrint?.(idCard.id)}
                                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                            >
                                <Printer className="w-4 h-4" /> Print Now
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
