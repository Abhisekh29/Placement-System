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

export const addCompanyType = (req, res) => {
  const { type_name, mod_by } = req.body;
  const q = "INSERT INTO company_type_master (type_name, mod_by, mod_time) VALUES (?, ?, NOW())";
  db.query(q, [type_name, mod_by], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(201).json({ message: "Company type added successfully." });
  });
};

export const updateCompanyType = (req, res) => {
  const { typeId } = req.params;
  const { type_name, mod_by } = req.body;
  const q = "UPDATE company_type_master SET type_name = ?, mod_by = ?, mod_time = NOW() WHERE type_id = ?";
  db.query(q, [type_name, mod_by, typeId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json({ message: "Company type updated successfully." });
  });
};

export const deleteCompanyType = (req, res) => {
  const { typeId } = req.params;
  const q = "DELETE FROM company_type_master WHERE type_id = ?";
  db.query(q, [typeId], (err, data) => {
    if (err) {
      if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ message: "Cannot delete this company type as it is being used in other records." });
      }
      return res.status(500).json({ message: "Failed to delete company type.", error: err });
    }
    return res.status(200).json({ message: "Company type deleted successfully." });
  });
};