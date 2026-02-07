"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Briefcase,
    FileText,
    Download,
    Printer,
    Filter,
    CheckCircle,
    XCircle,
    Search
} from "lucide-react";
import { getEmployeeReport } from "@/api/reportApi"; // Optimized API
import { getDepartments } from "@/api/departmentApi"; // For dropdown options
import DataTable from "@/components/layout/DataTable";

export default function EmployeeReportPage() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Filters
    const [statusFilter, setStatusFilter] = useState("all");
    const [deptFilter, setDeptFilter] = useState("all");

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        depts: 0
    });

    // Fetch Departments for Dropdown
    useEffect(() => {
        const fetchDepts = async () => {
            try {
                const data = await getDepartments();
                setDepartments(data);
            } catch (error) {
                console.error("Failed to fetch departments:", error);
            }
        };
        fetchDepts();
    }, []);

    // Fetch Report Data (Employees + Stats)
    useEffect(() => {
        const fetchReport = async () => {
            try {
                setLoading(true);
                const data = await getEmployeeReport({
                    status: statusFilter,
                    departmentId: deptFilter
                });

                if (data) {
                    setEmployees(data.data || []);
                    setStats({
                        total: data.summary?.total || 0,
                        active: data.summary?.active || 0,
                        inactive: data.summary?.inactive || 0,
                        depts: data.summary?.totalDepartments || 0
                    });
                }
            } catch (error) {
                console.error("Failed to fetch employee report:", error);
            } finally {
                setLoading(false);
            }
        };

        // Debounce or just call on change
        fetchReport();
    }, [statusFilter, deptFilter]);

    // Client-side search (since backend search isn't implemented yet)
    const filteredEmployees = employees.filter(emp => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            (emp.user?.fullName?.toLowerCase().includes(term)) ||
            (emp.title?.toLowerCase().includes(term)) ||
            (emp.id?.toString().includes(term))
        );
    });

    const handlePrint = () => {
        window.print();
    };

    const handleExportCSV = () => {
        const headers = ["ID", "Full Name", "Title", "Department", "Status", "Contact"];
        const rows = filteredEmployees.map(emp => [
            emp.id,
            emp.user?.fullName,
            emp.title,
            emp.department?.departmentName || "N/A",
            emp.status,
            emp.user?.email || "N/A"
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(r => r.map(cell => `"${cell}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Employee_Report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns = [
        {
            label: "ID",
            key: "id",
            width: "70px",
            align: "center",
        },
        {
            label: "FULL NAME",
            key: "user.fullName",
            render: (row: any) => (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                        {row.user?.fullName?.charAt(0) || "U"}
                    </div>
                    <div>
                        <span className="font-semibold text-gray-900 block">{row.user?.fullName}</span>
                        <span className="text-[10px] text-gray-400">{row.user?.email}</span>
                    </div>
                </div>
            )
        },
        {
            label: "TITLE",
            key: "title",
            render: (row: any) => <span className="text-gray-600 font-medium">{row.title || "-"}</span>
        },
        {
            label: "DEPARTMENT",
            key: "department.departmentName",
            render: (row: any) => (
                <span className="px-2.5 py-1 bg-gray-50 text-gray-600 rounded-lg text-[11px] font-bold border border-gray-100 uppercase tracking-wider">
                    {row.department?.departmentName || "General"}
                </span>
            )
        },
        {
            label: "STATUS",
            key: "status",
            align: "center",
            render: (row: any) => (
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${row.status === "active"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : "bg-rose-50 text-rose-600 border border-rose-100"
                    }`}>
                    {row.status}
                </span>
            )
        },
        {
            label: "JOINED",
            key: "createdAt",
            render: (row: any) => (
                <span className="text-gray-500 text-xs font-mono">
                    {new Date(row.createdAt).toLocaleDateString()}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-6 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Employee Master Report</h1>
                    <p className="text-gray-500 text-sm mt-1">Detailed personnel analytics and records</p>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-3">
                {[
                    { title: "Total Employees", value: stats.total, icon: Users, color: "text-blue-600 bg-blue-50" },
                    { title: "Active Personnel", value: stats.active, icon: CheckCircle, color: "text-emerald-600 bg-emerald-50" },
                    { title: "Inactive / On Leave", value: stats.inactive, icon: XCircle, color: "text-rose-600 bg-rose-50" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <stat.icon className={`w-5 h-5 ${stat.color.split(' ')[0]}`} />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global Metric</span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                        <p className="text-xs font-medium text-gray-400 mt-1">{stat.title}</p>
                    </div>
                ))}
            </div>

            {/* Filters Section */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm print:hidden">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative col-span-1 md:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, title or ID..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div>
                        <select
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer appearance-none"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                        </select>
                    </div>
                    <div>
                        <select
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer appearance-none"
                            value={deptFilter}
                            onChange={(e) => setDeptFilter(e.target.value)}
                        >
                            <option value="all">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.departmentName}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Report Table */}
            <div className="print:m-0 print:border-none print:shadow-none">
                <DataTable
                    title="Employee Roster"
                    columns={columns}
                    data={filteredEmployees}
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
