"use client";

import { useEffect, useState } from "react";
import { CreditCard, Plus, Loader2, Calendar, User, UserCheck } from "lucide-react";
import { usePermission } from "@/hooks/usePermission";
import GenerateIdModal from "../../../components/GenerateIdModal";
import ViewIdModal from "../../../components/ViewIdModal";
import { getAllIdGenerates, IdGenerate, markReadyToPrint, printIdGenerate } from "../../../api/generateIdApi";
import Swal from 'sweetalert2';

export default function GenerateIdPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [idCards, setIdCards] = useState<IdGenerate[]>([]);
    const [selectedIdCard, setSelectedIdCard] = useState<IdGenerate | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { hasPermission } = usePermission();
    const canGenerate = hasPermission("generate-id", "generate", true);
    const canApprove = hasPermission("generate-id", "approve", true);

    const fetchIdCards = async () => {
        try {
            setIsLoading(true);
            const data = await getAllIdGenerates();
            // Filter 'created', 'lost', and 'expired' status for this page
            const filteredData = data.filter((card: IdGenerate) =>
                card.status === 'created' || card.status === 'lost' || card.status === 'expired'
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

    const handleApprove = async (id: number) => {
        const result = await Swal.fire({
            title: 'Approve ID Card?',
            text: "This will mark the ID card as Ready to Print.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#1B1555',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, approve it!'
        });

        if (result.isConfirmed) {
            try {
                await markReadyToPrint(id);
                await Swal.fire(
                    'Approved!',
                    'ID card has been marked as Ready to Print.',
                    'success'
                );
                fetchIdCards();
            } catch (err: any) {
                console.error("Failed to approve ID card:", err);
                Swal.fire(
                    'Error!',
                    err.response?.data?.message || "Failed to approve ID card",
                    'error'
                );
            }
        }
    };

    const handlePrint = async (id: number) => {
        const result = await Swal.fire({
            title: 'Mark as Printed?',
            text: "This will update the status to Printed.",
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#16a34a',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, mark as printed'
        });

        if (result.isConfirmed) {
            try {
                await printIdGenerate(id);
                await Swal.fire(
                    'Printed!',
                    'ID card has been marked as printed.',
                    'success'
                );
                fetchIdCards();
            } catch (err: any) {
                console.error("Failed to mark ID as printed:", err);
                Swal.fire(
                    'Error!',
                    err.response?.data?.message || "Failed to mark as printed",
                    'error'
                );
            }
        }
    };

    const handleView = (card: IdGenerate) => {
        setSelectedIdCard(card);
        setIsViewModalOpen(true);
    };

    useEffect(() => {
        fetchIdCards();
    }, []);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <CreditCard className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">ID Card Management</h1>
                            <p className="text-sm text-gray-500">View and generate employee ID cards</p>
                        </div>
                    </div>

                    {canGenerate && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-6 py-3 bg-[#1B1555] text-white rounded-lg font-medium hover:bg-[#141040] transition-colors flex items-center gap-2"
                        >
                            <Plus className="h-5 w-5" />
                            Generate New ID
                        </button>
                    )}
                </div>
            </div>

            {/* Content Area */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center bg-white rounded-lg shadow-sm border border-gray-200 p-20">
                    <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-500 font-medium">Loading ID cards...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg text-center">
                    <p className="font-medium">{error}</p>
                    <button
                        onClick={fetchIdCards}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            ) : idCards.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No IDs Pending Approval</h3>
                    <p className="text-gray-500 mb-4">Click the "Generate New ID" button to get started or check the Print ID page for approved cards.</p>
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
                                    <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">Generated Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">Created By</th>
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
                                                card.status === 'ready_to_print' ? 'bg-blue-100 text-blue-700' :
                                                    card.status === 'replaced' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                                                        card.status === 'lost' ? 'bg-red-100 text-red-700 border border-red-200' :
                                                            card.status === 'expired' ? 'bg-gray-100 text-gray-700 border border-gray-300' :
                                                                'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {card.status === 'lost' ? 'Lost' :
                                                    card.status === 'expired' ? 'Expired' :
                                                        card.status.replace('_', ' ')}
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
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                {new Date(card.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600">
                                                {card.createdBy?.fullName || "Admin"}
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
                                                {canApprove && (card.status === 'created' || card.status === 'lost' || card.status === 'expired') && (
                                                    <button
                                                        onClick={() => handleApprove(card.id)}
                                                        className="px-3 py-1.5 text-sm font-medium text-white bg-[#16BCF8] rounded-lg hover:bg-[#009ED9] transition-colors shadow-sm"
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                                {canApprove && card.status === 'ready_to_print' && (
                                                    <button
                                                        onClick={() => handlePrint(card.id)}
                                                        className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                                                    >
                                                        Print Now
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

            {/* Modal */}
            <GenerateIdModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    fetchIdCards(); // Refresh list after modal closes
                }}
            />

            <ViewIdModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                idCard={selectedIdCard}
                onPrint={(id) => {
                    setIsViewModalOpen(false); // Close modal before printing (optional, but good UX)
                    handlePrint(id);
                }}
            />
        </div>
    );
}
