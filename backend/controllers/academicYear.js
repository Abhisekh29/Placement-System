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