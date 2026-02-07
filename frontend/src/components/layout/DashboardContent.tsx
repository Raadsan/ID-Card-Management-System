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
    const [genderStats, setGenderStats] = useState({
        male: 0,
        female: 0,
        other: 0
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

                // Calculate gender distribution
                const genderCounts = {
                    male: employeesData.filter((emp: any) => emp.user?.gender?.toLowerCase() === 'male').length,
                    female: employeesData.filter((emp: any) => emp.user?.gender?.toLowerCase() === 'female').length,
                    other: employeesData.filter((emp: any) => {
                        const gender = emp.user?.gender?.toLowerCase();
                        return gender && gender !== 'male' && gender !== 'female';
                    }).length
                };
                setGenderStats(genderCounts);

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
                <span className="text-gray-600 font-medium text-sm">
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

            {/* Employee Gender Distribution & Recent Transactions */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Gender Distribution Pie Chart */}
                <div className="col-span-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Employee Gender Distribution</h3>
                            <p className="text-xs text-gray-500 mt-1">Total workforce composition</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                            <User className="h-4 w-4" />
                            <span>{idStats.totalEmployees} Total</span>
                        </div>
                    </div>
                    <div className="h-[300px] relative flex items-center justify-center">
                        {!hasMounted ? (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg animate-pulse">
                                <span className="text-gray-400 text-sm">Loading chart...</span>
                            </div>
                        ) : (() => {
                            const total = genderStats.male + genderStats.female + genderStats.other;
                            if (total === 0) {
                                return (
                                    <div className="text-center">
                                        <User className="h-16 w-16 text-gray-200 mx-auto mb-3" />
                                        <p className="text-gray-400 text-sm">No employee data available</p>
                                    </div>
                                );
                            }

                            const malePercent = (genderStats.male / total) * 100;
                            const femalePercent = (genderStats.female / total) * 100;
                            const otherPercent = (genderStats.other / total) * 100;

                            // Calculate pie slices with explosion effect
                            const radius = 90;
                            const centerX = 150;
                            const centerY = 150;
                            const explodeDistance = 10;

                            let currentAngle = -90; // Start from top

                            const createArc = (percentage: number, offsetX: number = 0, offsetY: number = 0) => {
                                const angle = (percentage / 100) * 360;
                                const startAngle = currentAngle;
                                const endAngle = currentAngle + angle;

                                const startRad = (startAngle * Math.PI) / 180;
                                const endRad = (endAngle * Math.PI) / 180;

                                const x1 = centerX + offsetX + radius * Math.cos(startRad);
                                const y1 = centerY + offsetY + radius * Math.sin(startRad);
                                const x2 = centerX + offsetX + radius * Math.cos(endRad);
                                const y2 = centerY + offsetY + radius * Math.sin(endRad);

                                const largeArc = angle > 180 ? 1 : 0;

                                currentAngle = endAngle;

                                return {
                                    path: `M ${centerX + offsetX} ${centerY + offsetY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`,
                                    midAngle: startAngle + angle / 2,
                                    labelX: centerX + offsetX + (radius * 0.65) * Math.cos((startAngle + angle / 2) * Math.PI / 180),
                                    labelY: centerY + offsetY + (radius * 0.65) * Math.sin((startAngle + angle / 2) * Math.PI / 180)
                                };
                            };

                            const segments = [
                                { label: 'Male', value: genderStats.male, percent: malePercent, color: '#1B1555', gradient: 'maleGradient' },
                                { label: 'Female', value: genderStats.female, percent: femalePercent, color: '#16BCF8', gradient: 'femaleGradient' },
                                { label: 'Other', value: genderStats.other, percent: otherPercent, color: '#8B5CF6', gradient: 'otherGradient' }
                            ].filter(s => s.value > 0);

                            // Reset angle for rendering
                            currentAngle = -90;

                            return (
                                <div className="w-full flex items-center justify-center">
                                    <svg viewBox="0 0 400 300" className="w-full max-w-md">
                                        <defs>
                                            <linearGradient id="maleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#2D2270" />
                                                <stop offset="100%" stopColor="#1B1555" />
                                            </linearGradient>
                                            <linearGradient id="femaleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#4DD4FF" />
                                                <stop offset="100%" stopColor="#16BCF8" />
                                            </linearGradient>
                                            <linearGradient id="otherGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#A78BFA" />
                                                <stop offset="100%" stopColor="#8B5CF6" />
                                            </linearGradient>
                                            <filter id="shadow">
                                                <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.25" />
                                            </filter>
                                        </defs>

                                        {/* Pie segments */}
                                        {segments.map((segment, idx) => {
                                            const midAngle = currentAngle + (segment.percent / 100) * 360 / 2;
                                            const offsetX = explodeDistance * Math.cos((midAngle) * Math.PI / 180);
                                            const offsetY = explodeDistance * Math.sin((midAngle) * Math.PI / 180);

                                            if (segment.percent >= 99.9) {
                                                const labelX = centerX + (radius * 0.65);
                                                const labelY = centerY;

                                                return (
                                                    <g key={idx}>
                                                        <circle
                                                            cx={centerX}
                                                            cy={centerY}
                                                            r={radius}
                                                            fill={`url(#${segment.gradient})`}
                                                            filter="url(#shadow)"
                                                            className="transition-all duration-300 hover:opacity-90 cursor-pointer"
                                                        />
                                                        <g>
                                                            <rect x={labelX - 35} y={labelY - 18} width="70" height="36" rx="6" fill="white" opacity="0.95" filter="url(#shadow)" />
                                                            <text x={labelX} y={labelY - 4} textAnchor="middle" className="text-xs font-semibold" fill={segment.color} fontSize="11">{segment.label}</text>
                                                            <text x={labelX} y={labelY + 10} textAnchor="middle" className="text-xs font-bold" fill={segment.color} fontSize="13">{segment.percent.toFixed(1)}%</text>
                                                        </g>
                                                    </g>
                                                );
                                            }

                                            const arcData = createArc(segment.percent, offsetX, offsetY);

                                            return (
                                                <g key={idx}>
                                                    <path d={arcData.path} fill={`url(#${segment.gradient})`} filter="url(#shadow)" className="transition-all duration-300 hover:opacity-90 cursor-pointer" />
                                                    <g>
                                                        <rect x={arcData.labelX - 35} y={arcData.labelY - 18} width="70" height="36" rx="6" fill="white" opacity="0.95" filter="url(#shadow)" />
                                                        <text x={arcData.labelX} y={arcData.labelY - 4} textAnchor="middle" className="text-xs font-semibold" fill={segment.color} fontSize="11">{segment.label}</text>
                                                        <text x={arcData.labelX} y={arcData.labelY + 10} textAnchor="middle" className="text-xs font-bold" fill={segment.color} fontSize="13">{segment.percent.toFixed(1)}%</text>
                                                    </g>
                                                </g>
                                            );
                                        })}

                                        {/* Center info */}
                                        <circle cx={centerX} cy={centerY} r="45" fill="white" filter="url(#shadow)" />
                                        <text x={centerX} y={centerY - 8} textAnchor="middle" className="text-3xl font-bold fill-gray-900" fontSize="28">{total}</text>
                                        <text x={centerX} y={centerY + 12} textAnchor="middle" className="text-xs fill-gray-500" fontSize="11">Employees</text>
                                    </svg>
                                </div>

                            );
                        })()}
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
