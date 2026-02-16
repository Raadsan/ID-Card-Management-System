import { prisma } from "../lib/prisma.js";
import path from "path";
import fs from "fs";
import { logAudit, getClientIp, AUDIT_ACTIONS, TABLE_NAMES } from "../utils/auditLogger.js";

// Create a new ID Card Template
export const createTemplate = async (req, res) => {
    try {
        const { name, description, width, height, status, layout } = req.body;

        // Check if files are uploaded
        if (!req.files || !req.files.frontBackground) {
            return res.status(400).json({ error: "Front background image is required" });
        }

        const frontBackground = req.files.frontBackground?.[0]?.path;
        const backBackground = req.files.backBackground?.[0]?.path;


        // Convert string to numbers (multipart/form-data sends strings)
        const numWidth = parseInt(width);
        const numHeight = parseInt(height);

        if (isNaN(numWidth) || isNaN(numHeight)) {
            return res.status(400).json({ error: "Width and Height must be numbers" });
        }

        let parsedLayout = null;
        if (layout) {
            try {
                parsedLayout = JSON.parse(layout);
            } catch (e) {
                console.error("Invalid layout JSON:", e);
                // defaulting to null or handling error? Let's proceed with null but maybe warn?
            }
        }

        const template = await prisma.idCardTemplate.create({
            data: {
                name,
                description,
                width: numWidth,
                height: numHeight,
                frontBackground,
                backBackground,

                status: status || "active",
                layout: parsedLayout,
            },
        });

        // Log audit
        await logAudit({
            userId: req.user?.id,
            action: AUDIT_ACTIONS.CREATE,
            tableName: TABLE_NAMES.ID_CARD_TEMPLATE,
            recordId: template.id,
            newData: { name, description, width: numWidth, height: numHeight, status: status || "active", layout: parsedLayout },
            ipAddress: getClientIp(req),
        });

        res.status(201).json(template);
    } catch (error) {
        console.error("Error creating template:", error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: "A template with this name already exists" });
        }
        res.status(500).json({ error: "Failed to create template" });
    }
};

// Get all templates
export const getAllTemplates = async (req, res) => {
    try {
        const templates = await prisma.idCardTemplate.findMany({
            orderBy: { createdAt: "desc" },
        });
        res.json(templates);
    } catch (error) {
        console.error("Error fetching templates:", error);
        res.status(500).json({ error: "Failed to fetch templates" });
    }
};

// Get single template
export const getTemplateById = async (req, res) => {
    try {
        const { id } = req.params;
        const template = await prisma.idCardTemplate.findUnique({
            where: { id: parseInt(id) },
        });

        if (!template) {
            return res.status(404).json({ error: "Template not found" });
        }

        res.json(template);
    } catch (error) {
        console.error("Error fetching template:", error);
        res.status(500).json({ error: "Failed to fetch template" });
    }
};

// Update template
export const updateTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, width, height, status, layout } = req.body;

        // Find existing template first to handle file replacement
        const existingTemplate = await prisma.idCardTemplate.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingTemplate) {
            return res.status(404).json({ error: "Template not found" });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (status) updateData.status = status;
        if (width) updateData.width = parseInt(width);
        if (height) updateData.height = parseInt(height);

        if (layout) {
            try {
                updateData.layout = JSON.parse(layout);
            } catch (e) {
                console.error("Invalid layout JSON:", e);
            }
        }

        // Handle Image Updates
        if (req.files) {
            if (req.files.frontBackground) {
                // Delete old image if exists
                // (Optional: Implement file deletion logic here if strictly required, skipping for now to focus on logic)
                updateData.frontBackground = req.files.frontBackground[0].path;
            }
            if (req.files.backBackground) {
                updateData.backBackground = req.files.backBackground[0].path;
            }
        }

        const updatedTemplate = await prisma.idCardTemplate.update({
            where: { id: parseInt(id) },
            data: updateData,
        });

        // Log audit
        await logAudit({
            userId: req.user?.id,
            action: AUDIT_ACTIONS.UPDATE,
            tableName: TABLE_NAMES.ID_CARD_TEMPLATE,
            recordId: parseInt(id),
            oldData: {
                name: existingTemplate.name,
                description: existingTemplate.description,
                status: existingTemplate.status,
                width: existingTemplate.width,
                height: existingTemplate.height,
                layout: existingTemplate.layout
            },
            newData: updateData,
            ipAddress: getClientIp(req),
        });

        res.json(updatedTemplate);
    } catch (error) {
        console.error("Error updating template:", error);
        res.status(500).json({ error: "Failed to update template" });
    }
};

// Delete template
export const deleteTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const templateId = parseInt(id);

        // 1. Check if template is used in any generated IDs
        const usageCount = await prisma.idGenerate.count({
            where: { templateId: templateId }
        });

        if (usageCount > 0) {
            return res.status(400).json({
                message: "Ma tirtiri kartid template-kaan sababtoo ah waxaa jira ID-yo loo isticmaalay. Fadlan tirtir ID-yadaas marka hore."
            });
        }

        // 2. Get template details to find file paths
        const template = await prisma.idCardTemplate.findUnique({
            where: { id: templateId }
        });

        if (!template) {
            return res.status(404).json({ error: "Template-ka lama helin" });
        }

        // 3. Delete physical files if they exist
        const deleteFile = (filename) => {
            if (filename) {
                const filePath = path.join("uploads", filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        };

        deleteFile(template.frontBackground);
        deleteFile(template.backBackground);

        // 4. Delete from database
        await prisma.idCardTemplate.delete({
            where: { id: templateId },
        });

        // Log audit
        await logAudit({
            userId: req.user?.id,
            action: AUDIT_ACTIONS.DELETE,
            tableName: TABLE_NAMES.ID_CARD_TEMPLATE,
            recordId: templateId,
            oldData: { name: template.name, description: template.description },
            ipAddress: getClientIp(req),
        });

        res.json({ message: "Template-ka waa la tirtiray si guul ah" });
    } catch (error) {
        console.error("Error deleting template:", error);
        res.status(500).json({
            error: "Wuu ku guuldareystay tirtirista template-ka.",
            details: error.message
        });
    }
};
