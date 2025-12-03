import express from "express";
import { 
    getStudentPlacementStats, 
    getPlacementDriveStats, 
    getSelectedStudentsReport, 
    getExpenditureReport, 
    getStudentInternshipReport,
} from "../controllers/reports.js";
import { isAdmin } from "../middleware/auth.js";

const router = express.Router();

// GET /api/reports/student-placement-stats
router.get("/student-placement-stats", isAdmin, getStudentPlacementStats);
router.get("/placement-drive-stats", isAdmin, getPlacementDriveStats);
router.get("/selected-students", isAdmin, getSelectedStudentsReport);
router.get("/expenditure-report", isAdmin, getExpenditureReport);
router.get("/student-internship-report", isAdmin, getStudentInternshipReport);
export default router;