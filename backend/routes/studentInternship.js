import express from "express";
import {
  getStudentInternships,
  addStudentInternship,
  updateStudentInternship,
  deleteStudentInternship,
  upload,
} from "../controllers/studentInternship.js";
import { isStudent, isStudentAndActive} from "../middleware/auth.js"; // Use isStudent, NOT isAdmin

const router = express.Router();

// All routes are protected by isStudent, which adds req.user
router.get("/", isStudent, getStudentInternships);
router.post("/", isStudentAndActive, upload.single("certificate"), addStudentInternship);
router.put("/:internshipId", isStudentAndActive, upload.single("certificate"), updateStudentInternship);
router.delete("/:internshipId", isStudentAndActive, deleteStudentInternship);

export default router;