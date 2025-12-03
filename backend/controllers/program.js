import { db } from "../db.js";

// Get all programs
export const getPrograms = (req, res) => {
  const q = "SELECT * FROM program_master";

  db.query(q, (err, data) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    res.status(200).json(data);
  });
};

// Get a single program by ID
export const getProgram = (req, res) => {
  const program_id = req.params.program_id;
  const q = "SELECT * FROM program_master WHERE program_id = ?";

  db.query(q, [program_id], (err, data) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    if (data.length === 0) return res.status(404).json({ message: "Program not found" });
    res.status(200).json(data[0]);
  });
};
