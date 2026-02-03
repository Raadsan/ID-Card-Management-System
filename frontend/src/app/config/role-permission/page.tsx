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
    menu: {
        id: number;
        title: string;
    };
    subMenus: {
        id: number;
        subMenuId: number;
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
            subMenus: number[];
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
        const menuMap: any = {};

        perm.menus.forEach((ma) => {
            menuMap[ma.menuId] = {
                enabled: true,
                subMenus: ma.subMenus.map((sm) => sm.subMenuId),
            };
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
        setSelectedMenus((prev) => ({
            ...prev,
            [menuId]: {
                enabled: !prev[menuId]?.enabled,
                subMenus: prev[menuId]?.subMenus || [],
            },
        }));
    };

    const toggleSubMenu = (menuId: number, subMenuId: number) => {
        setSelectedMenus((prev) => {
            const current = prev[menuId] || { enabled: true, subMenus: [] };
            const subMenus = current.subMenus.includes(subMenuId)
                ? current.subMenus.filter((id) => id !== subMenuId)
                : [...current.subMenus, subMenuId];

            return {
                ...prev,
                [menuId]: { ...current, subMenus },
            };
        });
    };

    const selectAllSubMenus = (menuId: number) => {
        const menu = menus.find((m) => m.id === menuId);
        if (!menu) return;
        setSelectedMenus((prev) => ({
            ...prev,
            [menuId]: {
                enabled: true,
                subMenus: menu.subMenus.map((sm) => sm.id),
            },
        }));
    };

    const deselectAllSubMenus = (menuId: number) => {
        setSelectedMenus((prev) => ({
            ...prev,
            [menuId]: {
                ...(prev[menuId] || { enabled: true }),
                subMenus: [],
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
                    subMenus: data.subMenus.map((smId) => ({ subMenuId: Number(smId) })),
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
                                        <div key={idx} className="px-2 py-1.5 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-between gap-1 overflow-hidden" title={ma.menu?.title}>
                                            <span className="text-[9px] font-bold text-gray-700 uppercase tracking-tight truncate">{ma.menu?.title}</span>
                                            {ma.subMenus.length > 0 && (
                                                <span className="h-4 w-4 shrink-0 rounded-full bg-blue-500 flex items-center justify-center text-[8px] font-black text-white">
                                                    {ma.subMenus.length}
                                                </span>
                                            )}
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
                                <div key={idx} className="space-y-3">
                                    <div className="flex items-center gap-2 text-gray-800 font-black uppercase text-xs tracking-widest">
                                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                        {ma.menu?.title}
                                    </div>
                                    <div className="pl-4 flex flex-wrap gap-2">
                                        {ma.subMenus.length > 0 ? ma.subMenus.map((sm, sIdx) => (
                                            <span key={sIdx} className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-500 uppercase">
                                                {sm.subMenu?.title}
                                            </span>
                                        )) : (
                                            <span className="text-[10px] font-bold text-gray-300 italic">Full Access</span>
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

                                        {selectedMenus[menu.id]?.enabled && menu.subMenus && menu.subMenus.length > 0 && (
                                            <div className="ml-10 mt-6 pt-6 border-t border-blue-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {menu.subMenus.map((submenu) => (
                                                    <label
                                                        key={submenu.id}
                                                        className={`flex items-center gap-4 cursor-pointer p-3 rounded-2xl border transition-all ${selectedMenus[menu.id]?.subMenus.includes(submenu.id)
                                                            ? 'bg-white border-blue-200 shadow-sm'
                                                            : 'bg-transparent border-transparent'
                                                            }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedMenus[menu.id]?.subMenus.includes(submenu.id) || false}
                                                            onChange={() => toggleSubMenu(menu.id, submenu.id)}
                                                            className="w-4 h-4 rounded border-2 border-gray-300 text-blue-500 focus:ring-0 transition-all cursor-pointer"
                                                        />
                                                        <span className={`text-[10px] font-bold uppercase ${selectedMenus[menu.id]?.subMenus.includes(submenu.id) ? 'text-blue-700' : 'text-gray-400'}`}>
                                                            {submenu.title}
                                                        </span>
                                                    </label>
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
                </form>
            </Modal>

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
        </div>
    );
}
