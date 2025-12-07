import express from "express";
import {
  getCompanyTypes,
} from "../controllers/companyType.js";
import { isAdmin } from "../middleware/auth.js"; // Import the admin middleware

const router = express.Router();

router.get("/", isAdmin, getCompanyTypes);

export default router;