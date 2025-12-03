import { db } from "../db.js";

// Get all departments for the dropdown
export const getAllDepartments = (req, res) => {
  const q = "SELECT department_id, department_name FROM department_master ORDER BY department_name";
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

// Get programs based on the selected department
export const getProgramsByDept = (req, res) => {
  const { deptId } = req.params;
  const q = "SELECT program_id, program_name FROM program_master WHERE department_id = ? ORDER BY program_name";
  db.query(q, [deptId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

// Search for students based on program and a search term (CORRECTED LOGIC)
export const searchStudents = (req, res) => {
  const { progId, searchTerm } = req.query; // No longer uses deptId

  if (!progId) {
    return res.status(400).json({ message: "A Program must be selected to search for students." });
  }

  // The query now correctly filters only by program_id
  let q = `
    SELECT userid, name, rollno 
    FROM student_master
    WHERE program_id = ?
  `;
  const params = [progId];

  if (searchTerm) {
    q += " AND (name LIKE ? OR rollno LIKE ?)";
    params.push(`%${searchTerm}%`, `%${searchTerm}%`);
  }
  
  q += " ORDER BY name";

  db.query(q, params, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};