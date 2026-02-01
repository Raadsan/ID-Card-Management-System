"use client";

import { useState } from "react";
import { Bell, Search, Menu, LogOut, User } from "lucide-react";

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
    const [showDropdown, setShowDropdown] = useState(false);

    // Static user data for design purposes
    const user = {
        fullname: "Dahir Ahmed",
        email: "dahir@example.com",
        initials: "DA"
    };

    const portalTitle = "Admin Dashboard";

    const handleLogout = () => {
        setShowDropdown(false);
        // Future: Add logout logic here
        console.log("Logout clicked");
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 sm:hidden"
                    onClick={onMenuClick}
                >
                    <span className="sr-only">Open sidebar</span>
                    <Menu className="h-6 w-6" />
                </button>
                <div className="hidden md:block">
                    <h1 className="text-xl font-bold text-primary">{portalTitle}</h1>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative hidden sm:block">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="h-10 w-64 rounded-full border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm text-gray-900 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                    />
                </div>

                <button className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100">
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500"></span>
                </button>

                <div className="relative">
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="h-8 w-8 overflow-hidden rounded-full bg-gray-200 hover:ring-2 hover:ring-secondary transition-all"
                    >
                        <div className="flex h-full w-full items-center justify-center bg-primary text-xs font-medium text-white">
                            {user.initials}
                        </div>
                    </button>

                    {showDropdown && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowDropdown(false)}
                            />
                            <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg z-20">
                                <div className="p-3 border-b border-gray-100">
                                    <p className="text-sm font-semibold text-gray-900">{user.fullname}</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
