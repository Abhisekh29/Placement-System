import express from "express";
import { getSessions } from "../controllers/session.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", verifyToken, getSessions);

export default router;