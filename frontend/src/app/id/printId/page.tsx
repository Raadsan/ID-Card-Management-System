"use client";

import { useEffect, useState } from "react";
import { Printer, Loader2, Calendar, User, CheckCircle2, Trash2, Eye, AlertTriangle } from "lucide-react";
import ViewIdModal from "../../../components/ViewIdModal";
import MessageBox, { MessageBoxType } from "../../../components/MessageBox";
import { usePermission } from "@/hooks/usePermission";
import { getAllIdGenerates, IdGenerate, printIdGenerate, deleteIdGenerate, markAsLost } from "../../../api/generateIdApi";
import { QRCodeSVG } from "qrcode.react";

import { getImageUrl } from "@/utils/url";

// Dynamic import for html2pdf.js to avoid SSR issues
let html2pdf: any;
if (typeof window !== 'undefined') {
    import('html2pdf.js').then((module) => {
        html2pdf = module.default;
    });
}

export default function PrintIdPage() {
    const [idCards, setIdCards] = useState<IdGenerate[]>([]);
    const [selectedIdCard, setSelectedIdCard] = useState<IdGenerate | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { hasPermission } = usePermission();
    const canEdit = hasPermission("Print ID", "edit", true);
    const canDelete = hasPermission("Print ID", "delete", true);
    const [cardToPrint, setCardToPrint] = useState<IdGenerate | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [pendingPrintId, setPendingPrintId] = useState<number | null>(null);
    const [isPostPrintConfirmOpen, setIsPostPrintConfirmOpen] = useState(false);
    const [printedCardId, setPrintedCardId] = useState<number | null>(null);

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



    const fetchReadyToPrintIds = async () => {
        try {
            setIsLoading(true);
            const data = await getAllIdGenerates();
            // Filter ready_to_print, printed and replaced status for this page
            const filteredData = data.filter((card: IdGenerate) =>
                card.status === 'printed'
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

    const handleDelete = (id: number) => {
        setMsgBox({
            isOpen: true,
            title: "Delete ID Record",
            message: "Are you sure you want to delete this ID record? This action cannot be undone.",
            type: "confirm",
            onConfirm: () => performDelete(id),
        });
    };

    const performDelete = async (id: number) => {
        try {
            setMsgBox(prev => ({ ...prev, loading: true }));
            await deleteIdGenerate(id);
            setMsgBox({
                isOpen: true,
                title: "Deleted!",
                message: "ID record has been removed successfully.",
                type: "success",
            });
            fetchReadyToPrintIds();
        } catch (error: any) {
            console.error("Failed to delete ID:", error);
            setMsgBox({
                isOpen: true,
                title: "Deletion Failed",
                message: error.response?.data?.message || "Could not delete ID record.",
                type: "error",
            });
        }
    };

    const handlePrintRequest = (id: number) => {
        // Directly open print dialog without confirmation
        const card = idCards.find((c: IdGenerate) => c.id === id);
        if (!card) return;

        // Set the card to print
        setCardToPrint(card);
        setPrintedCardId(id);

        // Wait for DOM to update
        setTimeout(() => {
            // Setup one-time event listener for after print dialog closes
            const handleAfterPrint = () => {
                // Show confirmation asking if they actually printed
                setIsPostPrintConfirmOpen(true);
                window.removeEventListener('afterprint', handleAfterPrint);
            };

            // Add event listener
            window.addEventListener('afterprint', handleAfterPrint);

            // Open browser print dialog
            window.print();
        }, 300);
    };

    const confirmPrinted = async () => {
        if (!printedCardId) return;
        const id = printedCardId;

        try {
            // Update status to printed in backend
            const response = await printIdGenerate(id);
            const updatedCard = response.data;

            // Update the list with the fresh data from backend
            setIdCards(prev => prev.map(c => c.id === id ? updatedCard : c));

            // If the view modal is open with this card, update its data too
            if (selectedIdCard?.id === id) {
                setSelectedIdCard(updatedCard);
            }

            setIsPostPrintConfirmOpen(false);
            setPrintedCardId(null);
        } catch (err: any) {
            console.error("Failed to mark ID as printed:", err);
            alert(err.response?.data?.message || "Failed to mark as printed");
        }
    };

    const handleDownloadPDF = async (card: IdGenerate) => {
        if (!html2pdf) {
            console.error("html2pdf library not loaded yet");
            return;
        }

        const element = document.querySelector('.print-area');
        if (!element) return;

        // Wait for all images in the print area to load before capturing
        const images = element.querySelectorAll('img');
        const imagePromises = Array.from(images).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve; // Continue even if an image fails
            });
        });

        await Promise.all(imagePromises);

        const opt = {
            margin: [5, 5],
            filename: `ID_Card_${card.employee?.user.fullName || card.id}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 3,
                useCORS: true,
                letterRendering: true,
                allowTaint: false,
                backgroundColor: "#ffffff",
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        html2pdf().from(element).set(opt).save();
    };



    const cancelPrinted = () => {
        setIsPostPrintConfirmOpen(false);
        setPrintedCardId(null);
    };

    const handleView = (card: IdGenerate) => {
        setSelectedIdCard(card);
        setIsViewModalOpen(true);
    };

    const handleMarkAsLost = (id: number) => {
        const card = idCards.find((c: IdGenerate) => c.id === id);
        setMsgBox({
            isOpen: true,
            title: "Mark ID as Lost",
            message: `Are you sure you want to mark the ID of "${card?.employee?.user?.fullName}" as lost? This action will update the ID status.`,
            type: "confirm",
            onConfirm: () => performMarkAsLost(id),
        });
    };

    const performMarkAsLost = async (id: number) => {
        try {
            setMsgBox(prev => ({ ...prev, loading: true }));
            const response = await markAsLost(id);
            const updatedCard = response.data;

            // Update the list with the fresh data from backend
            setIdCards(prev => prev.map(c => c.id === id ? updatedCard : c));

            // If the view modal is open with this card, update its data too
            if (selectedIdCard?.id === id) {
                setSelectedIdCard(updatedCard);
            }

            setMsgBox({
                isOpen: true,
                title: "Marked as Lost!",
                message: "ID has been marked as lost successfully.",
                type: "success",
            });
            fetchReadyToPrintIds();
        } catch (error: any) {
            console.error("Failed to mark ID as lost:", error);
            setMsgBox({
                isOpen: true,
                title: "Operation Failed",
                message: error.response?.data?.message || "Could not mark ID as lost.",
                type: "error",
            });
        }
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Printed Logs Found</h3>
                    <p className="text-gray-500">No print history available.</p>
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
                                                    {card.employee?.fullName || "N/A"}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">
                                                {card.template?.name || "Standard Template"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${card.status === 'printed' ? 'bg-green-100 text-green-700' :
                                                card.status === 'replaced' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                                                    card.status === 'lost' ? 'bg-red-100 text-red-700 border border-red-200' :
                                                        card.status === 'expired' ? 'bg-gray-100 text-gray-700 border border-gray-300' :
                                                            'bg-blue-100 text-blue-700'
                                                }`}>
                                                {card.status === 'printed' ? 'Printed' :
                                                    card.status === 'replaced' ? 'Replaced' :
                                                        card.status === 'lost' ? 'Lost' :
                                                            card.status === 'expired' ? 'Expired' : 'Ready to Print'}
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
                                                    className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all"
                                                    title="View ID"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                {canEdit && (card.status === 'ready_to_print' || card.status === 'replaced') && (
                                                    <button
                                                        onClick={() => handlePrintRequest(card.id)}
                                                        className="px-4 py-2 text-xs font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-md shadow-green-100 flex items-center gap-2"
                                                    >
                                                        <Printer className="h-4 w-4" />
                                                        Print
                                                    </button>
                                                )}
                                                {!canEdit && (card.status === 'ready_to_print' || card.status === 'replaced') && (
                                                    <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 bg-gray-50 rounded-lg flex items-center gap-1.5 border border-gray-100 italic">
                                                        No Print Permission
                                                    </div>
                                                )}
                                                {card.status === 'printed' && canEdit && (
                                                    <button
                                                        onClick={() => handleMarkAsLost(card.id)}
                                                        className="px-3 py-2 text-xs font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-all shadow-md shadow-amber-100 flex items-center gap-2"
                                                        title="Mark as Lost"
                                                    >
                                                        <AlertTriangle className="h-4 w-4" />
                                                        Lost
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        onClick={() => handleDelete(card.id)}
                                                        className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all"
                                                        title="Delete Record"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
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

            {/* Post-Print Confirmation Modal */}
            {isPostPrintConfirmOpen && printedCardId && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Printer className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Print Confirmation</h3>
                        <p className="text-gray-600 mb-2">Did you print the ID of employee</p>
                        <p className="text-lg font-bold text-blue-600 mb-6">
                            "{idCards.find(c => c.id === printedCardId)?.employee?.fullName || 'Unknown'}"?
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={cancelPrinted}
                                className="flex-1 py-3 text-gray-600 font-bold bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all"
                            >
                                No
                            </button>
                            <button
                                onClick={confirmPrinted}
                                className="flex-1 py-3 text-white font-bold bg-[#1B1555] rounded-2xl hover:bg-[#16BCF8] transition-all shadow-lg"
                            >
                                Yes
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Printable Area - Positioned off-screen but fully visible to the capture engine */}
            <div className="print-area hidden print:block">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        body * { visibility: hidden; }
                        .print-area, .print-area * { visibility: visible; }
                        .print-area { position: absolute; left: 0; top: 0; width: 100%; height: 100%; }
                        
                        /* Standard ID card size for printers - CR80 */
                        @page { 
                          size: 86mm 54mm; 
                          margin: 0; 
                        }
                        
                        .id-card-page {
                            page-break-after: always;
                            break-after: page;
                            width: 86mm;
                            height: 54mm;
                            margin: 0;
                            padding: 0;
                            display: block;
                            overflow: hidden;
                            position: relative;
                        }
                        
                        .id-card-page:last-child {
                            page-break-after: avoid;
                            break-after: avoid;
                        }

                        /* Ensure the card fills the 86x54mm page */
                        .print-card-container {
                            width: 100%;
                            height: 100%;
                            position: relative;
                            overflow: hidden;
                        }
                    }
                `}} />

                {cardToPrint && (
                    <>
                        {/* FRONT SIDE - PAGE 1 */}
                        <div className="id-card-page">
                            <div
                                className="print-card-container bg-white"
                                style={{
                                    width: `${cardToPrint.template?.width || 1000}px`,
                                    height: `${cardToPrint.template?.height || 600}px`,
                                    transform: `scale(${86 / (cardToPrint.template?.width || 1000) * 3.7795})`, // Convert mm to px roughly
                                    transformOrigin: 'top left'
                                }}
                            >
                                {/* Background Image using <img> for better capture compatibility */}
                                <img
                                    src={getImageUrl(cardToPrint.template?.frontBackground) || ""}
                                    className="absolute inset-0 w-full h-full object-fill"
                                    crossOrigin="anonymous"
                                    alt=""
                                />
                                {(() => {
                                    try {
                                        const rawLayout = cardToPrint.template?.layout;
                                        const layout = typeof rawLayout === 'string'
                                            ? JSON.parse(rawLayout)
                                            : (rawLayout || {});

                                        // Default positions matching IdTemplateLayout.tsx EXACTLY (1000x600 space)
                                        const pos = {
                                            photo: layout.photo || { x: 88, y: 130, width: 220, height: 215, objectFit: 'fill' },
                                            fullName: layout.fullName || { x: 355, y: 284, fontSize: 27, color: "#000000ff", fontWeight: "normal", textAlign: "left", letterSpacing: 0 },
                                            title: layout.title || { x: 353, y: 348, fontSize: 27, color: "#000000ff", fontWeight: "normal", textAlign: "left", letterSpacing: 0 },
                                            department: layout.department || { x: 355, y: 415, fontSize: 27, color: "#000000ff", fontWeight: "normal", textAlign: "left", letterSpacing: 0 },
                                            idNumber: layout.idNumber || { x: 83, y: 479, fontSize: 27, color: "#000000ff", fontWeight: "bold", textAlign: "left", letterSpacing: 0 },
                                            issueDate: layout.issueDate || { x: 353, y: 488, fontSize: 18, color: "#000000ff", fontWeight: "normal", textAlign: "left", letterSpacing: 0 },
                                            expiryDate: layout.expiryDate || { x: 640, y: 491, fontSize: 18, color: "#000000ff", fontWeight: "normal", textAlign: "left", letterSpacing: 0 },
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
                                                        src={getImageUrl(cardToPrint.employee?.photo) || ""}
                                                        className="w-full h-full"
                                                        style={{ objectFit: (pos.photo as any).objectFit || 'cover' }}
                                                        crossOrigin="anonymous"
                                                    />
                                                </div>
                                                <div className="absolute whitespace-nowrap overflow-hidden"
                                                    style={{
                                                        left: `${pos.fullName.x}px`,
                                                        top: `${pos.fullName.y}px`,
                                                        fontSize: `${pos.fullName.fontSize}px`,
                                                        color: pos.fullName.color,
                                                        fontFamily: 'Outfit, sans-serif',
                                                        fontWeight: (pos.fullName as any).fontWeight || 'normal',
                                                        textAlign: (pos.fullName as any).textAlign || 'left',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: `${(pos.fullName as any).letterSpacing || 0}px`
                                                    }}>
                                                    {cardToPrint.employee?.fullName}
                                                </div>
                                                <div className="absolute whitespace-nowrap overflow-hidden"
                                                    style={{
                                                        left: `${pos.title.x}px`,
                                                        top: `${pos.title.y}px`,
                                                        fontSize: `${pos.title.fontSize}px`,
                                                        color: (pos.title as any).color || '#000000ff',
                                                        fontFamily: 'Outfit, sans-serif',
                                                        fontWeight: (pos.title as any).fontWeight || 'normal',
                                                        textAlign: (pos.title as any).textAlign || 'left',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: `${(pos.title as any).letterSpacing || 0}px`
                                                    }}>
                                                    {cardToPrint.employee?.title || 'Staff'}
                                                </div>
                                                <div className="absolute whitespace-nowrap overflow-hidden"
                                                    style={{
                                                        left: `${pos.department.x}px`,
                                                        top: `${pos.department.y}px`,
                                                        fontSize: `${pos.department.fontSize}px`,
                                                        color: pos.department.color,
                                                        fontFamily: 'Outfit, sans-serif',
                                                        fontWeight: (pos.department as any).fontWeight || 'normal',
                                                        textAlign: (pos.department as any).textAlign || 'left',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: `${(pos.department as any).letterSpacing || 0}px`
                                                    }}>
                                                    {cardToPrint.employee?.department?.departmentName || 'N/A'}
                                                </div>
                                                <div className="absolute whitespace-nowrap overflow-hidden"
                                                    style={{
                                                        left: `${pos.issueDate.x}px`,
                                                        top: `${pos.issueDate.y}px`,
                                                        fontSize: `${pos.issueDate.fontSize}px`,
                                                        color: pos.issueDate.color,
                                                        fontFamily: 'Outfit, sans-serif',
                                                        fontWeight: (pos.issueDate as any).fontWeight || 'normal',
                                                        textAlign: (pos.issueDate as any).textAlign || 'left',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: `${(pos.issueDate as any).letterSpacing || 0}px`
                                                    }}>
                                                    {cardToPrint.issueDate ? new Date(cardToPrint.issueDate).toLocaleDateString() : 'N/A'}
                                                </div>
                                                <div className="absolute whitespace-nowrap overflow-hidden"
                                                    style={{
                                                        left: `${pos.expiryDate.x}px`,
                                                        top: `${pos.expiryDate.y}px`,
                                                        fontSize: `${pos.expiryDate.fontSize}px`,
                                                        color: pos.expiryDate.color,
                                                        fontFamily: 'Outfit, sans-serif',
                                                        fontWeight: (pos.expiryDate as any).fontWeight || 'normal',
                                                        textAlign: (pos.expiryDate as any).textAlign || 'left',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: `${(pos.expiryDate as any).letterSpacing || 0}px`
                                                    }}>
                                                    {cardToPrint.expiryDate ? new Date(cardToPrint.expiryDate).toLocaleDateString() : 'N/A'}
                                                </div>
                                                <div className="absolute whitespace-nowrap overflow-visible barcode"
                                                    style={{
                                                        left: `${pos.idNumber.x}px`,
                                                        top: `${pos.idNumber.y}px`,
                                                        fontSize: `${(pos.idNumber as any).fontSize || 27}px`,
                                                        color: pos.idNumber.color || '#000000ff',
                                                        fontFamily: 'monospace',
                                                        fontWeight: (pos.idNumber as any).fontWeight || 'bold',
                                                        textAlign: (pos.idNumber as any).textAlign || 'left',
                                                        letterSpacing: `${(pos.idNumber as any).letterSpacing || 0}px`
                                                    }}>
                                                    SPA01{cardToPrint.employee?.id?.toString().padStart(4, '0') || '0000'}/26
                                                </div>
                                            </>
                                        );
                                    } catch (e) {
                                        return null;
                                    }
                                })()}
                            </div>
                        </div>

                        {/* BACK SIDE - PAGE 2 */}
                        <div className="id-card-page">
                            <div
                                className="print-card-container bg-white"
                                style={{
                                    width: `${cardToPrint.template?.width || 1000}px`,
                                    height: `${cardToPrint.template?.height || 600}px`,
                                    transform: `scale(${86 / (cardToPrint.template?.width || 1000) * 3.7795})`,
                                    transformOrigin: 'top left'
                                }}
                            >
                                {/* Background Image using <img> for better capture compatibility */}
                                <img
                                    src={getImageUrl(cardToPrint.template?.backBackground) || ""}
                                    className="absolute inset-0 w-full h-full object-fill"
                                    crossOrigin="anonymous"
                                    alt=""
                                />
                                {(() => {
                                    try {
                                        const rawLayout = cardToPrint.template?.layout;
                                        const layout = typeof rawLayout === 'string'
                                            ? JSON.parse(rawLayout)
                                            : (rawLayout || {});
                                        const qrPos = layout.qrCode || { x: 169, y: 404, width: 90, height: 90 };

                                        return (
                                            <div className="absolute bg-white/80 p-1 rounded-lg"
                                                style={{
                                                    left: `${qrPos.x}px`,
                                                    top: `${qrPos.y}px`,
                                                    width: `${qrPos.width}px`,
                                                    height: `${qrPos.height}px`
                                                }}>
                                                <QRCodeSVG
                                                    value={`${window.location.origin}/verify/${cardToPrint.qrCode}`}
                                                    width="100%"
                                                    height="100%"
                                                />
                                            </div>
                                        );
                                    } catch (e) {
                                        return null;
                                    }
                                })()}
                            </div>
                        </div>
                    </>
                )}
            </div>

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
