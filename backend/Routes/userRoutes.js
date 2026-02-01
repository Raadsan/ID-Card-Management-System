import express from "express";
import upload from "../utils/malter.js";
import { createUser, updateUser, getUsers, getUserById, deleteUser } from "../Controller/userController.js";
import { protect } from "../middleware/authMiddleare.js";

const router = express.Router();

router.post("/",protect, upload.single("photo"),createUser);
router.patch("/:id",protect, upload.single("photo"),protect, updateUser);
router.get("/",protect, getUsers);
router.get("/:id",protect, getUserById);
router.delete("/:id",protect, deleteUser);

export default router;
