import { db } from "../db.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// --- Multer Configuration ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = "uploads/certificates/";
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    // Use the logged-in user's ID from the token for the filename
    const uniqueSuffix = req.user.userid + "-" + Date.now();
    cb(null, "cert-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type, only JPEG, PNG, JPG and PDF is allowed!"),
      false
    );
  }
};
export const upload = multer({ storage, fileFilter });

// --- Controller Functions ---

// GET ONLY the logged-in student's internships
export const getStudentInternships = (req, res) => {
  const loggedInUserId = req.user.userid;

  const q = `
    SELECT 
      i.internship_id, i.user_id, i.company_id, i.semester,
      i.session_id, s.session_name,
      i.certificate,
      c.company_name,
      i.mod_time,
      um.username AS modified_by
    FROM student_internship AS i
    JOIN company_master AS c ON i.company_id = c.company_id
    LEFT JOIN session_master AS s ON i.session_id = s.session_id
    LEFT JOIN user_master AS um ON i.mod_by = um.userid
    WHERE i.user_id = ?
    ORDER BY i.internship_id DESC
  `;

  db.query(q, [loggedInUserId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

// ADD an internship FOR the logged-in student
export const addStudentInternship = (req, res) => {
  const loggedInUserId = req.user.userid;

  const q =
    "INSERT INTO student_internship (`user_id`, `company_id`, `semester`, `session_id`, `certificate`, `mod_by`, `mod_time`) VALUES (?, ?, ?, ?, ?, ?, NOW())";
  const values = [
    loggedInUserId, // user_id is from the token, not req.body
    req.body.company_id,
    req.body.semester,
    req.body.session_id,
    req.file ? req.file.filename : null,
    loggedInUserId, // The student is modifying their own record
  ];

  db.query(q, values, (err, data) => {
    if (err) {
      // FIX: Delete the uploaded file if DB insert fails to prevent orphans
      if (req.file) {
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) console.error("Failed to delete orphaned file:", unlinkErr);
        });
      }

      // Check for duplicate entry
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
            message: "Error: You have already added an internship for this company and semester.",
          });
      }
      return res.status(500).json(err);
    }
    return res
      .status(201)
      .json({ message: "Internship record added successfully." });
  });
};

// UPDATE an internship ONLY IF the student owns it
export const updateStudentInternship = (req, res) => {
  const { internshipId } = req.params;
  const loggedInUserId = req.user.userid;

  const getOwnerQuery =
    "SELECT user_id, certificate FROM student_internship WHERE internship_id = ?";

  db.query(getOwnerQuery, [internshipId], (err, data) => {
    if (err) {
        // Cleanup new file if initial query fails
        if(req.file) fs.unlink(req.file.path, () => {});
        return res.status(500).json(err);
    }
    if (data.length === 0) {
        if(req.file) fs.unlink(req.file.path, () => {});
        return res.status(404).json({ message: "Internship record not found." });
    }

    const record = data[0];
    const oldFileName = record.certificate;
    const ownerId = record.user_id;

    // Security Check
    if (ownerId !== loggedInUserId) {
      if(req.file) fs.unlink(req.file.path, () => {});
      return res.status(403).json({ message: "Forbidden: You can only update your own records." });
    }

    let newFileName = oldFileName;
    if (req.file) {
      newFileName = req.file.filename;
    }

    const q = "UPDATE student_internship SET `company_id` = ?, `semester` = ?, `session_id` = ?, `certificate` = ?, `mod_by` = ?, `mod_time` = NOW() WHERE `internship_id` = ? AND `user_id` = ?";
    const values = [
      req.body.company_id,
      req.body.semester,
      req.body.session_id,
      newFileName,
      loggedInUserId,
      internshipId,
      loggedInUserId,
    ];

    db.query(q, values, (updateErr, updateData) => {
      if (updateErr) {
        // FIX: DB Update failed. 
        // 1. Delete the NEW file (orphaned).
        // 2. Keep the OLD file (so data stays consistent).
        if (req.file) {
          fs.unlink(req.file.path, (unlinkErr) => {
            if (unlinkErr) console.error("Failed to delete orphaned new file:", unlinkErr);
          });
        }

        if (updateErr.code === "ER_DUP_ENTRY") {
          return res.status(409).json({
              message: "Error: You have already added an internship for this company and semester.",
            });
        }
        return res.status(500).json(updateErr);
      }

      // DB Update Success. NOW it is safe to delete the old file.
      if (req.file && oldFileName && oldFileName !== newFileName) {
        const oldFilePath = path.resolve("uploads/certificates", oldFileName);
        if (fs.existsSync(oldFilePath)) {
          fs.unlink(oldFilePath, (unlinkErr) => {
            if (unlinkErr) console.error("Could not delete old certificate:", unlinkErr);
          });
        }
      }

      return res.status(200).json({ message: "Internship record updated successfully." });
    });
  });
};

// DELETE an internship ONLY IF the student owns it
export const deleteStudentInternship = (req, res) => {
  const { internshipId } = req.params;
  const loggedInUserId = req.user.userid;

  const getFileQuery =
    "SELECT user_id, certificate FROM student_internship WHERE internship_id = ?";

  db.query(getFileQuery, [internshipId], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0)
      return res.status(404).json({ message: "Internship record not found." });

    const record = data[0];
    const oldFileName = record.certificate;
    const ownerId = record.user_id;

    if (ownerId !== loggedInUserId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own records." });
    }

    const q = "DELETE FROM student_internship WHERE internship_id = ? AND user_id = ?";
    db.query(q, [internshipId, loggedInUserId], (deleteErr, deleteData) => {
      if (deleteErr)
        return res.status(500).json({ message: "Failed to delete internship.", error: deleteErr });
      
      // FIX: Only delete the file AFTER the DB record is successfully deleted
      if (oldFileName) {
        const filePath = path.resolve("uploads/certificates", oldFileName);
        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) console.error("Could not delete certificate file:", unlinkErr);
          });
        }
      }

      return res.status(200).json({ message: "Internship record deleted successfully." });
    });
  });
};