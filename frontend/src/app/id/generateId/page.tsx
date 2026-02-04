"use client";

import { useState } from "react";
import { CreditCard, Plus } from "lucide-react";
import GenerateIdModal from "../../../components/GenerateIdModal";

export default function GenerateIdPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

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
                            <h1 className="text-2xl font-bold text-gray-900">Generate ID Card</h1>
                            <p className="text-sm text-gray-500">Create ID cards for employees</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Plus className="h-5 w-5" />
                        Create ID Card
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No ID Cards Yet</h3>
                <p className="text-gray-500 mb-4">Click the "Create ID Card" button to get started</p>
            </div>

            {/* Modal */}
            <GenerateIdModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
