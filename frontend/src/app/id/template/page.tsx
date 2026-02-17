"use client";

import { useEffect, useState, useMemo } from "react";
import DataTable from "@/components/layout/DataTable";
import { usePermission } from "@/hooks/usePermission";
import { getAllTemplates, deleteTemplate, IdCardTemplate } from "@/api/idTemplateApi";
import { Edit, Trash2, Eye } from "lucide-react";
import MessageBox, { MessageBoxType } from "@/components/MessageBox";
import AddIdTemplateModal from "@/components/AddIdTemplateModal";
import EditIdTemplateModal from "@/components/EditIdTemplateModal";
import ViewIdTemplateModal from "@/components/ViewIdTemplateModal";

export default function IdTemplatesPage() {
    const [templates, setTemplates] = useState<IdCardTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<IdCardTemplate | null>(null);

    const { hasPermission } = usePermission();
    const canAdd = hasPermission("ID Template", "add", true);
    const canEdit = hasPermission("ID Template", "edit", true);
    const canDelete = hasPermission("ID Template", "delete", true);

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
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const response = await getAllTemplates();
            setTemplates(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error("Failed to fetch templates:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleView = (template: IdCardTemplate) => {
        setSelectedTemplate(template);
        setIsViewModalOpen(true);
    };

    const handleEdit = (template: IdCardTemplate) => {
        setSelectedTemplate(template);
        setIsEditModalOpen(true);
    };

    const handleDelete = (id: number) => {
        const tpl = templates.find(t => t.id === id);
        setMsgBox({
            isOpen: true,
            title: "Delete Template",
            message: `Are you sure you want to delete the "${tpl?.name}" template? This action cannot be undone.`,
            type: "confirm",
            onConfirm: () => performDelete(id),
        });
    };

    const performDelete = async (id: number) => {
        try {
            setMsgBox(prev => ({ ...prev, loading: true }));
            await deleteTemplate(id);
            setMsgBox({
                isOpen: true,
                title: "Deleted!",
                message: "Template has been removed successfully.",
                type: "success",
            });
            fetchTemplates();
        } catch (error: any) {
            console.error("Failed to delete template:", error);
            setMsgBox({
                isOpen: true,
                title: "Deletion Failed",
                message: error.response?.data?.message || error.response?.data?.error || "Could not delete template.",
                type: "error",
            });
        }
    };

    const handleAddTemplate = () => {
        setIsAddModalOpen(true);
    };

    const columns = useMemo(
        () => [
            {
                label: "ID",
                key: "id",
                render: (row: IdCardTemplate) => (
                    <span className="font-bold text-gray-900">{row.id}</span>
                )
            },
            {
                label: "Template Name",
                key: "name",
                render: (row: IdCardTemplate) => (
                    <span className="font-bold text-gray-900">{row.name}</span>
                )
            },
            {
                label: "Description",
                key: "description",
                render: (row: IdCardTemplate) => (
                    <span className="text-sm text-gray-600">
                        {row.description || <span className="italic text-gray-400">No description</span>}
                    </span>
                )
            },
            {
                label: "Dimensions",
                key: "dimensions",
                render: (row: IdCardTemplate) => (
                    <span className="text-gray-600 text-sm">{row.width} x {row.height} px</span>
                )
            },
            {
                label: "Status",
                key: "status",
                render: (row: IdCardTemplate) => (
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${row.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                        }`}>
                        {row.status}
                    </span>
                )
            },

            {
                label: "Actions",
                key: "actions",
                align: "center",
                render: (row: IdCardTemplate) => (
                    <div className="flex items-center justify-center gap-2">
                        <button
                            onClick={() => handleView(row)}
                            className="p-1.5 text-purple-500 hover:bg-purple-50 rounded-lg transition-colors"
                            title="View Template"
                        >
                            <Eye className="h-4 w-4" />
                        </button>
                        {canEdit && (
                            <button
                                onClick={() => handleEdit(row)}
                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit Template"
                            >
                                <Edit className="h-4 w-4" />
                            </button>
                        )}
                        {canDelete && (
                            <button
                                onClick={() => handleDelete(row.id)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Delete Template"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                ),
            },
        ],
        [templates, canEdit, canDelete]
    );

    return (
        <div className="space-y-6">
            <DataTable
                title="ID Card Templates"
                columns={columns}
                data={templates}
                loading={loading}
                onAddClick={canAdd ? handleAddTemplate : undefined}
                addButtonLabel="New Template"
            />

            <AddIdTemplateModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    setMsgBox({
                        isOpen: true,
                        title: "Success",
                        message: "New template has been created successfully.",
                        type: "success",
                    });
                    fetchTemplates();
                }}
            />

            <EditIdTemplateModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedTemplate(null);
                }}
                template={selectedTemplate}
                onSuccess={() => {
                    setMsgBox({
                        isOpen: true,
                        title: "Updated",
                        message: "Template details have been updated.",
                        type: "success",
                    });
                    fetchTemplates();
                }}
            />

            <ViewIdTemplateModal
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setSelectedTemplate(null);
                }}
                template={selectedTemplate}
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
