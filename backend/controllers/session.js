import { db } from "../db.js";

export const getSessions = (req, res) => {
  const q = "SELECT * FROM session_master";
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};