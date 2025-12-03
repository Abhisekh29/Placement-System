import express from "express";
import { getCompanies } from "../controllers/company.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", verifyToken, getCompanies);

export default router;