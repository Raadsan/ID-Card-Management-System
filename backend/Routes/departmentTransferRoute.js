import express from "express";
import {
  createDepartmentTransfer,
  getDepartmentTransfers,
  getDepartmentTransferById,
  updateDepartmentTransfer,
  deleteDepartmentTransfer
} from "../Controller/departmentTransferController.js";

const router = express.Router();

router.post("/", createDepartmentTransfer);
router.get("/", getDepartmentTransfers);
router.get("/:id", getDepartmentTransferById);
router.patch("/:id", updateDepartmentTransfer);
router.delete("/:id", deleteDepartmentTransfer);

export default router;

