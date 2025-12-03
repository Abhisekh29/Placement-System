import express from "express";
import {
  getRequirements,
  addRequirement,
  updateRequirement,
  deleteRequirement,
} from "../controllers/internshipRequirement.js";
import { isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", isAdmin, getRequirements);
router.post("/", isAdmin, addRequirement);
router.put("/:reqId", isAdmin, updateRequirement);
router.delete("/:reqId", isAdmin, deleteRequirement);

export default router;