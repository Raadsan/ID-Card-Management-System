"use client";

import { useState, useEffect } from "react";
import {
    getRolePermissions,
    createRolePermission,
    updateRolePermission,
    deleteRolePermission,
} from "@/api/role_permisionApi";
import { getRoles } from "@/api/roleApi";
import { getMenus } from "@/api/menuApi";
import {
    Trash2,
    Edit,
    Plus,
    Save,
    Shield,
    Lock,
    Check,
    X,
    Layout,
    Eye,
    MoreHorizontal,
    Users,
    ShieldAlert,
    ChevronDown,
    Loader2
} from "lucide-react";
import Modal from "@/components/layout/Modal";
import DeleteConfirmModal from "@/components/layout/ConfirmDeleteModel";
import MessageBox, { MessageBoxType } from "@/components/MessageBox";
import { usePermission } from "@/hooks/usePermission";

// Interfaces
interface SubMenu {
    id: number;
    title: string;
    url: string;
}

interface Menu {
    id: number;
    title: string;
    icon?: string;
    url?: string;
    isCollapsible: boolean;
    subMenus: SubMenu[];
}

interface Role {
    id: number;
    name: string;
    description: string;
}

interface RoleMenuAccess {
    id?: number;
    menuId: number;
    canView: boolean;
    canAdd: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canAssign: boolean;
    canApprove: boolean;
    canGenerate: boolean;
    menu: {
        id: number;
        title: string;
    };
    subMenus: {
        id: number;
        subMenuId: number;
        canView: boolean;
        canAdd: boolean;
        canEdit: boolean;
        canDelete: boolean;
        canAssign: boolean;
        canApprove: boolean;
        canGenerate: boolean;
        subMenu: {
            id: number;
            title: string;
        }
    }[];
}

interface RolePermission {
    id: number;
    roleId: number;
    role: Role;
    menus: RoleMenuAccess[];
}

export default function RolePermissionsPage() {
    const [permissions, setPermissions] = useState<RolePermission[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [menus, setMenus] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [viewingPerm, setViewingPerm] = useState<RolePermission | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [permissionToDelete, setPermissionToDelete] = useState<RolePermission | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { hasPermission } = usePermission();
    const canAdd = hasPermission("Role Permission", "add", true);
    const canEdit = hasPermission("Role Permission", "edit", true);
    const canDelete = hasPermission("Role Permission", "delete", true);
    const canAssign = hasPermission("Role Permission", "assign", true);

    // MessageBox State
    const [msgBox, setMsgBox] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: MessageBoxType;
        onConfirm?: () => void;
        loading?: boolean;
    }>({
        isOpen: false,
        title: "",
        message: "",
        type: "info",
    });

    const [selectedRoleId, setSelectedRoleId] = useState<number | "">("");
    const [selectedMenus, setSelectedMenus] = useState<{
        [menuId: number]: {
            enabled: boolean;
            canView: boolean;
            canAdd: boolean;
            canEdit: boolean;
            canDelete: boolean;
            canAssign: boolean;
            canApprove: boolean;
            canGenerate: boolean;
            subMenus: {
                [subMenuId: number]: {
                    enabled: boolean;
                    canView: boolean;
                    canAdd: boolean;
                    canEdit: boolean;
                    canDelete: boolean;
                    canAssign: boolean;
                    canApprove: boolean;
                    canGenerate: boolean;
                }
            };
        };
    }>({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [permData, roleData, menuData] = await Promise.all([
                getRolePermissions(),
                getRoles(),
                getMenus(),
            ]);

            setPermissions(Array.isArray(permData) ? permData : []);
            setRoles(Array.isArray(roleData) ? roleData : []);
            setMenus(Array.isArray(menuData) ? menuData : []);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (perm: RolePermission) => {
        setSelectedRoleId(perm.roleId);

        // 1. Initialize with ALL available menus and submenus (enabled: false)
        const menuMap: any = {};
        menus.forEach(menu => {
            const subMenuMap: any = {};
            menu.subMenus.forEach(submenu => {
                subMenuMap[submenu.id] = {
                    enabled: false,
                    canView: false,
                    canAdd: false,
                    canEdit: false,
                    canDelete: false,
                    canAssign: false,
                    canApprove: false,
                    canGenerate: false,
                };
            });
            menuMap[menu.id] = {
                enabled: false,
                canView: false,
                canAdd: false,
                canEdit: false,
                canDelete: false,
                canAssign: false,
                canApprove: false,
                canGenerate: false,
                subMenus: subMenuMap,
            };
        });

        // 2. Overlay existing permissions
        perm.menus.forEach((ma) => {
            if (menuMap[ma.menuId]) {
                menuMap[ma.menuId].enabled = true;
                menuMap[ma.menuId].canView = ma.canView;
                menuMap[ma.menuId].canAdd = ma.canAdd;
                menuMap[ma.menuId].canEdit = ma.canEdit;
                menuMap[ma.menuId].canDelete = ma.canDelete;
                menuMap[ma.menuId].canAssign = ma.canAssign;
                menuMap[ma.menuId].canApprove = ma.canApprove;
                menuMap[ma.menuId].canGenerate = ma.canGenerate;

                ma.subMenus.forEach((sm) => {
                    if (menuMap[ma.menuId].subMenus[sm.subMenuId]) {
                        menuMap[ma.menuId].subMenus[sm.subMenuId].enabled = true;
                        menuMap[ma.menuId].subMenus[sm.subMenuId].canView = sm.canView;
                        menuMap[ma.menuId].subMenus[sm.subMenuId].canAdd = sm.canAdd;
                        menuMap[ma.menuId].subMenus[sm.subMenuId].canEdit = sm.canEdit;
                        menuMap[ma.menuId].subMenus[sm.subMenuId].canDelete = sm.canDelete;
                        menuMap[ma.menuId].subMenus[sm.subMenuId].canAssign = sm.canAssign;
                        menuMap[ma.menuId].subMenus[sm.subMenuId].canApprove = sm.canApprove;
                        menuMap[ma.menuId].subMenus[sm.subMenuId].canGenerate = sm.canGenerate;
                    }
                });
            }
        });

        setSelectedMenus(menuMap);
        setShowModal(true);
    };

    const handleDelete = (perm: RolePermission) => {
        setPermissionToDelete(perm);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!permissionToDelete) return;
        try {
            setLoading(true);
            await deleteRolePermission(String(permissionToDelete.roleId));
            setMsgBox({
                isOpen: true,
                title: "Success",
                message: "Permissions have been successfully purged.",
                type: "success",
            });
            fetchData();
        } catch (error: any) {
            setMsgBox({
                isOpen: true,
                title: "Error",
                message: error.response?.data?.message || "Error deleting permissions",
                type: "error",
            });
        } finally {
            setLoading(false);
            setPermissionToDelete(null);
            setIsDeleteModalOpen(false);
        }
    };

    const toggleMenu = (menuId: number) => {
        setSelectedMenus((prev) => {
            const isEnabled = !prev[menuId]?.enabled;
            return {
                ...prev,
                [menuId]: {
                    enabled: isEnabled,
                    canView: isEnabled,
                    canAdd: false,
                    canEdit: false,
                    canDelete: false,
                    canAssign: false,
                    canApprove: false,
                    canGenerate: false,
                    subMenus: prev[menuId]?.subMenus || {},
                },
            };
        });
    };

    const toggleSubMenu = (menuId: number, subMenuId: number) => {
        setSelectedMenus((prev) => {
            const currentMenu = prev[menuId] || {
                enabled: true,
                canView: true,
                canAdd: false,
                canEdit: false,
                canDelete: false,
                canAssign: false,
                canApprove: false,
                canGenerate: false,
                subMenus: {}
            };

            const currentSub = currentMenu.subMenus[subMenuId];
            const isEnabled = !currentSub?.enabled;

            return {
                ...prev,
                [menuId]: {
                    ...currentMenu,
                    subMenus: {
                        ...currentMenu.subMenus,
                        [subMenuId]: {
                            enabled: isEnabled,
                            canView: isEnabled,
                            canAdd: false,
                            canEdit: false,
                            canDelete: false,
                            canAssign: false,
                            canApprove: false,
                            canGenerate: false,
                        }
                    }
                },
            };
        });
    };

    const selectAllSubMenus = (menuId: number) => {
        const menu = menus.find((m) => m.id === menuId);
        if (!menu) return;

        const isRolePerm = menu.title.toLowerCase() === "role permission";
        const isGenerateId = menu.title.toLowerCase() === "generate-id";

        const subMenuMap: any = {};
        menu.subMenus.forEach(sm => {
            const isSubRolePerm = sm.title.toLowerCase() === "role permission";
            const isSubGenerateId = sm.title.toLowerCase() === "generate-id";

            subMenuMap[sm.id] = {
                enabled: true,
                canView: true,
                canAdd: true,
                canEdit: true,
                canDelete: true,
                canAssign: isSubRolePerm,
                canApprove: isSubGenerateId,
                canGenerate: isSubGenerateId,
            };
        });

        setSelectedMenus((prev) => ({
            ...prev,
            [menuId]: {
                enabled: true,
                canView: true,
                canAdd: true,
                canEdit: true,
                canDelete: true,
                canAssign: isRolePerm,
                canApprove: isGenerateId,
                canGenerate: isGenerateId,
                subMenus: subMenuMap,
            },
        }));
    };

    const deselectAllSubMenus = (menuId: number) => {
        setSelectedMenus((prev) => ({
            ...prev,
            [menuId]: {
                ...(prev[menuId] || {
                    enabled: true,
                    canView: true,
                    canAdd: false,
                    canEdit: false,
                    canDelete: false
                }),
                subMenus: {},
            },
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedRoleId === "") return;

        try {
            setIsSubmitting(true);
            const menusAccess = Object.entries(selectedMenus)
                .filter(([_, data]) => data.enabled)
                .map(([menuId, data]) => ({
                    menuId: Number(menuId),
                    canView: data.canView,
                    canAdd: data.canAdd,
                    canEdit: data.canEdit,
                    canDelete: data.canDelete,
                    canAssign: data.canAssign,
                    canApprove: data.canApprove,
                    canGenerate: data.canGenerate,
                    subMenus: Object.entries(data.subMenus)
                        .filter(([_, subData]) => subData.enabled)
                        .map(([subMenuId, subData]) => ({
                            subMenuId: Number(subMenuId),
                            canView: subData.canView,
                            canAdd: subData.canAdd,
                            canEdit: subData.canEdit,
                            canDelete: subData.canDelete,
                            canAssign: subData.canAssign,
                            canApprove: subData.canApprove,
                            canGenerate: subData.canGenerate,
                        })),
                }));

            const exists = permissions.find(p => p.roleId === selectedRoleId);

            if (exists) {
                await updateRolePermission(String(selectedRoleId), { menusAccess });
            } else {
                await createRolePermission({ roleId: Number(selectedRoleId), menusAccess });
            }

            setShowModal(false);
            setSelectedRoleId("");
            setSelectedMenus({});
            setMsgBox({
                isOpen: true,
                title: "Success",
                message: "Authority mandate has been synchronized.",
                type: "success",
            });
            fetchData();
        } catch (error: any) {
            setMsgBox({
                isOpen: true,
                title: "Error",
                message: error.response?.data?.message || "Error saving permissions",
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Color helpers for roles based on design
    const getRoleColor = (roleName: string) => {
        const name = roleName.toLowerCase();
        if (name.includes('admin')) return 'bg-blue-600';
        if (name.includes('manager')) return 'bg-orange-500';
        if (name.includes('user')) return 'bg-green-500';
        return 'bg-purple-600';
    };

    return (
        <div className="p-8 space-y-10 min-h-screen bg-[#F8FAFC]">
            {/* Action Bar */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Role Permissions</h1>
                    <p className="text-sm text-gray-500">Manage security mandates and module access</p>
                </div>
                {canAssign && (
                    <button
                        onClick={() => {
                            setSelectedRoleId("");
                            setSelectedMenus({});
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 rounded-xl bg-[#1B1555] px-6 py-3 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all"
                    >
                        <Plus size={18} />
                        Assign Role-Permission
                    </button>
                )}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-white rounded-3xl animate-pulse shadow-sm border border-gray-100" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {permissions.map((perm) => (
                        <div
                            key={perm.id}
                            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col relative group"
                        >
                            {/* Card Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className={`h-14 w-14 rounded-2xl ${getRoleColor(perm.role.name)} flex items-center justify-center text-white shadow-lg`}>
                                        <Layout size={28} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 tracking-tight">{perm.role.name}</h3>
                                </div>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>

                            {/* Card Content - Assigned Menus */}
                            <div className="mb-8 overflow-hidden">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Assigned Modules</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {perm.menus.map((ma, idx) => (
                                        <div key={idx} className="px-2 py-1.5 bg-gray-50 border border-gray-100 rounded-lg flex flex-col gap-1 overflow-hidden" title={ma.menu?.title}>
                                            <div className="flex items-center justify-between gap-1 overflow-hidden">
                                                <span className="text-[9px] font-bold text-gray-700 uppercase tracking-tight truncate">{ma.menu?.title}</span>
                                                {ma.subMenus.length > 0 && (
                                                    <span className="h-3 w-3 shrink-0 rounded-full bg-blue-500 flex items-center justify-center text-[7px] font-black text-white">
                                                        {ma.subMenus.length}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-0.5 opacity-60">
                                                {ma.canView && <span className="text-[7px] font-black text-blue-500">V</span>}
                                                {ma.canAdd && <span className="text-[7px] font-black text-green-500">A</span>}
                                                {ma.canEdit && <span className="text-[7px] font-black text-orange-500">E</span>}
                                                {ma.canDelete && <span className="text-[7px] font-black text-rose-500">D</span>}
                                                {ma.canAssign && ma.menu?.title.toLowerCase() === "role permission" && <span className="text-[7px] font-black text-purple-500">S</span>}
                                                {ma.canApprove && ma.menu?.title.toLowerCase() === "generate-id" && <span className="text-[7px] font-black text-teal-500">P</span>}
                                                {ma.canGenerate && ma.menu?.title.toLowerCase() === "generate-id" && <span className="text-[7px] font-black text-indigo-500">G</span>}
                                            </div>
                                        </div>
                                    ))}
                                    {perm.menus.length === 0 && (
                                        <span className="text-[10px] text-gray-300 italic font-bold uppercase">No access privileges defined</span>
                                    )}
                                </div>
                            </div>
                            <div className="mt-auto pt-6 border-t border-gray-50 flex gap-2">
                                <button
                                    onClick={() => setViewingPerm(perm)}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-sm text-gray-600 hover:text-gray-900 font-bold transition-all text-sm"
                                >
                                    <Eye size={16} />
                                    View
                                </button>
                                <button
                                    onClick={() => handleEdit(perm)}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-sm text-blue-600 hover:bg-blue-50 font-bold transition-all text-sm"
                                >
                                    <Edit size={16} />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(perm)}
                                    className="flex items-center justify-center w-12 h-12 rounded-xl border border-gray-100 bg-gray-50 hover:bg-rose-50 text-gray-400 hover:text-rose-500 transition-all font-bold"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {permissions.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                            <ShieldAlert size={48} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-gray-400 font-medium">No permission mandates found in the registry.</p>
                        </div>
                    )}
                </div>
            )}

            {/* viewing Modal */}
            <Modal isOpen={!!viewingPerm} onClose={() => setViewingPerm(null)} title={viewingPerm ? `${viewingPerm.role.name} Permissions` : ""} maxWidth="max-w-xl">
                {viewingPerm && (
                    <div className="p-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        <div className="space-y-6">
                            {viewingPerm.menus.map((ma, idx) => (
                                <div key={idx} className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-gray-800 font-black uppercase text-xs tracking-widest">
                                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                                            {ma.menu?.title}
                                        </div>
                                        <div className="flex gap-1">
                                            {ma.canView && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded text-[8px] font-black" title="View">V</span>}
                                            {ma.canAdd && <span className="px-1.5 py-0.5 bg-green-100 text-green-600 rounded text-[8px] font-black" title="Add">A</span>}
                                            {ma.canEdit && <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded text-[8px] font-black" title="Edit">E</span>}
                                            {ma.canDelete && <span className="px-1.5 py-0.5 bg-rose-100 text-rose-600 rounded text-[8px] font-black" title="Delete">D</span>}
                                            {ma.canAssign && ma.menu?.title.toLowerCase() === "role permission" && <span className="px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded text-[8px] font-black" title="Assign">S</span>}
                                            {ma.canApprove && ma.menu?.title.toLowerCase() === "generate-id" && <span className="px-1.5 py-0.5 bg-teal-100 text-teal-600 rounded text-[8px] font-black" title="Approve">P</span>}
                                            {ma.canGenerate && ma.menu?.title.toLowerCase() === "generate-id" && <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded text-[8px] font-black" title="Generate">G</span>}
                                        </div>
                                    </div>
                                    <div className="pl-4 space-y-2">
                                        {ma.subMenus.length > 0 ? ma.subMenus.map((sm, sIdx) => (
                                            <div key={sIdx} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase">
                                                    {sm.subMenu?.title}
                                                </span>
                                                <div className="flex gap-1">
                                                    {sm.canView && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-400 rounded text-[7px] font-black" title="View">V</span>}
                                                    {sm.canAdd && <span className="px-1.5 py-0.5 bg-green-50 text-green-400 rounded text-[7px] font-black" title="Add">A</span>}
                                                    {sm.canEdit && <span className="px-1.5 py-0.5 bg-orange-50 text-orange-400 rounded text-[7px] font-black" title="Edit">E</span>}
                                                    {sm.canDelete && <span className="px-1.5 py-0.5 bg-rose-50 text-rose-400 rounded text-[7px] font-black" title="Delete">D</span>}
                                                    {sm.canAssign && sm.subMenu?.title.toLowerCase() === "role permission" && <span className="px-1.5 py-0.5 bg-purple-50 text-purple-400 rounded text-[7px] font-black" title="Assign">S</span>}
                                                    {sm.canApprove && sm.subMenu?.title.toLowerCase() === "generate-id" && <span className="px-1.5 py-0.5 bg-teal-50 text-teal-400 rounded text-[7px] font-black" title="Approve">P</span>}
                                                    {sm.canGenerate && sm.subMenu?.title.toLowerCase() === "generate-id" && <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-400 rounded text-[7px] font-black" title="Generate">G</span>}
                                                </div>
                                            </div>
                                        )) : (
                                            <span className="text-[10px] font-bold text-gray-300 italic uppercase">Main Access only</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {viewingPerm.menus.length === 0 && (
                                <p className="text-center py-10 text-gray-400 italic">Zero clearance assigned to this role.</p>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Assignment Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Assign Role-Permissions" maxWidth="max-w-2xl">
                <form onSubmit={handleSubmit} className="px-2">
                    <div className="space-y-10 py-6">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Select Role</label>
                            <select
                                value={selectedRoleId}
                                onChange={(e) => setSelectedRoleId(Number(e.target.value))}
                                className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-6 py-4 font-bold text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                                required
                            >
                                <option value="">Choose a role...</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>{role.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Module Access Matrix</label>
                            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                                {menus.map((menu) => (
                                    <div
                                        key={menu.id}
                                        className={`rounded-[1.75rem] p-6 border transition-all ${selectedMenus[menu.id]?.enabled
                                            ? 'bg-blue-50 border-blue-200 shadow-sm'
                                            : 'bg-white border-gray-100 hover:border-gray-200'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <label className="flex items-center gap-4 cursor-pointer flex-1">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedMenus[menu.id]?.enabled || false}
                                                    onChange={() => toggleMenu(menu.id)}
                                                    className="w-6 h-6 rounded-lg border-2 border-gray-300 text-blue-600 focus:ring-0 transition-all cursor-pointer"
                                                />
                                                <span className={`text-sm font-black uppercase tracking-widest ${selectedMenus[menu.id]?.enabled ? 'text-blue-900' : 'text-gray-400'}`}>
                                                    {menu.title}
                                                </span>
                                            </label>

                                            {selectedMenus[menu.id]?.enabled && menu.isCollapsible && (
                                                <div className="flex gap-4">
                                                    <button type="button" onClick={() => selectAllSubMenus(menu.id)} className="text-[9px] font-black uppercase text-blue-600 hover:underline">Select All</button>
                                                    <button type="button" onClick={() => deselectAllSubMenus(menu.id)} className="text-[9px] font-black uppercase text-gray-300 hover:text-rose-500">Reset</button>
                                                </div>
                                            )}
                                        </div>

                                        {selectedMenus[menu.id]?.enabled && !menu.isCollapsible && (
                                            <div className="ml-10 mt-4 flex items-center gap-6">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedMenus[menu.id]?.canView || false}
                                                        onChange={() => setSelectedMenus(prev => {
                                                            const newPrev = JSON.parse(JSON.stringify(prev));
                                                            const isChecked = !newPrev[menu.id].canView;
                                                            newPrev[menu.id].canView = isChecked;
                                                            if (!isChecked) {
                                                                newPrev[menu.id].canAdd = false;
                                                                newPrev[menu.id].canEdit = false;
                                                                newPrev[menu.id].canDelete = false;
                                                                newPrev[menu.id].canAssign = false;
                                                                newPrev[menu.id].canApprove = false;
                                                                newPrev[menu.id].canGenerate = false;
                                                            }
                                                            return newPrev;
                                                        })}
                                                        className="w-4 h-4 rounded border-2 border-gray-300 text-blue-500 focus:ring-0 transition-all cursor-pointer"
                                                    />
                                                    <span className="text-[10px] font-black text-gray-400 uppercase">View</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedMenus[menu.id]?.canAdd || false}
                                                        onChange={() => setSelectedMenus(prev => {
                                                            const newPrev = JSON.parse(JSON.stringify(prev));
                                                            const isChecked = !newPrev[menu.id].canAdd;
                                                            newPrev[menu.id].canAdd = isChecked;
                                                            if (isChecked) newPrev[menu.id].canView = true;
                                                            return newPrev;
                                                        })}
                                                        className="w-4 h-4 rounded border-2 border-gray-300 text-blue-500 focus:ring-0 transition-all cursor-pointer"
                                                    />
                                                    <span className="text-[10px] font-black text-gray-400 uppercase">Add</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedMenus[menu.id]?.canEdit || false}
                                                        onChange={() => setSelectedMenus(prev => {
                                                            const newPrev = JSON.parse(JSON.stringify(prev));
                                                            const isChecked = !newPrev[menu.id].canEdit;
                                                            newPrev[menu.id].canEdit = isChecked;
                                                            if (isChecked) newPrev[menu.id].canView = true;
                                                            return newPrev;
                                                        })}
                                                        className="w-4 h-4 rounded border-2 border-gray-300 text-blue-500 focus:ring-0 transition-all cursor-pointer"
                                                    />
                                                    <span className="text-[10px] font-black text-gray-400 uppercase">Edit</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedMenus[menu.id]?.canDelete || false}
                                                        onChange={() => setSelectedMenus(prev => {
                                                            const newPrev = JSON.parse(JSON.stringify(prev));
                                                            const isChecked = !newPrev[menu.id].canDelete;
                                                            newPrev[menu.id].canDelete = isChecked;
                                                            if (isChecked) newPrev[menu.id].canView = true;
                                                            return newPrev;
                                                        })}
                                                        className="w-4 h-4 rounded border-2 border-gray-300 text-blue-500 focus:ring-0 transition-all cursor-pointer"
                                                    />
                                                    <span className="text-[10px] font-black text-gray-400 uppercase">Delete</span>
                                                </label>
                                                {menu.title.toLowerCase() === "role permission" && (
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedMenus[menu.id]?.canAssign || false}
                                                            onChange={() => setSelectedMenus(prev => {
                                                                const newPrev = JSON.parse(JSON.stringify(prev));
                                                                const isChecked = !newPrev[menu.id].canAssign;
                                                                newPrev[menu.id].canAssign = isChecked;
                                                                if (isChecked) newPrev[menu.id].canView = true;
                                                                return newPrev;
                                                            })}
                                                            className="w-4 h-4 rounded border-2 border-gray-300 text-blue-500 focus:ring-0 transition-all cursor-pointer"
                                                        />
                                                        <span className="text-[10px] font-black text-gray-400 uppercase">Assign</span>
                                                    </label>
                                                )}
                                                {menu.title.toLowerCase() === "generate-id" && (
                                                    <>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedMenus[menu.id]?.canApprove || false}
                                                                onChange={() => setSelectedMenus(prev => {
                                                                    const newPrev = JSON.parse(JSON.stringify(prev));
                                                                    const isChecked = !newPrev[menu.id].canApprove;
                                                                    newPrev[menu.id].canApprove = isChecked;
                                                                    if (isChecked) newPrev[menu.id].canView = true;
                                                                    return newPrev;
                                                                })}
                                                                className="w-4 h-4 rounded border-2 border-gray-300 text-blue-500 focus:ring-0 transition-all cursor-pointer"
                                                            />
                                                            <span className="text-[10px] font-black text-gray-400 uppercase">Approve</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedMenus[menu.id]?.canGenerate || false}
                                                                onChange={() => setSelectedMenus(prev => {
                                                                    const newPrev = JSON.parse(JSON.stringify(prev));
                                                                    const isChecked = !newPrev[menu.id].canGenerate;
                                                                    newPrev[menu.id].canGenerate = isChecked;
                                                                    if (isChecked) newPrev[menu.id].canView = true;
                                                                    return newPrev;
                                                                })}
                                                                className="w-4 h-4 rounded border-2 border-gray-300 text-blue-500 focus:ring-0 transition-all cursor-pointer"
                                                            />
                                                            <span className="text-[10px] font-black text-gray-400 uppercase">Generate</span>
                                                        </label>
                                                    </>
                                                )}
                                            </div>
                                        )}

                                        {selectedMenus[menu.id]?.enabled && menu.subMenus && menu.subMenus.length > 0 && (
                                            <div className="ml-10 mt-6 pt-6 border-t border-blue-100 space-y-4">
                                                {menu.subMenus.map((submenu) => (
                                                    <div key={submenu.id} className="space-y-2">
                                                        <label
                                                            className={`flex items-center gap-4 cursor-pointer p-3 rounded-2xl border transition-all ${selectedMenus[menu.id]?.subMenus[submenu.id]?.enabled
                                                                ? 'bg-white border-blue-200 shadow-sm'
                                                                : 'bg-transparent border-transparent'
                                                                }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedMenus[menu.id]?.subMenus[submenu.id]?.enabled || false}
                                                                onChange={() => toggleSubMenu(menu.id, submenu.id)}
                                                                className="w-4 h-4 rounded border-2 border-gray-300 text-blue-500 focus:ring-0 transition-all cursor-pointer"
                                                            />
                                                            <span className={`text-[10px] font-bold uppercase ${selectedMenus[menu.id]?.subMenus[submenu.id]?.enabled ? 'text-blue-700' : 'text-gray-400'}`}>
                                                                {submenu.title}
                                                            </span>
                                                        </label>

                                                        {selectedMenus[menu.id]?.subMenus[submenu.id]?.enabled && (
                                                            <div className="ml-8 flex items-center gap-4">
                                                                <label className="flex items-center gap-2 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedMenus[menu.id]?.subMenus[submenu.id]?.canView || false}
                                                                        onChange={() => setSelectedMenus(prev => {
                                                                            const newPrev = JSON.parse(JSON.stringify(prev));
                                                                            const isChecked = !newPrev[menu.id].subMenus[submenu.id].canView;
                                                                            newPrev[menu.id].subMenus[submenu.id].canView = isChecked;
                                                                            if (!isChecked) {
                                                                                newPrev[menu.id].subMenus[submenu.id].canAdd = false;
                                                                                newPrev[menu.id].subMenus[submenu.id].canEdit = false;
                                                                                newPrev[menu.id].subMenus[submenu.id].canDelete = false;
                                                                                newPrev[menu.id].subMenus[submenu.id].canAssign = false;
                                                                                newPrev[menu.id].subMenus[submenu.id].canApprove = false;
                                                                                newPrev[menu.id].subMenus[submenu.id].canGenerate = false;
                                                                            }
                                                                            return newPrev;
                                                                        })}
                                                                        className="w-3 h-3 rounded border-2 border-gray-300 text-blue-500 focus:ring-0 transition-all cursor-pointer"
                                                                    />
                                                                    <span className="text-[8px] font-black text-gray-400 uppercase">View</span>
                                                                </label>
                                                                <label className="flex items-center gap-2 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedMenus[menu.id]?.subMenus[submenu.id]?.canAdd || false}
                                                                        onChange={() => setSelectedMenus(prev => {
                                                                            const newPrev = JSON.parse(JSON.stringify(prev));
                                                                            const isChecked = !newPrev[menu.id].subMenus[submenu.id].canAdd;
                                                                            newPrev[menu.id].subMenus[submenu.id].canAdd = isChecked;
                                                                            if (isChecked) newPrev[menu.id].subMenus[submenu.id].canView = true;
                                                                            return newPrev;
                                                                        })}
                                                                        className="w-3 h-3 rounded border-2 border-gray-300 text-blue-500 focus:ring-0 transition-all cursor-pointer"
                                                                    />
                                                                    <span className="text-[8px] font-black text-gray-400 uppercase">Add</span>
                                                                </label>
                                                                <label className="flex items-center gap-2 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedMenus[menu.id]?.subMenus[submenu.id]?.canEdit || false}
                                                                        onChange={() => setSelectedMenus(prev => {
                                                                            const newPrev = JSON.parse(JSON.stringify(prev));
                                                                            const isChecked = !newPrev[menu.id].subMenus[submenu.id].canEdit;
                                                                            newPrev[menu.id].subMenus[submenu.id].canEdit = isChecked;
                                                                            if (isChecked) newPrev[menu.id].subMenus[submenu.id].canView = true;
                                                                            return newPrev;
                                                                        })}
                                                                        className="w-3 h-3 rounded border-2 border-gray-300 text-blue-500 focus:ring-0 transition-all cursor-pointer"
                                                                    />
                                                                    <span className="text-[8px] font-black text-gray-400 uppercase">Edit</span>
                                                                </label>
                                                                <label className="flex items-center gap-2 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedMenus[menu.id]?.subMenus[submenu.id]?.canDelete || false}
                                                                        onChange={() => setSelectedMenus(prev => {
                                                                            const newPrev = JSON.parse(JSON.stringify(prev));
                                                                            const isChecked = !newPrev[menu.id].subMenus[submenu.id].canDelete;
                                                                            newPrev[menu.id].subMenus[submenu.id].canDelete = isChecked;
                                                                            if (isChecked) newPrev[menu.id].subMenus[submenu.id].canView = true;
                                                                            return newPrev;
                                                                        })}
                                                                        className="w-3 h-3 rounded border-2 border-gray-300 text-blue-500 focus:ring-0 transition-all cursor-pointer"
                                                                    />
                                                                    <span className="text-[8px] font-black text-gray-400 uppercase">Delete</span>
                                                                </label>
                                                                {submenu.title.toLowerCase() === "role permission" && (
                                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedMenus[menu.id]?.subMenus[submenu.id]?.canAssign || false}
                                                                            onChange={() => setSelectedMenus(prev => {
                                                                                const newPrev = JSON.parse(JSON.stringify(prev));
                                                                                const isChecked = !newPrev[menu.id].subMenus[submenu.id].canAssign;
                                                                                newPrev[menu.id].subMenus[submenu.id].canAssign = isChecked;
                                                                                if (isChecked) newPrev[menu.id].subMenus[submenu.id].canView = true;
                                                                                return newPrev;
                                                                            })}
                                                                            className="w-3 h-3 rounded border-2 border-gray-300 text-blue-500 focus:ring-0 transition-all cursor-pointer"
                                                                        />
                                                                        <span className="text-[8px] font-black text-gray-400 uppercase">Assign</span>
                                                                    </label>
                                                                )}
                                                                {submenu.title.toLowerCase() === "generate-id" && (
                                                                    <>
                                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={selectedMenus[menu.id]?.subMenus[submenu.id]?.canApprove || false}
                                                                                onChange={() => setSelectedMenus(prev => {
                                                                                    const newPrev = JSON.parse(JSON.stringify(prev));
                                                                                    const isChecked = !newPrev[menu.id].subMenus[submenu.id].canApprove;
                                                                                    newPrev[menu.id].subMenus[submenu.id].canApprove = isChecked;
                                                                                    if (isChecked) newPrev[menu.id].subMenus[submenu.id].canView = true;
                                                                                    return newPrev;
                                                                                })}
                                                                                className="w-3 h-3 rounded border-2 border-gray-300 text-blue-500 focus:ring-0 transition-all cursor-pointer"
                                                                            />
                                                                            <span className="text-[8px] font-black text-gray-400 uppercase">Approve</span>
                                                                        </label>
                                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={selectedMenus[menu.id]?.subMenus[submenu.id]?.canGenerate || false}
                                                                                onChange={() => setSelectedMenus(prev => {
                                                                                    const newPrev = JSON.parse(JSON.stringify(prev));
                                                                                    const isChecked = !newPrev[menu.id].subMenus[submenu.id].canGenerate;
                                                                                    newPrev[menu.id].subMenus[submenu.id].canGenerate = isChecked;
                                                                                    if (isChecked) newPrev[menu.id].subMenus[submenu.id].canView = true;
                                                                                    return newPrev;
                                                                                })}
                                                                                className="w-3 h-3 rounded border-2 border-gray-300 text-blue-500 focus:ring-0 transition-all cursor-pointer"
                                                                            />
                                                                            <span className="text-[8px] font-black text-gray-400 uppercase">Generate</span>
                                                                        </label>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end items-center gap-6 border-t border-gray-100 pb-4">
                        <button type="button" onClick={() => setShowModal(false)} className="text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest">Cancel</button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-10 py-4 bg-[#1B1555] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:translate-y-[-2px] transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? "Synchronizing..." : "Synchronize Mandate"}
                        </button>
                    </div>
                </form >
            </Modal >

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                itemName={permissionToDelete?.role.name}
                message={`Are you sure you want to purge all access privileges for the "${permissionToDelete?.role.name}" authority?`}
            />

            <MessageBox
                isOpen={msgBox.isOpen}
                onClose={() => setMsgBox(prev => ({ ...prev, isOpen: false }))}
                onConfirm={msgBox.onConfirm}
                title={msgBox.title}
                message={msgBox.message}
                type={msgBox.type}
                loading={msgBox.loading}
            />

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </div >
    );
}
