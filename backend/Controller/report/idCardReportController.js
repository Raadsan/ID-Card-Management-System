import { prisma } from "../../lib/prisma.js";

export const getIdCardReport = async (req, res) => {
    try {
        const { startDate, endDate, status, period } = req.query;

        // Build filter object
        const where = {};

        // Date filtering logic
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        if (period) {
            switch (period) {
                case 'today':
                    where.createdAt = {
                        gte: startOfDay,
                        lte: endOfDay
                    };
                    break;
                case 'week':
                    const startOfWeek = new Date(now);
                    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
                    startOfWeek.setHours(0, 0, 0, 0);
                    where.createdAt = {
                        gte: startOfWeek,
                        lte: endOfDay
                    };
                    break;
                case 'month':
                    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                    where.createdAt = {
                        gte: startOfMonth,
                        lte: endOfDay
                    };
                    break;
                case 'year':
                    const startOfYear = new Date(now.getFullYear(), 0, 1);
                    where.createdAt = {
                        gte: startOfYear,
                        lte: endOfDay
                    };
                    break;
                default:
                    break;
            }
        }

        // Custom date range overrides period if provided
        if (startDate && endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            where.createdAt = {
                gte: new Date(startDate),
                lte: end
            };
        }

        // Status filtering
        if (status) {
            where.status = status;
        }

        // Fetch Data
        const idCards = await prisma.idGenerate.findMany({
            where,
            include: {
                employee: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                                email: true,
                                phone: true,
                                photo: true,
                                gender: true,
                                role: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        },
                        department: {
                            select: {
                                departmentName: true,
                                description: true
                            }
                        }
                    }
                },
                template: {
                    select: {
                        name: true
                    }
                },
                createdBy: {
                    select: {
                        fullName: true
                    }
                },
                printedBy: {
                    select: {
                        fullName: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Calculate Summary Statistics
        const total = idCards.length;
        const printed = idCards.filter(card => card.status === 'printed').length;
        const pending = idCards.filter(card => card.status === 'created' || card.status === 'ready_to_print').length;

        // Calculate status breakdown for charts
        const statusBreakdown = {
            created: idCards.filter(c => c.status === 'created').length,
            ready_to_print: idCards.filter(c => c.status === 'ready_to_print').length,
            printed: idCards.filter(c => c.status === 'printed').length
        };

        const formattedData = idCards.map(card => ({
            id: card.id,
            // Employee Basic Info
            employeeId: card.employee.userId,
            employeeName: card.employee.user.fullName,
            employeeEmail: card.employee.user.email,
            employeePhoto: card.employee.user.photo,

            // Employee Details for View
            employeePhone: card.employee.user.phone,
            employeeGender: card.employee.user.gender,
            employeeRole: card.employee.user.role.name,
            employeeTitle: card.employee.title,
            employeeAddress: card.employee.address,
            employeeDob: card.employee.dob,
            employeeStatus: card.employee.status,
            employeeJoinDate: card.employee.createdAt,

            department: card.employee.department.departmentName,
            departmentDesc: card.employee.department.description,

            templateName: card.template.name,
            status: card.status,
            issueDate: card.issueDate,
            expiryDate: card.expiryDate,
            createdBy: card.createdBy.fullName,
            printedBy: card.printedBy?.fullName || "N/A",
            createdAt: card.createdAt,
            updatedAt: card.updatedAt
        }));

        res.status(200).json({
            success: true,
            summary: {
                total,
                printed,
                pending,
                statusBreakdown
            },
            data: formattedData
        });

    } catch (error) {
        console.error("Error fetching ID Card report:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
