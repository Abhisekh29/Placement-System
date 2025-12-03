import express from "express";
import {
  getAllDepartments,
  getProgramsByDept,
  searchStudents,
} from "../controllers/filters.js";
import { isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/departments", isAdmin, getAllDepartments);
router.get("/programs/:deptId", isAdmin, getProgramsByDept);
router.get("/students/search", isAdmin, searchStudents);

export default router;