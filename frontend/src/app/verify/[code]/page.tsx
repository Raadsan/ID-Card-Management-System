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

                <div className="max-w-4xl mx-auto px-6 py-8 md:py-16 flex flex-col items-center relative z-10 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 mb-8 transform hover:scale-105 transition-transform">
                        <div className="h-16 w-16 md:h-20 md:w-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-2xl p-3 md:p-4">
                            <ShieldCheck className="h-8 w-8 md:h-10 md:w-10 text-white" />
                        </div>
                        <div className="h-1 lg:h-12 w-12 lg:w-[2px] bg-white/20 hidden md:block"></div>
                        <div className="text-center md:text-left">
                            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight uppercase leading-tight">
                                ID Verification
                            </h1>
                            <p className="text-[8px] md:text-[10px] text-blue-200 mt-1 md:mt-2 font-black uppercase tracking-[0.2em] md:tracking-[0.4em] opacity-80">
                                Somali Petroleum Authority
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Document Body */}
            <div className="max-w-3xl mx-auto px-4 -mt-10 relative z-20">
                <div className="relative shadow-[0_20px_50px_rgba(0,0,0,0.15)]  overflow-hidden ">
                    {/* Background Template */}
                    <img
                        src="/verifyimage.png"
                        alt="ID Card Template"
                        className="w-full h-auto block"
                    />

                    {/* Photo Overlay */}
                    <div className="absolute top-[31%] right-[5.8%] w-[21.8%] h-[15.8%] aspect-[0.85/1] rounded-sm overflow-hidden  ">
                        {data?.employee?.user?.photo ? (
                            <img
                                src={getImageUrl(data.employee.user.photo) || undefined}
                                alt="Employee Photo"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                <User className="w-10 h-10 text-gray-300" />
                            </div>
                        )}
                    </div>

                    {/* Metadata Overlays (Tracking, ID, Issue Date) */}
                    <div className="absolute top-[32.5%] left-[54%] text-[#143d73] font-normal  tracking-tight">
                        {data?.qrCode || "N/A"}
                    </div>
                    <div className="absolute top-[38.6%] left-[54%] text-[#143d73] font-black text-[clamp(10px,1.8vw,14px)] tracking-tight">
                        ID-0000{data?.employee?.id || "0"}
                    </div>
                    <div className="absolute top-[44%] left-[54%] text-[#143d73] font-black text-[clamp(10px,1.8vw,14px)] tracking-tight">
                        {formatDate(data?.issueDate)}
                    </div>

                    {/* Primary Info (Full Name) */}
                    <div className="absolute top-[50.5%] left-[8.5%] w-[79%] h-[8%] flex items-center">
                        <h2 className="text-black font-normal  text-[clamp(10px,1.8vw,18px)] leading-none  tracking-tight">
                            {data?.employee?.user?.fullName || "N/A"}
                        </h2>
                    </div>

                    {/* Department and Job Title */}
                    <div className="absolute top-[59.2%] left-[8.5%] w-[38.5%] h-[5%] flex items-center">
                        <p className="text-black font-normal text-[clamp(10px,1.8vw,18px)] leading-none ">
                            {data?.employee?.department?.departmentName || "N/A"}
                        </p>
                    </div>
                    <div className="absolute top-[60.2%] left-[53.7%] w-[36.5%] h-[5%] flex items-center">
                        <p className="text-black font-normal text-[clamp(10px,1.8vw,18px)] leading-none ">
                            {data?.employee?.title || "N/A"}
                        </p>
                    </div>

                    {/* Personal Details Row */}
                    <div className="absolute top-[71.4%] left-[8.8%] w-[20%] text-black font-normal text-[clamp(8px,1.6vw,16px)]">
                        {data?.employee?.user?.gender || "N/A"}
                    </div>
                    <div className="absolute top-[71.4%] left-[25.8%] w-[30%] text-black font-normal text-[clamp(8px,1.6vw,16px)] text-center">
                        {formatDate(data?.employee?.dob)}
                    </div>
                    <div className="absolute top-[71.4%] left-[69.5%] w-[21%] text-black font-normal text-[clamp(8px,1.6vw,16px)]">
                        Somalia
                    </div>

                    {/* Address/Location Row */}
                    <div className="absolute top-[81.3%] left-[8.8%] w-[45%] text-black font-normal text-[clamp(8px,1.6vw,16px)] truncate">
                        Somalia
                    </div>
                    <div className="absolute top-[81.3%] left-[59.2%] w-[33%] text-black font-normal text-[clamp(8px,1.6vw,16px)] truncate">
                        {data?.employee?.address || "Mogadishu"}
                    </div>
                </div>

                {/* Footer Section */}
                <div className="mt-12 text-center space-y-6">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-white shadow-lg rounded-full border border-green-100 transform hover:scale-105 transition-all duration-300">
                        <div className="bg-green-500 rounded-full p-1">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-gray-700 font-bold text-sm tracking-wide">
                            Authenticated Verification
                        </span>
                    </div>

                    <div className="pt-8 border-t border-gray-200/50">
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">
                            © {new Date().getFullYear()} Somali Petroleum Authority • SPA-CMS System
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
