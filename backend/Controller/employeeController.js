import { prisma } from "../lib/prisma.js";
import { logAudit, getClientIp, AUDIT_ACTIONS, TABLE_NAMES } from "../utils/auditLogger.js";

/* =========================
   CREATE EMPLOYEE
========================= */



export const createEmployee = async (req, res) => {
    try {
        const {
            address,
            dob,
            status,
            title,
            departmentId,
            userId,
        } = req.body;

        if (!departmentId || !userId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
        });
        if (!user) {
            return res.status(400).json({ message: "Invalid userId" });
        }

        const existingEmployee = await prisma.employee.findUnique({
            where: { userId: Number(userId) },
        });
        if (existingEmployee) {
            return res.status(409).json({
                message: "This user is already assigned as an employee",
            });
        }

        const department = await prisma.department.findUnique({
            where: { id: Number(departmentId) },
        });
        if (!department) {
            return res.status(400).json({ message: "Invalid departmentId" });
        }

        const employee = await prisma.employee.create({
            data: {
                userId: Number(userId),
                address,
                title,
                dob: dob ? new Date(dob) : null,
                status: status || "active",
                departmentId: Number(departmentId),
            },
            include: {
                department: true,
                user: true
            },
        });

        // Log audit
        await logAudit({
            userId: req.user?.id,
            action: AUDIT_ACTIONS.CREATE,
            tableName: TABLE_NAMES.EMPLOYEE,
            recordId: employee.id,
            newData: { userId, address, title, dob, status: status || "active", departmentId },
            ipAddress: getClientIp(req),
        });

        res.status(201).json(employee);
    } catch (error) {
        if (error.code === "P2002") {
            return res.status(409).json({ message: "Employee already exists" });
        }
        res.status(500).json({
            message: "Failed to create employee",
            error: error.message,
        });
    }
};

/* =========================
   GET ALL EMPLOYEES
========================= */

export const getAllEmployees = async (req, res) => {
    try {
        const { limit } = req.query;
        const employees = await prisma.employee.findMany({
            include: {
                department: true,
                user: {
                    include: { role: true }
                }
            },
            orderBy: { createdAt: "desc" },
            ...(limit && { take: Number(limit) })
        });
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch employees", error: error.message });
    }
};

/* =========================
   GET EMPLOYEE BY ID
========================= */

export const getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await prisma.employee.findUnique({
            where: { id: Number(id) },
            include: { department: true, user: true }
        });
        if (!employee) return res.status(404).json({ message: "Employee not found" });
        res.status(200).json(employee);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch employee", error: error.message });
    }
};

/* =========================
   UPDATE EMPLOYEE
========================= */

export const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const { dob, departmentId, userId, title, address, status } = req.body;

        // Get old data
        const oldEmployee = await prisma.employee.findUnique({ where: { id: Number(id) } });

        const updateData = {};
        if (dob) updateData.dob = new Date(dob);
        if (departmentId) updateData.departmentId = Number(departmentId);
        if (userId) updateData.userId = Number(userId);
        if (title) updateData.title = title;
        if (address) updateData.address = address;
        if (status) updateData.status = status;

        const employee = await prisma.employee.update({
            where: { id: Number(id) },
            data: updateData,
            include: { department: true, user: true }
        });

        // Log audit
        await logAudit({
            userId: req.user?.id,
            action: AUDIT_ACTIONS.UPDATE,
            tableName: TABLE_NAMES.EMPLOYEE,
            recordId: Number(id),
            oldData: {
                userId: oldEmployee.userId,
                address: oldEmployee.address,
                title: oldEmployee.title,
                dob: oldEmployee.dob,
                status: oldEmployee.status,
                departmentId: oldEmployee.departmentId
            },
            newData: updateData,
            ipAddress: getClientIp(req),
        });

        res.status(200).json(employee);
    } catch (error) {
        console.error("Update Employee Error:", error);
        res.status(500).json({ message: "Failed to update employee", error: error.message });
    }
};

/* ========================= 
   DELETE EMPLOYEE
========================= */

export const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const employeeId = Number(id);

        // Get employee data before deletion
        const employee = await prisma.employee.findUnique({ where: { id: employeeId } });

        // 1️⃣ Delete related DepartmentTransfer records first
        await prisma.departmentTransfer.deleteMany({
            where: { employeeId: employeeId }
        });

        // 2️⃣ Delete the employee
        await prisma.employee.delete({
            where: { id: employeeId }
        });

        // Log audit
        await logAudit({
            userId: req.user?.id,
            action: AUDIT_ACTIONS.DELETE,
            tableName: TABLE_NAMES.EMPLOYEE,
            recordId: employeeId,
            oldData: {
                userId: employee.userId,
                address: employee.address,
                title: employee.title,
                departmentId: employee.departmentId,
                status: employee.status
            },
            ipAddress: getClientIp(req),
        });

        res.status(200).json({ message: "Employee deleted successfully" });
    } catch (error) {
        console.error("Delete Employee Error:", error);
        res.status(500).json({ message: "Failed to delete employee", error: error.message });
    }
};
