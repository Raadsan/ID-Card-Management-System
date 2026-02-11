import express from "express";
import {
  createMenu,
  getMenus,
  getMenuById,
  updateMenu,
  deleteMenu,
  getUserMenus,
} from "../Controller/menuController.js";
import { protect } from "../middleware/authMiddleare.js";

const router = express.Router();

// CRUD
router.post("/", protect, createMenu);
router.get("/my-menus", protect, getUserMenus);
router.get("/", protect, getMenus);
router.get("/:id", protect, getMenuById);
router.patch("/:id", protect, updateMenu);
router.delete("/:id", protect, deleteMenu);

export default router;
