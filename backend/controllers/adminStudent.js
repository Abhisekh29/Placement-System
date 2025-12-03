import { db } from "../db.js";

// --- HELPER: Validate Freeze Eligibility ---
// Returns { valid: true } or { valid: false, reason: "..." }
const validateFreezeEligibility = async (userid) => {
  try {
    // 1. Check Pending Placements
    const placementCheckQuery =
      "SELECT COUNT(*) as count FROM student_placement WHERE user_id = ? AND is_selected = 'Pending'";
    const [placementData] = await db.promise().query(placementCheckQuery, [userid]);

    if (placementData[0].count > 0) {
      return { valid: false, reason: `Has ${placementData[0].count} pending placement application(s).` };
    }

    // 2. Check Internship Requirements
    const studentQuery = "SELECT program_id FROM student_master WHERE userid = ?";
    const [studentData] = await db.promise().query(studentQuery, [userid]);

    if (studentData.length === 0) return { valid: false, reason: "Student profile not found." };
    
    const studentProgramId = studentData[0].program_id;
    const reqQuery = "SELECT semester, internship_count FROM internship_requirement WHERE program_id = ?";
    const [requirements] = await db.promise().query(reqQuery, [studentProgramId]);

    if (requirements.length > 0) {
      const completedQuery =
        "SELECT semester, COUNT(*) as count FROM student_internship WHERE user_id = ? GROUP BY semester";
      const [completedData] = await db.promise().query(completedQuery, [userid]);

      const completedMap = new Map();
      completedData.forEach((item) => completedMap.set(item.semester, item.count));

      for (const req of requirements) {
        const completedCount = completedMap.get(req.semester) || 0;
        if (completedCount < req.internship_count) {
          const needed = req.internship_count - completedCount;
          return { valid: false, reason: `Missing ${needed} internship(s) for Semester ${req.semester}.` };
        }
      }
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, reason: "Database error during validation." };
  }
};

// Fetching active students (is_enable = '1') WITH PAGINATION
export const getStudents = (req, res) => {
  // --- Pagination & Filter Parameters ---
  const {
    yearId, // Required filter
    programId, // Optional filter
    search, // Optional search term
    page, // Page number
    limit, // Records per page (10, 50, 100, All)
  } = req.query;

  if (!yearId) {
    return res
      .status(400)
      .json({ message: "Academic Year is required for fetching students." });
  }

  // --- 1. Build the Data Query ---
  let q = `
    SELECT 
      s.userid, s.rollno, s.name, s.mobile, s.email, s.dob, s.gender,
      s.caste, s.address, s.per_10, s.per_12,
      ss.session_name,
      p.program_name,
      s.is_profile_frozen,
      s.is_profile_locked, -- Added Lock Status
      s.mod_time,
      um.username AS modified_by
    FROM student_master AS s
    JOIN session_master AS ss ON s.session_id = ss.session_id
    JOIN academic_year AS ay ON ss.year_id = ay.year_id 
    JOIN program_master AS p ON s.program_id = p.program_id
    LEFT JOIN user_master AS um ON s.mod_by = um.userid
    JOIN user_master AS u ON s.userid = u.userid
  `;

  // --- 2. Build the COUNT Query ---
  // This query must have the SAME filters as the data query
  let countQuery = `
    SELECT COUNT(*) as total
    FROM student_master AS s
    JOIN session_master AS ss ON s.session_id = ss.session_id
    JOIN academic_year AS ay ON ss.year_id = ay.year_id 
    JOIN program_master AS p ON s.program_id = p.program_id
    JOIN user_master AS u ON s.userid = u.userid
  `;

  // --- 3. Dynamically Add WHERE Clauses ---
  const values = [];
  const countValues = [];

  // Condition 1: Must be an active student in the selected Academic Year
  let conditions = ["u.is_enable = '1'", "ay.year_id = ?"];
  values.push(yearId);
  countValues.push(yearId);

  // Condition 2: Optional Program filter
  if (programId && programId !== "all") {
    conditions.push("p.program_id = ?");
    values.push(programId);
    countValues.push(programId);
  }

  // Condition 3: Optional Search filter
  if (search) {
    // Search by student name OR roll number
    conditions.push("(s.name LIKE ? OR s.rollno LIKE ?)");
    const searchTerm = `%${search}%`;
    values.push(searchTerm, searchTerm);
    countValues.push(searchTerm, searchTerm);
  }

  // Add all conditions to the queries
  const whereClause = " WHERE " + conditions.join(" AND ");
  q += whereClause;
  countQuery += whereClause;

  // Add sorting
  q += " ORDER BY LENGTH(s.rollno), s.rollno ASC";

  // --- 4. Add Pagination (LIMIT/OFFSET) ---
  if (limit !== "all") {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    q += " LIMIT ? OFFSET ?";
    values.push(limitNum, offset);
  }

  // --- 5. Execute Queries ---
  // We run the COUNT query first to get the total number of records
  db.query(countQuery, countValues, (err, countData) => {
    if (err) {
      console.error("DB Error (Count) fetching active students:", err);
      return res.status(500).json(err);
    }

    const total = countData[0].total;
    if (total === 0) {
      // No students found, return empty set
      return res.status(200).json({ data: [], total: 0 });
    }

    // Now run the Data query to get the paginated results
    db.query(q, values, (err, data) => {
      if (err) {
        console.error("DB Error (Data) fetching active students:", err);
        return res.status(500).json(err);
      }
      // Return both the page data and the total count
      return res.status(200).json({ data: data, total: total });
    });
  });
};

//  NEW FUNCTION: Fetching rejected students (is_enable = '2') 
export const getRejectedStudents = (req, res) => {
  const q = `
    SELECT 
      u.userid,
      s.name,
      s.rollno,
      s.mobile,
      u.username,
      u.user_type,
      u.mod_time,
      um.username AS modified_by
    FROM user_master AS u
    LEFT JOIN student_master AS s ON u.userid = s.userid
    LEFT JOIN user_master AS um ON u.mod_by = um.userid
    WHERE u.is_enable = '2' 
    ORDER BY u.mod_time DESC
  `;

  db.query(q, (err, data) => {
    if (err) {
      console.error("DB Error fetching rejected students:", err);
      return res.status(500).json(err);
    }
    return res.status(200).json(data);
  });
};

export const updateStudent = (req, res) => {
  const { userid } = req.params;
  const q =
    "UPDATE Student_master SET `rollno` = ?, `name` = ?, `mobile` = ?, `email` = ?, `dob` = ?, `gender` = ? , `caste` = ? , `address` = ? , `per_10` = ? , `per_12` = ? , `session_id` = ?, `program_id` = ?, `mod_by` = ?, `mod_time` = NOW() WHERE userid = ?";
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
  db.query(q, [...values, userid], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json({ message: "Student updated successfully." });
  });
};

export const deleteStudent = (req, res) => {
  const { userid } = req.params;

  // Start transaction to ensure both records are handled
  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ message: "Transaction failed." });

    // 1. Delete from student_master
    const q1 = "DELETE FROM Student_master WHERE userid = ?";
    db.query(q1, [userid], (err, data) => {
      // Check for foreign key constraints on student_master
      if (err && err.code === "ER_ROW_IS_REFERENCED_2") {
        return db.rollback(() =>
          res
            .status(400)
            .json({
              message:
                "Cannot delete student: They have existing placement or internship records.",
            })
        );
      }

      db.commit((commitErr) => {
        if (commitErr)
          return db.rollback(() =>
            res.status(500).json({ message: "Commit failed." })
          );
        return res
          .status(200)
          .json({ message: "Student and User records deleted successfully." });
      });
    });
  });
};


// --- FREEZE FUNCTION ---
export const freezeStudent = async (req, res) => {
  const { userid } = req.params;
  const mod_by = req.user.userid; // Get admin ID from token

  try {
    // === Check 1: Pending Placements ===
    const placementCheckQuery =
      "SELECT COUNT(*) as count FROM student_placement WHERE user_id = ? AND is_selected = 'Pending'";
    
    const [placementData] = await db.promise().query(placementCheckQuery, [userid]);

    if (placementData[0].count > 0) {
      return res.status(400).json({
        message: `Cannot freeze: Student has ${placementData[0].count} pending placement application(s).`,
      });
    }

    // === Check 2: Internship Requirements ===
    const studentQuery = "SELECT program_id FROM student_master WHERE userid = ?";
    const [studentData] = await db.promise().query(studentQuery, [userid]);
    
    if (studentData.length === 0) {
      return res.status(404).json({ message: "Student not found." });
    }
    const studentProgramId = studentData[0].program_id;

    const reqQuery = "SELECT semester, internship_count FROM internship_requirement WHERE program_id = ?";
    const [requirements] = await db.promise().query(reqQuery, [studentProgramId]);

    if (requirements.length > 0) {
      const completedQuery =
        "SELECT semester, COUNT(*) as count FROM student_internship WHERE user_id = ? GROUP BY semester";
      const [completedData] = await db.promise().query(completedQuery, [userid]);

      const completedMap = new Map();
      completedData.forEach(item => {
        completedMap.set(item.semester, item.count);
      });

      for (const req of requirements) {
        const completedCount = completedMap.get(req.semester) || 0;
        if (completedCount < req.internship_count) {
          const needed = req.internship_count - completedCount;
          return res.status(400).json({
            message: `Cannot freeze: Missing ${needed} internship(s) for Semester ${req.semester}.`,
          });
        }
      }
    }

    // === All Checks Passed: Freeze Profile ===
    const freezeQuery = "UPDATE student_master SET is_profile_frozen = 'Yes', mod_by = ?, mod_time = NOW() WHERE userid = ?";
    await db.promise().query(freezeQuery, [mod_by, userid]);

    return res.status(200).json({ message: "Student profile has been frozen." });

  } catch (err) {
    console.error("Error freezing student:", err);
    return res.status(500).json({ message: "An internal server error occurred.", error: err });
  }
};

export const unfreezeStudent = async (req, res) => {
  const { userid } = req.params;
  const mod_by = req.user.userid; // Get admin ID from token

  try {
    const unfreezeQuery =
      "UPDATE student_master SET is_profile_frozen = 'No', mod_by = ?, mod_time = NOW() WHERE userid = ?";
    const [result] = await db.promise().query(unfreezeQuery, [mod_by, userid]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Student not found." });
    }

    return res
      .status(200)
      .json({ message: "Student profile has been unfrozen." });
  } catch (err) {
    console.error("Error unfreezing student:", err);
    return res
      .status(500)
      .json({ message: "An internal server error occurred.", error: err });
  }
};

// --- LOCK / UNLOCK FUNCTIONS (Manual) ---
export const lockStudent = async (req, res) => {
  const { userid } = req.params;
  const mod_by = req.user.userid;

  try {
    const q = "UPDATE student_master SET is_profile_locked = 'Yes', mod_by = ?, mod_time = NOW() WHERE userid = ?";
    await db.promise().query(q, [mod_by, userid]);
    return res.status(200).json({ message: "Student profile has been locked." });
  } catch (err) {
    return res.status(500).json({ message: "Error locking student.", error: err });
  }
};

export const unlockStudent = async (req, res) => {
  const { userid } = req.params;
  const mod_by = req.user.userid;

  try {
    const q = "UPDATE student_master SET is_profile_locked = 'No', mod_by = ?, mod_time = NOW() WHERE userid = ?";
    await db.promise().query(q, [mod_by, userid]);
    return res.status(200).json({ message: "Student profile has been unlocked." });
  } catch (err) {
    return res.status(500).json({ message: "Error unlocking student.", error: err });
  }
};

// --- CENTRAL BULK UPDATE FUNCTION ---
export const bulkUpdateStudentStatus = async (req, res) => {
  const { userids, action } = req.body; // action: 'freeze', 'unfreeze', 'lock', 'unlock'
  const mod_by = req.user.userid;

  if (!userids || userids.length === 0) {
    return res.status(400).json({ message: "No students selected." });
  }

  try {
    // === Case 1: Bulk Freeze (PARTIAL SUCCESS LOGIC) ===
    // We verify everyone. We freeze the good ones. We list the bad ones.
    if (action === "freeze") {
      const failures = [];
      const successIds = [];

      // Validate ALL selected students
      for (const id of userids) {
        const check = await validateFreezeEligibility(id);
        if (!check.valid) {
          // Add to failure report
          const [sData] = await db.promise().query("SELECT rollno, name FROM student_master WHERE userid = ?", [id]);
          failures.push({
            userid: id,
            rollno: sData[0]?.rollno || "N/A",
            name: sData[0]?.name || "Unknown",
            reason: check.reason
          });
        } else {
          // Add to success list
          successIds.push(id);
        }
      }

      // Execute freeze for the successful ones (if any)
      if (successIds.length > 0) {
        const q = "UPDATE student_master SET is_profile_frozen = 'Yes', mod_by = ?, mod_time = NOW() WHERE userid IN (?)";
        await db.promise().query(q, [mod_by, successIds]);
      }

      // Return results (Successful count + Failure details)
      return res.status(200).json({
        message: `Processed: ${successIds.length} frozen, ${failures.length} skipped due to requirements.`,
        failures: failures, // Frontend will generate Excel from this
        successCount: successIds.length
      });
    }

    // === Case 2: Simple Bulk Actions (Unfreeze, Lock, Unlock) - Direct Update ===
    let field = "";
    let status = "";

    if (action === "unfreeze") { field = "is_profile_frozen"; status = "No"; }
    else if (action === "lock") { field = "is_profile_locked"; status = "Yes"; }
    else if (action === "unlock") { field = "is_profile_locked"; status = "No"; }
    else { return res.status(400).json({ message: "Invalid action." }); }

    const q = `UPDATE student_master SET ${field} = ?, mod_by = ?, mod_time = NOW() WHERE userid IN (?)`;
    await db.promise().query(q, [status, mod_by, userids]);

    return res.status(200).json({ 
      message: `Bulk ${action} successful for ${userids.length} student(s).` 
    });

  } catch (err) {
    console.error("Bulk update error:", err);
    return res.status(500).json({ message: "Bulk update failed.", error: err });
  }
};