import express from "express";
import { getProgram, getPrograms } from "../controllers/program.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Get all programs
router.get("/", verifyToken, getPrograms);

// Get a single program by ID
router.get("/:program_id", verifyToken, getProgram);

export default router;