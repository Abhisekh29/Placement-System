import express from "express";
import {
  getCompanies,
  addCompany,
  updateCompany,
  deleteCompany,
} from "../controllers/adminCompany.js";
import { isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", isAdmin, getCompanies);
router.post("/", isAdmin, addCompany);
router.put("/:companyId", isAdmin, updateCompany);
router.delete("/:companyId", isAdmin, deleteCompany);

export default router;