import express from "express";
import {
  createRolePermissions,
  getAllRolePermissions,
  getRolePermissionsByRoleId,
  updateRolePermissions,
  deleteRolePermissions,
} from "../Controller/rolePermissionsController.js";

const router = express.Router();

router.post("/", createRolePermissions);
router.get("/", getAllRolePermissions);
router.get("/:roleId", getRolePermissionsByRoleId);
router.put("/:roleId", updateRolePermissions);
router.delete("/:roleId", deleteRolePermissions);

export default router;

