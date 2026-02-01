import { createEmployee, getAllEmployees, getEmployeeById, updateEmployee, deleteEmployee } from "../Controller/employeeController.js";
import express from "express";
import { protect } from "../middleware/authMiddleare.js";

const router = express.Router();

router.post("/",protect, createEmployee);
router.get("/",protect, getAllEmployees);
router.get("/:id",protect, getEmployeeById);
router.patch("/:id",protect, updateEmployee);
router.delete("/:id",protect, deleteEmployee);

export default router;
