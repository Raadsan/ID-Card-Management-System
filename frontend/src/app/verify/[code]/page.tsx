"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, XCircle, User, Briefcase, Building2, Calendar, ShieldCheck, Loader2 } from "lucide-react";
import { verifyQrCode } from "@/api/generateIdApi";

const SERVER_URL = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5000';

export default function VerificationPage() {
    const params = useParams();
    const code = params.code as string;
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchVerification = async () => {
            try {
                setLoading(true);
                const result = await verifyQrCode(code);
                setData(result.data);
                setError(null);
            } catch (err: any) {
                console.error("Verification failed:", err);
                setError(err.response?.data?.message || "Invalid or Expired ID Card");
            } finally {
                setLoading(false);
            }
        };

        if (code) {
            fetchVerification();
        }
    }, [code]);

    const getImageUrl = (path: string | null) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${SERVER_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <Loader2 className="h-12 w-12 text-[#16BCF8] animate-spin mb-4" />
                <p className="text-gray-600 font-medium animate-pulse">Verifying Security Credentials...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-red-100">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle className="h-12 w-12 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 mb-2">Verification Failed</h1>
                    <p className="text-gray-500 mb-8 leading-relaxed">{error}</p>
                    <div className="p-4 bg-gray-50 rounded-2xl text-[10px] font-mono text-gray-400 uppercase tracking-widest leading-loose">
                        Ref: {code}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header / Banner */}
            <div className="bg-[#1B1555] text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#16BCF8]/10 rounded-full blur-3xl -ml-24 -mb-24"></div>

                <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center relative z-10">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl mb-6 backdrop-blur-md">
                        <ShieldCheck className="h-10 w-10 text-[#16BCF8]" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight text-center uppercase mb-4">
                        ID Verification
                    </h1>
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#16BCF8] rounded-full text-[#1B1555] font-bold text-xs uppercase tracking-widest shadow-lg shadow-[#16BCF8]/20">
                        <CheckCircle2 className="h-4 w-4" /> Authenticated System
                    </div>
                </div>
            </div>

            {/* Verification Content */}
            <div className="max-w-4xl mx-auto px-4 -mt-10 mb-20 relative z-20">
                <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-white shadow-blue-900/5">

                    {/* Top Status Bar */}
                    <div className="bg-green-50 px-8 py-4 border-b border-green-100 flex items-center justify-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <p className="text-green-700 font-bold text-sm uppercase tracking-widest">Officially Verified ID</p>
                    </div>

                    <div className="p-8 md:p-12">
                        <div className="flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left">

                            {/* Photo Area */}
                            <div className="relative group">
                                <div className="w-48 h-48 md:w-56 md:h-56 rounded-[32px] overflow-hidden border-8 border-gray-50 shadow-xl group-hover:scale-[1.02] transition-transform duration-500">
                                    <img
                                        src={getImageUrl(data.employee?.user?.photo) || '/placeholder-user.png'}
                                        alt="Employee Photo"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute -bottom-4 right-2 w-12 h-12 bg-[#16BCF8] rounded-2xl flex items-center justify-center shadow-lg border-4 border-white group-hover:rotate-12 transition-transform duration-300">
                                    <ShieldCheck className="h-6 w-6 text-white" />
                                </div>
                            </div>

                            {/* Info Area */}
                            <div className="flex-1 space-y-8 py-2">
                                <div>
                                    <p className="text-[10px] font-black text-[#16BCF8] uppercase tracking-[0.3em] mb-2">Identification Name</p>
                                    <h2 className="text-3xl md:text-5xl font-black text-[#1B1555] leading-tight">
                                        {data.employee?.user?.fullName}
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-[#1B1555]">
                                            <Briefcase className="h-6 w-6 text-[#16BCF8]" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Job Designation</p>
                                            <p className="text-lg font-bold text-gray-900">{data.employee?.title || 'Staff member'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-[#1B1555]">
                                            <Building2 className="h-6 w-6 text-[#16BCF8]" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Department</p>
                                            <p className="text-lg font-bold text-gray-900">{data.employee?.department?.departmentName || 'General Operations'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-[#1B1555]">
                                            <Calendar className="h-6 w-6 text-[#16BCF8]" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Issue Date</p>
                                            <p className="text-lg font-bold text-gray-900">{new Date(data.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-[#1B1555]">
                                            <User className="h-6 w-6 text-[#16BCF8]" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Employee ID</p>
                                            <p className="text-lg font-bold text-gray-900 font-mono">#{data.employee?.id.toString().padStart(4, '0')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Verification Code */}
                        <div className="mt-16 pt-8 border-t-2 border-dashed border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="text-center md:text-left">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 underline decoration-[#16BCF8] decoration-2 underline-offset-4">Digital Identity Authentication</p>
                                <p className="text-xs font-mono text-gray-500 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                    UUID Verification Checksum: {code}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 px-6 py-3 bg-[#1B1555] rounded-2xl shadow-xl shadow-blue-900/20 transform hover:-translate-y-1 transition-transform">
                                <ShieldCheck className="h-5 w-5 text-[#16BCF8]" />
                                <span className="text-white text-xs font-black uppercase tracking-widest">System Authenticated</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10 text-center">
                    <p className="text-gray-400 text-xs font-medium">© {new Date().getFullYear()} ID Management System. All security protocols enforced.</p>
                </div>
            </div>
        </div>
    );
}
