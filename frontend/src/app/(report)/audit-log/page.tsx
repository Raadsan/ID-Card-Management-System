"use client";

import { useEffect, useState, useMemo } from "react";
import DataTable from "@/components/layout/DataTable";
import { getAuditLogs } from "@/api/audit-logApi";
import {
    History,
    Activity,
    Globe,
    ArrowRight,
    Search,
    Database,
    LogIn,
    LogOut,
    Plus,
    Edit,
    Trash2,
    Eye,
    Download,
    Printer,
    ArrowLeftRight
} from "lucide-react";

// Types based on the backend response
interface AuditLog {
    id: number;
    userId: number;
    action: string;
    tableName: string;
    recordId: number | null;
    oldData: any | null;
    newData: any | null;
    ipAddress: string | null;
    createdAt: string;
    user: {
        id: number;
        fullName: string;
        email: string;
    };
}

export default function AuditLogsPage() {
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(50);

    useEffect(() => {
        fetchAuditLogs();
    }, [page, limit]);

    const fetchAuditLogs = async () => {
        try {
            setLoading(true);
            const response = await getAuditLogs({ page, limit });
            if (response && response.data) {
                setAuditLogs(response.data);
                setTotal(response.pagination.total);
            }
        } catch (error) {
            console.error("Failed to fetch audit logs:", error);
        } finally {
            setLoading(false);
        }
    };

    const getActionIcon = (action: string) => {
        switch (action.toUpperCase()) {
            case "LOGIN": return <LogIn className="h-4 w-4 text-emerald-500" />;
            case "LOGOUT": return <LogOut className="h-4 w-4 text-amber-500" />;
            case "CREATE": return <Plus className="h-4 w-4 text-blue-500" />;
            case "UPDATE": return <Edit className="h-4 w-4 text-indigo-500" />;
            case "DELETE": return <Trash2 className="h-4 w-4 text-rose-500" />;
            case "VIEW": return <Eye className="h-4 w-4 text-sky-500" />;
            case "EXPORT": return <Download className="h-4 w-4 text-purple-500" />;
            case "PRINT": return <Printer className="h-4 w-4 text-slate-500" />;
            case "TRANSFER": return <ArrowLeftRight className="h-4 w-4 text-orange-500" />;
            default: return <Activity className="h-4 w-4 text-gray-500" />;
        }
    };

    const getActionColor = (action: string) => {
        switch (action.toUpperCase()) {
            case "LOGIN": return "bg-emerald-50 text-emerald-700 border-emerald-100";
            case "LOGOUT": return "bg-amber-50 text-amber-700 border-amber-100";
            case "CREATE": return "bg-blue-50 text-blue-700 border-blue-100";
            case "UPDATE": return "bg-indigo-50 text-indigo-700 border-indigo-100";
            case "DELETE": return "bg-rose-50 text-rose-700 border-rose-100";
            case "VIEW": return "bg-sky-50 text-sky-700 border-sky-100";
            default: return "bg-gray-50 text-gray-700 border-gray-100";
        }
    };

    const columns = useMemo(
        () => [
            {
                label: "Action",
                key: "action",
                width: "140px",
                render: (row: AuditLog) => (
                    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${getActionColor(row.action)}`}>
                        {getActionIcon(row.action)}
                        {row.action}
                    </div>
                )
            },
            {
                label: "User",
                key: "user",
                render: (row: AuditLog) => (
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-sm">{row.user?.fullName || "System"}</span>
                        <span className="text-[10px] text-gray-500 font-medium">{row.user?.email || "N/A"}</span>
                    </div>
                )
            },
            {
                label: "Target Table",
                key: "tableName",
                render: (row: AuditLog) => (
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-[#1B1555]/5 text-[#1B1555] rounded-lg text-[10px] font-black uppercase border border-[#1B1555]/10 flex items-center gap-2">
                            <Database className="h-3 w-3" />
                            {row.tableName}
                        </div>
                        {row.recordId && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-bold border border-gray-200">
                                ID: {row.recordId}
                            </span>
                        )}
                    </div>
                )
            },
            {
                label: "IP Address",
                key: "ipAddress",
                render: (row: AuditLog) => (
                    <div className="flex items-center gap-2 text-gray-400">
                        <Globe className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-black font-mono tracking-tight">{row.ipAddress || "::1"}</span>
                    </div>
                )
            },
            {
                label: "Changes",
                key: "changes",
                render: (row: AuditLog) => {
                    const hasChanges = (row.oldData && Object.keys(row.oldData).length > 0) ||
                        (row.newData && Object.keys(row.newData).length > 0);

                    if (!hasChanges) return <span className="text-gray-300 italic text-[10px] font-bold uppercase tracking-widest">No Context</span>;

                    return (
                        <div className="flex items-center gap-1.5 max-w-[200px]">
                            {row.newData && (
                                <div className="flex flex-wrap gap-1">
                                    {Object.entries(row.newData).slice(0, 2).map(([key, val]: [string, any]) => (
                                        <span key={key} className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[9px] font-black border border-emerald-100 max-w-[100px] truncate">
                                            {key}: {String(val)}
                                        </span>
                                    ))}
                                    {Object.keys(row.newData).length > 2 && <span className="text-[9px] font-black text-gray-400">+{Object.keys(row.newData).length - 2} more</span>}
                                </div>
                            )}
                        </div>
                    );
                }
            },
            {
                label: "Timestamp",
                key: "createdAt",
                align: "right",
                render: (row: AuditLog) => {
                    const date = new Date(row.createdAt);
                    return (
                        <div className="flex flex-col items-end">
                            <span className="font-black text-[#1B1555] text-[10px] uppercase tracking-wider">
                                {date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold">
                                {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </span>
                        </div>
                    );
                }
            }
        ],
        []
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-[#1B1555] rounded-2xl flex items-center justify-center shadow-xl shadow-[#1B1555]/20 border border-[#1B1555]/10">
                        <History className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-[#1B1555] tracking-tight uppercase">Audit Logs</h1>
                        <p className="text-[11px] font-black text-[#16BCF8] uppercase tracking-[0.2em] opacity-80">Security & Activity Tracking</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <div className="px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Events</span>
                            <span className="text-sm font-black text-[#1B1555]">{total}</span>
                        </div>
                        <div className="h-8 w-px bg-gray-100"></div>
                        <Activity className="h-5 w-5 text-[#16BCF8]" />
                    </div>
                </div>
            </div>

            <DataTable
                title="Activity Timeline"
                columns={columns}
                data={auditLogs}
                loading={loading}
            />

        </div>
    );
}
