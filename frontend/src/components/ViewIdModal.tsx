"use client";

import { useState, useEffect } from "react";
import { X, User, MapPin, CreditCard, LayoutTemplate, Calendar, Printer, UserCheck, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { IdGenerate } from "@/api/generateIdApi";
import { getImageUrl } from "@/utils/url";


interface ViewIdModalProps {
    isOpen: boolean;
    onClose: () => void;
    idCard: IdGenerate | null;
    onPrint?: (id: number) => void;
}



const ID_TEXT_STYLE = {
    fontFamily: '"Outfit", sans-serif',
    fontWeight: "700", // Bold
    letterSpacing: "0.5px",
    fontSize: "14px",
    textTransform: "uppercase" as const
};

export default function ViewIdModal({ isOpen, onClose, idCard, onPrint }: ViewIdModalProps) {
    const [showFront, setShowFront] = useState(true);
    const [scale, setScale] = useState(0.8);
    const [positions, setPositions] = useState({
        photo: { x: 100, y: 100, width: 150, height: 150 },
        fullName: { x: 175, y: 280, fontSize: 24, color: "#000000" },
        title: { x: 175, y: 300, fontSize: 18, color: "#000000" },
        department: { x: 175, y: 320, fontSize: 18, color: "#666666" },
        idNumber: { x: 175, y: 360, fontSize: 16, color: "#000000" },
        expiryDate: { x: 175, y: 380, fontSize: 16, color: "#000000" },
        qrCode: { x: 100, y: 100, width: 100, height: 100 }
    });

    useEffect(() => {
        if (idCard?.template?.layout) {
            try {
                const layoutData = typeof idCard.template.layout === 'string'
                    ? JSON.parse(idCard.template.layout)
                    : idCard.template.layout;
                setPositions(prev => ({
                    ...prev,
                    ...layoutData,
                    qrCode: layoutData.qrCode || layoutData.barcode || prev.qrCode
                }));
            } catch (e) {
                console.error("Error parsing template layout", e);
            }
        }
    }, [idCard]);

    if (!isOpen || !idCard) return null;



    const statusColors = {
        created: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        ready_to_print: 'bg-blue-100 text-blue-700 border-blue-200',
        printed: 'bg-green-100 text-green-700 border-green-200'
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] relative animate-in fade-in zoom-in-95 duration-200">
                {/* Close Button Overlay */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-50 p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-gray-100 hover:border-red-100 group shadow-sm bg-white"
                >
                    <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                </button>

                {/* Left Side: Preview Area */}
                <div className="flex-1 bg-gray-50 flex flex-col border-r border-gray-100">
                    <div className="p-5 border-b border-gray-100 bg-white flex justify-between items-center pr-28">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                <CreditCard className="w-4 h-4" />
                            </div>
                            <h3 className="font-bold text-gray-800 text-sm">Design Preview</h3>
                        </div>
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setShowFront(true)}
                                className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${showFront ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                Front
                            </button>
                            <button
                                onClick={() => setShowFront(false)}
                                className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${!showFront ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                Back
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto flex items-center justify-center p-8  min-h-[400px]">
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
                                                borderRadius: '8px',
                                            }}
                                        >
                                            <img
                                                src={getImageUrl(idCard.employee?.user?.photo) || '/placeholder-user.png'}
                                                alt=""
                                                className="w-full h-full"
                                                style={{ objectFit: (positions.photo as any).objectFit || 'cover' }}
                                            />
                                        </div>
                                        <div
                                            className="absolute whitespace-nowrap overflow-hidden"
                                            style={{
                                                ...ID_TEXT_STYLE,
                                                left: `${positions.fullName.x}px`,
                                                top: `${positions.fullName.y}px`,
                                                fontSize: `${(positions.fullName as any).fontSize || 24}px`,
                                                fontWeight: 'normal',
                                                textAlign: (positions.fullName as any).textAlign || 'left',
                                                color: positions.fullName.color,
                                                maxWidth: `${(idCard.template?.width || 350) - positions.fullName.x - 20}px`,
                                                textOverflow: 'ellipsis',
                                                letterSpacing: '2px',
                                            }}
                                        >
                                            {idCard.employee?.user.fullName}
                                        </div>
                                        <div
                                            className="absolute whitespace-nowrap overflow-hidden"
                                            style={{
                                                ...ID_TEXT_STYLE,
                                                left: `${positions.title.x}px`,
                                                top: `${positions.title.y}px`,
                                                fontSize: `${(positions.title as any).fontSize || 18}px`,
                                                fontWeight: 'normal',
                                                textAlign: (positions.title as any).textAlign || 'left',
                                                color: (positions.title as any).color || '#000000',
                                                maxWidth: `${(idCard.template?.width || 350) - positions.title.x - 20}px`,
                                                textOverflow: 'ellipsis'
                                            }}
                                        >
                                            {idCard.employee?.title || 'Staff'}
                                        </div>
                                        <div
                                            className="absolute whitespace-nowrap overflow-hidden"
                                            style={{
                                                ...ID_TEXT_STYLE,
                                                left: `${positions.department.x}px`,
                                                top: `${positions.department.y}px`,
                                                fontSize: `${(positions.department as any).fontSize || 18}px`,
                                                fontWeight: (positions.department as any).fontWeight || 'normal',
                                                textAlign: (positions.department as any).textAlign || 'left',
                                                color: positions.department.color,
                                                maxWidth: `${(idCard.template?.width || 350) - positions.department.x - 20}px`,
                                                textOverflow: 'ellipsis'
                                            }}
                                        >
                                            {idCard.employee?.department?.departmentName || 'N/A'}
                                        </div>
                                        <div
                                            className="absolute whitespace-nowrap overflow-hidden"
                                            style={{
                                                ...ID_TEXT_STYLE,
                                                left: `${(positions as any).issueDate?.x || 0}px`,
                                                top: `${(positions as any).issueDate?.y || 0}px`,
                                                fontSize: `${(positions as any).issueDate?.fontSize || 16}px`,
                                                fontWeight: (positions as any).issueDate?.fontWeight || 'normal',
                                                textAlign: (positions as any).issueDate?.textAlign || 'left',
                                                color: (positions as any).issueDate?.color || '#000000',
                                                maxWidth: `${(idCard.template?.width || 350) - ((positions as any).issueDate?.x || 0) - 20}px`,
                                                textOverflow: 'ellipsis'
                                            }}
                                        >
                                            ISSUE: {idCard.issueDate ? new Date(idCard.issueDate).toLocaleDateString() : '01/01/2026'}
                                        </div>
                                        <div
                                            className="absolute whitespace-nowrap overflow-hidden"
                                            style={{
                                                ...ID_TEXT_STYLE,
                                                left: `${positions.expiryDate.x}px`,
                                                top: `${positions.expiryDate.y}px`,
                                                fontSize: `${(positions.expiryDate as any).fontSize || 16}px`,
                                                fontWeight: (positions.expiryDate as any).fontWeight || 'normal',
                                                textAlign: (positions.expiryDate as any).textAlign || 'left',
                                                color: (positions.expiryDate as any).color || '#000000',
                                                maxWidth: `${(idCard.template?.width || 350) - positions.expiryDate.x - 20}px`,
                                                textOverflow: 'ellipsis'
                                            }}
                                        >
                                            EXP: {idCard.expiryDate ? new Date(idCard.expiryDate).toLocaleDateString() : '31/12/2026'}
                                        </div>
                                        <div
                                            className="absolute whitespace-nowrap overflow-hidden"
                                            style={{
                                                ...ID_TEXT_STYLE,
                                                left: `${positions.photo.x}px`,
                                                top: `${positions.idNumber.y}px`,
                                                width: `${positions.photo.width}px`,
                                                fontSize: `22px`,
                                                fontWeight: 'bold',
                                                textAlign: 'center',
                                                fontFamily: 'Orbitron',
                                                color: positions.idNumber.color,
                                                maxWidth: `${positions.photo.width}px`,
                                                textOverflow: 'ellipsis'
                                            }}
                                        >
                                            S/N: SPA01{idCard.employee?.id?.toString().padStart(4, '0') || '0000'}/26
                                        </div>
                                    </>
                                )}

                                {!showFront && positions.qrCode && (
                                    <div
                                        className="absolute overflow-hidden flex items-center justify-center p-1 bg-white"
                                        style={{
                                            left: `${positions.qrCode.x}px`,
                                            top: `${positions.qrCode.y}px`,
                                            width: `${positions.qrCode.width}px`,
                                            height: `${positions.qrCode.height}px`,
                                        }}
                                    >
                                        <QRCodeSVG
                                            value={`${window.location.origin}/verify/${idCard.qrCode}`}
                                            width="100%"
                                            height="100%"
                                            fgColor="#000000"
                                            bgColor="#ffffff"
                                        />
                                    </div>
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
                                    size={250}
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
                        {(idCard.status === 'ready_to_print' || idCard.status === 'printed') && (
                            <button
                                onClick={() => onPrint?.(idCard.id)}
                                className={`flex-1 py-3 text-white font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 ${idCard.status === 'printed'
                                        ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
                                        : 'bg-green-600 hover:bg-green-700 shadow-green-100'
                                    }`}
                            >
                                <Printer className="w-4 h-4" /> {idCard.status === 'printed' ? 'Download' : 'Print Now'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
