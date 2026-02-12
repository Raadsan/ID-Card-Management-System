import { prisma } from "../lib/prisma.js";
import { nanoid } from "nanoid";

/**
 * CREATE ID
 */
export const createIdGenerate = async (req, res) => {
    try {
        const { employeeId, templateId, issueDate, expiryDate } = req.body;
        const createdById = req.user.id; // from auth middleware

        const idGenerate = await prisma.idGenerate.create({
            data: {
                employeeId: Number(employeeId),
                templateId: Number(templateId),
                createdById: Number(createdById),
                qrCode: nanoid(),
                issueDate: issueDate ? new Date(issueDate) : null,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
            },
        });

        res.status(201).json({
            message: "ID generated successfully",
            data: idGenerate,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * GET ALL IDS
 */
export const getAllIdGenerates = async (req, res) => {
    try {
        const data = await prisma.idGenerate.findMany({
            include: {
                employee: { include: { user: true, department: true } },
                template: true,
                createdBy: true,
                printedBy: true,
            },
        });

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * GET SINGLE ID
 */
export const getIdGenerateById = async (req, res) => {
    try {
        const { id } = req.params;

        const data = await prisma.idGenerate.findUnique({
            where: { id: Number(id) },
            include: {
                employee: { include: { user: true, department: true } },
                template: true,
            },
        });

        if (!data) {
            return res.status(404).json({ message: "ID not found" });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * MARK READY TO PRINT
 */
export const markReadyToPrint = async (req, res) => {
    try {
        const { id } = req.params;

        const updated = await prisma.idGenerate.update({
            where: { id: Number(id) },
            data: { status: "ready_to_print" },
        });

        res.json({
            message: "ID marked as ready to print",
            data: updated,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * PRINT ID
 */
export const printIdGenerate = async (req, res) => {
    try {
        const { id } = req.params;
        const printedById = req.user.id;

        const updated = await prisma.idGenerate.update({
            where: { id: Number(id) },
            data: {
                status: "printed",
                printedById: Number(printedById),
            },
            include: {
                createdBy: true,
                printedBy: true,
                employee: {
                    include: {
                        user: true,
                        department: true
                    }
                },
                template: true
            }
        });

        res.json({
            message: "ID printed successfully",
            data: updated,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * VERIFY QR CODE
 */
export const verifyQrCode = async (req, res) => {
    try {
        const { qrCode } = req.params;

        const data = await prisma.idGenerate.findUnique({
            where: { qrCode },
            include: {
                employee: { include: { user: true, department: true } },
                template: true,
            },
        });

        if (!data) {
            return res.status(404).json({
                message: "Invalid QR Code",
                valid: false,
                reason: "invalid_qr"
            });
        }

        // Check if ID card itself is printed
        if (data.status !== "printed") {
            return res.status(400).json({
                message: "ID is not printed",
                valid: false,
                reason: "not_printed"
            });
        }

        // Check if ID card has expired
        if (data.expiryDate < new Date()) {
            return res.status(400).json({
                message: "ID has expired",
                valid: false,
                reason: "expired"
            });
        }

        // Check if Employee is inactive
        if (data.employee?.status === "inactive") {
            return res.status(400).json({
                message: "Employee ID is inactive",
                valid: false,
                reason: "employee_inactive"
            });
        }

        res.json({
            valid: true,
            data,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * DELETE ID
 */
export const deleteIdGenerate = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.idGenerate.delete({
            where: { id: Number(id) },
        });

        res.json({ message: "ID deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
