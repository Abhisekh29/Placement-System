import { db } from "../db.js";

export const getDepartments = (req, res) => {
  const q = `
    SELECT 
      d.department_id, 
      d.department_name, 
      d.mod_time, 
      um.username AS modified_by
    FROM department_master AS d
    LEFT JOIN user_master AS um ON d.mod_by = um.userid
    ORDER BY d.department_id DESC
  `;
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};