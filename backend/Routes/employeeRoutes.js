import { createEmployee, getAllEmployees, getEmployeeById, updateEmployee, deleteEmployee } from "../Controller/employeeController.js";
import express from "express";
import { protect } from "../middleware/authMiddleare.js";
import upload from "../utils/malter.js";

const router = express.Router();

router.post("/", protect, upload.single("photo"), createEmployee);
router.get("/", protect, getAllEmployees);
router.get("/:id", protect, getEmployeeById);
router.patch("/:id", protect, upload.single("photo"), updateEmployee);
router.delete("/:id", protect, deleteEmployee);

export default router;
