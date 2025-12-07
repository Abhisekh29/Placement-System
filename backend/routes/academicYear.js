import express from "express";
import {
  getAcademicYears,
} from "../controllers/academicYear.js";
import { isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", isAdmin, getAcademicYears);

export default router;