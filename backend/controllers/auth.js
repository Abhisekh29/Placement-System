import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// REGISTER
export const register = (req, res) => {
  const q = "SELECT * FROM user_master WHERE username = ?";

  db.query(q, [req.body.username], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length) return res.status(409).json("User already exists!");

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    // Insert new user
    const insertQ =
      "INSERT INTO user_master(`username`, `password`, `user_type`, `is_enable`) VALUES (?)";

    const values = [
      req.body.username,
      hash,
      req.body.user_type, // "0" = admin, "1" = student
      "0", // is_enable default: 0 (pending approval)
    ];

    db.query(insertQ, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("User has been created.");
    });
  });
};

// LOGIN
export const login = (req, res) => {
  //Check user
  const q = "SELECT * FROM user_master WHERE username = ?";

  db.query(q, [req.body.username], (err, data) => {
    if (err) return res.json(err);
    if (data.length === 0) return res.status(404).json("User Not Found!");

    // Check Password
    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      data[0].password
    );

    if (!isPasswordCorrect)
      return res.status(400).json("Wrong Username or Password!");

    // const token = jwt.sign({ id: data[0].id }, "jwtkey");
    const token = jwt.sign(
      {
        userid: data[0].userid, // use the correct column name
        username: data[0].username, // optional, nice to have
        user_type: data[0].user_type, // optional, useful for role-based access
      },
      "jwtkey",
       // { expiresIn: "10s" }
    );
    const { password, ...other } = data[0];

    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json({ token, ...other });
  });
};

// LOGOUT
export const logout = (req, res) => {
  console.log("User logged out");
  res
    .clearCookie("access_token", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    })
    .status(200)
    .json("User logged out");
};

export const changePassword = (req, res) => {
  // 1. Get userid from the verified token
  const userId = req.user.userid;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json("Old and new passwords are required.");
  }
  
  if (newPassword.length < 4) {
    return res.status(400).json("New password must be at least 4 characters.");
  }

  // 2. Get the user's current password from DB
  const q = "SELECT password FROM user_master WHERE userid = ?";
  db.query(q, [userId], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("User not found.");

    const user = data[0];

    // 3. Check if the old password is correct
    const isPasswordCorrect = bcrypt.compareSync(oldPassword, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json("Incorrect old password!");
    }

    // 4. Hash the new password
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newPassword, salt);

    // 5. Update the password in the database
    const updateQ = "UPDATE user_master SET password = ? WHERE userid = ?";
    db.query(updateQ, [hash, userId], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("Password has been changed successfully.");
    });
  });
};

// VERIFY STUDENT DETAILS FOR PASSWORD RESET
export const verifyStudentDetails = (req, res) => {
  const { username, mobile, email, dob } = req.body;

  if (!username || !mobile || !email || !dob) {
    return res.status(400).json("All fields are required for verification.");
  }

  // This query joins user_master and student_master to find a match
  const q = `
    SELECT u.userid 
    FROM user_master u
    JOIN student_master s ON u.userid = s.userid
    WHERE u.username = ? 
      AND s.mobile = ? 
      AND s.email = ? 
      AND s.dob = ?
  `;
  
  // Assumes DOB is sent in 'YYYY-MM-DD' format from the frontend
  const values = [username, mobile, email, dob];

  db.query(q, values, (err, data) => {
    if (err) {
      console.error("DB Error in verifyStudentDetails:", err);
      return res.status(500).json("Database query failed.");
    }

    if (data.length === 0) {
      // No user matched all 4 criteria
      return res.status(404).json("Details do not match. Please try again.");
    }

    // Details matched. Send back the userid to be used in the next step.
    return res.status(200).json({ 
      message: "Verification successful. Please set your new password.",
      userid: data[0].userid 
    });
  });
};

export const verifyAdminDetails = (req, res) => {
  const { username, mobile, email, dob } = req.body;

  if (!username || !mobile || !email || !dob) {
    return res.status(400).json("All fields are required for verification.");
  }

  // This query joins with admin_master instead
  const q = `
    SELECT u.userid 
    FROM user_master u
    JOIN admin_master a ON u.userid = a.userid
    WHERE u.username = ? 
      AND a.mobile = ? 
      AND a.email = ? 
      AND a.dob = ?
  `;
  
  const values = [username, mobile, email, dob];

  db.query(q, values, (err, data) => {
    if (err) {
      console.error("DB Error in verifyAdminDetails:", err);
      return res.status(500).json("Database query failed.");
    }

    if (data.length === 0) {
      return res.status(404).json("Details do not match. Please try again.");
    }

    return res.status(200).json({ 
      message: "Verification successful. Please set your new password.",
      userid: data[0].userid 
    });
  });
};

// RESET PASSWORD (PUBLIC)
// This is called *after* verification is successful
export const resetPasswordPublic = (req, res) => {
  const { userid, newPassword } = req.body;

  if (!userid || !newPassword) {
    return res.status(400).json("User ID and new password are required.");
  }
  if (newPassword.length < 4) {
    return res.status(400).json("Password must be at least 4 characters.");
  }

  // Hash the new password
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(newPassword, salt);

  // Update the password using the userid we got from verification
  const q = "UPDATE user_master SET password = ? WHERE userid = ?";
  
  db.query(q, [hash, userid], (err, data) => {
    if (err) {
      console.error("DB Error in resetPasswordPublic:", err);
      return res.status(500).json("Failed to update password.");
    }
    if (data.affectedRows === 0) {
      return res.status(404).json("User not found.");
    }
    return res.status(200).json("Password has been reset successfully!");
  });
};