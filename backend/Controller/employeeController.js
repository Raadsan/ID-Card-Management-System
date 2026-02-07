import { prisma } from "../lib/prisma.js";

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
        const { dob, departmentId, userId, ...updateData } = req.body;

        const data = { ...updateData };
        if (dob) data.dob = new Date(dob);
        if (departmentId) data.departmentId = Number(departmentId);
        if (userId) data.userId = Number(userId);

        const employee = await prisma.employee.update({
            where: { id: Number(id) },
            data,
            include: { department: true, user: true }
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

        // 1️⃣ Delete related DepartmentTransfer records first
        await prisma.departmentTransfer.deleteMany({
            where: { employeeId: employeeId }
        });

        // 2️⃣ Delete the employee
        await prisma.employee.delete({
            where: { id: employeeId }
        });

        res.status(200).json({ message: "Employee deleted successfully" });
    } catch (error) {
        console.error("Delete Employee Error:", error);
        res.status(500).json({ message: "Failed to delete employee", error: error.message });
    }
};
