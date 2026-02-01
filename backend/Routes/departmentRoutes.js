import express from "express";
import { createDepartment, getAllDepartments, getDepartmentById, updateDepartment, deleteDepartment } from "../Controller/departmentController.js";
import { protect } from "../middleware/authMiddleare.js";

const router = express.Router();

router.post("/",protect, createDepartment);
router.get("/",protect, getAllDepartments);
router.get("/:id",protect, getDepartmentById);
router.patch("/:id",protect, updateDepartment);
router.delete("/:id",protect, deleteDepartment);

export default router;