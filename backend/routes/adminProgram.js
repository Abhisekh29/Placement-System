import express from "express";
import {
  getPrograms,
  addProgram,
  updateProgram,
  deleteProgram,
} from "../controllers/adminProgram.js";
import { isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", isAdmin, getPrograms);
router.post("/", isAdmin, addProgram);
router.put("/:programId", isAdmin, updateProgram);
router.delete("/:programId", isAdmin, deleteProgram);

export default router;