import express from "express" 
import { register, login, logout, changePassword, verifyStudentDetails, verifyAdminDetails,resetPasswordPublic } from "../controllers/auth.js"
import { verifyToken } from "../middleware/auth.js";

const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.post("/logout", logout)

// This route is protected; only a logged-in user can access it.
router.post("/change-password", verifyToken, changePassword)

// Public routes for "Forgot Password" flow
router.post("/verify-admin-details", verifyAdminDetails)
router.post("/verify-student-details", verifyStudentDetails)
router.post("/reset-password-public", resetPasswordPublic)

export default router;