"use client";

import React from "react";
import Modal from "./Modal";
import { AlertTriangle, Trash2 } from "lucide-react";

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    itemName?: string;
}

const DeleteConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Deletion",
    message = "Are you sure you want to delete this item? This action cannot be undone.",
    itemName,
}: DeleteConfirmModalProps) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
        >
            <div className="space-y-6">
                <div className="flex flex-col items-center text-center space-y-4 py-2">
                    <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                        <Trash2 className="h-8 w-8" />
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                            Delete Confirmation
                        </h4>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto">
                            {message}
                        </p>
                        {itemName && (
                            <p className="text-sm font-bold text-primary mt-2 italic px-3 py-1 bg-gray-50 rounded-lg border border-gray-100">
                                {itemName}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-50">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all active:scale-95"
                    >
                        Keep Item
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Trash2 className="h-4 w-4" />
                        Yes, Delete
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteConfirmModal;
