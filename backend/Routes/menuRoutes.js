import express from "express";
import {
  createMenu,
  getMenus,
  getMenuById,
  updateMenu,
  deleteMenu,
} from "../Controller/menuController.js";

const router = express.Router();

// CRUD
router.post("/", createMenu);
router.get("/", getMenus);
router.get("/:id", getMenuById);
router.patch("/:id", updateMenu);
router.delete("/:id", deleteMenu);

export default router;
