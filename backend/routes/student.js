import express from "express";
import {
  addStudent,
  getStudentDetails,
  updateStudent,
} from "../controllers/student.js";
import { isStudent, isStudentAndActive } from "../middleware/auth.js";

const router = express.Router();

// General Routes
router.post("/", isStudent, addStudent);
router.get("/:userid", isStudent, getStudentDetails);
router.put("/:userid", isStudentAndActive, updateStudent);

export default router;