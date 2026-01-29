import { prisma } from "../lib/prisma.js";

/* =========================
   CREATE EMPLOYEE
========================= */



export const createEmployee = async (req, res) => {
    try {
        const { employeeCode, fullName, email, phone, address, gender, dob, status, position, departmentId } = req.body;

        if (!employeeCode || !fullName || !email || !departmentId || !position || !gender || !dob || !status) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const department = await prisma.department.findUnique({
            where: { id: Number(departmentId) },
        });

        if (!department) {
            return res.status(400).json({ message: "Invalid departmentId" });
        }

        const employee = await prisma.employee.create({
            data: {
                employeeCode,
                fullName,
                email,
                phone,
                gender,
                dob: new Date(dob),
                address,
                position,
                status: status || "active",
                departmentId: Number(departmentId),
            },
            include: {
                department: true,
            },
        });

        res.status(201).json(employee);
    } catch (error) {
        console.error(error);
        if (error.code === "P2002") {
            return res.status(409).json({ message: "Employee already exists" });
        }
        res.status(500).json({ message: "Failed to create employee", error: error.message });
    }
};

export const getAllEmployees = async (req, res) => {
    try {
        const employees = await prisma.employee.findMany({
            include: { department: true }
        });
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch employees", error: error.message });
    }
};

export const getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await prisma.employee.findUnique({
            where: { id: Number(id) },
            include: { department: true }
        });
        if (!employee) return res.status(404).json({ message: "Employee not found" });
        res.status(200).json(employee);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch employee", error: error.message });
    }
};

export const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const { dob, departmentId, ...updateData } = req.body;

        const data = { ...updateData };
        if (dob) data.dob = new Date(dob);
        if (departmentId) data.departmentId = Number(departmentId);

        const employee = await prisma.employee.update({
            where: { id: Number(id) },
            data,
            include: { department: true }
        });
        res.status(200).json(employee);
    } catch (error) {
        res.status(500).json({ message: "Failed to update employee", error: error.message });
    }
};

export const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.employee.delete({
            where: { id: Number(id) }
        });
        res.status(200).json({ message: "Employee deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete employee", error: error.message });
    }
};
