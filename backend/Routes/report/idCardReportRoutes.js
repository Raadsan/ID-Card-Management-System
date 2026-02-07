import express from "express";
import { getIdCardReport } from "../../Controller/report/idCardReportController.js";
import { protect } from "../../middleware/authMiddleare.js";

const router = express.Router();

router.get("/id-report", protect, getIdCardReport);

export default router;
