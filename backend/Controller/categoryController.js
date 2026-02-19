import { prisma } from "../lib/prisma.js";
import { logAudit, getClientIp, AUDIT_ACTIONS, TABLE_NAMES } from "../utils/auditLogger.js";

/* =========================
   CREATE CATEGORY
========================= */
export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Category name is required" });
        }

        const category = await prisma.category.create({
            data: {
                name,
                description,
            },
        });

        // Log audit
        await logAudit({
            userId: req.user?.id,
            action: AUDIT_ACTIONS.CREATE,
            tableName: TABLE_NAMES.CATEGORY,
            recordId: category.id,
            newData: { name, description },
            ipAddress: getClientIp(req),
        });

        res.status(201).json({ message: "Category created successfully", category });
    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { id: "asc" }
        });
        res.status(200).json({ categories });
    } catch (error) {
        console.error("Error getting categories:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id, name, description } = req.body;

        if (!id) {
            return res.status(400).json({ message: "Category ID is required" });
        }

        // Get old data for audit log
        const oldCategory = await prisma.category.findUnique({
            where: { id: Number(id) }
        });

        if (!oldCategory) {
            return res.status(404).json({ message: "Category not found" });
        }

        const category = await prisma.category.update({
            where: {
                id: Number(id),
            },
            data: {
                name,
                description,
            },
        });

        // Log audit
        await logAudit({
            userId: req.user?.id,
            action: AUDIT_ACTIONS.UPDATE,
            tableName: TABLE_NAMES.CATEGORY,
            recordId: id,
            oldData: { name: oldCategory.name, description: oldCategory.description },
            newData: { name, description },
            ipAddress: getClientIp(req),
        });

        res.status(200).json({ message: "Category updated successfully", category });
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ message: "Category ID is required" });
        }

        // Get old data for audit log
        const oldCategory = await prisma.category.findUnique({
            where: { id: Number(id) }
        });

        if (!oldCategory) {
            return res.status(404).json({ message: "Category not found" });
        }

        const category = await prisma.category.delete({
            where: {
                id: Number(id),
            },
        });

        // Log audit
        await logAudit({
            userId: req.user?.id,
            action: AUDIT_ACTIONS.DELETE,
            tableName: TABLE_NAMES.CATEGORY,
            recordId: id,
            oldData: { name: oldCategory.name, description: oldCategory.description },
            ipAddress: getClientIp(req),
        });

        res.status(200).json({ message: "Category deleted successfully", category });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

