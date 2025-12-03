import express from "express";
import {
  getPlacementDrives,
  addPlacementDrive,
  updatePlacementDrive,
  deletePlacementDrive,
  toggleDriveStatus,
} from "../controllers/placementDrive.js";
import { isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", isAdmin, getPlacementDrives);
router.post("/", isAdmin, addPlacementDrive);
router.put("/:driveId", isAdmin, updatePlacementDrive);
router.delete("/:driveId", isAdmin, deletePlacementDrive);
router.put("/status/:driveId", isAdmin, toggleDriveStatus); // New route for status toggle

export default router;