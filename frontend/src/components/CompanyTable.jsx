import React, { useState, useEffect } from "react";
import api from "../api/axios";

const initialFormState = {
  company_name: "",
  hr_name: "",
  company_mobile: "",
  company_email: "",
  type_id: "",
  company_description: "",
};

const CompanyTable = ({ setToastMessage }) => {
  const [companies, setCompanies] = useState([]);
  const [companyTypes, setCompanyTypes] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [actionToConfirm, setActionToConfirm] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  //  --- NEW STATE FOR SEARCH --- 
  const [searchTerm, setSearchTerm] = useState("");

  const user = JSON.parse(sessionStorage.getItem("user"));

  // Fetch initial data
  const fetchCompanies = async () => {
    try {
      const res = await api.get("/adminCompany");
      setCompanies(res.data);
    } catch (err) {
      console.error(err);
      setToastMessage({ type: "error", content: "Failed to load companies." });
    }
  };

  const fetchCompanyTypes = async () => {
    try {
      const res = await api.get("/companyType");
      setCompanyTypes(res.data);
    } catch (err) {
      console.error(err);
      setToastMessage({
        type: "error",
        content: "Failed to load company types.",
      });
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchCompanyTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddClick = () => {
    setFormData(initialFormState);
    setShowAddModal(true);
  };

  const handleEditClick = (company) => {
    setEditingCompany(company);
    setFormData({
      company_name: company.company_name,
      hr_name: company.hr_name,
      company_mobile: company.company_mobile,
      company_email: company.company_email,
      type_id: company.type_id,
      company_description: company.company_description,
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (company) => {
    setActionToConfirm(
      () => () => deleteCompany(company.company_id, company.company_name)
    );
    setShowConfirmModal(true);
  };

  const confirmAction = () => {
    if (actionToConfirm) actionToConfirm();
    setShowConfirmModal(false);
  };

  //  --- NEW EXPORT FUNCTION --- 
  const exportToExcel = (filteredData) => {
    if (filteredData.length === 0) {
      setToastMessage({ type: "error", content: "No records to export." });
      return;
    }

    const headers = [
      "Company Name", "HR Name", "Email", "Mobile", "Type", "Description", "Modified By", "Last Modified"
    ];

    const dataRows = filteredData.map((company) =>
      [
        `"${(company.company_name || "").replace(/"/g, '""')}"`,
        `"${(company.hr_name || "").replace(/"/g, '""')}"`,
        `"${(company.company_email || "").replace(/"/g, '""')}"`,
        `"${(company.company_mobile || "").replace(/"/g, '""')}"`,
        `"${(company.type_name || "").replace(/"/g, '""')}"`,
        `"${(company.company_description || "").replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        `"${(company.modified_by || "N/A").replace(/"/g, '""')}"`,
        `"${new Date(company.mod_time).toLocaleString()}"`,
      ].join(",")
    );

    const csvString = [headers.join(","), ...dataRows].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const fileName = `Companies_${new Date().toISOString().split("T")[0]}.csv`;
    
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage({
      type: "success",
      content: `Exported ${filteredData.length} records.`,
    });
  };

  // --- CRUD API Calls ---
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.company_name ||
      !formData.company_mobile ||
      !formData.company_email ||
      !formData.type_id
    ) {
      setToastMessage({
        type: "error",
        content: "Name, Mobile, Email, and Type are required.",
      });
      return;
    }

    try {
      await api.post("/adminCompany", { ...formData, mod_by: user.userid });
      setShowAddModal(false);
      fetchCompanies(); // Refresh
      setToastMessage({
        type: "success",
        content: "Company added successfully.",
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to add company.";
      setToastMessage({ type: "error", content: errorMessage });
    }
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    const noChanges =
      formData.company_name.trim() === editingCompany.company_name &&
      formData.hr_name.trim() === editingCompany.hr_name &&
      formData.company_mobile.trim() === editingCompany.company_mobile &&
      formData.company_email.trim() === editingCompany.company_email &&
      Number(formData.type_id) === editingCompany.type_id &&
      formData.company_description.trim() === editingCompany.company_description;

    if (noChanges) {
      setToastMessage({ type: "info", content: "No changes were made." });
      setShowEditModal(false);
      return;
    }

    setShowEditModal(false);
    setActionToConfirm(() => () => updateCompany());
  };

  const updateCompany = async () => {
    try {
      await api.put(`/adminCompany/${editingCompany.company_id}`, {
        ...formData,
        mod_by: user.userid,
      });
      fetchCompanies(); // Refresh
      setToastMessage({
        type: "success",
        content: "Company updated successfully.",
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update company.";
      setToastMessage({ type: "error", content: errorMessage });
    }
  };

  const deleteCompany = async (companyId, companyName) => {
    try {
      await api.delete(`/adminCompany/${companyId}`);
      fetchCompanies(); // Refresh
      setToastMessage({
        type: "success",
        content: `"${companyName}" has been deleted.`,
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete company.";
      setToastMessage({ type: "error", content: errorMessage });
    }
  };

  //  --- CLIENT-SIDE SEARCH LOGIC --- 
  const filteredCompanies = companies.filter((company) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (company.company_name || "").toLowerCase().includes(searchLower) ||
      (company.hr_name || "").toLowerCase().includes(searchLower) ||
      (company.type_name || "").toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="bg-blue-200 py-2 px-4 rounded-xl shadow-md">
      {/*  --- SEARCH & EXPORT BAR ---  */}
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-2xl font-bold">Manage Companies</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search company, HR, or Type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-60 h-7 p-2 bg-white border rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          <button
            onClick={() => exportToExcel(filteredCompanies)}
            className={`px-3 py-1.5 rounded-lg text-white text-xs transition shadow-sm w-auto flex-shrink-0 
              ${filteredCompanies.length === 0 ? "bg-green-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
            disabled={filteredCompanies.length === 0}
          >
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-x-auto no-scrollbar">
        <div className="min-w-[1200px]">
          <div className="grid grid-cols-[0.5fr_1.5fr_1fr_1.5fr_1fr_1fr_1.5fr_1.5fr_1fr] bg-gray-300 p-2 font-semibold text-sm">
            <div>S.No.</div>
            <div>Company Name</div>
            <div>HR Name</div>
            <div>Email</div>
            <div>Mobile</div>
            <div>Type</div>
            <div>Modified By</div>
            <div>Last Modified</div>
            <div className="text-right">Actions</div>
          </div>
          <div className="max-h-96 overflow-y-auto no-scrollbar">
            {/*  --- MAP OVER filteredCompanies ---  */}
            {filteredCompanies.length > 0 ? (
              filteredCompanies.map((company, index) => (
                <div
                  key={company.company_id}
                  className="grid grid-cols-[0.5fr_1.5fr_1fr_1.5fr_1fr_1fr_1.5fr_1.5fr_1fr] items-center p-2 border-t bg-white text-sm"
                >
                  <div>{index + 1}.</div>
                  <div className="font-semibold">{company.company_name}</div>
                  <div>{company.hr_name || "N/A"}</div>
                  <div className="break-words">{company.company_email}</div>
                  <div>{company.company_mobile}</div>
                  <div>{company.type_name}</div>
                  <div className="break-words">
                    {company.modified_by || "N/A"}
                  </div>
                  <div>{new Date(company.mod_time).toLocaleString()}</div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEditClick(company)}
                      className="bg-blue-500 text-white px-2 py-0.5 rounded-md text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(company)}
                      className="bg-red-500 text-white px-2 py-0.5 rounded-md text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 p-4">
                {searchTerm
                  ? `No companies found matching "${searchTerm}".`
                  : "No companies found."}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Add Button */}
      <div className="mt-4 text-right">
        <button
          onClick={handleAddClick}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-600"
        >
          ➕ Add New Company
        </button>
      </div>

      {/* --- Modals --- */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">
              {showAddModal ? "Add New Company" : "Edit Company"}
            </h3>
            <form onSubmit={showAddModal ? handleAddSubmit : handleUpdateSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  placeholder="Company Name*"
                  className="w-full p-3 border rounded-lg md:col-span-2"
                />
                <input
                  type="text"
                  name="hr_name"
                  value={formData.hr_name}
                  onChange={handleInputChange}
                  placeholder="HR Name"
                  className="w-full p-3 border rounded-lg"
                />
                <select
                  name="type_id"
                  value={formData.type_id}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">Select Type*</option>
                  {companyTypes.map((type) => (
                    <option key={type.type_id} value={type.type_id}>
                      {type.type_name}
                    </option>
                  ))}
                </select>
                <input
                  type="email"
                  name="company_email"
                  value={formData.company_email}
                  onChange={handleInputChange}
                  placeholder="Company Email*"
                  className="w-full p-3 border rounded-lg"
                />
                <input
                  type="text"
                  name="company_mobile"
                  value={formData.company_mobile}
                  onChange={handleInputChange}
                  placeholder="Company Mobile*"
                  className="w-full p-3 border rounded-lg"
                />
                <textarea
                  name="company_description"
                  value={formData.company_description}
                  onChange={handleInputChange}
                  placeholder="Company Description (Optional)"
                  rows="3"
                  className="w-full p-3 border rounded-lg md:col-span-2"
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() =>
                    showAddModal
                      ? setShowAddModal(false)
                      : setShowEditModal(false)
                  }
                  className="px-4 py-2 rounded-lg bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-500 text-white"
                >
                  {showAddModal ? "Add Company" : "Update Company"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Are you sure?
            </h3>
            <p className="text-gray-600 mb-6">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } } .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }`}</style>
    </div>
  );
};

export default CompanyTable;