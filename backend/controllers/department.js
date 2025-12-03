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

export const addDepartment = (req, res) => {
  const { department_name, mod_by } = req.body;
  const q = "INSERT INTO department_master (department_name, mod_by, mod_time) VALUES (?, ?, NOW())";
  db.query(q, [department_name, mod_by], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(201).json({ message: "Department added successfully." });
  });
};

export const updateDepartment = (req, res) => {
  const { departmentId } = req.params;
  const { department_name, mod_by } = req.body;
  const q = "UPDATE department_master SET department_name = ?, mod_by = ?, mod_time = NOW() WHERE department_id = ?";
  db.query(q, [department_name, mod_by, departmentId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json({ message: "Department updated successfully." });
  });
};

export const deleteDepartment = (req, res) => {
  const { departmentId } = req.params;
  const q = "DELETE FROM department_master WHERE department_id = ?";
  db.query(q, [departmentId], (err, data) => {
    if (err) {
      if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ message: "Cannot delete this department as it is being used in other records." });
      }
      return res.status(500).json({ message: "Failed to delete department.", error: err });
    }
    return res.status(200).json({ message: "Department deleted successfully." });
  });
};