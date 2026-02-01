import express from "express";
import {
  createRolePermissions,
  getAllRolePermissions,
  getRolePermissionsByRoleId,
  updateRolePermissions,
  deleteRolePermissions,
} from "../Controller/rolePermissionsController.js";
import { protect } from "../middleware/authMiddleare.js";

const router = express.Router();

router.post("/",protect, createRolePermissions);
router.get("/",protect, getAllRolePermissions);
router.get("/:roleId",protect, getRolePermissionsByRoleId);
router.put("/:roleId",protect, updateRolePermissions);
router.delete("/:roleId",protect, deleteRolePermissions);

export default router;

