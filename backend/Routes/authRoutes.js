import express from "express";
import { loginUser, getCurrentUser } from "../Controller/authController.js";
import { protect } from "../middleware/authMiddleare.js";

const router = express.Router();

router.post("/login", loginUser);
router.get("/me", protect, getCurrentUser);

export default router;