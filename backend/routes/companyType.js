// import express from "express";
// import {
//   getCompanyTypes,
//   addCompanyType,
//   updateCompanyType,
//   deleteCompanyType,
// } from "../controllers/companyType.js";

// const router = express.Router();

// router.get("/", getCompanyTypes);
// router.post("/", addCompanyType);
// router.put("/:typeId", updateCompanyType);
// router.delete("/:typeId", deleteCompanyType);

// export default router;

import express from "express";
import {
  getCompanyTypes,
  addCompanyType,
  updateCompanyType,
  deleteCompanyType,
} from "../controllers/companyType.js";
import { isAdmin } from "../middleware/auth.js"; // Import the admin middleware

const router = express.Router();

router.get("/", isAdmin, getCompanyTypes);
router.post("/", isAdmin, addCompanyType);
router.put("/:typeId", isAdmin, updateCompanyType);
router.delete("/:typeId", isAdmin, deleteCompanyType);

export default router;