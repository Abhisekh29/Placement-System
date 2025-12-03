// import express from "express";
// import { getAcademicYears, addAcademicYear, deleteAcademicYear, updateAcademicYear, } from "../controllers/academicYear.js";

// const router = express.Router();

// router.get("/", getAcademicYears);
// router.post("/", addAcademicYear);
// router.put("/:yearId", updateAcademicYear);
// router.delete("/:yearId", deleteAcademicYear);

// export default router;



import express from "express";
import {
  getAcademicYears,
  addAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
} from "../controllers/academicYear.js";
import { isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", isAdmin, getAcademicYears);
router.post("/", isAdmin, addAcademicYear);
router.put("/:yearId", isAdmin, updateAcademicYear);
router.delete("/:yearId", isAdmin, deleteAcademicYear);

export default router;