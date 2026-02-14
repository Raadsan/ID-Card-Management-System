import { prisma } from "../../lib/prisma.js";
import { logAudit, getClientIp, AUDIT_ACTIONS, TABLE_NAMES } from "../../utils/auditLogger.js";



export const getDepartmentTransferReport = async (req, res) => {
    try {
        const { startDate, endDate, period } = req.query;

        // Log audit
        await logAudit({
            userId: req.user?.id,
            action: AUDIT_ACTIONS.VIEW,
            tableName: TABLE_NAMES.REPORT_TRANSFER,
            newData: { startDate, endDate, period },
            ipAddress: getClientIp(req),
        });

        let where = {};

        // Date filtering logic
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        if (period) {
            switch (period) {
                case 'today':
                    where.transferDate = {
                        gte: startOfDay,
                        lte: endOfDay
                    };
                    break;
                case 'week':
                    // Last 7 days
                    const lastWeekDate = new Date();
                    lastWeekDate.setDate(lastWeekDate.getDate() - 7);
                    lastWeekDate.setHours(0, 0, 0, 0);
                    where.transferDate = {
                        gte: lastWeekDate
                    };
                    break;
                case 'month':
                    // Last 30 days
                    const lastMonthDate = new Date();
                    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
                    lastMonthDate.setHours(0, 0, 0, 0);
                    where.transferDate = {
                        gte: lastMonthDate
                    };
                    break;
                case 'year':
                    // Last 365 days
                    const lastYearDate = new Date();
                    lastYearDate.setFullYear(lastYearDate.getFullYear() - 1);
                    lastYearDate.setHours(0, 0, 0, 0);
                    where.transferDate = {
                        gte: lastYearDate
                    };
                    break;
            }
        }

        // Custom date range overrides period if provided
        if (startDate && endDate) {
            // Ensure we cover the full day for endDate
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            where.transferDate = {
                gte: new Date(startDate),
                lte: end
            };
        }

        // Fetch transfers
        const transfers = await prisma.departmentTransfer.findMany({
            where,
            include: {
                employee: {
                    include: {
                        user: { select: { fullName: true } }
                    }
                },
                fromDepartment: { select: { departmentName: true } },
                toDepartment: { select: { departmentName: true } },
                authorizedBy: { select: { fullName: true } }
            },
            orderBy: { transferDate: 'desc' }
        });

        // Calculate summary stats
        const totalTransfers = transfers.length;
        // Count unique employees transferred
        const uniqueEmployees = new Set(transfers.map(t => t.employeeId)).size;

        res.status(200).json({
            summary: {
                totalTransfers,
                uniqueEmployees,
                period: period || 'custom'
            },
            data: transfers.map(t => ({
                id: t.id,
                employeeName: t.employee?.user?.fullName || "Unknown",
                fromDept: t.fromDepartment?.departmentName || "N/A",
                toDept: t.toDepartment?.departmentName || "N/A",
                date: t.transferDate,
                authorizedBy: t.authorizedBy?.fullName || "System",
                reason: t.reason
            }))
        });

    } catch (error) {
        console.error("Transfer Report Error:", error);
        res.status(500).json({
            message: "Failed to fetch transfer report",
            error: error.message
        });
    }
};
