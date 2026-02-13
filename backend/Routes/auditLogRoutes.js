import express from "express";
import {
    createAuditLog,
    getAuditLogs,
    getAuditLogById,
    getAuditLogsByUser,
    getAuditLogsByTable,
    deleteAuditLog,
} from "../Controller/auditLogController.js";
import { protect } from "../middleware/authMiddleare.js";

const router = express.Router();

// Get all audit logs with optional filters
router.get("/", protect, getAuditLogs);

// Create new audit log
router.post("/", protect, createAuditLog);

// Get audit logs by user
router.get("/user/:userId", protect, getAuditLogsByUser);

// Get audit logs by table
router.get("/table/:tableName", protect, getAuditLogsByTable);

// Get single audit log by ID
router.get("/:id", protect, getAuditLogById);

// Delete audit log
router.delete("/:id", protect, deleteAuditLog);

export default router;
