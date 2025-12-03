import { db } from "../db.js";

export const getStudentDetails = (req, res) => {
  const q = "SELECT * FROM student_master WHERE userid = ?";

  db.query(q, [req.params.userid], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const addStudent = (req, res) => {
    const q =
    "INSERT INTO student_master(`rollno`, `name`, `mobile`, `email`, `dob`, `gender`, `caste`, `address`, `per_10`, `per_12`, `session_id`, `program_id`, `userid`, `mod_by`) VALUES (?)";

    const values = [
        req.body.rollno,
        req.body.name,
        req.body.mobile,
        req.body.email,
        req.body.dob,
        req.body.gender,
        req.body.caste,
        req.body.address,
        req.body.per_10,
        req.body.per_12,
        req.body.session_id,
        req.body.program_id,
        req.body.userid,
        req.body.mod_by,
    ];

    db.query(q, [values], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json("Student data has been created.");
    });
}

export const updateStudent = (req, res) => {
  const { userid } = req.params;

  // 1. Check if Profile is Locked
  const checkQ = "SELECT is_profile_locked FROM student_master WHERE userid = ?";
  db.query(checkQ, [userid], (err, data) => {
    if (err) return res.status(500).json(err);

    if (data.length > 0 && data[0].is_profile_locked === 'Yes') {
      return res.status(403).json({ 
        message: "Profile is locked. Contact admin to edit details." 
      });
    }

    // 2. Proceed with Update if Not Locked
    const q =
      "UPDATE student_master SET `rollno`=?, `name`=?, `mobile`=?, `email`=?, `dob`=?, `gender`=?, `caste`=?, `address`=?, `per_10`=?, `per_12`=?, `session_id`=?, `program_id`=?, `mod_by`=? WHERE userid = ?";

    const values = [
      req.body.rollno,
      req.body.name,
      req.body.mobile,
      req.body.email,
      req.body.dob,
      req.body.gender,
      req.body.caste,
      req.body.address,
      req.body.per_10,
      req.body.per_12,
      req.body.session_id,
      req.body.program_id,
      req.body.mod_by,
    ];

    db.query(q, [...values, userid], (updateErr, updateData) => {
      if (updateErr) return res.status(500).json(updateErr);
      return res.json("Student data has been updated.");
    });
  });
};

export const getStudentsList = (req, res) => {
  const q = "SELECT userid, name, rollno FROM student_master ORDER BY rollno";
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};