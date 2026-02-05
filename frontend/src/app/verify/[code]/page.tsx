"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, XCircle, ShieldCheck, Loader2, MapPin, Calendar, User, Fingerprint } from "lucide-react";
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
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        // If it's just a filename (no slashes), it's in the uploads folder
        if (!cleanPath.includes('/') && !cleanPath.includes('\\')) {
            return `${SERVER_URL}/uploads/${cleanPath}`;
        }
        return `${SERVER_URL}/${cleanPath}`;
    };

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
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                <div className="bg-white p-10 rounded-[40px] shadow-2xl max-w-md w-full text-center border border-red-100 ring-8 ring-red-50">
                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <XCircle className="h-12 w-12 text-red-500" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Access Denied</h1>
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
                                National Identity Authority
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Document Body */}
            <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-20">
                <div className="bg-white rounded-[10px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-200 relative">

                    {/* Security Watermark Background */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] rotate-12">
                        <Fingerprint className="w-[600px] h-[600px] text-gray-900" />
                    </div>

                    <div className="p-1 md:p-3 relative z-10">
                        {/* Inner Document Border */}
                        <div className="border border-gray-100 p-6 md:p-10 min-h-[900px] flex flex-col">

                            {/* Document Header Text - SPA Branding */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-8 border-b border-gray-100">
                                {/* Somali Header */}
                                <div className="text-left space-y-0.5">
                                    <h3 className="text-[11px] font-black text-gray-900 tracking-tight uppercase leading-tight">
                                        JAMHUURIYADDA
                                    </h3>
                                    <h3 className="text-[11px] font-black text-gray-900 tracking-tight uppercase leading-tight">
                                        FEDERAALKA SOOMAALIYA
                                    </h3>
                                    <h3 className="text-[10px] font-bold text-[#1e4e8c] tracking-tight uppercase">
                                        HAY'ADDA BATROOLKA SOOMAALIYEED
                                    </h3>
                                </div>

                                {/* Center Crest Area */}
                                <div className="flex flex-col items-center">
                                    <div className="w-24 h-24 bg-white shadow-sm border border-gray-100 rounded-lg flex items-center justify-center p-2 relative">

                                        <div className="w-full h-full flex items-center justify-center overflow-hidden">
                                            <img
                                                src="/jamhuriyada.png"
                                                alt="SPA Crest"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-4 text-center">
                                        <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest leading-none">FEDERAL REPUBLIC OF SOMALIA</p>
                                        <p className="text-[10px] font-black text-[#1e4e8c] uppercase tracking-widest mt-1">SOMALI PETROLEUM AUTHORITY</p>
                                    </div>
                                </div>

                                {/* Arabic Header */}
                                <div className="text-right space-y-0.5" dir="rtl">
                                    <h3 className="text-sm font-black text-gray-900 tracking-tight leading-tight">
                                        جمهورية الصومال الفيدرالية
                                    </h3>
                                    <h3 className="text-xs font-bold text-[#1e4e8c] tracking-tight">
                                        هيئة البترول الصومالية
                                    </h3>
                                </div>
                            </div>

                            {/* Main Document Title */}
                            <div className="bg-[#1e4e8c] text-white py-2.5 px-6 flex justify-between items-center mb-12 overflow-hidden shadow-md rounded-sm">
                                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">SHAHAADADA AQOONSIGA</span>
                                <span className="h-4 w-[1px] bg-white/30 mx-2"></span>
                                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-center flex-1">CERTIFICATE OF IDENTITY</span>
                                <span className="h-4 w-[1px] bg-white/30 mx-2"></span>
                                <span className="text-[10px] md:text-xs font-black tracking-widest text-right">شهادة الهوية</span>
                            </div>

                            {/* Upper Section: Photo & ID Details */}
                            <div className="flex flex-col md:flex-row gap-12 mb-12">
                                {/* Photo Container */}
                                <div className="flex flex-col items-center">
                                    <div className="w-48 h-64 border-[8px] border-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)] overflow-hidden relative ring-1 ring-gray-200/50">
                                        <img
                                            src={getImageUrl(data.employee?.user?.photo) || '/placeholder-user.png'}
                                            alt="Employee Identity"
                                            className="w-full h-full object-cover grayscale-[0.1]"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/placeholder-user.png';
                                            }}
                                        />
                                        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/20 to-transparent"></div>
                                    </div>
                                </div>

                                {/* Summary Grid */}
                                <div className="flex-1 space-y-1">
                                    {[
                                        {
                                            label: "TRACKING NUMBER / رقم التتبع / LAMBARKA RAAD RAACA",
                                            value: code?.slice(0, 12).toUpperCase(),
                                            isBold: false
                                        },
                                        {
                                            label: "IDENTITY NUMBER / رقم الهوية / LAMBARKA AQOONSIGA",
                                            value: `ID-${data.employee?.id?.toString().padStart(6, '0')}`,
                                            isBold: true
                                        },
                                        {
                                            label: "ISSUE DATE / تاريخ الإصدار / TAARIIKHDA LA BIXIYAY",
                                            value: formatDate(data.issueDate || data.createdAt),
                                            isBold: false
                                        }
                                    ].map((item, i) => (
                                        <div key={i} className="flex flex-col md:flex-row border-b border-gray-100 last:border-0 py-3 bg-gray-50/30 px-4 rounded-lg">
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-normal">
                                                    {item.label}
                                                </p>
                                            </div>
                                            <div className="md:w-1/2 md:text-right mt-1 md:mt-0">
                                                <p className={`text-base tracking-widest text-[#1e4e8c] ${item.isBold ? 'font-black' : 'font-bold'}`}>
                                                    {item.value}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Main Information Section */}
                            <div className="space-y-4">
                                {/* Full Name Section */}
                                <div className="bg-[#edf2f7] p-1 rounded-sm shadow-sm">
                                    <div className="px-4 py-2 border-l-[5px] border-[#1e4e8c]">
                                        <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1.5">
                                            FULL NAME / الاسم الكامل / MAGACA OO AFARAH AMA SEDDAXAH
                                        </p>
                                        <p className="text-2xl font-black text-gray-900 tracking-wider uppercase">
                                            {data.employee?.user?.fullName}
                                        </p>
                                    </div>
                                </div>

                                {/* Department & Title Sections (Two Columns) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Department Column */}
                                    <div className="bg-[#edf2f7] p-1 rounded-sm shadow-sm">
                                        <div className="px-4 py-3 border-l-[5px] border-[#1e4e8c]">
                                            <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1.5">
                                                DEPARTMENT / القسم / WAAXDA
                                            </p>
                                            <p className="text-lg font-black text-gray-900 tracking-wider uppercase">
                                                {data.employee?.department?.departmentName || 'GENERAL STAFF'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Title Column */}
                                    <div className="bg-[#edf2f7] p-1 rounded-sm shadow-sm">
                                        <div className="px-4 py-3 border-l-[5px] border-[#1e4e8c]">
                                            <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1.5">
                                                JOB TITLE / المسمى الوظيفي / XILKA
                                            </p>
                                            <p className="text-lg font-black text-gray-900 tracking-wider uppercase">
                                                {data.employee?.title || 'STAFF MEMBER'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Other Personal Info Grid */}
                                <div className="bg-[#edf2f7] p-1 rounded-sm">
                                    <div className="px-4 py-2 border-l-[5px] border-[#1e4e8c]">
                                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-3">
                                            OTHER PERSONAL INFORMATION / معلومات شخصية أخرى / MACLUUMAADKA KALE EE QOFKA
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div>
                                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">GENDER / الجنس / LAB/DED</p>
                                                <p className="text-sm font-black text-gray-800 uppercase tracking-widest">
                                                    {data.employee?.user?.gender || "MALE"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">DATE OF BIRTH / تاريخ الميلاد / TAARIIKHDA</p>
                                                <p className="text-sm font-black text-gray-800 uppercase tracking-widest">
                                                    {formatDate(data.employee?.dob)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">COUNTRY / بلد / DALKA</p>
                                                <p className="text-sm font-black text-gray-800 uppercase tracking-widest">SOMALIA</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Address Section */}
                                <div className="bg-[#edf2f7] p-1 rounded-sm shadow-sm">
                                    <div className="px-4 py-2 border-l-[5px] border-[#1e4e8c]">
                                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1.5">
                                            CURRENT ADDRESS / العنوان الحالي / DEGAANKA
                                        </p>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                <div>
                                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">COUNTRY</p>
                                                    <p className="text-sm font-black text-gray-800">SOMALIA</p>
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">LOCATION DETAIL</p>
                                                    <p className="text-sm font-black text-gray-800 uppercase leading-none truncate">
                                                        {data.employee?.address || "Region / District Unknown"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Document Footer */}
                            <div className="mt-auto pt-16">
                                <div className="flex flex-col md:flex-row justify-between items-end gap-10">
                                    <div className="flex-1 space-y-4">
                                        <div className="h-12 w-48 bg-[url('https://repo.sourcelink.com/static/signature-placeholder.png')] bg-contain bg-no-repeat opacity-60"></div>
                                        <div className="text-[8px] font-medium text-gray-400 uppercase leading-relaxed max-w-sm italic">
                                            Any unauthorized use of this identification document the bearer must immediately report to NIRA.
                                            This electronic verification session is valid for 10 minutes.
                                        </div>
                                    </div>

                                    {/* Security QR Code */}
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="p-3 bg-white border-2 border-gray-100 rounded-xl shadow-md">
                                            {/* Static placeholder for aesthetics, actual verification is the URL itself */}
                                            <div className="w-24 h-24 bg-green-50 flex items-center justify-center rounded-lg">
                                                <CheckCircle2 className="w-14 h-14 text-[#166534] drop-shadow-sm" />
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-black text-[#166534] uppercase tracking-[0.2em]">
                                            Official Verification Node
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Footer Seal */}
                    <div className="bg-[#1e4e8c] h-1.5 w-full"></div>
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
