import express from "express";
import {
  getDepartments,
} from "../controllers/department.js";
import { isAdmin } from "../middleware/auth.js"; // Import the admin middleware

const router = express.Router();

router.get("/", isAdmin, getDepartments);

export default router;