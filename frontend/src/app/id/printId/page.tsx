"use client";

import { useEffect, useState } from "react";
import { Printer, Loader2, Calendar, User, CheckCircle2 } from "lucide-react";
import ViewIdModal from "../../../components/ViewIdModal";
import { getAllIdGenerates, IdGenerate, printIdGenerate } from "../../../api/generateIdApi";

export default function PrintIdPage() {
    const [idCards, setIdCards] = useState<IdGenerate[]>([]);
    const [selectedIdCard, setSelectedIdCard] = useState<IdGenerate | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReadyToPrintIds = async () => {
        try {
            setIsLoading(true);
            const data = await getAllIdGenerates();
            // Filter only ready_to_print status
            const filteredData = data.filter((card: IdGenerate) => card.status === 'ready_to_print');
            setIdCards(filteredData);
            setError(null);
        } catch (err: any) {
            console.error("Failed to fetch ID cards:", err);
            setError("Failed to load ID cards. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = async (id: number) => {
        try {
            await printIdGenerate(id);
            alert("ID card marked as printed successfully!");
            fetchReadyToPrintIds(); // Refresh the list
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
                        <h1 className="text-2xl font-bold text-gray-900">Ready to Print</h1>
                        <p className="text-sm text-gray-500">Manage and print approved employee ID cards</p>
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
                                    <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">Ready Since</th>
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
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide bg-blue-100 text-blue-700">
                                                Ready to Print
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                {new Date(card.updatedAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleView(card)}
                                                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handlePrint(card.id)}
                                                    className="px-4 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2"
                                                >
                                                    <Printer className="h-4 w-4" />
                                                    Print Now
                                                </button>
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
            />
        </div>
    );
}
