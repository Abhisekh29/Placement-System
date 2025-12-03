import { db } from "../db.js";
export const getDriveDetails = (req, res) => {
  const { driveId } = req.params;
  const q = `
    SELECT 
      pd.drive_id,
      pd.drive_name,
      cm.company_name,
      pd.drive_description,
      pd.ctc
    FROM placement_drive AS pd
    JOIN company_master AS cm ON pd.company_id = cm.company_id
    WHERE pd.is_active = '1' AND pd.drive_id = ?
  `;
  db.query(q, [driveId], (err, data) => {
    if (err) {
      console.error("DB Error fetching drive details:", err);
      return res.status(500).json(err);
    }
    if (data.length === 0) {
      return res.status(404).json({ message: "Active drive not found." });
    }
    return res.status(200).json(data[0]); // Send only the first (and only) result
  });
};

export const getActiveDrives = (req, res) => {
  const q = `
    SELECT 
      pd.drive_id,
      pd.drive_name,
      cm.company_name,
      pd.drive_description,
      pd.ctc
    FROM placement_drive AS pd
    JOIN company_master AS cm ON pd.company_id = cm.company_id
    WHERE pd.is_active = '1'
    ORDER BY pd.drive_id DESC
  `;
  db.query(q, (err, data) => {
    if (err) {
      console.error("DB Error fetching active placement drives:", err);
      return res.status(500).json(err);
    }
    return res.status(200).json(data);
  });
};