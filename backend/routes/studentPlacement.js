import express from "express";
import {
  applyForDrive,
  getAppliedDrives,
  getMyPlacements,
  updateMyPlacement,
  uploadOfferLetter,
} from "../controllers/studentPlacement.js";
import { isStudent, isStudentAndActive } from "../middleware/auth.js";

const router = express.Router();

router.get("/applied-drives", isStudent, getAppliedDrives);
router.get("/my-placements", isStudent, getMyPlacements);
router.post("/apply", isStudentAndActive, applyForDrive);

router.put(
  "/my-placements/:driveId", 
  isStudentAndActive, 
  uploadOfferLetter.single("offerletter_file_name"), // Handles the file
  updateMyPlacement
);

export default router;