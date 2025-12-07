import { db } from "../db.js";

export const getAcademicSessions = (req, res) => {
  const q = `
    SELECT 
      s.session_id, 
      s.session_name, 
      ay.year_name,
      s.mod_time, 
      um.username AS modified_by
    FROM session_master AS s
    JOIN academic_year AS ay ON s.year_id = ay.year_id
    LEFT JOIN user_master AS um ON s.mod_by = um.userid
    ORDER BY s.session_id DESC
  `;
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};