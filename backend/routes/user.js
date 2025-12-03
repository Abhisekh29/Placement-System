// import express from "express";
// import { getPendingUsers, updateUserStatus } from "../controllers/user.js";

// const router = express.Router();

// router.get("/pending", getPendingUsers);
// router.put("/:userId/status", updateUserStatus);

// export default router;

import express from "express";
import { getPendingUsers, updateUserStatus, getIncompleteUsers, resetPassword } from "../controllers/user.js";
import { isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/pending", isAdmin, getPendingUsers);
router.put("/:userid/status", isAdmin, updateUserStatus);
router.put("/:userid/reset-password", isAdmin, resetPassword);

router.get("/incomplete", isAdmin, getIncompleteUsers);


export default router;