import { db } from "../db.js";

export const getAcademicYears = (req, res) => {
  const q = `
    SELECT 
      ay.year_id, 
      ay.year_name, 
      ay.mod_time, 
      um.username AS modified_by
    FROM academic_year AS ay
    LEFT JOIN user_master AS um ON ay.mod_by = um.userid
    ORDER BY ay.year_id DESC
  `;
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const addAcademicYear = (req, res) => {
  const { year_name, mod_by } = req.body;
  const q = "INSERT INTO academic_year (year_name, mod_by, mod_time) VALUES (?, ?, NOW())";
  db.query(q, [year_name, mod_by], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(201).json({ message: "Academic year added successfully." });
  });
};

export const deleteAcademicYear = (req, res) => {
  const { yearId } = req.params;
  const q = "DELETE FROM academic_year WHERE year_id = ?";
  db.query(q, [yearId], (err, data) => {
    if (err) {
      // Check for foreign key constraint error
      if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ message: "Cannot delete this year as it is being used in other records." });
      }
      return res.status(500).json({ message: "Failed to delete academic year.", error: err });
    }
    return res.status(200).json({ message: "Academic year deleted successfully." });
  });
};

export const updateAcademicYear = (req, res) => {
  const { yearId } = req.params;
  const { year_name, mod_by } = req.body;
  const q = "UPDATE academic_year SET year_name = ?, mod_by = ?, mod_time = NOW() WHERE year_id = ?";
  db.query(q, [year_name, mod_by, yearId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json({ message: "Academic year updated successfully." });
  });
};