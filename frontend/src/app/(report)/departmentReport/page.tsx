"use client";

import { useState, useEffect } from "react";
import {
    Briefcase,
    Users,
    Download,
    Printer,
    Search,
    Building,
    UserCheck,
    UserMinus
} from "lucide-react";
import { getDepartmentReport } from "@/api/reportApi";
import DataTable from "@/components/layout/DataTable";

export default function DepartmentReportPage() {
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Stats
    const [stats, setStats] = useState({
        totalDepts: 0,
        totalEmps: 0
    });

    // Fetch Report Data
    useEffect(() => {
        const fetchReport = async () => {
            try {
                setLoading(true);
                const data = await getDepartmentReport();

                if (data) {
                    setDepartments(data.data || []);
                    setStats({
                        totalDepts: data.summary?.totalDepartments || 0,
                        totalEmps: data.summary?.totalEmployees || 0
                    });
                }
            } catch (error) {
                console.error("Failed to fetch department report:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, []);

    // Client-side search
    const filteredDepartments = departments.filter(dept => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            (dept.name?.toLowerCase().includes(term)) ||
            (dept.id?.toString().includes(term))
        );
    });

    const handlePrint = () => {
        window.print();
    };

    const handleExportCSV = () => {
        const headers = ["ID", "Department Name", "Total Employees", "Active", "Inactive"];
        const rows = filteredDepartments.map(dept => [
            dept.id,
            dept.name,
            dept.totalEmployees,
            dept.activeEmployees,
            dept.inactiveEmployees
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(r => r.map(cell => `"${cell}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Department_Report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns = [
        {
            label: "ID",
            key: "id",
            width: "60px",
            align: "center",
        },
        {
            label: "DEPARTMENT NAME",
            key: "name",
            render: (row: any) => (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
                        <Building className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-gray-900">{row.name}</span>
                </div>
            )
        },
        {
            label: "TOTAL EMPLOYEES",
            key: "totalEmployees",
            align: "center",
            render: (row: any) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <Users className="w-3 h-3 mr-1" />
                    {row.totalEmployees}
                </span>
            )
        },
        {
            label: "ACTIVE",
            key: "activeEmployees",
            align: "center",
            render: (row: any) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <UserCheck className="w-3 h-3 mr-1" />
                    {row.activeEmployees}
                </span>
            )
        },
        {
            label: "INACTIVE",
            key: "inactiveEmployees",
            align: "center",
            render: (row: any) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.inactiveEmployees > 0
                    ? "bg-rose-50 text-rose-700 border border-rose-100"
                    : "bg-gray-50 text-gray-400 border border-gray-100"
                    }`}>
                    <UserMinus className="w-3 h-3 mr-1" />
                    {row.inactiveEmployees}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-6 pb-10 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Department Report</h1>
                    <p className="text-sm text-gray-500 font-medium">Overview of organizational structure and workforce distribution</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-xl font-semibold text-xs border border-gray-200 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Export CSV
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl font-semibold text-xs shadow-md shadow-gray-200 hover:bg-gray-800 transition-all"
                    >
                        <Printer className="w-3.5 h-3.5" />
                        Print
                    </button>
                </div>
            </div>

            {/* Compact Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-2">
                <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-colors">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Departments</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-1 group-hover:text-indigo-600 transition-colors">{stats.totalDepts}</h3>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                        <Building className="w-6 h-6" />
                    </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-blue-100 transition-colors">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Employees</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-1 group-hover:text-blue-600 transition-colors">{stats.totalEmps}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-100 transition-colors">
                        <Users className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                {/* Embedded Toolbar */}
                <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Filter departments..."
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* Placeholder for future filters */}
                </div>

                {/* Table */}
                <div className="print:m-0 print:border-none print:shadow-none">
                    <DataTable
                        title="" // Empty title as we have page header
                        columns={columns}
                        data={filteredDepartments}
                        loading={loading}
                        showAddButton={false}
                    />
                </div>
            </div>

            {/* Print Only Footer */}
            <div className="hidden print:block mt-8 text-center border-t border-gray-200 pt-4">
                <p className="text-xs text-gray-400 uppercase tracking-widest">Confidential Report • ID Management System • {new Date().toLocaleDateString()}</p>
            </div>
        </div>
    );
}
