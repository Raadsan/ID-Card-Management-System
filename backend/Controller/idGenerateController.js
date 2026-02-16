import { prisma } from "../lib/prisma.js";
import { nanoid } from "nanoid";
import { logAudit, getClientIp, AUDIT_ACTIONS, TABLE_NAMES } from "../utils/auditLogger.js";

/**
 * CREATE ID
 */
export const createIdGenerate = async (req, res) => {
    try {
        const { employeeId, templateId, issueDate, expiryDate } = req.body;
        const createdById = req.user.id; // from auth middleware

        // 1️⃣ Fetch employee's current department before creating the ID record
        const employee = await prisma.employee.findUnique({
            where: { id: Number(employeeId) },
            select: { departmentId: true }
        });

        const idGenerate = await prisma.idGenerate.create({
            data: {
                employeeId: Number(employeeId),
                templateId: Number(templateId),
                departmentId: employee?.departmentId || null,
                createdById: Number(createdById),
                qrCode: nanoid(),
                issueDate: issueDate ? new Date(issueDate) : null,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
            },
        });

        // Log audit
        await logAudit({
            userId: req.user?.id,
            action: AUDIT_ACTIONS.CREATE,
            tableName: TABLE_NAMES.ID_GENERATE,
            recordId: idGenerate.id,
            newData: { employeeId, templateId, issueDate, expiryDate },
            ipAddress: getClientIp(req),
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
                department: true,
                createdBy: true,
                printedBy: true,
            },
        });

        res.json(data);
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            error: error.toString(),
            stack: error.stack
        });
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

        // Log audit
        await logAudit({
            userId: req.user?.id,
            action: AUDIT_ACTIONS.PRINT,
            tableName: TABLE_NAMES.ID_GENERATE,
            recordId: Number(id),
            newData: { status: "printed", printedById },
            ipAddress: getClientIp(req),
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
        const recordId = Number(id);

        // 1️⃣ Check if record exists
        const idGenerate = await prisma.idGenerate.findUnique({ where: { id: recordId } });
        if (!idGenerate) return res.status(404).json({ message: "Xogtan lama helin" });

        // 2️⃣ Perform Delete
        await prisma.idGenerate.delete({
            where: { id: recordId },
        });

        // Log audit
        await logAudit({
            userId: req.user?.id,
            action: AUDIT_ACTIONS.DELETE,
            tableName: TABLE_NAMES.ID_GENERATE,
            recordId: recordId,
            oldData: { employeeId: idGenerate.employeeId, templateId: idGenerate.templateId, status: idGenerate.status },
            ipAddress: getClientIp(req),
        });

        res.json({ message: "Xogta ID-ga waa la tirtiray si guul ah" });
    } catch (error) {
        console.error("DELETE_ID_ERROR:", error);

        if (error.code === "P2003") {
            return res.status(400).json({
                message: "Ma tirtiri kartid xogtan sababtoo ah waxaa jira xog kale oo ku xiran."
            });
        }

        res.status(500).json({ message: "Wuu ku guuldareystay tirtirista xogta ID-ga.", error: error.message });
    }
};
