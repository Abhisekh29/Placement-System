import jwt from "jsonwebtoken";
import { db } from "../db.js";

export const verifyToken = (req, res, next) => {
  let token = req.cookies.access_token;

  // Fallback to Authorization header if no cookie
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Not authenticated. Please log in." });
  }

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        res.clearCookie("access_token", {
          httpOnly: true,
          sameSite: "none",
          secure: true,
        });
        return res.status(401).json({
          message: "Your session has expired. Please log in again.",
        });
      }
    }
    req.user = userInfo;
    next();
  });
};

export const isAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.user_type === "0") {
      // '0' is for Admin
      next();
    } else {
      return res.status(403).json({
        message: "Forbidden. You do not have administrative privileges.",
      });
    }
  });
};

export const isStudent = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.user_type === "1") {
      // '1' is for Student
      next();
    } else {
      return res.status(403).json({
        message: "Forbidden. You must be a student to access this resource.",
      });
    }
  });
};

export const isStudentAndActive = (req, res, next) => {
  isStudent(req, res, () => {
    // If they are a student, check the database for their frozen status
    const q = "SELECT is_profile_frozen FROM student_master WHERE userid = ?";
    
    db.query(q, [req.user.userid], (err, data) => {
      if (err) {
        return res.status(500).json({ message: "Database error.", error: err });
      }

      if (data.length === 0) {
        // This means they have a user account but no student profile
        return res.status(404).json({ message: "Student profile not found." });
      }

      // Check the frozen status
      if (data[0].is_profile_frozen === "Yes") {
        return res.status(403).json({
          message: "Forbidden: Your profile is frozen and you cannot perform this action.",
        });
      }

      // If not frozen, allow the request to proceed
      next();
    });
  });
};

