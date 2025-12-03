import express from "express";
import {
  getNotifications,
  addNotification,
  updateNotification,
  deleteNotification,
} from "../controllers/notification.js";
import { isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", isAdmin, getNotifications);
router.post("/", isAdmin, addNotification);
router.put("/:nid", isAdmin, updateNotification);
router.delete("/:nid", isAdmin, deleteNotification);

export default router;