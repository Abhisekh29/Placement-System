import express from "express";
import { getIncompleteUsers, resetPassword } from "../controllers/user.js";
import { isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.put("/:userid/reset-password", isAdmin, resetPassword);
router.get("/incomplete", isAdmin, getIncompleteUsers);

export default router;