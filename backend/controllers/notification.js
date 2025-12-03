import { db } from "../db.js";

export const getNotifications = (req, res) => {
  const q = `
    SELECT 
      n.nid, 
      n.date, 
      n.text, 
      n.mod_time, 
      um.username AS modified_by
    FROM notification AS n
    LEFT JOIN user_master AS um ON n.mod_by = um.userid
    ORDER BY n.date DESC
  `;
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const addNotification = (req, res) => {
  const { date, text, mod_by } = req.body;
  const q = "INSERT INTO notification (`date`, `text`, `mod_by`, `mod_time`) VALUES (?, ?, ?, NOW())";
  db.query(q, [date, text, mod_by], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(201).json({ message: "Notification added successfully." });
  });
};

export const updateNotification = (req, res) => {
  const { nid } = req.params;
  const { date, text, mod_by } = req.body;
  const q = "UPDATE notification SET `date` = ?, `text` = ?, `mod_by` = ?, `mod_time` = NOW() WHERE nid = ?";
  db.query(q, [date, text, mod_by, nid], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json({ message: "Notification updated successfully." });
  });
};

export const deleteNotification = (req, res) => {
  const { nid } = req.params;
  const q = "DELETE FROM notification WHERE nid = ?";
  db.query(q, [nid], (err, data) => {
    if (err) {
       // This table likely won't have foreign key issues, but it's good practice to check
      if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ message: "This notification cannot be deleted as it is referenced elsewhere." });
      }
      return res.status(500).json({ message: "Failed to delete notification.", error: err });
    }
    return res.status(200).json({ message: "Notification deleted successfully." });
  });
};