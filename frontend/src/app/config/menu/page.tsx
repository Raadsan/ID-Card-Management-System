"use client";

import { useEffect, useState, useMemo } from "react";
import DataTable from "@/components/DataTable";
import { getMenus, deleteMenu } from "@/api/menuApi";
import { Edit, Trash2 } from "lucide-react";

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

    useEffect(() => {
        fetchMenus();
    }, []);

    const fetchMenus = async () => {
        try {
            setLoading(true);
            const data = await getMenus();
            console.log("Fetched menus data:", data);

            if (Array.isArray(data)) {
                setMenus(data);
            } else {
                console.error("Unexpected API response format:", data);
                setMenus([]);
            }
        } catch (error) {
            console.error("Failed to fetch menus:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (menu: Menu) => {
        console.log("Edit menu:", menu);
        alert(`Edit menu: ${menu.title}`);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this menu?")) {
            try {
                await deleteMenu(String(id));
                fetchMenus();
            } catch (error) {
                console.error("Failed to delete menu:", error);
                alert("Failed to delete menu");
            }
        }
    };

    const handleAddMenu = () => {
        console.log("Add new menu clicked");
        alert("Add New Menu functionality needs implementation");
    };

    const columns = useMemo(
        () => [
            {
                label: "ID",
                key: "id",
            },
            {
                label: "Title",
                key: "title",
            },
            {
                label: "URL",
                key: "url",
                render: (row: Menu) => (
                    <span className="font-mono text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                        {row.url || "N/A"}
                    </span>
                ),
            },
            {
                label: "Icon",
                key: "icon",
                render: (row: Menu) => (
                    <span className="font-mono text-xs text-gray-500">
                        {row.icon || "N/A"}
                    </span>
                ),
            },
            {
                label: "Collapsible",
                key: "isCollapsible",
                render: (row: Menu) => (
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${row.isCollapsible
                            ? 'bg-purple-50 text-purple-700 ring-purple-600/20'
                            : 'bg-gray-50 text-gray-600 ring-gray-500/10'
                        }`}>
                        {row.isCollapsible ? "Yes" : "No"}
                    </span>
                ),
            },
            {
                label: "Actions",
                key: "actions",
                render: (row: Menu) => (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleEdit(row)}
                            className="rounded p-1 text-blue-600 hover:bg-blue-50"
                            title="Edit Menu"
                        >
                            <Edit className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => handleDelete(row.id)}
                            className="rounded p-1 text-red-600 hover:bg-red-50"
                            title="Delete Menu"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ),
            },
        ],
        []
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
            </div>

            <DataTable
                title="System Menus"
                columns={columns}
                data={menus}
                loading={loading}
                onAddClick={handleAddMenu}
                addButtonLabel="Add Menu"
            />
        </div>
    );
}
