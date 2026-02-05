"use client";

import { useEffect, useState } from "react";
import { Printer, Loader2, Calendar, User, CheckCircle2 } from "lucide-react";
import ViewIdModal from "../../../components/ViewIdModal";
import { getAllIdGenerates, IdGenerate, printIdGenerate } from "../../../api/generateIdApi";
import { QRCodeSVG } from "qrcode.react";

const SERVER_URL = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5000';

export default function PrintIdPage() {
    const [idCards, setIdCards] = useState<IdGenerate[]>([]);
    const [selectedIdCard, setSelectedIdCard] = useState<IdGenerate | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cardToPrint, setCardToPrint] = useState<IdGenerate | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [pendingPrintId, setPendingPrintId] = useState<number | null>(null);

    const getImageUrl = (path: string | null) => {
        if (!path) return "";
        if (path.startsWith('http')) return path;
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        return `${SERVER_URL}/${cleanPath}`;
    };

    const fetchReadyToPrintIds = async () => {
        try {
            setIsLoading(true);
            const data = await getAllIdGenerates();
            // Filter both ready_to_print and printed status for this page
            const filteredData = data.filter((card: IdGenerate) =>
                card.status === 'ready_to_print' || card.status === 'printed'
            );
            setIdCards(filteredData);
            setError(null);
        } catch (err: any) {
            console.error("Failed to fetch ID cards:", err);
            setError("Failed to load ID cards. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrintRequest = (id: number) => {
        setPendingPrintId(id);
        setIsConfirmModalOpen(true);
    };

    const handlePrint = async () => {
        if (!pendingPrintId) return;
        const id = pendingPrintId;

        try {
            const card = idCards.find((c: IdGenerate) => c.id === id);
            if (!card) return;

            setCardToPrint(card);
            setIsConfirmModalOpen(false);
            setPendingPrintId(null);

            const response = await printIdGenerate(id);
            const updatedCard = response.data;

            // Optimistically update the list with the fresh data from backend
            setIdCards(prev => prev.map(c => c.id === id ? updatedCard : c));

            // If the view modal is open with this card, update its data too
            if (selectedIdCard?.id === id) {
                setSelectedIdCard(updatedCard);
            }

            // Wait for state to update and render before printing
            setTimeout(() => {
                window.print();
            }, 300);
        } catch (err: any) {
            console.error("Failed to mark ID as printed:", err);
            alert(err.response?.data?.message || "Failed to mark as printed");
        }
    };

    const handleView = (card: IdGenerate) => {
        setSelectedIdCard(card);
        setIsViewModalOpen(true);
    };

    useEffect(() => {
        fetchReadyToPrintIds();
    }, []);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                        <Printer className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">ID Printing & Logs</h1>
                        <p className="text-sm text-gray-500">Manage approved cards and view printing history</p>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center bg-white rounded-lg shadow-sm border border-gray-200 p-20">
                    <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-500 font-medium">Loading ready-to-print cards...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg text-center">
                    <p className="font-medium">{error}</p>
                    <button
                        onClick={fetchReadyToPrintIds}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            ) : idCards.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <CheckCircle2 className="h-16 w-16 text-green-200 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Cards Ready to Print</h3>
                    <p className="text-gray-500">All generated IDs are either pending approval or have already been printed.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#1B1555] border-b border-gray-200">
                                    <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">Employee</th>
                                    <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">Template</th>
                                    <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">Issue Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">Expiry Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">Approved By</th>
                                    <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">Printed By</th>
                                    <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {idCards.map((card) => (
                                    <tr key={card.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-semibold text-gray-900">#{card.id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                                                    <User className="h-5 w-5" />
                                                </div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {card.employee?.user?.fullName || "N/A"}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">
                                                {card.template?.name || "Standard Template"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${card.status === 'printed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {card.status === 'printed' ? 'Printed' : 'Ready to Print'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                {card.issueDate ? new Date(card.issueDate).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                {card.expiryDate ? new Date(card.expiryDate).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {card.createdBy?.fullName || "Admin"}
                                            </div>
                                            <div className="text-[10px] text-gray-400 mt-0.5">
                                                {new Date(card.updatedAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {card.status === 'printed' ? (
                                                <>
                                                    <div className="text-sm font-medium text-blue-600">
                                                        {card.printedBy?.fullName || "Admin"}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 mt-0.5 whitespace-nowrap">
                                                        {new Date(card.updatedAt).toLocaleDateString()}
                                                    </div>
                                                </>
                                            ) : (
                                                <span className="text-xs text-gray-400 font-medium italic">Pending</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 text-right">
                                                <button
                                                    onClick={() => handleView(card)}
                                                    className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
                                                >
                                                    View
                                                </button>
                                                {card.status === 'ready_to_print' ? (
                                                    <button
                                                        onClick={() => handlePrintRequest(card.id)}
                                                        className="px-4 py-2 text-xs font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-md shadow-green-100 flex items-center gap-2"
                                                    >
                                                        <Printer className="h-4 w-4" />
                                                        Print Now
                                                    </button>
                                                ) : (
                                                    <div className="px-4 py-2 text-xs font-bold text-green-600 bg-green-50 rounded-lg flex items-center gap-2 border border-green-100 italic">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        Archived
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <ViewIdModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                idCard={selectedIdCard}
                onPrint={handlePrintRequest}
            />

            {/* Confirmation Modal */}
            {isConfirmModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Printer className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Print ID Card?</h3>
                        <p className="text-gray-500 mb-8">This will mark the card as printed and record your name in the audit logs.</p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setIsConfirmModalOpen(false)}
                                className="flex-1 py-3 text-gray-600 font-bold bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePrint}
                                className="flex-1 py-3 text-white font-bold bg-blue-600 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                            >
                                Print Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Printable Area - Hidden by default, visible during window.print() */}
            <div className="print-area hidden print:block pt-10">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        body * { visibility: hidden; }
                        .print-area, .print-area * { visibility: visible; }
                        .print-area { position: absolute; left: 0; top: 0; width: 100%; }
                        @page { size: auto; margin: 0; }
                    }
                `}} />

                {cardToPrint && (
                    <div className="flex flex-col items-center gap-10">
                        {/* Front Side */}
                        <div
                            className="relative bg-white shadow-none border border-gray-100"
                            style={{
                                width: `${cardToPrint.template?.width || 350}px`,
                                height: `${cardToPrint.template?.height || 500}px`,
                                backgroundImage: `url(${getImageUrl(cardToPrint.template?.frontBackground)})`,
                                backgroundSize: '100% 100%',
                            }}
                        >
                            {/* Safe Layout Parsing with Default Fallbacks */}
                            {(() => {
                                try {
                                    const rawLayout = cardToPrint.template?.layout;
                                    const layout = typeof rawLayout === 'string'
                                        ? JSON.parse(rawLayout)
                                        : (rawLayout || {});

                                    // Default positions if layout is empty or missing properties
                                    const pos = {
                                        photo: layout.photo || { x: 100, y: 100, width: 150, height: 150 },
                                        fullName: layout.fullName || { x: 175, y: 280, fontSize: 24, color: "#000000" },
                                        title: layout.title || { x: 175, y: 300, fontSize: 18, color: "#000000" },
                                        department: layout.department || { x: 175, y: 320, fontSize: 18, color: "#666666" },
                                        idNumber: layout.idNumber || { x: 175, y: 360, fontSize: 16, color: "#000000" },
                                        expiryDate: layout.expiryDate || { x: 175, y: 380, fontSize: 16, color: "#000000" },
                                        qrCode: layout.qrCode || layout.barcode || { x: 100, y: 100, width: 100, height: 100 }
                                    };

                                    return (
                                        <>
                                            <div className="absolute overflow-hidden"
                                                style={{
                                                    left: `${pos.photo.x}px`,
                                                    top: `${pos.photo.y}px`,
                                                    width: `${pos.photo.width}px`,
                                                    height: `${pos.photo.height}px`
                                                }}>
                                                <img
                                                    src={getImageUrl(cardToPrint.employee?.user?.photo)}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="absolute whitespace-nowrap"
                                                style={{
                                                    left: `${pos.fullName.x}px`,
                                                    top: `${pos.fullName.y}px`,
                                                    fontSize: `${pos.fullName.fontSize}px`,
                                                    color: pos.fullName.color,
                                                    fontWeight: (pos.fullName as any).fontWeight || 'bold'
                                                }}>
                                                {cardToPrint.employee?.user?.fullName}
                                            </div>
                                            <div className="absolute whitespace-nowrap"
                                                style={{
                                                    left: `${pos.title.x}px`,
                                                    top: `${pos.title.y}px`,
                                                    fontSize: `${pos.title.fontSize || 18}px`,
                                                    color: pos.title.color || '#000000',
                                                    fontWeight: (pos.title as any).fontWeight || 'normal'
                                                }}>
                                                {cardToPrint.employee?.title || 'Staff'}
                                            </div>
                                            <div className="absolute whitespace-nowrap"
                                                style={{
                                                    left: `${pos.department.x}px`,
                                                    top: `${pos.department.y}px`,
                                                    fontSize: `${pos.department.fontSize}px`,
                                                    color: pos.department.color,
                                                    fontWeight: (pos.department as any).fontWeight || 'normal'
                                                }}>
                                                {cardToPrint.employee?.department?.departmentName || 'N/A'}
                                            </div>
                                            <div className="absolute whitespace-nowrap"
                                                style={{
                                                    left: `${pos.expiryDate.x}px`,
                                                    top: `${pos.expiryDate.y}px`,
                                                    fontSize: `${pos.expiryDate.fontSize || 16}px`,
                                                    color: pos.expiryDate.color || '#000000',
                                                    fontWeight: (pos.expiryDate as any).fontWeight || 'normal'
                                                }}>
                                                EXP: {cardToPrint.expiryDate ? new Date(cardToPrint.expiryDate).toLocaleDateString() : '31/12/2026'}
                                            </div>
                                            <div className="absolute font-mono whitespace-nowrap"
                                                style={{
                                                    left: `${pos.idNumber.x}px`,
                                                    top: `${pos.idNumber.y}px`,
                                                    fontSize: `${pos.idNumber.fontSize}px`,
                                                    color: pos.idNumber.color,
                                                    fontWeight: (pos.idNumber as any).fontWeight || 'bold'
                                                }}>
                                                EMP-{cardToPrint.employee?.id?.toString().padStart(4, '0') || '0000'}
                                            </div>
                                        </>
                                    );
                                } catch (e) {
                                    console.error("Layout Error:", e);
                                    return <div className="p-4 text-red-500 bg-white/80">Layout Parsing Failed</div>;
                                }
                            })()}
                        </div>

                        {/* Back Side */}
                        <div
                            className="relative bg-white shadow-none border border-gray-100"
                            style={{
                                width: `${cardToPrint.template?.width || 350}px`,
                                height: `${cardToPrint.template?.height || 500}px`,
                                backgroundImage: `url(${getImageUrl(cardToPrint.template?.backBackground)})`,
                                backgroundSize: '100% 100%',
                            }}
                        >
                            {(() => {
                                try {
                                    const rawLayout = cardToPrint.template?.layout;
                                    const layout = typeof rawLayout === 'string'
                                        ? JSON.parse(rawLayout)
                                        : (rawLayout || {});
                                    const qrPos = layout.qrCode || layout.barcode || { x: 100, y: 100, width: 100, height: 100 };

                                    return (
                                        <div className="absolute bg-white p-1"
                                            style={{
                                                left: `${qrPos.x}px`,
                                                top: `${qrPos.y}px`,
                                                width: `${qrPos.width}px`,
                                                height: `${qrPos.height}px`
                                            }}>
                                            <QRCodeSVG
                                                value={`${window.location.origin}/verify/${cardToPrint.qrCode}`}
                                                size={Math.min(qrPos.width, qrPos.height) - 10}
                                                level="H"
                                            />
                                        </div>
                                    );
                                } catch (e) {
                                    return null;
                                }
                            })()}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
