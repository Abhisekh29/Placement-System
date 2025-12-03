import { db } from "../db.js";

// 1. Student Placement Stats Report (Unchanged)
export const getStudentPlacementStats = (req, res) => {
  const {
    yearId,
    studentName,
    rollNo,
    programName,
    sessionName,
    countApply,
    countSelected,
  } = req.query;

  if (!yearId) {
    return res
      .status(400)
      .json({ message: "Academic Year (yearId) is required." });
  }

  let values = [yearId];
  let whereClauses = ["ss.year_id = ?"];
  let havingClauses = [];

  if (studentName) {
    whereClauses.push("s.name LIKE ?");
    values.push(`%${studentName}%`);
  }
  if (rollNo) {
    whereClauses.push("s.rollno LIKE ?");
    values.push(`${rollNo}%`);
  }
  if (programName) {
    whereClauses.push("p.program_name LIKE ?");
    values.push(`%${programName}%`);
  }
  if (sessionName) {
    whereClauses.push("ss.session_name LIKE ?");
    values.push(`%${sessionName}%`);
  }

  if (countApply) {
    havingClauses.push("CAST(count_apply AS CHAR) LIKE ?");
    values.push(`${countApply}%`);
  }
  if (countSelected) {
    havingClauses.push("CAST(count_selected AS CHAR) LIKE ?");
    values.push(`${countSelected}%`);
  }

  const q = `
    SELECT
        s.name AS student_name,
        s.rollno, 
        p.program_name,
        ss.session_name,
        COUNT(sp.drive_id) AS count_apply,
        SUM(CASE WHEN sp.is_selected = 'Yes' THEN 1 ELSE 0 END) AS count_selected
    FROM student_master AS s
    LEFT JOIN student_placement AS sp ON s.userid = sp.user_id
    JOIN session_master AS ss ON s.session_id = ss.session_id
    JOIN program_master AS p ON s.program_id = p.program_id
    WHERE ${whereClauses.join(" AND ")}
    GROUP BY s.userid, s.name, s.rollno, p.program_name, ss.session_name 
    ${havingClauses.length > 0 ? `HAVING ${havingClauses.join(" AND ")}` : ""}
    ORDER BY s.name;
  `;

  db.query(q, values, (err, data) => {
    if (err) {
      console.error("DB Error fetching student placement stats:", err);
      return res.status(500).json(err);
    }
    return res.status(200).json(data);
  });
};

// 2. Placement Drive Stats Report (Unchanged)
export const getPlacementDriveStats = (req, res) => {
  const {
    yearId,
    isActive, // 'all', '1' (Active), '0' (Closed)
    driveName,
    companyName,
    ctc,
    countApply,
    countSelected,
  } = req.query;

  if (!yearId) {
    return res
      .status(400)
      .json({ message: "Academic Year (yearId) is required." });
  }

  let values = [yearId];
  let whereClauses = ["sm.year_id = ?"]; // JOINed via session_master
  let havingClauses = [];

  // --- Build WHERE clauses ---
  if (isActive && isActive !== "all") {
    whereClauses.push("pd.is_active = ?");
    values.push(isActive);
  }
  if (driveName) {
    whereClauses.push("pd.drive_name LIKE ?");
    values.push(`%${driveName}%`);
  }
  if (companyName) {
    whereClauses.push("cm.company_name LIKE ?");
    values.push(`%${companyName}%`);
  }
  if (ctc) {
    whereClauses.push("CAST(pd.ctc AS CHAR) LIKE ?");
    values.push(`${ctc}%`);
  }

  // --- Build HAVING clauses (for aggregated counts) ---
  if (countApply) {
    havingClauses.push("CAST(count_apply AS CHAR) LIKE ?");
    values.push(`${countApply}%`);
  }
  if (countSelected) {
    havingClauses.push("CAST(count_selected AS CHAR) LIKE ?");
    values.push(`${countSelected}%`);
  }

  const q = `
    SELECT
        pd.drive_id,
        pd.drive_name,
        cm.company_name,
        pd.ctc,
        pd.drive_description AS description,
        pd.is_active,
        COUNT(sp.user_id) AS count_apply,
        SUM(CASE WHEN sp.is_selected = 'Yes' THEN 1 ELSE 0 END) AS count_selected
    FROM placement_drive AS pd
    JOIN session_master AS sm ON pd.session_id = sm.session_id
    JOIN company_master AS cm ON pd.company_id = cm.company_id
    LEFT JOIN student_placement AS sp ON pd.drive_id = sp.drive_id
    WHERE ${whereClauses.join(" AND ")}
    GROUP BY pd.drive_id, pd.drive_name, cm.company_name, pd.ctc, pd.drive_description, pd.is_active
    ${havingClauses.length > 0 ? `HAVING ${havingClauses.join(" AND ")}` : ""}
    ORDER BY pd.drive_id DESC;
  `;

  db.query(q, values, (err, data) => {
    if (err) {
      console.error("Failed to fetch placement drive stats:", err);
      return res
        .status(500)
        .json({ message: "Database query error", error: err });
    }
    return res.status(200).json(data);
  });
};

// --- 3. Selected Student List Report (MODIFIED) ---
export const getSelectedStudentsReport = (req, res) => {
  const {
    yearId,
    studentName,
    rollNo,
    programName,
    driveName,
    companyName,
    company_type,
    ctc,
    role,
    place,
  } = req.query;

  if (!yearId) {
    return res
      .status(400)
      .json({ message: "Academic Year (yearId) is required." });
  }

  let values = [yearId];
  // Filter by year AND only selected students
  let whereClauses = ["sm.year_id = ?", "sp.is_selected = 'Yes'"];

  if (studentName) {
    whereClauses.push("s.name LIKE ?");
    values.push(`%${studentName}%`);
  }
  if (rollNo) {
    whereClauses.push("s.rollno LIKE ?");
    values.push(`${rollNo}%`);
  }
  if (programName) {
    whereClauses.push("pm.program_name LIKE ?");
    values.push(`%${programName}%`);
  }
  if (driveName) {
    whereClauses.push("pd.drive_name LIKE ?");
    values.push(`%${driveName}%`);
  }
  if (companyName) {
    whereClauses.push("cm.company_name LIKE ?");
    values.push(`%${companyName}%`);
  }
  if (company_type) {
    whereClauses.push("ct.type_name LIKE ?");
    values.push(`%${company_type}%`);
  }
  if (ctc) {
    whereClauses.push("CAST(sp.ctc AS CHAR) LIKE ?");
    values.push(`${ctc}%`);
  }
  if (role) {
    whereClauses.push("sp.role LIKE ?");
    values.push(`%${role}%`);
  }
  if (place) {
    whereClauses.push("sp.place LIKE ?");
    values.push(`%${place}%`);
  }
  // --- END OF ADDED LOGIC ---

  const q = `
    SELECT 
        s.name AS student_name,
        s.rollno,
        pm.program_name,
        pd.drive_name,
        cm.company_name,
        ct.type_name AS company_type,
        sp.ctc,
        sp.role,
        sp.place
    FROM student_placement AS sp
    JOIN student_master AS s ON sp.user_id = s.userid
    JOIN placement_drive AS pd ON sp.drive_id = pd.drive_id
    JOIN company_master AS cm ON pd.company_id = cm.company_id
    JOIN company_type_master AS ct ON cm.type_id = ct.type_id
    JOIN program_master AS pm ON s.program_id = pm.program_id
    JOIN session_master AS sm ON s.session_id = sm.session_id
    WHERE ${whereClauses.join(" AND ")}
    ORDER BY s.name, pd.drive_name;
  `;

  db.query(q, values, (err, data) => {
    if (err) {
      console.error("Failed to fetch selected students report:", err);
      return res
        .status(500)
        .json({ message: "Database query error", error: err });
    }
    return res.status(200).json(data);
  });
};

// 4. Expenditure Report 
export const getExpenditureReport = (req, res) => {
  const { yearId, expense_on, session_name, amount } = req.query;

  if (!yearId) {
    return res
      .status(400)
      .json({ message: "Academic Year (yearId) is required." });
  }

  let values = [yearId];
  let whereClauses = ["s.year_id = ?"];

  if (expense_on) {
    whereClauses.push("e.expense_on LIKE ?");
    values.push(`%${expense_on}%`);
  }
  if (session_name) {
    whereClauses.push("s.session_name LIKE ?");
    values.push(`%${session_name}%`);
  }
  if (amount) {
    // Cast amount to CHAR to allow LIKE queries (e.g., "100")
    whereClauses.push("CAST(e.amount AS CHAR) LIKE ?");
    values.push(`${amount}%`);
  }

  const q = `
    SELECT 
        e.exp_id AS expenditure_id,
        e.expense_on,
        s.session_name,
        e.amount,
        e.bill_file AS bill_file_path
    FROM expenditure AS e
    JOIN session_master AS s ON e.session_id = s.session_id
    WHERE ${whereClauses.join(" AND ")}
    ORDER BY e.mod_time DESC
  `;

  db.query(q, values, (err, data) => {
    if (err) {
      console.error("Error fetching expenditure report:", err);
      return res
        .status(500)
        .json({ message: "Failed to fetch expenditure report.", error: err });
    }
    return res.status(200).json(data);
  });
};

// 5. Student Internship Report
export const getStudentInternshipReport = (req, res) => {
  const {
    yearId,
    student_name,
    rollno,
    program_name,
    semester,
    session_name,
    internship_count,
  } = req.query;

  if (!yearId) {
    return res
      .status(400)
      .json({ message: "Academic Year (yearId) is required." });
  }

  let values = [yearId];
  // sm represents the student's admission session/batch
  let whereClauses = ["sm.year_id = ?"];
  let havingClauses = [];

  if (student_name) {
    whereClauses.push("s.name LIKE ?");
    values.push(`%${student_name}%`);
  }
  if (rollno) {
    whereClauses.push("s.rollno LIKE ?");
    values.push(`%${rollno}%`);
  }
  if (program_name) {
    whereClauses.push("p.program_name LIKE ?");
    values.push(`%${program_name}%`);
  }
  
  // Filter by the session name of the INTERNSHIP
  if (session_name) {
    whereClauses.push("iss.session_name LIKE ?");
    values.push(`%${session_name}%`);
  }

  if (semester) {
    if (semester.toLowerCase() === "n/a" || semester === "0") {
      havingClauses.push("semester IS NULL");
    } else {
      havingClauses.push("CAST(semester AS CHAR) LIKE ?");
      values.push(`${semester}%`);
    }
  }

  if (internship_count) {
    havingClauses.push("CAST(internship_count AS CHAR) LIKE ?");
    values.push(`${internship_count}%`);
  }

  const q = `
    SELECT 
        s.userid, 
        s.name AS student_name, 
        s.rollno, 
        p.program_name, 
        si.semester, 
        iss.session_name AS internship_session, 
        COUNT(si.internship_id) AS internship_count
    FROM 
        student_master AS s
    JOIN 
        session_master AS sm ON s.session_id = sm.session_id
    JOIN 
        program_master AS p ON s.program_id = p.program_id
    LEFT JOIN 
        student_internship AS si ON s.userid = si.user_id
    LEFT JOIN
        session_master AS iss ON si.session_id = iss.session_id 
    WHERE 
        ${whereClauses.join(" AND ")}
    GROUP BY 
        s.userid, s.name, s.rollno, p.program_name, si.semester, iss.session_name
    ${
      havingClauses.length > 0 ? "HAVING " + havingClauses.join(" AND ") : ""
    }
    ORDER BY 
        s.name, si.semester;
  `;

  db.query(q, values, (err, data) => {
    if (err) {
      console.error("Error fetching student internship report:", err);
      return res
        .status(500)
        .json({
          message: "Failed to fetch student internship report.",
          error: err,
        });
    }
    return res.status(200).json(data);
  });
};