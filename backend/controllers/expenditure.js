import { db } from "../db.js";
import multer from "multer";
import path from "path";
import fs from "fs"; // Import the File System module

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure directory exists
    const dest = "uploads/expenditure/";
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now();
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
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

export const upload = multer({ storage: storage, fileFilter: fileFilter });

// --- Controller functions ---

// WRITTEN to support pagination, search, and limits 
export const getExpenditures = (req, res) => {
  // --- 1. Get Parameters ---
  const { 
    search,     // Optional search term
    page,       // Page number
    limit       // Records per page (10, 50, 100, "all")
  } = req.query; 

  // --- 2. Build Base Queries ---
  let q = `
    SELECT 
      e.exp_id, e.session_id, s.session_name, e.expense_on,
      e.amount, e.bill_file, e.mod_time,
      um.username AS modified_by
    FROM expenditure AS e
    JOIN session_master AS s ON e.session_id = s.session_id
    LEFT JOIN user_master AS um ON e.mod_by = um.userid
  `;

  let countQuery = `
    SELECT COUNT(*) as total
    FROM expenditure AS e
    JOIN session_master AS s ON e.session_id = s.session_id
    LEFT JOIN user_master AS um ON e.mod_by = um.userid
  `;

  // --- 3. Add Dynamic WHERE Clause for Search ---
  const values = [];
  const countValues = [];

  if (search) {
    // Search by expense description OR session name
    const whereClause = " WHERE (e.expense_on LIKE ? OR s.session_name LIKE ?)";
    const searchTerm = `%${search}%`;
    
    q += whereClause;
    countQuery += whereClause;
    
    values.push(searchTerm, searchTerm);
    countValues.push(searchTerm, searchTerm);
  }

  // Add sorting (most recent first)
  q += " ORDER BY e.exp_id DESC"; 

  // --- 4. Add Pagination (LIMIT/OFFSET) ---
  if (limit !== "all") {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    q += " LIMIT ? OFFSET ?";
    values.push(limitNum, offset);
  }
  // If limit is "all", we add nothing to the query.

  // --- 5. Execute Queries ---
  db.query(countQuery, countValues, (err, countData) => {
    if (err) {
      console.error("DB Error (Count) fetching expenditures:", err);
      return res.status(500).json(err);
    }
    
    const total = countData[0].total;
    if (total === 0) {
      return res.status(200).json({ data: [], total: 0 });
    }

    // Now get the paged data
    db.query(q, values, (err, data) => {
      if (err) {
        console.error("DB Error (Data) fetching expenditures:", err);
        return res.status(500).json(err);
      }
      // Return both the page data and the total count
      return res.status(200).json({ data: data, total: total });
    });
  });
};

export const addExpenditure = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Bill file is required." });
  }
  const q = "INSERT INTO expenditure (`session_id`, `expense_on`, `amount`, `bill_file`, `mod_by`, `mod_time`) VALUES (?, ?, ?, ?, ?, NOW())";
  const values = [
    req.body.session_id,
    req.body.expense_on,
    req.body.amount,
    req.file.filename,
    req.body.mod_by,
  ];
  db.query(q, values, (err, data) => {
    if (err) {
        // FIX: Delete file if DB insert fails
        if (req.file) {
            fs.unlink(req.file.path, () => {}); 
        }
        return res.status(500).json(err);
    }
    return res.status(201).json({ message: "Expenditure added successfully." });
  });
};

export const updateExpenditure = (req, res) => {
  const { expId } = req.params;
  
  const getOldFileQuery = "SELECT bill_file FROM expenditure WHERE exp_id = ?";
  db.query(getOldFileQuery, [expId], (err, data) => {
    if (err) {
        if(req.file) fs.unlink(req.file.path, () => {});
        return res.status(500).json(err);
    }
    if (data.length === 0) {
        if(req.file) fs.unlink(req.file.path, () => {});
        return res.status(404).json({ message: "Expenditure not found." });
    }

    const oldFileName = data[0].bill_file;
    let newFileName = oldFileName;

    if (req.file) {
      newFileName = req.file.filename;
    }

    const q = "UPDATE expenditure SET `session_id` = ?, `expense_on` = ?, `amount` = ?, `bill_file` = ?, `mod_by` = ?, `mod_time` = NOW() WHERE `exp_id` = ?";
    const values = [
      req.body.session_id,
      req.body.expense_on,
      req.body.amount,
      newFileName,
      req.body.mod_by,
      expId,
    ];

    db.query(q, values, (err, data) => {
      if (err) {
        // FIX: DB failed, delete the new orphaned file
        if (req.file) {
            fs.unlink(req.file.path, () => {}); 
        }
        return res.status(500).json(err);
      }

      // FIX: DB Success, NOW delete the old file
      if (req.file && oldFileName && oldFileName !== newFileName) {
        const oldFilePath = path.join("uploads/expenditure", oldFileName);
        if (fs.existsSync(oldFilePath)) {
          fs.unlink(oldFilePath, (unlinkErr) => {
            if (unlinkErr) console.error("Error deleting old file:", unlinkErr);
          });
        }
      }

      return res.status(200).json({ message: "Expenditure updated successfully." });
    });
  });
};


export const deleteExpenditure = (req, res) => {
  const { expId } = req.params;

  const getFileQuery = "SELECT bill_file FROM expenditure WHERE exp_id = ?";
  db.query(getFileQuery, [expId], (err, data) => {
    if (err) return res.status(500).json(err);
    
    const fileName = (data.length > 0) ? data[0].bill_file : null;

    const q = "DELETE FROM expenditure WHERE exp_id = ?";
    db.query(q, [expId], (err, data) => {
      if (err) {
        return res.status(500).json({ message: "Failed to delete expenditure record.", error: err });
      }
      
      // FIX: Only delete file after successful DB delete
      if (fileName) {
        const filePath = path.join("uploads/expenditure", fileName);
        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) console.error("Error deleting file:", unlinkErr);
          });
        }
      }

      return res.status(200).json({ message: "Expenditure deleted successfully." });
    });
  });
};