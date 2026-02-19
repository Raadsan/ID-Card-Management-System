import { prisma } from "../lib/prisma.js";
import { logAudit, getClientIp, AUDIT_ACTIONS, TABLE_NAMES } from "../utils/auditLogger.js";

/* =========================
   CREATE DEPARTMENT
========================= */


export const createDepartment = async (req, res) => {
    try {
        console.log("Create Department Payload:", req.body);
        const { departmentName, description, sections } = req.body; // sections is expected to be string[]
        if (!departmentName || !description) {
            return res.status(400).json({ message: "Department name and description are required" })
        }

        const department = await prisma.department.create({
            data: {
                departmentName: departmentName,
                description: description,
                sections: {
                    create: (sections || []).map(name => ({ name }))
                }
            },
            include: { sections: true }
        })

        // Log audit
        await logAudit({
            userId: req.user?.id,
            action: AUDIT_ACTIONS.CREATE,
            tableName: TABLE_NAMES.DEPARTMENT,
            recordId: department.id,
            newData: { departmentName, description, sections },
            ipAddress: getClientIp(req),
        });

        return res.status(201).json({ message: "Department created successfully", department })
    } catch (error) {
        console.error("Create Department Error Details:", error);
        return res.status(500).json({
            message: error.message || "Internal Server Error",
            error: error
        })
    }
}

export const getAllDepartments = async (req, res) => {
    try {
        const departments = await prisma.department.findMany({
            include: { sections: true }
        })
        return res.status(200).json({ message: "Departments fetched successfully", departments })
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error })
    }
}
export const getDepartmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const department = await prisma.department.findUnique({
            where: {
                id: Number(id)
            },
            include: { sections: true }
        })
        return res.status(200).json({ message: "Department fetched successfully", department })
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error })
    }
}

export const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { departmentName, description, sections } = req.body; // sections is expected to be string[]

        // Get old data
        const oldDepartment = await prisma.department.findUnique({
            where: { id: Number(id) },
            include: { sections: true }
        });

        const updateData = {};
        if (departmentName) updateData.departmentName = departmentName;
        if (description) updateData.description = description;

        if (sections !== undefined) {
            updateData.sections = {
                deleteMany: {}, // Remove all existing sections
                create: sections.map(name => ({ name })) // Add new sections
            }
        }

        const department = await prisma.department.update({
            where: {
                id: Number(id)
            },
            data: updateData,
            include: { sections: true }
        })

        // Log audit
        await logAudit({
            userId: req.user?.id,
            action: AUDIT_ACTIONS.UPDATE,
            tableName: TABLE_NAMES.DEPARTMENT,
            recordId: Number(id),
            oldData: {
                departmentName: oldDepartment.departmentName,
                description: oldDepartment.description,
                sections: oldDepartment.sections.map(s => s.name)
            },
            newData: {
                ...updateData,
                sections: sections // Log the names
            },
            ipAddress: getClientIp(req),
        });

        return res.status(200).json({ message: "Department updated successfully", department })
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error })
    }
}

export const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const departmentId = Number(id);

        // 1️⃣ Check if department exists and has relations
        const department = await prisma.department.findUnique({
            where: { id: departmentId },
            include: {
                employees: { take: 1 },
                transfersFrom: { take: 1 },
                transfersTo: { take: 1 },
                idGenerates: { take: 1 },
                sections: true
            }
        });

        if (!department) return res.status(404).json({ message: "Waaxda (Department) lama helin" });

        // 2️⃣ Check for related records
        const relatedRecords = [];
        if (department.employees.length > 0) relatedRecords.push("Shaqaale (Employees)");
        if (department.transfersFrom.length > 0 || department.transfersTo.length > 0) relatedRecords.push("Wareejin (Transfers)");
        if (department.idGenerates.length > 0) relatedRecords.push("ID Cards");

        if (relatedRecords.length > 0) {
            const tableList = relatedRecords.join(" iyo ");
            return res.status(400).json({
                message: `Ma tirtiri kartid waaxdan sababtoo ah waxaa jira ${tableList} ku xiran. Fadlan marka hore ka saar xogtaas.`
            });
        }

        // 3️⃣ Perform Delete
        const result = await prisma.department.delete({ where: { id: departmentId } });

        // Log audit
        await logAudit({
            userId: req.user?.id,
            action: AUDIT_ACTIONS.DELETE,
            tableName: TABLE_NAMES.DEPARTMENT,
            recordId: departmentId,
            oldData: {
                departmentName: department.departmentName,
                description: department.description,
                sections: department.sections.map(s => s.name)
            },
            ipAddress: getClientIp(req),
        });

        return res.status(200).json({ message: "Department and all associated records deleted successfully", department: result });
    } catch (error) {
        console.error("Delete Department Error:", error);
        return res.status(500).json({ message: "Failed to delete department", error: error.message });
    }
};