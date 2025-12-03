import express from "express";
import {
  getHomeNotifications,
} from "../controllers/homeNotification.js";

const router = express.Router();

router.get("/", getHomeNotifications);

export default router;