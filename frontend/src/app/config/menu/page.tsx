"use client";

import { useEffect, useState, useMemo } from "react";
import DataTable from "@/components/DataTable";
import { getMenus, deleteMenu } from "@/api/menuApi";
import { Edit, Trash2, Layout, ExternalLink, Box } from "lucide-react";
import AddMenuModal from "@/components/AddMenuModal";
import EditMenuModal from "@/components/EditMenuModal";
import MessageBox, { MessageBoxType } from "@/components/MessageBox";

// Define the Menu type based on your API response
interface Menu {
    id: number;
    title: string;
    url?: string;
    icon?: string;
    isCollapsible: boolean;
}

export default function MenuPage() {
    const [menus, setMenus] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null);

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

    useEffect(() => {
        fetchMenus();
    }, []);

    const fetchMenus = async () => {
        try {
            setLoading(true);
            const data = await getMenus();
            if (Array.isArray(data)) {
                setMenus(data);
            } else {
                setMenus([]);
            }
        } catch (error) {
            console.error("Failed to fetch menus:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (menu: Menu) => {
        setSelectedMenuId(menu.id);
        setIsEditModalOpen(true);
    };

    const handleDelete = (id: number) => {
        const menu = menus.find(m => m.id === id);
        setMsgBox({
            isOpen: true,
            title: "Destructive Operation Warning",
            message: `Are you absolutely certain you want to purge the "${menu?.title}" navigation node? This will permanently remove its entire hierarchy.`,
            type: "confirm",
            onConfirm: () => performDelete(id),
        });
    };

    const performDelete = async (id: number) => {
        try {
            setMsgBox(prev => ({ ...prev, loading: true }));
            await deleteMenu(String(id));
            setMsgBox({
                isOpen: true,
                title: "Registry Purged",
                message: "The navigation node has been successfully removed from the system registry.",
                type: "success",
            });
            fetchMenus();
        } catch (error: any) {
            setMsgBox({
                isOpen: true,
                title: "Operation Restricted",
                message: error.response?.data?.message || "Internal failure aborted the purge operation.",
                type: "error",
            });
        }
    };

    const columns = useMemo(
        () => [
            {
                label: "Identification",
                key: "id",
                render: (row: Menu) => (
                    <span className="text-[10px] font-black tracking-widest text-[#1B1555]/40 tabular-nums">
                        #{row.id.toString().padStart(3, '0')}
                    </span>
                )
            },
            {
                label: "Display Title",
                key: "title",
                render: (row: Menu) => (
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-[#16BCF8]/5 flex items-center justify-center text-[#16BCF8]">
                            <Layout size={14} />
                        </div>
                        <span className="font-bold text-[#1B1555] tracking-tight">{row.title}</span>
                    </div>
                )
            },
            {
                label: "Target Context",
                key: "url",
                render: (row: Menu) => (
                    <div className="flex items-center gap-2">
                        {row.url ? (
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-50 border border-gray-100">
                                <ExternalLink size={10} className="text-gray-400" />
                                <span className="text-[10px] font-bold text-gray-500 font-mono">{row.url}</span>
                            </div>
                        ) : (
                            <span className="text-[10px] font-bold text-gray-300 uppercase italic">Virtual Node</span>
                        )}
                    </div>
                ),
            },
            {
                label: "Icon Glyph",
                key: "icon",
                render: (row: Menu) => (
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-gray-100 flex items-center justify-center border border-gray-200">
                            <Box size={10} className="text-gray-400" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                            {row.icon || "Default"}
                        </span>
                    </div>
                ),
            },
            {
                label: "Hierarchical",
                key: "isCollapsible",
                render: (row: Menu) => (
                    <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${row.isCollapsible
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-gray-50 text-gray-400 border border-gray-100'
                        }`}>
                        <div className={`h-1 w-1 rounded-full ${row.isCollapsible ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                        {row.isCollapsible ? "Parent" : "Leaf"}
                    </div>
                ),
            },
            {
                label: "Management",
                key: "actions",
                align: "center",
                render: (row: Menu) => (
                    <div className="flex items-center justify-center gap-1.5">
                        <button
                            onClick={() => handleEdit(row)}
                            className="p-2 text-gray-400 hover:text-[#16BCF8] hover:bg-[#16BCF8]/5 rounded-xl transition-all"
                            title="Edit Node"
                        >
                            <Edit className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => handleDelete(row.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Purge Node"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ),
            },
        ],
        [menus]
    );

    return (
        <div className="p-6 space-y-6 bg-gray-50/30 min-h-screen">
            <DataTable
                title="System Navigation Registry"
                columns={columns}
                data={menus}
                loading={loading}
                onAddClick={() => setIsAddModalOpen(true)}
                addButtonLabel="Establish Node"
            />

            <AddMenuModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    setMsgBox({
                        isOpen: true,
                        title: "Navigation Established",
                        message: "The new navigation node has been successfully integrated into the system branch.",
                        type: "success",
                    });
                    fetchMenus();
                }}
            />

            <EditMenuModal
                isOpen={isEditModalOpen}
                menuId={selectedMenuId}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedMenuId(null);
                }}
                onSuccess={() => {
                    setMsgBox({
                        isOpen: true,
                        title: "Hierarchy Synchronized",
                        message: "The navigation parameters have been successfully updated across the registry.",
                        type: "success",
                    });
                    fetchMenus();
                }}
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
        </div>
    );
}
