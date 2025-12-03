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

export const addAcademicSession = (req, res) => {
  const { session_name, year_id, mod_by } = req.body;
  
  const insertQuery = "INSERT INTO session_master (session_name, year_id, mod_by, mod_time) VALUES (?, ?, ?, NOW())";
  db.query(insertQuery, [session_name, year_id, mod_by], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(201).json({ message: "Academic session added successfully." });
  });
};

export const updateAcademicSession = (req, res) => {
  const { sessionId } = req.params;
  const { session_name, year_id, mod_by } = req.body;
  const q = "UPDATE session_master SET session_name = ?, year_id = ?, mod_by = ?, mod_time = NOW() WHERE session_id = ?";
  db.query(q, [session_name, year_id, mod_by, sessionId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json({ message: "Academic session updated successfully." });
  });
};

export const deleteAcademicSession = (req, res) => {
  const { sessionId } = req.params;
  const q = "DELETE FROM session_master WHERE session_id = ?";
  db.query(q, [sessionId], (err, data) => {
    if (err) {
      if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ message: "Cannot delete this session as it is being used in other records." });
      }
      return res.status(500).json({ message: "Failed to delete academic session.", error: err });
    }
    return res.status(200).json({ message: "Academic session deleted successfully." });
  });
};