import express from "express";
import { getDepartmentReport } from "../../Controller/report/departmentReportController.js";
import { protect } from "../../middleware/authMiddleare.js";

const router = express.Router();

router.get("/", protect, getDepartmentReport);

export default router;
