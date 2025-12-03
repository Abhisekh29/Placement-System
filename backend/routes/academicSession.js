import express from "express";
import {
  getAcademicSessions,
  addAcademicSession,
  updateAcademicSession,
  deleteAcademicSession,
} from "../controllers/academicSession.js";
import { isAdmin } from "../middleware/auth.js"; // Import the admin middleware

const router = express.Router();

router.get("/", isAdmin, getAcademicSessions);
router.post("/", isAdmin, addAcademicSession);
router.put("/:sessionId", isAdmin, updateAcademicSession);
router.delete("/:sessionId", isAdmin, deleteAcademicSession);

export default router;