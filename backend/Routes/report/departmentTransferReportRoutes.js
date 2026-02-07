import express from "express";
import { getDepartmentTransferReport } from "../../Controller/Report/departmentTransferReportController.js";
import { protect } from "../../middleware/authMiddleare.js";

const router = express.Router();

router.get("/", protect, getDepartmentTransferReport);

export default router;
