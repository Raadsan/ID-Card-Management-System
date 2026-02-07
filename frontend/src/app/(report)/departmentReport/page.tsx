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
        <div className="space-y-6 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Department Overview</h1>
                    <p className="text-gray-500 text-sm mt-1">Personnel distribution across organization units</p>
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

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-2">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <Briefcase className="w-5 h-5 text-indigo-600 bg-indigo-50 rounded-md p-0.5" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Structure</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">{stats.totalDepts}</h3>
                    <p className="text-xs font-medium text-gray-400 mt-1">Total Departments</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <Users className="w-5 h-5 text-blue-600 bg-blue-50 rounded-md p-0.5" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Workforce</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">{stats.totalEmps}</h3>
                    <p className="text-xs font-medium text-gray-400 mt-1">Total Employees Tracked</p>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm print:hidden">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search department name or ID..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Report Table */}
            <div className="print:m-0 print:border-none print:shadow-none">
                <DataTable
                    title="Department Breakdown"
                    columns={columns}
                    data={filteredDepartments}
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
