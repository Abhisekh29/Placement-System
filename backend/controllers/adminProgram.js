import { db } from "../db.js";

export const getPrograms = (req, res) => {
  const q = `
    SELECT 
      p.program_id, 
      p.program_name, 
      d.department_name,
      p.mod_time, 
      um.username AS modified_by
    FROM program_master AS p
    JOIN department_master AS d ON p.department_id = d.department_id
    LEFT JOIN user_master AS um ON p.mod_by = um.userid
    Order BY p.program_id DESC
  `;
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const addProgram = (req, res) => {
  const { program_name, department_id, mod_by } = req.body;
  const q = "INSERT INTO program_master (program_name, department_id, mod_by, mod_time) VALUES (?, ?, ?, NOW())";
  db.query(q, [program_name, department_id, mod_by], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(201).json({ message: "Program added successfully." });
  });
};

export const updateProgram = (req, res) => {
  const { programId } = req.params;
  const { program_name, department_id, mod_by } = req.body;
  const q = "UPDATE program_master SET program_name = ?, department_id = ?, mod_by = ?, mod_time = NOW() WHERE program_id = ?";
  db.query(q, [program_name, department_id, mod_by, programId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json({ message: "Program updated successfully." });
  });
};

export const deleteProgram = (req, res) => {
  const { programId } = req.params;
  const q = "DELETE FROM program_master WHERE program_id = ?";
  db.query(q, [programId], (err, data) => {
    if (err) {
      if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ message: "Cannot delete this program as it is being used in other records." });
      }
      return res.status(500).json({ message: "Failed to delete program.", error: err });
    }
    return res.status(200).json({ message: "Program deleted successfully." });
  });
};