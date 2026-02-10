"use client";

import React, { useState, useEffect } from "react";
import { User, FileText, MapPin, CreditCard, QrCode, Bold, ArrowLeftRight, ChevronLeft, ChevronRight, CheckCircle2, Loader2 } from "lucide-react";

export type TextAlign = "left" | "center" | "right";

export type IdTemplatePositions = typeof DEFAULT_POSITIONS & { [key: string]: any };

export const DEFAULT_POSITIONS = {
    photo: { x: 50, y: 155, width: 275, height: 325, objectFit: 'cover' as 'cover' | 'fill' | 'contain' },
    fullName: { x: 360, y: 245, fontSize: 24, color: "#000000ff", fontWeight: "bold", textAlign: "left" as TextAlign, letterSpacing: 0 },
    title: { x: 360, y: 315, fontSize: 18, color: "#000000ff", fontWeight: "normal", textAlign: "left" as TextAlign, letterSpacing: 0 },
    department: { x: 360, y: 385, fontSize: 18, color: "#000000ff", fontWeight: "normal", textAlign: "left" as TextAlign, letterSpacing: 0 },
    idNumber: { x: 160, y: 505, fontSize: 24, color: "#000000ff", fontWeight: "bold", textAlign: "left" as TextAlign, letterSpacing: 0 },
    issueDate: { x: 360, y: 420, fontSize: 18, color: "#000000ff", fontWeight: "normal", textAlign: "left" as TextAlign, letterSpacing: 0 },
    expiryDate: { x: 360, y: 455, fontSize: 18, color: "#000000ff", fontWeight: "normal", textAlign: "left" as TextAlign, letterSpacing: 0 },
    qrCode: { x: 125, y: 125, width: 100, height: 100 }
};

interface IdCardPreviewProps {
    positions: IdTemplatePositions;
    width: string | number;
    height: string | number;
    previewUrls: { front: string | null; back: string | null };
    activeSide: "front" | "back";
    scale: number;
    isEditable?: boolean;
    onMouseDown?: (e: React.MouseEvent, element: string) => void;
    onResizeStart?: (e: React.MouseEvent, element: string) => void;
    values?: {
        fullName?: string;
        title?: string;
        department?: string;
        idNumber?: string;
        issueDate?: string;
        expiryDate?: string;
        photo?: string;
    };
}

interface LayoutEditorProps {
    positions: IdTemplatePositions;
    setPositions: React.Dispatch<React.SetStateAction<IdTemplatePositions>>;
    width: string | number;
    height: string | number;
    previewUrls: { front: string | null; back: string | null };
    activeSide: "front" | "back";
    setActiveSide: (side: "front" | "back") => void;
    scale: number;
    setScale: (scale: number) => void;
}

export const IdCardPreview: React.FC<IdCardPreviewProps> = ({
    positions,
    width,
    height,
    previewUrls,
    activeSide,
    scale,
    isEditable = false,
    onMouseDown,
    onResizeStart,
    values
}) => {
    const sampleValues = {
        fullName: 'Full Namefffff',
        title: 'Position',
        department: 'Department',
        idNumber: 'ID Number',
        issueDate: 'Issue Date',
        expiryDate: 'Expiry Date',
        photo: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop'
    };

    const currentValues = values || sampleValues;

    return (
        <div className="flex flex-col items-center gap-8">
            {/* FRONT CARD */}
            {activeSide === "front" && (
                <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
                    <div className="flex items-center gap-2 px-6 py-2 bg-white rounded-full shadow-lg border border-blue-100 ring-4 ring-blue-50/50">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                        <span className="text-[11px] font-black text-[#1B1555] uppercase tracking-[0.25em]">Front Workspace</span>
                    </div>

                    <div
                        style={{
                            width: `${Number(width) * scale}px`,
                            height: `${Number(height) * scale}px`,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                        className="relative"
                    >
                        <div
                            className="absolute shadow-[0_32px_64px_-12px_rgba(0,0,0,0.18)] ring-1 ring-gray-100 overflow-hidden bg-white rounded-2xl"
                            style={{
                                width: `${width}px`,
                                height: `${height}px`,
                                transform: `scale(${scale})`,
                                transformOrigin: 'top left',
                            }}
                        >
                            {previewUrls.front ? (
                                <img src={previewUrls.front} alt="Front Template" className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-300 font-bold border-4 border-dashed border-gray-100 uppercase tracking-widest text-sm text-center px-10">Upload Front image to begin or view existing template</div>
                            )}

                            <div className="relative z-10 w-full h-full">
                                <div
                                    onMouseDown={isEditable && onMouseDown ? (e) => onMouseDown(e, 'photo') : undefined}
                                    className={`absolute ${isEditable ? 'border-2 border-dashed border-blue-500 bg-blue-500/10 cursor-move' : ''} flex items-center justify-center text-blue-600 font-black text-sm select-none backdrop-blur-[2px] transition-colors hover:bg-blue-500/20`}
                                    style={{ left: `${positions.photo.x}px`, top: `${positions.photo.y}px`, width: `${positions.photo.width}px`, height: `${positions.photo.height}px` }}
                                >
                                    <div className="flex flex-col items-center w-full h-full relative">
                                        <div className="absolute inset-0 bg-blue-500/5 flex items-center justify-center">
                                            <User size={scale > 0.5 ? 40 : 20} className="opacity-40" />
                                        </div>
                                        {currentValues.photo ? (
                                            <img
                                                src={currentValues.photo}
                                                alt="Photo"
                                                className={`w-full h-full pointer-events-none transition-all ${isEditable ? 'opacity-30' : ''}`}
                                                style={{ objectFit: positions.photo.objectFit || 'cover' }}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs border border-dashed border-gray-400">P/H</div>
                                        )}
                                        {isEditable && <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] uppercase font-black tracking-widest text-[#1B1555] bg-white/80 px-2 py-0.5 rounded shadow-sm backdrop-blur-sm whitespace-nowrap">Photo Box</span>}
                                    </div>
                                </div>

                                {[
                                    { key: 'fullName', label: 'Full Name', value: currentValues.fullName, tagColor: 'bg-green-500', hoverBorder: 'hover:border-green-500/50', resizeColor: 'bg-green-500' },
                                    { key: 'title', label: 'Job Title', value: currentValues.title, tagColor: 'bg-indigo-500', hoverBorder: 'hover:border-indigo-500/50', resizeColor: 'bg-indigo-500' },
                                    { key: 'department', label: 'Department', value: currentValues.department, tagColor: 'bg-purple-500', hoverBorder: 'hover:border-purple-500/50', resizeColor: 'bg-purple-500' },
                                    { key: 'issueDate', label: 'Issue Date', value: currentValues.issueDate, tagColor: 'bg-blue-400', hoverBorder: 'hover:border-blue-400/50', resizeColor: 'bg-blue-400' },
                                    { key: 'expiryDate', label: 'Expiry Date', value: currentValues.expiryDate, tagColor: 'bg-pink-500', hoverBorder: 'hover:border-pink-500/50', resizeColor: 'bg-pink-500' },
                                ].map((item) => (
                                    <div
                                        key={item.key}
                                        onMouseDown={isEditable && onMouseDown ? (e) => onMouseDown(e, item.key) : undefined}
                                        className={`absolute whitespace-nowrap px-1 py-1 border-2 border-dashed border-transparent ${isEditable ? `${item.hoverBorder} cursor-move rounded-xl group/field` : ''} select-none transition-all`}
                                        style={{
                                            left: `${positions[item.key].x}px`,
                                            top: `${positions[item.key].y}px`,
                                            fontSize: `${positions[item.key].fontSize}px`,
                                            color: (DEFAULT_POSITIONS[item.key as keyof typeof DEFAULT_POSITIONS] as any).color || positions[item.key].color,
                                            fontFamily: 'Outfit, sans-serif',
                                            fontWeight: (DEFAULT_POSITIONS[item.key as keyof typeof DEFAULT_POSITIONS] as any).fontWeight || (positions[item.key].fontWeight as any),
                                            textTransform: 'uppercase',
                                            textAlign: (positions[item.key].textAlign || 'left') as any,
                                            letterSpacing: `${(DEFAULT_POSITIONS[item.key as keyof typeof DEFAULT_POSITIONS] as any).letterSpacing ?? positions[item.key].letterSpacing}px`
                                        }}
                                    >
                                        {isEditable && <span className={`absolute -top-7 left-0 text-[9px] font-black text-white ${item.tagColor} px-2 py-0.5 rounded shadow-sm opacity-0 group-hover/field:opacity-100 transition-opacity uppercase tracking-widest`}>{item.label}</span>}
                                        {item.value}
                                        {isEditable && onResizeStart && (
                                            <div
                                                onMouseDown={(e) => onResizeStart(e, item.key)}
                                                className={`absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 ${item.resizeColor} rounded-full flex items-center justify-center cursor-ew-resize opacity-0 group-hover/field:opacity-100 transition-opacity shadow-sm border border-white`}
                                            >
                                                <ArrowLeftRight size={8} className="text-white" />
                                            </div>
                                        )}
                                    </div>
                                ))}

                                <div
                                    onMouseDown={isEditable && onMouseDown ? (e) => onMouseDown(e, 'idNumber') : undefined}
                                    className={`absolute whitespace-nowrap px-1 py-1 border-2 border-dashed border-transparent ${isEditable ? 'hover:border-orange-500/50 cursor-move rounded-xl group/field' : ''} select-none transition-all`}
                                    style={{
                                        left: `${positions.idNumber.x}px`,
                                        top: `${positions.idNumber.y}px`,
                                        fontSize: `${positions.idNumber.fontSize}px`,
                                        color: DEFAULT_POSITIONS.idNumber.color,
                                        fontFamily: 'monospace',
                                        fontWeight: DEFAULT_POSITIONS.idNumber.fontWeight as any,
                                        letterSpacing: `${DEFAULT_POSITIONS.idNumber.letterSpacing}px`,
                                        textAlign: (positions.idNumber.textAlign || 'left') as any
                                    }}
                                >
                                    {isEditable && <span className="absolute -top-7 left-0 text-[10px] font-black text-white bg-orange-500 px-2 py-0.5 rounded shadow-sm opacity-0 group-hover/field:opacity-100 transition-opacity uppercase tracking-widest">SERIAL / ID NO</span>}
                                    {currentValues.idNumber}
                                    {isEditable && onResizeStart && (
                                        <div
                                            onMouseDown={(e) => onResizeStart(e, 'idNumber')}
                                            className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center cursor-ew-resize opacity-0 group-hover/field:opacity-100 transition-opacity shadow-sm border border-white"
                                        >
                                            <ArrowLeftRight size={8} className="text-white" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* BACK CARD */}
            {activeSide === "back" && (
                <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
                    <div className="flex items-center gap-2 px-6 py-2 bg-white rounded-full shadow-lg border border-gray-100 ring-4 ring-gray-50/50">
                        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                        <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em]">Back Workspace</span>
                    </div>

                    <div
                        style={{
                            width: `${Number(width) * scale}px`,
                            height: `${Number(height) * scale}px`,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                        className="relative"
                    >
                        <div
                            className="absolute shadow-[0_32px_64px_-12px_rgba(0,0,0,0.18)] ring-1 ring-gray-100 overflow-hidden bg-white rounded-2xl"
                            style={{
                                width: `${width}px`,
                                height: `${height}px`,
                                transform: `scale(${scale})`,
                                transformOrigin: 'top left',
                            }}
                        >
                            {previewUrls.back ? (
                                <img src={previewUrls.back} alt="Back Template" className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-300 font-bold border-4 border-dashed border-gray-100 uppercase tracking-widest text-sm text-center px-10">Upload Back image to begin or view existing template</div>
                            )}

                            <div className="relative z-10 w-full h-full">
                                <div
                                    onMouseDown={isEditable && onMouseDown ? (e) => onMouseDown(e, 'qrCode') : undefined}
                                    className={`absolute ${isEditable ? 'border-2 border-dashed border-gray-400 bg-gray-50/50 cursor-move rounded-2xl hover:bg-gray-100/50 shadow-sm' : 'bg-white/80 rounded-lg shadow-sm'} flex flex-col items-center justify-center text-gray-600 font-black text-xs select-none backdrop-blur-[2px] transition-all`}
                                    style={{ left: `${positions.qrCode.x}px`, top: `${positions.qrCode.y}px`, width: `${positions.qrCode.width}px`, height: `${positions.qrCode.height}px` }}
                                >
                                    <QrCode size={Math.min(positions.qrCode.width, positions.qrCode.height) * 0.4} className="mb-2 text-gray-400 opacity-60" />
                                    <span className="text-[9px] font-black uppercase opacity-60 tracking-widest">Dynamic QR Code</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Spacer to ensure full scrollability over the footer */}
            <div className="h-64 w-full invisible pointer-events-none"></div>
        </div>
    );
};

export const LayoutEditor: React.FC<LayoutEditorProps> = ({
    positions,
    setPositions,
    width,
    height,
    previewUrls,
    activeSide,
    setActiveSide,
    scale,
    setScale
}) => {
    // DRAG AND DROP / RESIZE LOGIC
    const [isDragging, setIsDragging] = useState<string | null>(null);
    const [isResizing, setIsResizing] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent, element: string) => {
        e.preventDefault();
        setIsDragging(element);
        setDragOffset({
            x: e.clientX - (positions[element as keyof IdTemplatePositions] as any).x * scale,
            y: e.clientY - (positions[element as keyof IdTemplatePositions] as any).y * scale
        });
    };

    const handleResizeStart = (e: React.MouseEvent, element: string) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(element);
        setDragOffset({ x: e.clientX, y: 0 });
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                const newX = (e.clientX - dragOffset.x) / scale;
                const newY = (e.clientY - dragOffset.y) / scale;

                setPositions((prev: IdTemplatePositions) => ({
                    ...prev,
                    [isDragging]: {
                        ...prev[isDragging as keyof IdTemplatePositions],
                        x: Math.round(newX),
                        y: Math.round(newY)
                    }
                }));
            } else if (isResizing) {
                const deltaX = (e.clientX - dragOffset.x) / scale;
                const field = isResizing as keyof typeof positions;
                const currentSpacing = (positions[field] as any).letterSpacing || 0;

                // Sensitivity for letter spacing adjustment
                const newSpacing = Math.max(-5, Math.min(20, currentSpacing + deltaX * 0.1));

                setPositions((prev: IdTemplatePositions) => ({
                    ...prev,
                    [isResizing]: {
                        ...prev[isResizing as keyof IdTemplatePositions],
                        letterSpacing: parseFloat(newSpacing.toFixed(2))
                    }
                }));
                setDragOffset(prev => ({ ...prev, x: e.clientX }));
            }
        };

        const handleMouseUp = () => {
            setIsDragging(null);
            setIsResizing(null);
        };

        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, dragOffset, scale, positions, setPositions]);

    const handlePositionChange = (element: string, field: string, value: any) => {
        setPositions((prev: IdTemplatePositions) => ({
            ...prev,
            [element]: {
                ...prev[element as keyof IdTemplatePositions],
                [field]: value
            }
        }));
    };

    return (
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row border-t border-gray-100">
            {/* Controls Sidebar */}
            <div className="w-full lg:w-1/3 shrink-0 min-w-[320px] bg-white border-r border-gray-200 overflow-y-auto p-4 space-y-5 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
                <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800 border border-blue-100">
                    <strong>Tip:</strong> Drag elements on the cards to position them, or use these controls.
                </div>

                {/* Photo Settings */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                    <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 border-b border-gray-100 pb-2">
                        <User className="w-3 h-3 text-blue-500" /> Photo Placeholder
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                        {['x', 'y', 'width', 'height'].map((field) => (
                            <div key={field}>
                                <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">{field}</label>
                                <input type="number" value={(positions.photo as any)[field]} onChange={e => handlePositionChange('photo', field, +e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm font-mono focus:border-blue-500 focus:ring-0" />
                            </div>
                        ))}
                    </div>
                    <div className="mt-2">
                        <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">Image Fit</label>
                        <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200">
                            {['cover', 'fill', 'contain'].map((fit) => (
                                <button
                                    key={fit}
                                    onClick={() => handlePositionChange('photo', 'objectFit', fit)}
                                    className={`flex-1 py-1 rounded text-[10px] font-black uppercase transition-all ${((positions.photo as any).objectFit || 'cover') === fit ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {fit}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Common fields (FullName, Title, Department, IssueDate, ExpiryDate, IdNumber) */}
                {[
                    { key: 'fullName', label: 'Full Name', icon: <FileText className="w-3 h-3 text-green-500" />, focusColor: 'focus:border-green-500', bgColor: 'bg-green-100', borderColor: 'border-green-200', textColor: 'text-green-700' },
                    { key: 'title', label: 'Job Title', icon: <User className="w-3 h-3 text-indigo-500" />, focusColor: 'focus:border-indigo-500', bgColor: 'bg-indigo-100', borderColor: 'border-indigo-200', textColor: 'text-indigo-700' },
                    { key: 'department', label: 'Department', icon: <MapPin className="w-3 h-3 text-purple-500" />, focusColor: 'focus:border-purple-500', bgColor: 'bg-purple-100', borderColor: 'border-purple-200', textColor: 'text-purple-700' },
                    { key: 'issueDate', label: 'Issue Date', icon: <FileText className="w-3 h-3 text-blue-400" />, focusColor: 'focus:border-blue-400', bgColor: 'bg-blue-100', borderColor: 'border-blue-200', textColor: 'text-blue-700' },
                    { key: 'expiryDate', label: 'Expiry Date', icon: <FileText className="w-3 h-3 text-pink-500" />, focusColor: 'focus:border-pink-500', bgColor: 'bg-pink-100', borderColor: 'border-pink-200', textColor: 'text-pink-700' },
                    { key: 'idNumber', label: 'ID Number', icon: <CreditCard className="w-3 h-3 text-orange-500" />, focusColor: 'focus:border-orange-500', bgColor: 'bg-orange-100', borderColor: 'border-orange-200', textColor: 'text-orange-700' },
                ].map((fieldSet) => (
                    <div key={fieldSet.key} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                        <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 border-b border-gray-100 pb-2">
                            {fieldSet.icon} {fieldSet.label}
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            {['x', 'y', 'fontSize'].map((field) => (
                                <div key={field}>
                                    <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">
                                        {field === 'fontSize' ? 'Size' : field}
                                    </label>
                                    <input
                                        type="number"
                                        step="1"
                                        value={(positions[fieldSet.key] as any)[field]}
                                        onChange={e => handlePositionChange(fieldSet.key, field, +e.target.value)}
                                        className={`w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm font-mono ${fieldSet.focusColor} focus:ring-0`}
                                    />
                                </div>
                            ))}
                            <div className="col-span-2">
                                <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">Text Alignment</label>
                                <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200">
                                    {['left', 'center', 'right'].map((align) => (
                                        <button
                                            key={align}
                                            onClick={() => handlePositionChange(fieldSet.key, 'textAlign', align)}
                                            className={`flex-1 py-1 rounded text-[10px] font-bold uppercase ${(positions[fieldSet.key] as any).textAlign === align ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
                                        >
                                            {align}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* QR Code Settings */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                    <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 border-b border-gray-100 pb-2">
                        <QrCode className="w-3 h-3 text-gray-800" /> Back QR Code
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                        {['x', 'y', 'width', 'height'].map((field) => (
                            <div key={field}>
                                <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">{field}</label>
                                <input type="number" value={(positions.qrCode as any)[field]} onChange={e => handlePositionChange('qrCode', field, +e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm font-mono focus:border-gray-800 focus:ring-0" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 flex flex-col bg-gray-100/50">
                {/* Toolbar */}
                <div className="p-3 bg-white border-b border-gray-200 flex justify-between items-center z-10 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-6">
                            <h3 className="font-bold text-[#1B1555] text-sm uppercase tracking-wider">Design Canvas</h3>

                            {/* Tab Switcher */}
                            <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
                                <button
                                    onClick={() => setActiveSide("front")}
                                    className={`px-6 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${activeSide === "front" ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                                >
                                    Front
                                </button>
                                <button
                                    onClick={() => setActiveSide("back")}
                                    className={`px-6 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${activeSide === "back" ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                                >
                                    Back
                                </button>
                            </div>

                            <div className="h-4 w-[1px] bg-gray-200"></div>

                            <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-inner">
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">Zoom</span>
                                <input
                                    type="range"
                                    min="0.2"
                                    max="1.2"
                                    step="0.01"
                                    value={scale}
                                    onChange={(e) => setScale(parseFloat(e.target.value))}
                                    className="w-32 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                                <span className="text-[10px] font-black text-blue-600 w-8 text-right underline">{Math.round(scale * 100)}%</span>
                            </div>
                        </div>
                        <div className="text-[10px] font-black text-blue-500/60 uppercase bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 shadow-sm animate-pulse">
                            {activeSide === "front" ? "Front Side Active" : "Back Side Active"}
                        </div>
                    </div>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 overflow-auto bg-[#F1F5F9] relative custom-scrollbar">
                    <div className="min-h-full min-w-full flex items-center justify-center p-8 lg:p-20">
                        <IdCardPreview
                            positions={positions}
                            width={width}
                            height={height}
                            previewUrls={previewUrls}
                            activeSide={activeSide}
                            scale={scale}
                            isEditable={true}
                            onMouseDown={handleMouseDown}
                            onResizeStart={handleResizeStart}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
