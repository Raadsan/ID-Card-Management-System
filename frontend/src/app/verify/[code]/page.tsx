"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, XCircle, ShieldCheck, Loader2, MapPin, Calendar, User, Fingerprint, AlertTriangle, Clock, UserX } from "lucide-react";
import { verifyQrCode } from "@/api/generateIdApi";

import { getImageUrl } from "@/utils/url";


export default function VerificationPage() {
    const params = useParams();
    const code = params.code as string;
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [errorType, setErrorType] = useState<string | null>(null);

    useEffect(() => {
        const fetchVerification = async () => {
            try {
                setLoading(true);
                const result = await verifyQrCode(code);
                setData(result.data);
                setError(null);
                setErrorType(null);
            } catch (err: any) {
                console.error("Verification failed:", err);
                const errorMessage = err.response?.data?.message || "Invalid or Expired ID Card";
                const reason = err.response?.data?.reason;

                setError(errorMessage);
                setErrorType(reason || "unknown");
            } finally {
                setLoading(false);
            }
        };

        if (code) {
            fetchVerification();
        }
    }, [code]);



    const formatDate = (date: string | null) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '-');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50/30 p-4">
                <div className="relative">
                    <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
                    <ShieldCheck className="h-6 w-6 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="mt-6 text-blue-900 font-black uppercase tracking-[0.2em] text-xs animate-pulse">
                    Initializing Security Protocol...
                </p>
            </div>
        );
    }

    if (error) {
        // Determine icon and color based on error type
        const getErrorConfig = () => {
            switch (errorType) {
                case "employee_inactive":
                    return {
                        icon: <UserX className="h-12 w-12 text-orange-500" />,
                        bgColor: "bg-orange-100",
                        ringColor: "ring-orange-50",
                        borderColor: "border-orange-100",
                        title: "Employee Inactive",
                        titleColor: "text-orange-900"
                    };
                case "expired":
                    return {
                        icon: <Clock className="h-12 w-12 text-amber-500" />,
                        bgColor: "bg-amber-100",
                        ringColor: "ring-amber-50",
                        borderColor: "border-amber-100",
                        title: "ID Expired",
                        titleColor: "text-amber-900"
                    };
                case "not_printed":
                    return {
                        icon: <AlertTriangle className="h-12 w-12 text-yellow-500" />,
                        bgColor: "bg-yellow-100",
                        ringColor: "ring-yellow-50",
                        borderColor: "border-yellow-100",
                        title: "ID Not Printed",
                        titleColor: "text-yellow-900"
                    };
                default:
                    return {
                        icon: <XCircle className="h-12 w-12 text-red-500" />,
                        bgColor: "bg-red-100",
                        ringColor: "ring-red-50",
                        borderColor: "border-red-100",
                        title: "Access Denied",
                        titleColor: "text-red-900"
                    };
            }
        };

        const config = getErrorConfig();

        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                <div className={`bg-white p-10 rounded-[40px] shadow-2xl max-w-md w-full text-center border ${config.borderColor} ring-8 ${config.ringColor}`}>
                    <div className={`w-24 h-24 ${config.bgColor} rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner`}>
                        {config.icon}
                    </div>
                    <h1 className={`text-3xl font-black ${config.titleColor} mb-3 tracking-tight`}>{config.title}</h1>
                    <p className="text-gray-500 mb-10 leading-relaxed font-medium">{error}</p>
                    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 text-[10px] font-mono text-gray-400 uppercase tracking-[0.3em]">
                        REF-ID: {code?.slice(0, 12)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F0F2F5] font-sans pb-20">
            {/* Blue Banner Header */}
            <div className="bg-[#1e4e8c] text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-[120px] -mr-48 -mt-48"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400 rounded-full blur-[100px] -ml-40 -mb-40"></div>
                </div>

                <div className="max-w-4xl mx-auto px-6 py-12 md:py-16 flex flex-col items-center relative z-10">
                    <div className="flex items-center gap-6 mb-8 transform hover:scale-105 transition-transform">
                        <div className="h-20 w-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-2xl p-4">
                            <ShieldCheck className="h-10 w-10 text-white" />
                        </div>
                        <div className="h-12 w-[2px] bg-white/20 hidden md:block"></div>
                        <div className="text-center md:text-left">
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none">
                                ID Verification
                            </h1>
                            <p className="text-[10px] text-blue-200 mt-2 font-black uppercase tracking-[0.4em] opacity-80">
                                Somali Petroleum Authority
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Document Body */}
            <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-20">
                <div className=" border-b border-gray-100 mb-10">
                    <img src="/verifyimage.png" alt="SPA Crest" className="w-full" />

                </div>
                <div className="mt-8 text-center space-y-2">
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                        © {new Date().getFullYear()} Somali Petroleum Authority
                    </p>
                    <div className="flex justify-center gap-4 opacity-40">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <ShieldCheck className="w-4 h-4 text-green-600" />
                        <ShieldCheck className="w-4 h-4 text-green-600" />
                    </div>
                </div>
            </div>
        </div>
    );
}
