import express from "express";
import { createDepartment, getAllDepartments, getDepartmentById, updateDepartment, deleteDepartment } from "../Controller/departmentController.js";

const router=express.Router();

router.post("/create",createDepartment);
router.get("/all",getAllDepartments);
router.get("/get/:id",getDepartmentById);
router.patch("/update/:id",updateDepartment);
router.delete("/delete/:id",deleteDepartment);

export default router;