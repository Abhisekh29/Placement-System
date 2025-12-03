// import express from "express";
// import {
//   getDepartments,
//   addDepartment,
//   updateDepartment,
//   deleteDepartment,
// } from "../controllers/department.js";

// const router = express.Router();

// router.get("/", getDepartments);
// router.post("/", addDepartment);
// router.put("/:departmentId", updateDepartment);
// router.delete("/:departmentId", deleteDepartment);

// export default router;


import express from "express";
import {
  getDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/department.js";
import { isAdmin } from "../middleware/auth.js"; // Import the admin middleware

const router = express.Router();

router.get("/", isAdmin, getDepartments);
router.post("/", isAdmin, addDepartment);
router.put("/:departmentId", isAdmin, updateDepartment);
router.delete("/:departmentId", isAdmin, deleteDepartment);

export default router;