import express from "express";
import {
  getAcademicSessions,
} from "../controllers/academicSession.js";
import { isAdmin } from "../middleware/auth.js"; // Import the admin middleware

const router = express.Router();

router.get("/", isAdmin, getAcademicSessions);

export default router;