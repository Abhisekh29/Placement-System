import express from "express";
import {
  getStudents,
  updateStudent,
  deleteStudent,
  getRejectedStudents,
  freezeStudent,
  unfreezeStudent,
  lockStudent,
  unlockStudent,
  bulkUpdateStudentStatus,
} from "../controllers/adminStudent.js";
import { isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Bulk Route MUST come before /:userid
router.put("/bulk-status", isAdmin, bulkUpdateStudentStatus);

router.get("/", isAdmin, getStudents);
router.get("/rejected", isAdmin, getRejectedStudents);
router.put("/:userid", isAdmin, updateStudent);
router.delete("/:userid", isAdmin, deleteStudent);
router.put("/:userid/freeze", isAdmin, freezeStudent);
router.put("/:userid/unfreeze", isAdmin, unfreezeStudent);
router.put("/:userid/lock", isAdmin, lockStudent);
router.put("/:userid/unlock", isAdmin, unlockStudent);

export default router;