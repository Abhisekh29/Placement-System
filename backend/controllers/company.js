import { db } from "../db.js";

export const getCompanies = (req, res) => {
  const q = `
    SELECT 
      c.company_id,
      c.company_name,
      ct.type_name,
      c.company_description
    FROM company_master AS c
    JOIN company_type_master AS ct ON c.type_id = ct.type_id
  `;
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};