"use client";

import React from "react";
import Modal from "./Modal";
import { AlertTriangle, CheckCircle, Info, XCircle, Loader2 } from "lucide-react";

export type MessageBoxType = "confirm" | "success" | "error" | "info" | "warning";

interface MessageBoxProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    title: string;
    message: string;
    type?: MessageBoxType;
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
}

const MessageBox: React.FC<MessageBoxProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = "info",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    loading = false,
}) => {
    const getIcon = () => {
        switch (type) {
            case "success":
                return <CheckCircle className="h-12 w-12 text-emerald-500" />;
            case "error":
                return <XCircle className="h-12 w-12 text-rose-500" />;
            case "warning":
            case "confirm":
                return <AlertTriangle className="h-12 w-12 text-amber-500" />;
            default:
                return <Info className="h-12 w-12 text-blue-500" />;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
            <div className="flex flex-col items-center text-center space-y-4 py-2">
                <div className="rounded-full bg-gray-50 p-4 transition-transform duration-500 hover:scale-110">
                    {getIcon()}
                </div>

                <div className="space-y-2">
                    <p className="text-sm text-gray-600 leading-relaxed font-medium">
                        {message}
                    </p>
                </div>

                <div className="flex w-full items-center justify-center gap-3 pt-4 border-t border-gray-100">
                    {type === "confirm" ? (
                        <>
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition-all hover:bg-gray-50 active:scale-95 disabled:opacity-50"
                            >
                                {cancelLabel}
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#1B1555] px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#16BCF8] active:scale-95 shadow-lg shadow-[#1B1555]/10 disabled:opacity-70"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    confirmLabel
                                )}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className="w-full rounded-xl bg-[#1B1555] px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#16BCF8] active:scale-95 shadow-lg"
                        >
                            Okay
                        </button>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default MessageBox;
