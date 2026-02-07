"use client";

import { useState, useEffect } from "react";
import {
    Calendar,
    ArrowRightLeft,
    Download,
    Printer,
    Users,
    Filter,
    X
} from "lucide-react";
import { getDepartmentTransferReport } from "@/api/reportApi";
import DataTable from "@/components/layout/DataTable";

export default function DepartmentTransferReportPage() {
    const [transfers, setTransfers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [period, setPeriod] = useState("today");
    const [customStartDate, setCustomStartDate] = useState("");
    const [customEndDate, setCustomEndDate] = useState("");
    const [showCustomDate, setShowCustomDate] = useState(false);

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        uniqueEmps: 0
    });

    useEffect(() => {
        fetchReport();
    }, [period, customStartDate, customEndDate]);

    const fetchReport = async () => {
        try {
            setLoading(true);

            // If using custom date, ensure both dates are present before fetching
            if (period === 'custom' && (!customStartDate || !customEndDate)) {
                setLoading(false);
                return;
            }

            const data = await getDepartmentTransferReport({
                period: period === 'custom' ? undefined : period,
                startDate: period === 'custom' ? customStartDate : undefined,
                endDate: period === 'custom' ? customEndDate : undefined
            });

            if (data) {
                setTransfers(data.data || []);
                setStats({
                    total: data.summary?.totalTransfers || 0,
                    uniqueEmps: data.summary?.uniqueEmployees || 0
                });
            }
        } catch (error) {
            console.error("Failed to fetch transfer report:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportCSV = () => {
        const headers = ["ID", "Employee", "From Department", "To Department", "Date", "Authorized By", "Reason"];
        const rows = transfers.map(t => [
            t.id,
            t.employeeName,
            t.fromDept,
            t.toDept,
            new Date(t.date).toLocaleString(),
            t.authorizedBy,
            t.reason || "-"
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(r => r.map(cell => `"${cell}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Transfer_Report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns = [
        {
            label: "EMPLOYEE",
            key: "employeeName",
            render: (row: any) => (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 font-bold text-xs">
                        {row.employeeName?.charAt(0)}
                    </div>
                    <span className="font-semibold text-gray-900">{row.employeeName}</span>
                </div>
            )
        },
        {
            label: "FROM",
            key: "fromDept",
            render: (row: any) => (
                <span className="px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-[11px] font-bold border border-red-100 uppercase tracking-wider">
                    {row.fromDept}
                </span>
            )
        },
        {
            label: "",
            key: "arrow",
            width: "40px",
            align: "center",
            render: () => <ArrowRightLeft className="w-4 h-4 text-gray-300" />
        },
        {
            label: "TO",
            key: "toDept",
            render: (row: any) => (
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[11px] font-bold border border-emerald-100 uppercase tracking-wider">
                    {row.toDept}
                </span>
            )
        },
        {
            label: "DATE",
            key: "date",
            render: (row: any) => (
                <span className="text-gray-500 text-xs font-mono">
                    {new Date(row.date).toLocaleDateString()}
                    <span className="ml-2 text-gray-400">
                        {new Date(row.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </span>
            )
        },
        {
            label: "AUTHORIZED BY",
            key: "authorizedBy",
            render: (row: any) => <span className="text-xs text-gray-500">{row.authorizedBy}</span>
        }
    ];

    const periods = [
        { label: "Today", value: "today" },
        { label: "This Week", value: "week" },
        { label: "This Month", value: "month" },
        { label: "This Year", value: "year" },
        { label: "Custom Range", value: "custom" } // Triggers custom date picker
    ];

    return (
        <div className="space-y-6 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Transfer History Log</h1>
                    <p className="text-gray-500 text-sm mt-1">Audit trail of all personnel department changes</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all border border-gray-200 shadow-sm"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1B1555] text-white rounded-xl font-semibold text-sm hover:bg-[#16BCF8] transition-all shadow-md shadow-blue-100"
                    >
                        <Printer className="w-4 h-4" />
                        Print
                    </button>
                </div>
            </div>

            {/* Date Filters & Stats Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Filters */}
                <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm print:hidden">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                Date Range
                            </h3>
                            {period === 'custom' && (
                                <button
                                    onClick={() => setPeriod('today')}
                                    className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 font-medium"
                                >
                                    <X className="w-3 h-3" /> Reset
                                </button>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {periods.map((p) => (
                                <button
                                    key={p.value}
                                    onClick={() => setPeriod(p.value)}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${period === p.value
                                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                                        }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        {/* Custom Date Picker (Changes dynamically) */}
                        {period === 'custom' && (
                            <div className="flex flex-wrap items-end gap-3 pt-2 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 ml-1">From Date</label>
                                    <input
                                        type="date"
                                        value={customStartDate}
                                        onChange={(e) => setCustomStartDate(e.target.value)}
                                        className="block w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none hover:bg-white transition-colors"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 ml-1">To Date</label>
                                    <input
                                        type="date"
                                        value={customEndDate}
                                        onChange={(e) => setCustomEndDate(e.target.value)}
                                        className="block w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none hover:bg-white transition-colors"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* KPI Card */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-2xl shadow-lg text-white flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <ArrowRightLeft className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-medium text-blue-100 uppercase tracking-wider">Transfer Volume</span>
                    </div>
                    <div>
                        <h3 className="text-4xl font-bold">{stats.total}</h3>
                        <p className="text-sm text-blue-100 mt-1">
                            {stats.uniqueEmps} employee{stats.uniqueEmps !== 1 ? 's' : ''} moved
                            {period !== 'custom' ? ` ${periods.find(p => p.value === period)?.label.toLowerCase()}` : ' in selected range'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Report Table */}
            <div className="print:m-0 print:border-none print:shadow-none">
                <DataTable
                    title={`Transfers (${period === 'custom' ? 'Custom Range' : periods.find(p => p.value === period)?.label})`}
                    columns={columns}
                    data={transfers}
                    loading={loading}
                    showAddButton={false}
                />

                {/* Print Only Footer */}
                <div className="hidden print:block mt-8 text-center border-t border-gray-200 pt-4">
                    <p className="text-xs text-gray-400 uppercase tracking-widest">Confidential Report • Generated on {new Date().toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
}
