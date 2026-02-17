import express from "express";
import {
    createIdGenerate,
    getAllIdGenerates,
    getIdGenerateById,
    markReadyToPrint,
    printIdGenerate,
    verifyQrCode,
    deleteIdGenerate,
    markAsLost,
} from "../Controller/idGenerateController.js";
import { protect } from "../middleware/authMiddleare.js";



const router = express.Router();

// protected
router.post("/", protect, createIdGenerate);
router.get("/", protect, getAllIdGenerates);
router.get("/:id", protect, getIdGenerateById);
router.patch("/:id/ready", protect, markReadyToPrint);
router.patch("/:id/print", protect, printIdGenerate);
router.patch("/:id/lost", protect, markAsLost);
router.delete("/:id", protect, deleteIdGenerate);

// public (QR scan)
router.get("/verify/:qrCode", verifyQrCode);

export default router;
