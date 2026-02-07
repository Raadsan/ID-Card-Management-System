import express from "express";
import { getEmployeeReport } from "../../Controller/report/employeeReportController.js";
import { protect } from "../../middleware/authMiddleare.js";

const router = express.Router();

router.get("/", protect, getEmployeeReport);

export default router;
