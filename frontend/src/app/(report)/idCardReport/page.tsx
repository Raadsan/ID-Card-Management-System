"use client";

import { useState, useEffect } from "react";
import {
    Download,
    Printer,
    Search,
    CreditCard,
    CheckCircle,
    Clock,
    Filter,
    Eye,
    X,
    Calendar
} from "lucide-react";
import { getIdCardReport } from "@/api/reportApi";
import DataTable from "@/components/layout/DataTable";

export default function IdCardReportPage() {
    const [idCards, setIdCards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Filter State
    const [period, setPeriod] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Modal State
    const [selectedCard, setSelectedCard] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        printed: 0,
        pending: 0
    });

    // Fetch Report Data
    useEffect(() => {
        const fetchReport = async () => {
            try {
                setLoading(true);
                const data = await getIdCardReport({
                    startDate: period === 'custom' ? startDate : undefined,
                    endDate: period === 'custom' ? endDate : undefined,
                    status: statusFilter,
                    period: period !== 'custom' ? period : undefined
                });

                if (data) {
                    setIdCards(data.data || []);
                    setStats(data.summary || { total: 0, printed: 0, pending: 0 });
                }
            } catch (error) {
                console.error("Failed to fetch ID card report:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [startDate, endDate, statusFilter, period]);

    // Client-side search
    const filteredIdCards = idCards.filter(card => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            (card.employeeName?.toLowerCase().includes(term)) ||
            (card.employeeId?.toString().includes(term)) ||
            (card.department?.toLowerCase().includes(term))
        );
    });

    const handlePrint = () => {
        window.print();
    };

    const handleExportCSV = () => {
        const headers = ["Card ID", "Employee", "Department", "Template", "Status", "Created By", "Created At", "Printed By", "Printed At"];
        const rows = filteredIdCards.map(card => [
            card.id,
            card.employeeName,
            card.department,
            card.templateName,
            card.status,
            card.createdBy,
            new Date(card.createdAt).toLocaleDateString(),
            card.printedBy,
            card.updatedAt ? new Date(card.updatedAt).toLocaleDateString() : 'N/A'
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(r => r.map(cell => `"${cell}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `ID_Card_Report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleViewDetails = (card: any) => {
        setSelectedCard(card);
        setIsModalOpen(true);
    };

    const columns = [
        {
            label: "ID",
            key: "employeeId",
            width: "50px",
            align: "center",
        },
        {
            label: "EMPLOYEE",
            key: "employeeName",
            render: (row: any) => (
                <div className="flex items-center gap-3">
                    {row.employeePhoto ? (
                        <img
                            src={row.employeePhoto}
                            alt={row.employeeName}
                            className="w-8 h-8 rounded-full object-cover border border-gray-200"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold">
                            {row.employeeName.charAt(0)}
                        </div>
                    )}
                    <div>
                        <div className="font-semibold text-gray-900">{row.employeeName}</div>
                    </div>
                </div>
            )
        },
        {
            label: "EMAIL",
            key: "employeeEmail",
            render: (row: any) => <span className="text-gray-500 text-xs">{row.employeeEmail}</span>
        },
        {
            label: "TITLE",
            key: "employeeTitle",
            render: (row: any) => <span className="text-gray-600 text-xs font-medium">{row.employeeTitle || 'N/A'}</span>
        },
        {
            label: "DEPARTMENT",
            key: "department",
            render: (row: any) => <span className="text-gray-600 text-xs">{row.department}</span>
        },
        {
            label: "STATUS",
            key: "status",
            align: "center",
            render: (row: any) => {
                let colorClass = "bg-gray-100 text-gray-600";
                if (row.status === 'printed') colorClass = "bg-emerald-50 text-emerald-700 border border-emerald-100";
                if (row.status === 'ready_to_print') colorClass = "bg-blue-50 text-blue-700 border border-blue-100";
                if (row.status === 'created') colorClass = "bg-amber-50 text-amber-700 border border-amber-100";
                if (row.status === 'replaced') colorClass = "bg-orange-50 text-orange-700 border border-orange-100";

                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${colorClass}`}>
                        {row.status.replace(/_/g, " ")}
                    </span>
                );
            }
        },
        {
            label: "ACTION",
            key: "action",
            align: "center",
            width: "80px",
            render: (row: any) => (
                <button
                    onClick={() => handleViewDetails(row)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
                >
                    <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
            )
        }
    ];

    const periods = [
        { id: 'all', label: 'All Time' },
        { id: 'today', label: 'Today' },
        { id: 'week', label: 'Last Week' },
        { id: 'month', label: 'Month' },
        { id: 'year', label: 'Year' },
        { id: 'custom', label: 'Custom' },
    ];

    return (
        <div className="space-y-6 pb-10 animate-in fade-in duration-500 font-sans relative">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
                {/* ... existing header ... */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">ID Card Report</h1>
                    <p className="text-sm text-gray-500 font-medium">Tracking all generated and printed ID cards</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium shadow-md shadow-gray-200 hover:bg-gray-800 transition-colors"
                    >
                        <Printer className="w-4 h-4" />
                        Print
                    </button>
                </div>
            </div>

            {/* Date Filter Tabs & Stats Row */}
            <div className="space-y-4">
                {/* Period Tabs */}
                <div className="flex flex-wrap items-center gap-2 print:hidden">
                    {periods.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setPeriod(p.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === p.id
                                ? "bg-gray-900 text-white shadow-md shadow-gray-200"
                                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* Custom Date Picker */}
                {period === 'custom' && (
                    <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-200 w-fit animate-in fade-in slide-in-from-top-2">
                        <Calendar className="w-4 h-4 text-gray-400 ml-2" />
                        <input
                            type="date"
                            className="bg-transparent border-none text-gray-700 text-sm focus:ring-0"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            type="date"
                            className="bg-transparent border-none text-gray-700 text-sm focus:ring-0"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                )}

                {/* Stats Cards - Forced Grid Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="p-3 bg-violet-100 rounded-xl text-violet-600">
                                <CreditCard className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl font-bold text-gray-900">{stats.total}</h3>
                            <p className="text-sm text-gray-400 font-medium mt-1">Total Generated</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl font-bold text-gray-900">{stats.printed}</h3>
                            <p className="text-sm text-gray-400 font-medium mt-1">printed Successfully</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
                                <Clock className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl font-bold text-gray-900">{stats.pending}</h3>
                            <p className="text-sm text-gray-400 font-medium mt-1">Pending Print</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between gap-4">
                    <h3 className="text-lg font-bold text-gray-900 whitespace-nowrap">ID Verification Log</h3>

                    <div className="flex items-center gap-4 w-full justify-end">
                        <select
                            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="created">Created</option>
                            <option value="ready_to_print">Ready to Print</option>
                            <option value="printed">Printed</option>
                            <option value="replaced">Replaced</option>
                        </select>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none w-64 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="print:m-0 print:border-none print:shadow-none">
                    <DataTable
                        title=""
                        columns={columns}
                        data={filteredIdCards}
                        loading={loading}
                        showAddButton={false}
                        showSearch={false}
                    />
                </div>
            </div>

            {/* View Details Modal */}
            {isModalOpen && selectedCard && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Employee Details</h3>
                                    <p className="text-xs text-gray-500">Full information card</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 bg-gray-50/50">

                            {/* Personal Information Section */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-4 text-gray-900 font-bold border-b border-gray-50 pb-2">
                                    <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                                    Personal Information
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Full Name</p>
                                        <p className="text-base font-semibold text-gray-900">{selectedCard.employeeName}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Email</p>
                                        <p className="text-base font-medium text-gray-700">{selectedCard.employeeEmail}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Phone</p>
                                        <p className="text-base font-medium text-gray-700">{selectedCard.employeePhone || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Gender</p>
                                        <p className="text-base font-medium text-gray-700 capitalize">{selectedCard.employeeGender || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Date of Birth</p>
                                        <p className="text-base font-medium text-gray-700">
                                            {selectedCard.employeeDob ? new Date(selectedCard.employeeDob).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Professional Information Section */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-4 text-gray-900 font-bold border-b border-gray-50 pb-2">
                                    <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                                    Professional Information
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Job Title</p>
                                        <p className="text-base font-semibold text-blue-600">{selectedCard.employeeTitle || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Department</p>
                                        <p className="text-base font-medium text-gray-700">{selectedCard.department}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">System Role</p>
                                        <p className="text-base font-medium text-gray-700 capitalize">{selectedCard.employeeRole || 'User'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Join Date</p>
                                        <p className="text-base font-medium text-gray-700">
                                            {selectedCard.employeeJoinDate ? new Date(selectedCard.employeeJoinDate).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Status</p>
                                        <span className={`inline-flex px-2 py-0.5 rounded text-sm font-medium capitalize ${selectedCard.employeeStatus === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                            {selectedCard.employeeStatus || 'Active'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Location Section */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-4 text-gray-900 font-bold border-b border-gray-50 pb-2">
                                    <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                                    Location & Additional Details
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Office Address</p>
                                    <p className="text-base font-medium text-gray-700">{selectedCard.employeeAddress || 'Headquarters'}</p>
                                </div>
                            </div>

                            {/* ID Card System Info Section */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-4 text-gray-900 font-bold border-b border-gray-50 pb-2">
                                    <div className="w-1 h-4 bg-amber-500 rounded-full"></div>
                                    ID Card System Details
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-xl space-y-1">
                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Created By</p>
                                        <p className="font-semibold text-gray-900">{selectedCard.createdBy}</p>
                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(selectedCard.createdAt).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-xl space-y-1">
                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Printed By</p>
                                        <p className="font-semibold text-gray-900">{selectedCard.printedBy || 'Not Printed'}</p>
                                        {selectedCard.status === 'printed' && (
                                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {selectedCard.updatedAt ? new Date(selectedCard.updatedAt).toLocaleString() : 'N/A'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-between items-center text-sm border-t border-gray-100 pt-3">
                                    <span className="text-gray-500 font-medium">Card Template: {selectedCard.templateName}</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${selectedCard.status === 'printed' ? 'bg-emerald-100 text-emerald-700' :
                                        selectedCard.status === 'ready_to_print' ? 'bg-blue-100 text-blue-700' :
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                        {selectedCard.status.replace(/_/g, " ")}
                                    </span>
                                </div>
                            </div>

                        </div>

                        <div className="p-4 bg-white border-t border-gray-200 flex justify-end sticky bottom-0 z-10">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium transition-colors shadow-lg shadow-gray-200"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Print Only Footer */}
            <div className="hidden print:block mt-8 text-center border-t border-gray-200 pt-4">
                <p className="text-xs text-gray-400 uppercase tracking-widest">Confidential Report • ID Management System • {new Date().toLocaleDateString()}</p>
            </div>
        </div>
    );
}
