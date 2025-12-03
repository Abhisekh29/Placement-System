import express from "express";
import {
  getExpenditures,
  addExpenditure,
  updateExpenditure, // Import update function
  deleteExpenditure,
  upload,
} from "../controllers/expenditure.js";
import { isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", isAdmin, getExpenditures);
router.post("/", isAdmin, upload.single("bill_file"), addExpenditure);
router.put("/:expId", isAdmin, upload.single("bill_file"), updateExpenditure);
router.delete("/:expId", isAdmin, deleteExpenditure);

export default router;