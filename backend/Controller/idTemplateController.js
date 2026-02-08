import { prisma } from "../lib/prisma.js";
import path from "path";
import fs from "fs";

// Create a new ID Card Template
export const createTemplate = async (req, res) => {
    try {
        const { name, description, width, height, status, layout } = req.body;

        // Check if files are uploaded
        if (!req.files || !req.files.frontBackground) {
            return res.status(400).json({ error: "Front background image is required" });
        }

        const frontBackground = req.files.frontBackground?.[0]?.filename;
        const backBackground = req.files.backBackground?.[0]?.filename;


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

        let updateData = {
            name,
            description,
            status,
        };

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
                updateData.frontBackground = req.files.frontBackground[0].filename;
            }
            if (req.files.backBackground) {
                updateData.backBackground = req.files.backBackground[0].filename;
            }
        }

        const updatedTemplate = await prisma.idCardTemplate.update({
            where: { id: parseInt(id) },
            data: updateData,
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

        // Optional: Delete physical files
        // const template = await prisma.idCardTemplate.findUnique({ where: { id: parseInt(id) } });

        await prisma.idCardTemplate.delete({
            where: { id: parseInt(id) },
        });

        res.json({ message: "Template deleted successfully" });
    } catch (error) {
        console.error("Error deleting template:", error);
        res.status(500).json({ error: "Failed to delete template" });
    }
};
