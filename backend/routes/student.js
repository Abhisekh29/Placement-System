import express from "express";
import {
  addStudent,
  getStudentDetails,
  updateStudent,
  getStudentsList,
} from "../controllers/student.js";
import { isStudent, isAdmin, isStudentAndActive } from "../middleware/auth.js";

const router = express.Router();

// General Routes
router.post("/", isStudent, addStudent);
router.get("/:userid", isStudent, getStudentDetails);
router.put("/:userid", isStudentAndActive, updateStudent);

// New route for admin to get all students
router.get("/list/all", isAdmin, getStudentsList);

export default router;