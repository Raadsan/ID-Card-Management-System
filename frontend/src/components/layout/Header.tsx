"use client";

import { useState, useEffect } from "react";
import { Bell, Search, Menu, LogOut, User, Settings, ShieldCheck } from "lucide-react";
import { getMe } from "@/api/userApi";
import { getImageUrl } from "@/utils/url";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const data = await getMe();
            setUser(data);
        } catch (error) {
            console.error("Failed to fetch user in header:", error);
        }
    };

    const handleLogout = () => {
        setShowDropdown(false);
        localStorage.removeItem("token"); // Assuming token is stored in localStorage
        router.push("/login");
    };

    const getInitials = (name: string) => {
        if (!name) return "U";
        return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
    };

    const portalTitle = "Welcome " + user?.fullName + " !";

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 lg:hidden"
                    onClick={onMenuClick}
                >
                    <span className="sr-only">Open sidebar</span>
                    <Menu className="h-6 w-6" />
                </button>
                <div className="hidden md:block">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-[#1B1555] to-[#16BCF8] bg-clip-text text-transparent">
                        {portalTitle}
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-4">


                <div className="relative">
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="group flex items-center gap-3 p-1 rounded-xl hover:bg-gray-50 transition-all"
                    >
                        <div className="h-8 w-8 overflow-hidden rounded-full ring-2 ring-white shadow-sm border border-gray-100 relative">
                            {user?.photo ? (
                                <img
                                    src={getImageUrl(user.photo) || "/placeholder-user.png"}
                                    className="h-full w-full object-cover"
                                    alt="Avatar"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/placeholder-user.png";
                                    }}
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1B1555] to-[#2E248C] text-xs font-black text-white">
                                    {getInitials(user?.fullName || "User")}
                                </div>
                            )}
                        </div>
                        <div className="hidden lg:flex flex-col items-start leading-none mr-2">
                            <span className="text-xs font-black text-[#1B1555] uppercase tracking-tight">{user?.fullName || "Loading..."}</span>
                            <span className="text-[9px] font-bold text-[#16BCF8] uppercase mt-0.5 tracking-widest">{user?.role?.name || "Member"}</span>
                        </div>
                    </button>

                    {showDropdown && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowDropdown(false)}
                            />
                            <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-gray-100 bg-white shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="p-5 bg-gradient-to-br from-gray-50 to-white border-b border-gray-50">
                                    <p className="text-sm font-black text-[#1B1555] truncate">{user?.fullName}</p>
                                    <p className="text-[10px] font-bold text-gray-400 truncate mt-0.5">{user?.email}</p>
                                </div>
                                <div className="py-2">
                                    <Link
                                        href="/system/profile"
                                        onClick={() => setShowDropdown(false)}
                                        className="flex items-center gap-3 px-5 py-3 text-xs font-bold text-gray-600 hover:bg-[#16BCF8]/5 hover:text-[#16BCF8] transition-colors"
                                    >
                                        <ShieldCheck size={16} />
                                        Security Credentials
                                    </Link>
                                    <button
                                        className="w-full flex items-center gap-3 px-5 py-3 text-xs font-bold text-gray-600 hover:bg-[#16BCF8]/5 hover:text-[#16BCF8] transition-colors"
                                    >
                                        <Settings size={16} />
                                        System Settings
                                    </button>
                                </div>
                                <div className="p-2 border-t border-gray-50">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black text-rose-500 hover:bg-rose-50 transition-colors"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Sign Out Account
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

