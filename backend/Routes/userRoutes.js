import express from "express";
import upload from "../utils/malter.js";
import { createUser, updateUser, getUsers, getUserById, deleteUser, getMe } from "../Controller/userController.js";
import { protect } from "../middleware/authMiddleare.js";

const router = express.Router();

// Define specific routes BEFORE parameterized routes
router.get("/me", protect, getMe);

router.get("/", protect, getUsers);
router.post("/", protect, upload.single("photo"), createUser);

router.get("/:id", protect, getUserById);
router.patch("/:id", protect, upload.single("photo"), updateUser);
router.delete("/:id", protect, deleteUser);

export default router;
