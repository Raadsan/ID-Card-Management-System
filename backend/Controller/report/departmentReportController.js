import { prisma } from "../../lib/prisma.js";


export const getDepartmentReport = async (req, res) => {
    try {
        const { status } = req.query;

        let where = {};
        if (status && status !== 'all') {
            where.status = status;
        }

        // 1. Get Summary Stats (Total)
        const totalDepartments = await prisma.department.count();

        // 2. Get Detailed Department List with Stats
        const departments = await prisma.department.findMany({
            where,
            include: {
                employees: {
                    select: {
                        status: true
                    }
                }
            },
            orderBy: { departmentName: 'asc' }
        });

        // 3. Process Per-Department Stats
        const reportData = departments.map(dept => {
            const employees = dept.employees;
            const total = employees.length;
            const active = employees.filter(emp => emp.status === "active").length;
            const inactive = total - active;

            return {
                id: dept.id,
                name: dept.departmentName,
                totalEmployees: total,
                activeEmployees: active,
                inactiveEmployees: inactive
            };
        });

        // 4. Calculate Aggregate Stats
        const totalEmployeesAcrossDepts = reportData.reduce((acc, curr) => acc + curr.totalEmployees, 0);

        res.status(200).json({
            summary: {
                totalDepartments: totalDepartments,
                totalEmployees: totalEmployeesAcrossDepts
            },
            data: reportData
        });

    } catch (error) {
        console.error("Department Report Error:", error);
        res.status(500).json({
            message: "Failed to fetch department report",
            error: error.message
        });
    }
};
