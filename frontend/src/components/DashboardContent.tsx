"use client";

import { Users, TrendingUp, Activity, Briefcase, FileText, CheckCircle, XCircle, Clock } from "lucide-react";

export default function DashboardContent() {
    // Static stats data
    const stats = [
        {
            title: "Active IDs",
            value: "11",
            change: "+12% vs last month",
            icon: FileText,
            color: "bg-blue-100 text-blue-700",
            percentage: 11,
        },
        {
            title: "Pending IDs",
            value: "27",
            change: "-8% vs last month",
            icon: Clock,
            color: "bg-yellow-100 text-yellow-700",
            percentage: 27,
        },
        {
            title: "Completed IDs",
            value: "3",
            change: "+15% vs last month",
            icon: CheckCircle,
            color: "bg-green-100 text-green-700",
            percentage: 3,
        },
        {
            title: "Rejected IDs",
            value: "4",
            change: "+5% vs last month",
            icon: XCircle,
            color: "bg-red-100 text-red-700",
            percentage: 4,
        },
    ];

    // Static revenue data for chart (6 months)
    const revenueData = [
        { label: "Jan", revenue: 4200 },
        { label: "Feb", revenue: 3800 },
        { label: "Mar", revenue: 5100 },
        { label: "Apr", revenue: 4600 },
        { label: "May", revenue: 6200 },
        { label: "Jun", revenue: 7400 },
    ];

    // Static recent transactions
    const transactions = [
        { id: 1, name: "ID-2024-001", amount: 150, status: "completed", date: "2024-01-28", type: "New Registration" },
        { id: 2, name: "ID-2024-002", amount: 120, status: "completed", date: "2024-01-27", type: "Renewal" },
        { id: 3, name: "ID-2024-003", amount: 180, status: "completed", date: "2024-01-26", type: "Replacement" },
        { id: 4, name: "ID-2024-004", amount: 150, status: "completed", date: "2024-01-25", type: "New Registration" },
        { id: 5, name: "ID-2024-005", amount: 200, status: "completed", date: "2024-01-24", type: "Urgent Processing" },
    ];

    // Static top users data
    const topUsers = [
        { id: 1, fullname: "Ahmed Hassan", email: "ahmed@example.com", phone: "+252-61-234-5678", role: "User" },
        { id: 2, fullname: "Fatima Mohamed", email: "fatima@example.com", phone: "+252-61-234-5679", role: "User" },
        { id: 3, fullname: "Omar Ali", email: "omar@example.com", phone: "+252-61-234-5680", role: "User" },
        { id: 4, fullname: "Amina Abdi", email: "amina@example.com", phone: "+252-61-234-5681", role: "User" },
        { id: 5, fullname: "Ibrahim Yusuf", email: "ibrahim@example.com", phone: "+252-61-234-5682", role: "User" },
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
                                const maxRevenue = Math.max(...revenueData.map(d => d.revenue), 100);
                                const yMax = maxRevenue * 1.2;

                                const points = revenueData.map((d, i) => {
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
                                    v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${Math.round(v)}`
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
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="col-span-3 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                        <Activity className="h-5 w-5 text-secondary" />
                    </div>
                    <div className="space-y-4">
                        {transactions.map((t, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-green-100 text-green-600">
                                        <TrendingUp className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{t.name}</p>
                                        <p className="text-xs text-gray-500" suppressHydrationWarning>{new Date(t.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-900">${t.amount}</p>
                                    <p className="text-[10px] uppercase font-bold text-green-600">{t.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Users Table */}
            <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Applicants</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fullname</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {topUsers.map((user, index) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.fullname}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.phone}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                            {user.role}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
