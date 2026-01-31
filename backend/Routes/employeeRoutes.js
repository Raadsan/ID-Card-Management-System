import { createEmployee, getAllEmployees, getEmployeeById, updateEmployee, deleteEmployee } from "../Controller/employeeController.js";
import express from "express";

const router = express.Router();

router.post("/", createEmployee);
router.get("/", getAllEmployees);
router.get("/:id", getEmployeeById);
router.patch("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

export default router;
