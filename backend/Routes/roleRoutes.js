import express from "express";
import { createRole, getRoles } from "../Controller/roleController.js";

const router = express.Router();

router.post("/", createRole);
router.get("/", getRoles);

export default router;
