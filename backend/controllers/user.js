import { db } from "../db.js";
import bcrypt from "bcryptjs";

export const getPendingUsers = (req, res) => {
  const q = "SELECT userid, username, user_type, mod_time FROM user_master WHERE is_enable = '0' ORDER BY mod_time DESC";
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};


export const updateUserStatus = (req, res) => {
  const { userid } = req.params;
  const { status, mod_by } = req.body;
  
  if (!status || !mod_by) {
    // This handles the case where mod_by is missing (caused "status for null" error previously)
    return res.status(400).json({ message: "Status and modifier (mod_by) are required." });
  }

  // q: Update user_master table
  const q = "UPDATE user_master SET is_enable = ?, mod_by = ?, mod_time = NOW() WHERE userid = ?";
  const values = [status, mod_by, userid];

  db.query(q, values, (err, data) => {
    if (err) {
      console.error("DB Error updating user status:", err);
      return res.status(500).json({ message: "Database failed to update user status.", error: err });
    }
    
    if (data.affectedRows === 0) {
        return res.status(404).json({ message: "User not found or status already set." });
    }
    
    // Success: Returns 200 OK.
    return res.status(200).json({ message: `User status updated to ${status}` });
  });
};

// This finds all users who exist in user_master but NOT in student_master or admin_master
export const getIncompleteUsers = (req, res) => {
  // Get the search term from query parameters, default to empty string
  const searchTerm = req.query.search || "";

  // Base query
  let q = `
    SELECT u.userid, u.username, u.user_type
    FROM user_master u
    LEFT JOIN student_master s ON u.userid = s.userid
    LEFT JOIN admin_master a ON u.userid = a.userid
    WHERE s.userid IS NULL AND a.userid IS NULL
  `;

  const values = [];

  // If there is a search term, add a WHERE clause to filter by username
  if (searchTerm) {
    q += " AND u.username LIKE ?";
    values.push(`%${searchTerm}%`);
  }

  q += " ORDER BY u.userid DESC"; // Add ordering

  db.query(q, values, (err, data) => {
    if (err) {
      console.error("DB Error fetching incomplete users:", err);
      return res.status(500).json(err);
    }
    return res.status(200).json(data);
  });
};

export const resetPassword = (req, res) => {
  const { userid } = req.params; // The user whose password will be reset
  const { newPassword } = req.body;
  const adminUserId = req.user.userid; // The admin performing the action

  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json("Password must be at least 4 characters.");
  }

  // Hash the new password
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(newPassword, salt);

  // Update the password and set 'mod_by'
  const q = "UPDATE user_master SET password = ?, mod_by = ?, mod_time = NOW() WHERE userid = ?";
  db.query(q, [hash, adminUserId, userid], (err, data) => {
    if (err) {
      console.error("DB Error resetting password:", err);
      return res.status(500).json(err);
    }
    if (data.affectedRows === 0) {
      return res.status(404).json("User not found.");
    }
    return res.status(200).json("Password has been reset successfully.");
  });
};