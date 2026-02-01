import express from "express";
import {
  createDepartmentTransfer,
  getDepartmentTransfers,
  getDepartmentTransferById,
  updateDepartmentTransfer,
  deleteDepartmentTransfer
} from "../Controller/departmentTransferController.js";
import { protect } from "../middleware/authMiddleare.js";

const router = express.Router();

router.post("/",protect, createDepartmentTransfer);
router.get("/",protect, getDepartmentTransfers);
router.get("/:id",protect, getDepartmentTransferById);
router.patch("/:id",protect, updateDepartmentTransfer);
router.delete("/:id",protect, deleteDepartmentTransfer);

export default router;

