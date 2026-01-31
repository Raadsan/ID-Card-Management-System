import express from "express";
import upload from "../utils/malter.js";
import { createUser, updateUser, getUsers, getUserById, deleteUser } from "../Controller/userController.js";

const router = express.Router();

router.post("/", upload.single("photo"), createUser);
router.patch("/:id", upload.single("photo"), updateUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.delete("/:id", deleteUser);

export default router;
