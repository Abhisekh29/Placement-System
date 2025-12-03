import { db } from "../db.js";

export const getCompanies = (req, res) => {
  const q = `
    SELECT 
      c.company_id,
      c.company_name,
      c.hr_name,
      c.company_mobile,
      c.company_email,
      ct.type_name,
      c.company_description,
      c.mod_time,
      um.username AS modified_by
    FROM company_master AS c
    JOIN company_type_master AS ct ON c.type_id = ct.type_id
    LEFT JOIN user_master AS um ON c.mod_by = um.userid
    ORDER BY c.company_id DESC
  `;
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};
export const addCompany = (req, res) => {
  const q = "INSERT INTO company_master (`company_name`, `hr_name`, `company_mobile`, `company_email`, `type_id`, `company_description`, `mod_by`, `mod_time`) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";
  const values = [
    req.body.company_name,
    req.body.hr_name,
    req.body.company_mobile,
    req.body.company_email,
    req.body.type_id,
    req.body.company_description,
    req.body.mod_by,
  ];

  db.query(q, values, (err, data) => {
    if (err) {
      // Log the full error for your reference
      console.error("SQL Error:", err);

      // Check if the error is a duplicate entry
      if (err.code === 'ER_DUP_ENTRY') {
        let field = "A unique field"; // Default field name
        const sqlMessage = err.sqlMessage || "";

        // Check which unique constraint was violated
        // NOTE: Adjust these key names if they are different in your database schema!
        if (sqlMessage.includes('company_email_UNIQUE')) {
          field = "Email address";
        } else if (sqlMessage.includes('company_name_UNIQUE')) {
          field = "Company name";
        } else if (sqlMessage.includes('company_mobile_UNIQUE')) {
            field = "Mobile number";
        }

        // Send a 409 Conflict status with a specific message
        return res.status(409).json({ message: `${field} is already used by another company.` });
      }

      // For any other type of database error, send a generic 500 error
      return res.status(500).json({ message: "A database error occurred while adding the company." });
    }

    // If successful
    return res.status(201).json({ message: "Company added successfully." });
  });
};

export const updateCompany = (req, res) => {
  const { companyId } = req.params;
  const q = "UPDATE company_master SET `company_name` = ?, `hr_name` = ?, `company_mobile` = ?, `company_email` = ?, `type_id` = ?, `company_description` = ?, `mod_by` = ?, `mod_time` = NOW() WHERE company_id = ?";
  const values = [
    req.body.company_name,
    req.body.hr_name,
    req.body.company_mobile,
    req.body.company_email,
    req.body.type_id,
    req.body.company_description,
    req.body.mod_by,
  ];
  db.query(q, [...values, companyId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json({ message: "Company updated successfully." });
  });
};

export const deleteCompany = (req, res) => {
  const { companyId } = req.params;
  const q = "DELETE FROM company_master WHERE company_id = ?";
  db.query(q, [companyId], (err, data) => {
    if (err) {
      if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ message: "Cannot delete this company as it is being used in other records." });
      }
      return res.status(500).json({ message: "Failed to delete company.", error: err });
    }
    return res.status(200).json({ message: "Company deleted successfully." });
  });
};