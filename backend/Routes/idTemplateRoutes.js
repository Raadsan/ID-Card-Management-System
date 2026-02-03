import express from "express";
import {
    createTemplate,
    getAllTemplates,
    getTemplateById,
    updateTemplate,
    deleteTemplate
} from "../Controller/idTemplateController.js";
import upload from "../utils/malter.js"; // Note: User had typo 'malter.js'

const router = express.Router();

// Define upload fields
// 'frontBackground' and 'backBackground' match the schema and form data keys
const templateUpload = upload.fields([
    { name: 'frontBackground', maxCount: 1 },
    { name: 'backBackground', maxCount: 1 }
]);

router.post("/", templateUpload, createTemplate);
router.get("/", getAllTemplates);
router.get("/:id", getTemplateById);
router.put("/:id", templateUpload, updateTemplate);
router.delete("/:id", deleteTemplate);

export default router;
