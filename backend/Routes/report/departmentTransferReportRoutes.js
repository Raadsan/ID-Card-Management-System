import express from "express";
import { getDepartmentTransferReport } from "../../Controller/report/departmentTransferReportController.js";
import { protect } from "../../middleware/authMiddleare.js";

const router = express.Router();

router.get("/", protect, getDepartmentTransferReport);

export default router;
