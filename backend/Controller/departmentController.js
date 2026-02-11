
import { prisma } from "../lib/prisma.js";

/* =========================
   CREATE DEPARTMENT
========================= */


export const createDepartment = async (req, res) => {
    try {
        const { departmentName, description, } = req.body;
        if (!departmentName || !description) {
            return res.status(400).json({ message: "Department name and description are required" })
        }
        const department = await prisma.department.create({
            data: {
                departmentName: departmentName,
                description: description,
            }
        })
        return res.status(201).json({ message: "Department created successfully", department })
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error })
    }
}

export const getAllDepartments = async (req, res) => {
    try {
        const departments = await prisma.department.findMany()
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
            }
        })
        return res.status(200).json({ message: "Department fetched successfully", department })
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error })
    }
}

export const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { departmentName, description } = req.body;

        const updateData = {};
        if (departmentName) updateData.departmentName = departmentName;
        if (description) updateData.description = description;

        const department = await prisma.department.update({
            where: {
                id: Number(id)
            },
            data: updateData
        })
        return res.status(200).json({ message: "Department updated successfully", department })
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error })
    }
}

export const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const departmentId = Number(id);

        // Perform everything in a transaction for safety
        const result = await prisma.$transaction(async (tx) => {
            // 1️⃣ Delete all DepartmentTransfer records where this department is participating
            await tx.departmentTransfer.deleteMany({
                where: {
                    OR: [
                        { fromDepartmentId: departmentId },
                        { toDepartmentId: departmentId }
                    ]
                }
            });

            // 2️⃣ Get all employees in this department to clean up their specific transfers
            const employeesInDept = await tx.employee.findMany({
                where: { departmentId: departmentId },
                select: { id: true }
            });

            const employeeIds = employeesInDept.map(emp => emp.id);

            // 3️⃣ Delete transfers for these specific employees
            if (employeeIds.length > 0) {
                await tx.departmentTransfer.deleteMany({
                    where: { employeeId: { in: employeeIds } }
                });

                // 4️⃣ Delete the employees themselves
                await tx.employee.deleteMany({
                    where: { id: { in: employeeIds } }
                });
            }

            // 5️⃣ Finaly delete the department
            return await tx.department.delete({
                where: { id: departmentId }
            });
        });

        return res.status(200).json({ message: "Department and all associated records deleted successfully", department: result });
    } catch (error) {
        console.error("Delete Department Error:", error);
        return res.status(500).json({ message: "Failed to delete department", error: error.message });
    }
};