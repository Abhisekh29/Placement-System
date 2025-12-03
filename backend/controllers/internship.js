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
    const uniqueSuffix = req.body.user_id + "-" + Date.now();
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
    cb(new Error("Invalid file type, only JPEG, PNG, JPG and PDF is allowed!"), false);
  }
};
export const upload = multer({ storage, fileFilter });

// --- Controller Functions ---

export const getInternships = (req, res) => {
  // --- 1. Get Parameters ---
  const { 
    search,     // Optional search term
    page,       // Page number
    limit       // Records per page (10, 50, 100, "all")
  } = req.query; 

  // --- 2. Build Base Queries ---
  let q = `
    SELECT 
      i.internship_id, i.user_id, i.company_id, i.semester,
      i.session_id, sess.session_name,
      i.certificate,
      s.name AS student_name,
      c.company_name,
      pm.program_name,
      i.mod_time,
      um.username AS modified_by
    FROM student_internship AS i
    JOIN student_master AS s ON i.user_id = s.userid
    JOIN company_master AS c ON i.company_id = c.company_id
    LEFT JOIN user_master AS um ON i.mod_by = um.userid
    LEFT JOIN program_master AS pm ON s.program_id = pm.program_id
    LEFT JOIN session_master AS sess ON i.session_id = sess.session_id -- ADDED JOIN
  `;

  let countQuery = `
    SELECT COUNT(*) as total
    FROM student_internship AS i
    JOIN student_master AS s ON i.user_id = s.userid
    JOIN company_master AS c ON i.company_id = c.company_id
    LEFT JOIN user_master AS um ON i.mod_by = um.userid
    LEFT JOIN program_master AS pm ON s.program_id = pm.program_id
    LEFT JOIN session_master AS sess ON i.session_id = sess.session_id -- ADDED JOIN
  `;

  // --- 3. Add Dynamic WHERE Clause for Search ---
  const values = [];
  const countValues = [];

  if (search) {
    const whereClause = " WHERE (s.name LIKE ? OR c.company_name LIKE ? OR i.semester LIKE ? OR pm.program_name LIKE ?)";
    const searchTerm = `%${search}%`;
    
    q += whereClause;
    countQuery += whereClause;
    
    values.push(searchTerm, searchTerm, searchTerm, searchTerm);
    countValues.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  // Add sorting (most recent first)
  q += " ORDER BY i.internship_id DESC"; 

  // --- 4. Add Pagination (LIMIT/OFFSET) ---
  if (limit !== "all") {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    q += " LIMIT ? OFFSET ?";
    values.push(limitNum, offset);
  }

  // --- 5. Execute Queries ---
  db.query(countQuery, countValues, (err, countData) => {
    if (err) {
      console.error("DB Error (Count) fetching internships:", err);
      return res.status(500).json(err);
    }
    
    const total = countData[0].total;
    if (total === 0) {
      return res.status(200).json({ data: [], total: 0 });
    }

    db.query(q, values, (err, data) => {
      if (err) {
        console.error("DB Error (Data) fetching internships:", err);
        return res.status(500).json(err);
      }
      return res.status(200).json({ data: data, total: total });
    });
  });
};

export const addInternship = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Certificate file is required." });
  }

  const q = "INSERT INTO student_internship (`user_id`, `company_id`, `semester`, `session_id`, `certificate`, `mod_by`, `mod_time`) VALUES (?, ?, ?, ?, ?, ?, NOW())";
  const values = [
    req.body.user_id,
    req.body.company_id,
    req.body.semester,
    req.body.session_id, 
    req.file.filename,
    req.body.mod_by,
  ];
  db.query(q, values, (err, data) => {
    if (err) {
        // FIX: Delete file if DB error to prevent orphaned files
        if (req.file) {
            fs.unlink(req.file.path, (unlinkErr) => {
                if (unlinkErr) console.error("Failed to delete orphaned file:", unlinkErr);
            });
        }

        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "Error: This student already has an internship for this company and semester." });
        }
        return res.status(500).json(err);
    }
    return res.status(201).json({ message: "Internship record added successfully." });
  });
};

export const updateInternship = (req, res) => {
  const { internshipId } = req.params;
  const getOldFileQuery = "SELECT certificate FROM student_internship WHERE internship_id = ?";

  db.query(getOldFileQuery, [internshipId], (err, data) => {
    if (err) {
        // Cleanup new file if initial query fails
        if(req.file) fs.unlink(req.file.path, () => {});
        return res.status(500).json(err);
    }
    if (data.length === 0) {
        if(req.file) fs.unlink(req.file.path, () => {});
        return res.status(404).json({ message: "Internship record not found." });
    }

    const oldFileName = data[0].certificate;
    let newFileName = oldFileName;

    if (req.file) {
      newFileName = req.file.filename;
    }

    const q = "UPDATE student_internship SET `user_id` = ?, `company_id` = ?, `semester` = ?, `session_id` = ?, `certificate` = ?, `mod_by` = ?, `mod_time` = NOW() WHERE `internship_id` = ?";
    const values = [
      req.body.user_id,
      req.body.company_id,
      req.body.semester,
      req.body.session_id,
      newFileName,
      req.body.mod_by,
      internshipId,
    ];
    
    db.query(q, values, (updateErr, updateData) => {
        if (updateErr) {
            // FIX: Delete NEW file if DB update fails
            if (req.file) {
                fs.unlink(req.file.path, (unlinkErr) => {
                    if (unlinkErr) console.error("Failed to delete orphaned new file:", unlinkErr);
                });
            }

            if (updateErr.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: "Error: This student already has an internship for this company and semester." });
            }
            return res.status(500).json(updateErr);
        }

        // FIX: Only delete OLD file after successful DB update
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

export const deleteInternship = (req, res) => {
  const { internshipId } = req.params;
  const getFileQuery = "SELECT certificate FROM student_internship WHERE internship_id = ?";

  db.query(getFileQuery, [internshipId], (err, data) => {
    if (err) return res.status(500).json(err);
    
    const fileName = (data.length > 0) ? data[0].certificate : null;

    const q = "DELETE FROM student_internship WHERE internship_id = ?";
    db.query(q, [internshipId], (deleteErr, deleteData) => {
      if (deleteErr) return res.status(500).json({ message: "Failed to delete internship.", error: deleteErr });
      
      // FIX: Only delete file AFTER DB record is deleted
      if (fileName) {
        const filePath = path.resolve("uploads/certificates", fileName);
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