import { createEmployee, getAllEmployees, getEmployeeById, updateEmployee, deleteEmployee } from "../Controller/employeeController.js";
import express from "express";

const router = express.Router();

router.post("/create", createEmployee);
router.get("/all", getAllEmployees);
router.get("/get/:id", getEmployeeById);
router.patch("/update/:id", updateEmployee);
router.delete("/delete/:id", deleteEmployee);

export default router;
