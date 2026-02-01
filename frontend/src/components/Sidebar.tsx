"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    FileText,
    Users,
    Settings,
    BarChart3,
    LogOut,
    X,
    ChevronDown,
    ChevronRight,
    Folder,
    Scale,
    Briefcase,
    Gavel,
    UserCheck,
    FileStack,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getMenus } from "@/api/menuApi";

interface SubMenu {
    id: number;
    title: string;
    url: string;
}

interface MenuItem {
    id: number;
    title: string;
    url?: string;
    icon?: string;
    isCollapsible: boolean;
    subMenus: SubMenu[];
}

const iconMap: Record<string, any> = {
    dashboard: LayoutDashboard,
    "layout-dashboard": LayoutDashboard,
    briefcase: Briefcase,
    "file-text": FileText,
    filetext: FileText,
    scale: Scale,
    gavel: Gavel,
    "user-check": UserCheck,
    usercheck: UserCheck,
    "file-stack": FileStack,
    filestack: FileStack,
    users: Users,
    settings: Settings,
    "bar-chart": BarChart3,
    barchart: BarChart3,
    folder: Folder,
};

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
    const pathname = usePathname();
    const [expandedMenuId, setExpandedMenuId] = useState<number | null>(null);
    const [menus, setMenus] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch menus from API
    useEffect(() => {
        const fetchMenus = async () => {
            try {
                setLoading(true);
                const data = await getMenus();
                setMenus(data);
            } catch (error) {
                console.error("Failed to fetch menus:", error);
                setMenus([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMenus();
    }, []);

    // Auto-expand the active menu section
    useEffect(() => {
        if (menus.length > 0 && pathname) {
            const activeMenu = menus.find((menu: MenuItem) =>
                menu.isCollapsible && menu.subMenus.some((sub: SubMenu) => pathname === sub.url)
            );
            if (activeMenu) {
                setExpandedMenuId(activeMenu.id);
            }
        }
    }, [pathname, menus]);

    const toggleMenu = (menuId: number) => {
        setExpandedMenuId(prev => (prev === menuId ? null : menuId));
    };

    const getIcon = (iconName?: string) => {
        if (!iconName) return Folder;
        const normalizedName = iconName.toLowerCase().replace(/\s+/g, "-");
        return iconMap[normalizedName] || iconMap[iconName.toLowerCase()] || Folder;
    };

    const ensureAbsoluteUrl = (url?: string) => {
        if (!url) return "#";
        return url.startsWith("/") ? url : `/${url}`;
    };

    const isMenuActive = (menu: MenuItem): boolean => {
        const absoluteUrl = ensureAbsoluteUrl(menu.url);
        if (!menu.isCollapsible && menu.url) {
            return pathname === absoluteUrl;
        }
        return menu.subMenus.some(sub => pathname === ensureAbsoluteUrl(sub.url));
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 sm:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 z-50 h-screen w-64 bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-in-out sm:translate-x-0 border-r border-white/5 shadow-2xl ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex h-full flex-col px-3 pt-2 pb-4">
                    {/* Header / Logo */}
                    <div className="mb-2 flex items-center justify-between pl-2.5 pr-2 border-b border-white/10 pb-4">
                        <div className="flex items-center gap-3 w-full">
                            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center border border-white/10 shadow-sm">
                                <span className="text-secondary font-black text-sm">ID</span>
                            </div>
                            <h1 className="text-[10px] font-black text-white leading-tight tracking-[0.2em] uppercase whitespace-nowrap opacity-90">
                                ID-MANAGEMENT-SYSTEM
                            </h1>
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-lg p-1 text-white/70 hover:bg-white/10 sm:hidden ml-2"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <ul className="flex-1 space-y-1.5 font-medium py-5 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {loading ? (
                            <li className="flex items-center justify-center py-8">
                                <div className="text-white/50 text-sm">Loading menus...</div>
                            </li>
                        ) : menus.length === 0 ? (
                            <li className="flex items-center justify-center py-8">
                                <div className="text-white/50 text-sm">No menus available</div>
                            </li>
                        ) : (
                            menus.map((menu: MenuItem, index: number) => {
                                const Icon = getIcon(menu.icon || menu.title);
                                const isActive = isMenuActive(menu);
                                const isExpanded = expandedMenuId === menu.id;

                                if (!menu.isCollapsible && menu.url) {
                                    return (
                                        <li key={`${menu.id}-${index}`}>
                                            <Link
                                                href={ensureAbsoluteUrl(menu.url)}
                                                onClick={onClose}
                                                className={`flex items-center rounded-lg px-4 py-3 transition-colors hover:bg-white/10 ${isActive
                                                    ? "bg-secondary text-primary shadow-lg shadow-secondary/10 font-bold"
                                                    : "text-white/80 hover:text-white"
                                                    }`}
                                            >
                                                <Icon className="h-5 w-5 flex-shrink-0" />
                                                <span className="ml-3 text-sm font-medium tracking-wide">
                                                    {menu.title}
                                                </span>
                                            </Link>
                                        </li>
                                    );
                                }

                                return (
                                    <li key={`${menu.id}-${index}`}>
                                        <button
                                            onClick={() => toggleMenu(menu.id)}
                                            className={`flex w-full items-center justify-between rounded-lg px-4 py-3 transition-colors hover:bg-white/10 ${isActive
                                                ? "bg-secondary text-primary shadow-lg shadow-secondary/10 font-bold"
                                                : "text-white/80 hover:text-white"
                                                }`}
                                        >
                                            <div className="flex items-center">
                                                <Icon className="h-5 w-5 flex-shrink-0" />
                                                <span className="ml-3 text-sm font-medium tracking-wide">
                                                    {menu.title}
                                                </span>
                                            </div>
                                            {isExpanded ? (
                                                <ChevronDown className="h-4 w-4" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" />
                                            )}
                                        </button>

                                        {isExpanded && menu.subMenus.length > 0 && (
                                            <ul className="mt-1 ml-4 space-y-1">
                                                {menu.subMenus.map((submenu: SubMenu, subIndex: number) => {
                                                    const subUrl = ensureAbsoluteUrl(submenu.url);
                                                    const isSubActive = pathname === subUrl;
                                                    return (
                                                        <li key={`${submenu.id}-${subIndex}`}>
                                                            <Link
                                                                href={subUrl}
                                                                onClick={onClose}
                                                                className={`flex items-center rounded-lg px-4 py-2 pl-8 text-sm transition-colors hover:bg-white/10 ${isSubActive
                                                                    ? "bg-white/20 text-white font-medium"
                                                                    : "text-white/70 hover:text-white"
                                                                    }`}
                                                            >
                                                                {submenu.title}
                                                            </Link>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        )}
                                    </li>
                                );
                            })
                        )}
                    </ul>

                    {/* Logout Button */}
                    <div className="mt-auto border-t border-white/10 pt-4">
                        <button
                            className="flex w-full items-center rounded-lg px-4 py-3 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                        >
                            <LogOut className="h-5 w-5 flex-shrink-0" />
                            <span className="ml-3 text-sm font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
