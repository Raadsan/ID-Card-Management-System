import express from "express";
import {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
} from "../Controller/roleController.js";

const router = express.Router();

router.post("/", createRole);        // Create
router.get("/", getRoles);           // Read all
router.get("/:id", getRoleById);     // Read one
router.patch("/:id", updateRole);      // Update
router.delete("/:id", deleteRole);   // Delete

export default router;
