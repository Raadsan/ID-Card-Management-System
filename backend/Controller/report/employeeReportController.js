import { prisma } from "../../lib/prisma.js";
import { logAudit, getClientIp, AUDIT_ACTIONS, TABLE_NAMES } from "../../utils/auditLogger.js";


export const getEmployeeReport = async (req, res) => {
    try {
        const { status, departmentId } = req.query;

        // Log audit
        await logAudit({
            userId: req.user?.id,
            action: AUDIT_ACTIONS.VIEW,
            tableName: TABLE_NAMES.REPORT_EMPLOYEE,
            newData: { status, departmentId },
            ipAddress: getClientIp(req),
        });

        // Base filter object
        let where = {};
        if (status && status !== 'all') {
            where.status = status;
        }
        if (departmentId && departmentId !== 'all') {
            where.departmentId = Number(departmentId);
        }

        // 1. Get Summary Stats (Global)
        const totalEmployees = await prisma.employee.count();
        const activeEmployees = await prisma.employee.count({ where: { status: "active" } });
        const inactiveEmployees = await prisma.employee.count({ where: { status: { not: "active" } } });

        // 2. Get Department Distribution (Global)
        // Group by department to see how many employees are in each
        const employeesByDepartment = await prisma.employee.groupBy({
            by: ['departmentId'],
            _count: {
                id: true
            }
        });

        // 3. Fetch Department Details for the Grouped Data
        // Since groupBy doesn't support 'include', we fetch department names separately
        const departmentStats = await Promise.all(employeesByDepartment.map(async (group) => {
            const dept = await prisma.department.findUnique({
                where: { id: group.departmentId },
                select: { departmentName: true }
            });
            return {
                departmentId: group.departmentId,
                departmentName: dept ? dept.departmentName : "Unknown Department",
                count: group._count.id
            };
        }));

        // 4. Get Filtered Employee List
        // This list respects the query parameters (status, departmentId)
        const employees = await prisma.employee.findMany({
            where,
            include: {
                user: {
                    select: {
                        fullName: true,
                        email: true,
                        role: { select: { name: true } }
                    }
                },
                department: {
                    select: {
                        departmentName: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // 5. Construct Final Response
        res.status(200).json({
            summary: {
                total: totalEmployees,
                active: activeEmployees,
                inactive: inactiveEmployees,
                totalDepartments: departmentStats.length
            },
            departmentDistribution: departmentStats,
            data: employees
        });

    } catch (error) {
        console.error("Employee Report Error:", error);
        res.status(500).json({
            message: "Failed to fetch employee report",
            error: error.message
        });
    }
};
