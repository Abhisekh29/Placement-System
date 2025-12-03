import express from "express";
import { getAdminDetails, addOrUpdateAdminDetails } from "../controllers/admin.js";
import { isAdmin } from "../middleware/auth.js"; // Use isAdmin to protect

const router = express.Router();

// GET /api/admin/details
// Gets the logged-in admin's personal details
router.get("/details", isAdmin, getAdminDetails);

// POST /api/admin/details
// Creates or Updates the logged-in admin's personal details
router.post("/details", isAdmin, addOrUpdateAdminDetails);

export default router;