import { prisma } from "../lib/prisma.js";
import { logAudit, getClientIp, AUDIT_ACTIONS, TABLE_NAMES } from "../utils/auditLogger.js";

/* =========================
   CREATE EMPLOYEE
========================= */
export const createEmployee = async (req, res) => {
    try {
        const {
            fullName,
            email,
            phone,
            address,
            dob,
            nationality,
            gender,
            status,
            title,
            departmentId,
            sectionId,
            categoryId,
        } = req.body;

        if (!fullName || !email || !departmentId) {
            return res.status(400).json({ message: "Missing required fields: fullName, email, and departmentId" });
        }

        const department = await prisma.department.findUnique({
            where: { id: Number(departmentId) },
        });
        if (!department) {
            return res.status(400).json({ message: "Invalid departmentId" });
        }

        if (categoryId) {
            const category = await prisma.category.findUnique({
                where: { id: Number(categoryId) },
            });
            if (!category) {
                return res.status(400).json({ message: "Invalid categoryId" });
            }
        }

        // Photo URL from Multer/Cloudinary if applicable
        const photo = req.file ? req.file.path : null;

        const employee = await prisma.employee.create({
            data: {
                fullName,
                email,
                phone,
                address,
                dob: dob ? new Date(dob) : null,
                nationality,
                gender,
                photo,
                title,
                status: status || "active",
                departmentId: Number(departmentId),
                sectionId: sectionId ? Number(sectionId) : null,
                categoryId: categoryId ? Number(categoryId) : null,
            },
            include: {
                department: true,
                section: true,
                category: true
            },
        });

        // Log audit
        await logAudit({
            userId: req.user?.id,
            action: AUDIT_ACTIONS.CREATE,
            tableName: TABLE_NAMES.EMPLOYEE,
            recordId: employee.id,
            newData: { fullName, email, departmentId, sectionId, categoryId },
            ipAddress: getClientIp(req),
        });

        res.status(201).json(employee);
    } catch (error) {
        if (error.code === "P2002") {
            return res.status(409).json({ message: "Email already exists for another employee" });
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
                section: true,
                category: true,
                transfers: true,
                idGenerates: true
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
            include: { department: true, section: true, category: true }
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
        const {
            fullName,
            email,
            phone,
            address,
            dob,
            nationality,
            gender,
            status,
            title,
            departmentId,
            sectionId,
            categoryId
        } = req.body;

        const oldEmployee = await prisma.employee.findUnique({ where: { id: Number(id) } });
        if (!oldEmployee) return res.status(404).json({ message: "Employee not found" });

        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (email) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (address !== undefined) updateData.address = address;
        if (dob) updateData.dob = new Date(dob);
        if (nationality !== undefined) updateData.nationality = nationality;
        if (gender !== undefined) updateData.gender = gender;
        if (status) updateData.status = status;
        if (title !== undefined) updateData.title = title;
        if (departmentId) updateData.departmentId = Number(departmentId);
        if (sectionId !== undefined) updateData.sectionId = sectionId ? Number(sectionId) : null;
        if (categoryId !== undefined) updateData.categoryId = categoryId ? Number(categoryId) : null;

        if (req.file) {
            updateData.photo = req.file.path;
        }

        const employee = await prisma.employee.update({
            where: { id: Number(id) },
            data: updateData,
            include: { department: true, section: true, category: true }
        });

        await logAudit({
            userId: req.user?.id,
            action: AUDIT_ACTIONS.UPDATE,
            tableName: TABLE_NAMES.EMPLOYEE,
            recordId: Number(id),
            oldData: {
                fullName: oldEmployee.fullName,
                email: oldEmployee.email,
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
        const id = Number(req.params.id);

        const employee = await prisma.employee.findUnique({
            where: { id },
            include: {
                idGenerates: { take: 1 },
                transfers: { take: 1 }
            }
        });

        if (!employee) return res.status(404).json({ message: "Employee not found" });

        const relatedRecords = [];
        if (employee.idGenerates.length > 0) relatedRecords.push("ID Cards");
        if (employee.transfers.length > 0) relatedRecords.push("Transfers");

        if (relatedRecords.length > 0) {
            return res.status(400).json({
                message: `Cannot delete employee because there are ${relatedRecords.join(" and ")} attached.`
            });
        }

        await prisma.employee.delete({ where: { id } });

        await logAudit({
            userId: req.user?.id,
            action: AUDIT_ACTIONS.DELETE,
            tableName: TABLE_NAMES.EMPLOYEE,
            recordId: id,
            oldData: { fullName: employee.fullName, email: employee.email },
            ipAddress: getClientIp(req),
        });

        res.status(200).json({ message: "Employee deleted successfully" });
    } catch (error) {
        console.error("Delete Employee Error:", error);
        res.status(500).json({ message: "Failed to delete employee", error: error.message });
    }
};

