import express from "express";
import {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
} from "../Controller/roleController.js";
import { protect } from "../middleware/authMiddleare.js";

const router = express.Router();

router.post("/",protect, createRole);        
router.get("/",protect, getRoles);           
router.get("/:id",protect, getRoleById);     
router.patch("/:id",protect, updateRole);      
router.delete("/:id",protect, deleteRole);   

export default router;
