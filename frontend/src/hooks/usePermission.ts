"use client";

import { useEffect, useState } from "react";

interface SubMenuPermission {
    subMenuId: number;
    canView: boolean;
    canAdd: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canAssign: boolean;
    canApprove: boolean;
    canGenerate: boolean;
    canLost: boolean;
    subMenu: {
        title: string;
        url: string;
    }
}

interface MenuPermission {
    menuId: number;
    canView: boolean;
    canAdd: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canAssign: boolean;
    canApprove: boolean;
    canGenerate: boolean;
    canLost: boolean;
    menu: {
        title: string;
        url?: string;
    };
    subMenus: SubMenuPermission[];
}

interface UserPermissionData {
    id: number;
    roleId: number;
    menus: MenuPermission[];
}

export const usePermission = () => {
    const [permissions, setPermissions] = useState<UserPermissionData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPermissions = async () => {
            // 1. Try to load from localStorage first for immediate render
            const userData = localStorage.getItem("user");
            if (userData) {
                try {
                    const parsed = JSON.parse(userData);
                    if (parsed.permissions) {
                        setPermissions(parsed.permissions);
                    }
                } catch (e) {
                    console.error("Failed to parse user permissions", e);
                }
            }

            // 2. Fetch fresh permissions from backend
            try {
                // Only if we have a token (usually stored in localStorage or handled by axios interceptor)
                // Assuming axios is configured to send token.
                const { getCurrentUser } = await import("@/api/authApi");
                const user = await getCurrentUser();

                if (user && user.permissions) {
                    setPermissions(user.permissions);

                    // Update localStorage to keep it fresh
                    if (userData) {
                        const parsed = JSON.parse(userData);
                        parsed.permissions = user.permissions;
                        parsed.role = user.role; // Also update role name if changed
                        localStorage.setItem("user", JSON.stringify(parsed));
                    }
                }
            } catch (error) {
                console.error("Failed to refresh permissions:", error);
                // Optionally handle 401 by logging out or redirecting?
                // For now, we just rely on stored permissions if fetch fails.
            } finally {
                setLoading(false);
            }
        };

        fetchPermissions();
    }, []);

    /**
     * Check if user has specific permission for a module
     * @param moduleName - The name of the menu or submenu (e.g., "Departments", "Users")
     * @param action - The action to check: 'view', 'add', 'edit', 'delete', 'assign', 'approve', 'generate'
     * @param isSubMenu - Whether the module is a submenu (true) or a main menu (false) (default: false)
     */
    const hasPermission = (moduleName: string, action: 'view' | 'add' | 'edit' | 'delete' | 'assign' | 'approve' | 'generate' | 'lost', isSubMenu: boolean = false): boolean => {
        if (!permissions) return false;

        // Normalize: lowercase + strip hyphens, underscores, and spaces so
        // "ID Template", "ID-Template", "ID_Template" all match the same DB entry
        const normalize = (s: string) => s.toLowerCase().replace(/[-_\s]/g, "");
        const targetName = normalize(moduleName);

        // 1. Check Main Menus
        const menu = permissions.menus.find(m => normalize(m.menu?.title ?? "") === targetName);

        if (menu && !isSubMenu) {
            switch (action) {
                case 'view': return menu.canView;
                case 'add': return menu.canAdd;
                case 'edit': return menu.canEdit;
                case 'delete': return menu.canDelete;
                case 'assign': return menu.canAssign;
                case 'approve': return menu.canApprove;
                case 'generate': return menu.canGenerate;
                case 'lost': return menu.canLost;
            }
        }

        // 2. Check Sub Menus (if not found as main menu or explicitly searching for submenu)
        for (const m of permissions.menus) {
            const sub = m.subMenus.find(s => normalize(s.subMenu?.title ?? "") === targetName);
            if (sub) {
                switch (action) {
                    case 'view': return sub.canView;
                    case 'add': return sub.canAdd;
                    case 'edit': return sub.canEdit;
                    case 'delete': return sub.canDelete;
                    case 'assign': return sub.canAssign;
                    case 'approve': return sub.canApprove;
                    case 'generate': return sub.canGenerate;
                    case 'lost': return sub.canLost;
                }
            }
        }

        return false;
    };

    return { hasPermission, loading, permissions };
};
