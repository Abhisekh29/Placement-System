import { db } from "../db.js";

export const getCompanyTypes = (req, res) => {
  const q = `
    SELECT 
      ct.type_id, 
      ct.type_name, 
      ct.mod_time, 
      um.username AS modified_by
    FROM company_type_master AS ct
    LEFT JOIN user_master AS um ON ct.mod_by = um.userid
    ORDER BY ct.type_id DESC
  `;
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};