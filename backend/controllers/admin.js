import { db } from "../db.js";

// GET a single admin's details
export const getAdminDetails = (req, res) => {
  const userId = req.user.userid; // Defined as userId (camelCase)
  const q = "SELECT * FROM admin_master WHERE userid = ?";

  db.query(q, [userId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

// CREATE or UPDATE admin details (Upsert)
export const addOrUpdateAdminDetails = (req, res) => {
  const userId = req.user.userid;
  const { name, mobile, email, dob } = req.body;

  if (!name || !mobile || !email || !dob) {
    return res.status(400).json("All fields are required.");
  }

  const checkQ = "SELECT * FROM admin_master WHERE userid = ?";
  
  db.query(checkQ, [userId], (err, data) => {
    if (err) return res.status(500).json(err);

    let q;
    let values; 

    if (data.length > 0) {
      // --- UPDATE ---
      q = `
        UPDATE admin_master 
        SET name = ?, mobile = ?, email = ?, dob = ? 
        WHERE userid = ?
      `;
      values = [name, mobile, email, dob, userId];
    } else {
      // --- INSERT ---
      q = `
        INSERT INTO admin_master (name, mobile, email, dob, userid) 
        VALUES (?, ?, ?, ?, ?)
      `;
      values = [name, mobile, email, dob, userId];
    }

    db.query(q, values, (err, data) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json("Email or Mobile number already in use.");
        }
        return res.status(500).json(err);
      }
      const newDetails = { userid: userId, name, mobile, email, dob };
      return res.status(200).json(newDetails);
    });
  });
};