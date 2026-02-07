"use client";

import { useState, useEffect } from "react";
import { Users, TrendingUp, Activity, Briefcase, FileText, CheckCircle, XCircle, Clock, Edit2, Trash2, User } from "lucide-react";
import DataTable from "./DataTable";
import { getEmployees } from "@/api/employeeApi";
import { getAllIdGenerates } from "@/api/generateIdApi";
import { getDepartments } from "@/api/departmentApi";

export default function DashboardContent() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [idStats, setIdStats] = useState({
        created: 0,
        ready: 0,
        printed: 0,
        totalEmployees: 0,
        totalDepartments: 0
    });
    const [transactions, setTransactions] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [employeesData, idCardsData, departmentsData] = await Promise.all([
                    getEmployees(),
                    getAllIdGenerates(),
                    getDepartments()
                ]);

                // Set top 5 employees for the table
                setEmployees(employeesData.slice(0, 5));

                // Calculate stats based on status
                const stats = {
                    created: idCardsData.filter((id: any) => id.status === "created").length,
                    ready: idCardsData.filter((id: any) => id.status === "ready_to_print").length,
                    printed: idCardsData.filter((id: any) => id.status === "printed").length,
                    totalEmployees: employeesData.length,
                    totalDepartments: departmentsData.length
                };

                setIdStats(stats);

                // Set recent activities (transactions)
                const recentActivities = idCardsData
                    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5)
                    .map((id: any) => ({
                        id: id.id,
                        name: `${id.employee?.user?.fullName || "ID Request"}`,
                        employeeId: `EMP-${id.employee?.id?.toString().padStart(4, '0')}`,
                        status: id.status,
                        date: id.createdAt,
                    }));
                setTransactions(recentActivities);

                // Process chart data for last 6 months
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const now = new Date();
                const last6Months: { label: string; month: number; year: number; revenue: number }[] = [];
                for (let i = 5; i >= 0; i--) {
                    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    last6Months.push({
                        label: months[d.getMonth()],
                        month: d.getMonth(),
                        year: d.getFullYear(),
                        revenue: 0
                    });
                }

                idCardsData.forEach((id: any) => {
                    const d = new Date(id.createdAt);
                    const monthLabel = months[d.getMonth()];
                    const chartMonth = last6Months.find(m => m.label === monthLabel && m.year === d.getFullYear());
                    if (chartMonth) {
                        chartMonth.revenue += 1;
                    }
                });
                setChartData(last6Months);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const employeeColumns = [
        {
            label: "ID",
            key: "id",
            width: "60px",
            align: "center",
        },
        {
            label: "FULL NAME",
            key: "user.fullName",
            render: (row: any) => (
                <span className="font-semibold text-gray-900">{row.user?.fullName}</span>
            )
        },
        {
            label: "TITLE",
            key: "title",
            render: (row: any) => (
                <span className="text-gray-600 font-medium">{row.title || "-"}</span>
            )
        },
        {
            label: "DEPARTMENT",
            key: "department.departmentName",
            render: (row: any) => (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold border border-gray-200/50">
                    {row.department?.departmentName || "General"}
                </span>
            )
        },
        {
            label: "STATUS",
            key: "status",
            align: "center",
            render: (row: any) => (
                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${row.status === "active"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    : "bg-rose-50 text-rose-600 border border-rose-100"
                    }`}>
                    {row.status}
                </span>
            )
        },
    ];

    // Dynamic stats data
    const stats = [
        {
            title: "ID Cards Created",
            value: idStats.created.toString(),
            change: "+12% vs last month",
            icon: FileText,
            color: "bg-blue-100 text-blue-700",
            percentage: idStats.created,
        },
        {
            title: "Printed IDs",
            value: idStats.printed.toString(),
            change: "+15% vs last month",
            icon: CheckCircle,
            color: "bg-green-100 text-green-700",
            percentage: idStats.printed,
        },
        {
            title: "Total Employees",
            value: idStats.totalEmployees.toString(),
            change: "+5% vs last month",
            icon: Users,
            color: "bg-purple-100 text-purple-700",
            percentage: idStats.totalEmployees,
        },
        {
            title: "Total Departments",
            value: idStats.totalDepartments.toString(),
            change: "+2% vs last month",
            icon: Briefcase,
            color: "bg-emerald-100 text-emerald-700",
            percentage: idStats.totalDepartments,
        },
    ];


    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-gray-100/50">
                            <div className="absolute right-0 top-0 -mr-4 -mt-4 h-20 w-20 rounded-full bg-gray-50 opacity-50 transition-transform group-hover:scale-110"></div>
                            <div className="relative flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.title}</p>
                                    <h3 className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</h3>
                                </div>
                                <div className={`rounded-xl p-2.5 ${stat.color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
                                    <Icon className={`h-5 w-5 ${stat.color.replace('bg-', 'text-').replace('100', '600')}`} />
                                </div>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                                <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${stat.change.startsWith('+') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                                    }`}>
                                    <TrendingUp className="h-3 w-3" />
                                    {stat.change.startsWith('+') ? 'Up' : 'Down'}
                                </span>
                                <span className="text-xs text-gray-400">{stat.change}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Revenue Overview & Recent Transactions */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Revenue Chart */}
                <div className="col-span-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">ID Processing Overview</h3>
                        <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                            <TrendingUp className="h-4 w-4" />
                            <span>+12.5%</span>
                        </div>
                    </div>
                    <div className="h-[300px] relative">
                        {!hasMounted || chartData.length === 0 ? (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg animate-pulse">
                                <span className="text-gray-400 text-sm">Loading chart...</span>
                            </div>
                        ) : (
                            <svg viewBox="0 0 600 300" className="w-full h-full">
                                <defs>
                                    <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#16BCF8" stopOpacity="0.3" />
                                        <stop offset="100%" stopColor="#16BCF8" stopOpacity="0.05" />
                                    </linearGradient>
                                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#1B1555" />
                                        <stop offset="100%" stopColor="#16BCF8" />
                                    </linearGradient>
                                </defs>
                                {/* Grid Lines */}
                                {[0, 1, 2, 3, 4].map((i) => (
                                    <line key={i} x1="50" y1={50 + i * 50} x2="550" y2={50 + i * 50} stroke="#f3f4f6" strokeWidth="1" />
                                ))}

                                {(() => {
                                    const maxVal = Math.max(...chartData.map(d => d.revenue), 5);
                                    const yMax = Math.ceil(maxVal * 1.2);

                                    const points = chartData.map((d, i) => {
                                        const x = 50 + (i * 100);
                                        const y = 250 - ((d.revenue / yMax) * 200);
                                        return { x, y, val: d.revenue, label: d.label };
                                    });

                                    let pathD = `M ${points[0].x},${points[0].y}`;
                                    points.slice(1).forEach(p => {
                                        pathD += ` L ${p.x},${p.y}`;
                                    });
                                    const areaD = `${pathD} L ${points[points.length - 1].x},250 L ${points[0].x},250 Z`;

                                    const yLabels = [0, yMax * 0.25, yMax * 0.5, yMax * 0.75, yMax].map(v =>
                                        Math.round(v).toString()
                                    );

                                    return (
                                        <>
                                            {/* Y-axis Labels */}
                                            {yLabels.map((label, i) => (
                                                <text key={i} x="40" y={250 - i * 50} textAnchor="end" className="text-xs fill-gray-500" fontSize="12">{label}</text>
                                            ))}

                                            {/* Area Fill */}
                                            <path d={areaD} fill="url(#revenueGradient)" />

                                            {/* Line Stroke */}
                                            <path d={pathD} fill="none" stroke="url(#lineGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                                            {/* Data Points */}
                                            {points.map((p, i) => (
                                                <g key={i}>
                                                    <circle cx={p.x} cy={p.y} r="5" fill="#16BCF8" stroke="white" strokeWidth="2" />
                                                    <title>{p.val} IDs</title>
                                                </g>
                                            ))}

                                            {/* X-axis Labels */}
                                            {points.map((p, i) => (
                                                <text key={i} x={p.x} y={280} textAnchor="middle" className="text-xs fill-gray-500" fontSize="12">{p.label}</text>
                                            ))}
                                        </>
                                    );
                                })()}
                            </svg>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="col-span-3 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Recent ID Activity</h3>
                        <Activity className="h-5 w-5 text-secondary" />
                    </div>
                    <div className="space-y-4">
                        {transactions.length === 0 ? (
                            <div className="text-center py-10">
                                <FileText className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                                <p className="text-gray-400 text-sm">No recent activity</p>
                            </div>
                        ) : (
                            transactions.map((t, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${t.status === 'printed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                            }`}>
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{t.name}</p>
                                            <p className="text-[10px] text-gray-500 font-mono">
                                                {t.employeeId}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-400">
                                            {hasMounted ? new Date(t.date).toLocaleDateString() : '...'}
                                        </p>
                                        <p className={`text-[10px] uppercase font-bold ${t.status === 'printed' ? 'text-green-600' : 'text-blue-600'
                                            }`}>{t.status.replace(/_/g, ' ')}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Top Employees Table */}
            <DataTable
                title="Recent Employees"
                columns={employeeColumns}
                data={employees}
                loading={loading}
            />
        </div>
    );
}
