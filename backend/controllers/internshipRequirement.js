import { db } from "../db.js";

// GET all requirements
export const getRequirements = (req, res) => {
  const q = `
    SELECT 
      ir.req_id,
      ir.program_id,
      p.program_name,
      ir.semester,
      ir.internship_count,
      ir.mod_time,
      um.username AS modified_by
    FROM internship_requirement AS ir
    JOIN program_master AS p ON ir.program_id = p.program_id
    LEFT JOIN user_master AS um ON ir.mod_by = um.userid
    ORDER BY p.program_name, ir.semester
  `;
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

// ADD a new requirement
export const addRequirement = (req, res) => {
  const { program_id, semester, internship_count, mod_by } = req.body;
  
  if (!program_id || !semester || !internship_count) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const q = "INSERT INTO internship_requirement (`program_id`, `semester`, `internship_count`, `mod_by`, `mod_time`) VALUES (?, ?, ?, ?, NOW())";
  
  db.query(q, [program_id, semester, internship_count, mod_by], (err, data) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: "A requirement for this program and semester already exists." });
      }
      return res.status(500).json(err);
    }
    return res.status(201).json({ message: "Internship requirement added successfully." });
  });
};

// UPDATE a requirement
export const updateRequirement = (req, res) => {
  const { reqId } = req.params;
  const { program_id, semester, internship_count, mod_by } = req.body;

  if (!program_id || !semester || !internship_count) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const q = "UPDATE internship_requirement SET `program_id` = ?, `semester` = ?, `internship_count` = ?, `mod_by` = ?, `mod_time` = NOW() WHERE `req_id` = ?";
  
  db.query(q, [program_id, semester, internship_count, mod_by, reqId], (err, data) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: "A requirement for this program and semester already exists." });
      }
      return res.status(500).json(err);
    }
    return res.status(200).json({ message: "Internship requirement updated successfully." });
  });
};

// DELETE a requirement
export const deleteRequirement = (req, res) => {
  const { reqId } = req.params;
  const q = "DELETE FROM internship_requirement WHERE req_id = ?";
  
  db.query(q, [reqId], (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Failed to delete requirement.", error: err });
    }
    return res.status(200).json({ message: "Internship requirement deleted successfully." });
  });
};