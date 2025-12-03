import express from "express";
import {
  getInternships,
  addInternship,
  updateInternship,
  deleteInternship,
  upload,
} from "../controllers/internship.js";
import { isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", isAdmin, getInternships);
router.post("/", isAdmin, upload.single("certificate"), addInternship);
router.put("/:internshipId", isAdmin, upload.single("certificate"), updateInternship);
router.delete("/:internshipId", isAdmin, deleteInternship);

export default router;