import express from "express";
import { createCategory, getCategories, updateCategory, deleteCategory } from "../Controller/categoryController.js"
import { protect } from "../middleware/authMiddleare.js";

const router = express.Router();

router.post("/create",protect, createCategory);
router.get("/",protect, getCategories);
router.put("/update",protect, updateCategory);
router.delete("/delete",protect, deleteCategory);

export default router;