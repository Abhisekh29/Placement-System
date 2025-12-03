/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { debounce } from "lodash";

const initialFormState = {
  user_id: "",
  company_id: "",
  semester: "",
  session_id: "",
  certificate: null,
};

const InternshipTable = ({ setToastMessage }) => {
  // --- Pagination & Search State ---
  const [internships, setInternships] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalInternships, setTotalInternships] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const totalPages = Math.ceil(totalInternships / limit);
  const serialNoOffset = (limit === "all" || currentPage === 1) ? 0 : (currentPage - 1) * limit;

  // --- Modal State ---
  const [allStudents, setAllStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingInternship, setEditingInternship] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [filters, setFilters] = useState({ deptId: "", progId: "", searchTerm: "" });
  const [searchedStudents, setSearchedStudents] = useState([]);
  const [actionToConfirm, setActionToConfirm] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const user = JSON.parse(sessionStorage.getItem("user"));

  // --- Debounce Effect ---
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); 
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // --- fetchInternships ---
  const fetchInternships = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/internships", {
        params: {
          search: debouncedSearch,
          page: currentPage,
          limit: limit,
        },
      });
      setInternships(res.data.data || []);
      setTotalInternships(res.data.total || 0);
    } catch (err) {
      console.error("Failed to fetch internships:", err);
      setToastMessage({
        type: "error",
        content: "Failed to load internship data."
      });
      setInternships([]);
      setTotalInternships(0);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, currentPage, limit, setToastMessage]);

  useEffect(() => {
    fetchInternships();
  }, [fetchInternships]);
  
  // --- Modal Data Fetching ---
  const fetchInitialData = async () => {
    try {
      const [studentsRes, companiesRes, deptsRes, sessionsRes] = await Promise.all([
        api.get("/student_master/list/all"),
        api.get("/adminCompany"),
        api.get("/filters/departments"),
        api.get("/session_master"),
      ]);
      setAllStudents(studentsRes.data);
      setCompanies(companiesRes.data);
      setDepartments(deptsRes.data);
      setSessions(sessionsRes.data);
    } catch (err) {
      console.error("Failed to fetch initial data for modals:", err);
    }
  };
  useEffect(() => {
    fetchInitialData();
  }, []);
  useEffect(() => {
    const fetchPrograms = async () => {
      if (filters.deptId) {
        try {
          const res = await api.get(`/filters/programs/${filters.deptId}`);
          setPrograms(res.data);
        } catch (err) {
          setPrograms([]);
          console.error("Failed to fetch programs:", err);
        }
      } else {
        setPrograms([]);
      }
    };
    fetchPrograms();
    setFilters((prev) => ({ ...prev, progId: "", searchTerm: "" }));
    setSearchedStudents([]);
  }, [filters.deptId]);
  useEffect(() => {
    const handler = debounce(async (progId, searchTerm) => {
      if (!progId || !searchTerm.trim()) {
        setSearchedStudents([]);
        return;
      }
      try {
        const res = await api.get("/filters/students/search", {
          params: { progId: Number(progId), searchTerm: searchTerm.trim() },
        });
        setSearchedStudents(res.data);
      } catch (err) {
        console.error("Failed to search students:", err);
      }
    }, 400);
    handler(filters.progId, filters.searchTerm);
    return () => handler.cancel();
  }, [filters.progId, filters.searchTerm]);
  // --- End Modal Data Fetching ---

  // --- Input Handlers ---
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "certificate") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };
  const handlePaginationFilterChange = (e) => {
    const { name, value } = e.target;
    setCurrentPage(1); 
    setLimit(value === "all" ? "all" : Number(value));
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // --- Modal Click Handlers ---
  const handleAddClick = () => {
    setFormData(initialFormState);
    setFilters({ deptId: "", progId: "", searchTerm: "" });
    setSearchedStudents([]);
    setShowAddModal(true);
  };
  const handleEditClick = (internship) => {
    setEditingInternship(internship);
    setFormData({
      user_id: internship.user_id,
      company_id: internship.company_id,
      semester: internship.semester,
      session_id: internship.session_id, 
      certificate: null,
    });
    setShowEditModal(true);
  };
  const handleDeleteClick = (internship) => {
    setActionToConfirm(
      () => () =>
        deleteInternship(internship.internship_id, internship.student_name)
    );
    setShowConfirmModal(true);
  };
  
  // --- Export Function ---
  const exportToExcel = () => {
    if (internships.length === 0) {
      setToastMessage({ type: "error", content: "No records to export." });
      return;
    }

    const headers = [
      "Student Name", "Company", "Program", "Session", "Semester", "Certificate", "Modified By", "Last Modified"
    ];

    const dataRows = internships.map((internship) =>
      [
        `"${(internship.student_name || "N/A").replace(/"/g, '""')}"`,
        `"${(internship.company_name || "N/A").replace(/"/g, '""')}"`,
        `"${(internship.program_name || "N/A").replace(/"/g, '""')}"`,
        `"${(internship.session_name || "N/A").replace(/"/g, '""')}"`,
        `"${internship.semester || "N/A"}"`,
        `"${internship.certificate ? 'Yes' : 'No'}"`,
        `"${(internship.modified_by || "N/A").replace(/"/g, '""')}"`,
        `"${new Date(internship.mod_time).toLocaleString()}"`,
      ].join(",")
    );

    const csvString = [headers.join(","), ...dataRows].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const fileName = `Internships_Page${currentPage}_${new Date().toISOString().split("T")[0]}.csv`;

    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage({
      type: "success",
      content: `Exported ${internships.length} records from current page.`,
    });
  };

  // --- CRUD Functions ---
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.user_id || !formData.company_id || !formData.semester || !formData.session_id || !formData.certificate) {
      setToastMessage({
        type: "error",
        content: "Student, Company, Semester, Session, and Certificate are all required.",
      });
      return;
    }
    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    data.append("mod_by", user.userid);
    try {
      await api.post("/internships", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setShowAddModal(false);
      fetchInternships(); 
      setToastMessage({
        type: "success",
        content: "Internship added successfully.",
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to add internship.";
      setToastMessage({ type: "error", content: errorMessage });
    }
  };

  const confirmAction = () => {
    if (typeof actionToConfirm === "function") {
      actionToConfirm();
    }
    setShowConfirmModal(false);
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    const noChanges =
      Number(formData.user_id) === editingInternship.user_id &&
      Number(formData.company_id) === editingInternship.company_id &&
      Number(formData.semester) === editingInternship.semester &&
      Number(formData.session_id) === editingInternship.session_id &&
      !formData.certificate;
    if (noChanges) {
      setToastMessage({ type: "info", content: "No changes were made." });
      setShowEditModal(false);
      return;
    }
    setShowEditModal(false);
    setActionToConfirm(() => () => updateInternship());
    setShowConfirmModal(true);
  };

  const updateInternship = async () => {
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key !== "certificate" || formData.certificate) {
        data.append(key, formData[key]);
      }
    });
    data.append("mod_by", user.userid);
    try {
      await api.put(`/internships/${editingInternship.internship_id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchInternships(); 
      setToastMessage({
        type: "success",
        content: "Internship updated successfully.",
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update internship.";
      setToastMessage({ type: "error", content: errorMessage });
    }
  };

  const deleteInternship = async (internshipId, studentName) => {
    try {
      await api.delete(`/internships/${internshipId}`);
      fetchInternships(); 
      setToastMessage({
        type: "success",
        content: `Internship for "${studentName}" has been deleted.`,
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete internship.";
      setToastMessage({ type: "error", content: errorMessage });
    }
  };

  return (
    <div className="bg-blue-200 py-2 px-4 rounded-xl shadow-md">
      {/* Search Bar  */}
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-2xl font-bold">Student Internships</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search name, company, program, semester.."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-76 h-8 p-2 bg-white border rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          {/* NEW Export Button  */}
          <button
            onClick={exportToExcel}
            className={`px-3 py-1.5 rounded-lg text-white text-xs transition shadow-sm w-auto flex-shrink-0 
              ${internships.length === 0 ? "bg-green-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
            disabled={internships.length === 0}
          >
            Export Page
          </button>
        </div>
      </div>

      {/* Pagination Controls (Top) */}
      {!isLoading && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-2 text-sm">
          <div className="flex items-center gap-2">
            <label htmlFor="limit-select" className="text-gray-700">Records per page:</label>
            <select
              id="limit-select"
              name="limit"
              value={limit}
              onChange={handlePaginationFilterChange}
              className="p-1 border rounded-lg text-xs bg-white focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value="all">All</option>
            </select>
            {limit !== "all" && (
              <span className="text-gray-600">
                Showing {Math.min(serialNoOffset + 1, totalInternships)} - {Math.min(serialNoOffset + internships.length, totalInternships)} of {totalInternships}
              </span>
            )}
            {limit === "all" && totalInternships > 0 && (
              <span className="text-gray-600">
                Showing all {totalInternships} records
              </span>
            )}
          </div>
          {limit !== "all" && (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-white border rounded-lg shadow-sm text-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <span className="font-semibold">
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1 bg-white border rounded-lg shadow-sm text-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Table Layout */}
      <div className="max-h-400 border rounded-lg overflow-x-auto no-scrollbar">
        <div className="min-w-[1500px]">
          <div className="grid grid-cols-[0.5fr_1.2fr_1.2fr_1.2fr_1fr_0.8fr_1fr_1.5fr_1fr_1fr] bg-gray-300 p-2 font-semibold text-sm">
            <div>Sl. No.</div>
            <div>Student Name</div>
            <div className="text-center">Company</div>
            <div className="text-center">Program</div>
            <div className="text-center">Session</div>
            <div className="text-center">Semester</div>
            <div className="text-center">Certificate</div>
            <div>Modified By</div>
            <div>Last Modified</div>
            <div className="text-right">Actions</div>
          </div>
          <div className="overflow-y-auto no-scrollbar">
            {isLoading ? (
              <p className="text-center text-gray-700 p-4">Loading data...</p>
            ) : internships.length > 0 ? (
              internships.map((internship, index) => (
                <div
                  key={internship.internship_id}
                  className="grid grid-cols-[0.5fr_1.2fr_1.2fr_1.2fr_1fr_0.8fr_1fr_1.5fr_1fr_1fr] items-center p-2 border-t bg-white text-sm"
                >
                  <div>{serialNoOffset + index + 1}.</div>
                  <div className="font-semibold">{internship.student_name}</div>
                  <div className="text-center">{internship.company_name}</div>
                  <div className="text-center">{internship.program_name || "N/A"}</div>
                  <div className="text-center">{internship.session_name || "N/A"}</div>
                  <div className="text-center">{internship.semester}</div>
                  <div className="text-center">
                    {internship.certificate ? (
                      <a
                        href={`http://localhost:8000/uploads/certificates/${internship.certificate}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </div>
                  <div className="break-words pr-6">
                    {internship.modified_by || "N/A"}
                  </div>
                  <div>{new Date(internship.mod_time).toLocaleString()}</div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEditClick(internship)}
                      className="bg-blue-500 text-white px-2 py-0.5 rounded-md text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(internship)}
                      className="bg-red-500 text-white px-2 py-0.5 rounded-md text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 p-4 text-sm">
                {searchTerm
                  ? `No internships found matching "${searchTerm}".`
                  : "No internship records found."}
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
          ➕ Add New Internship
        </button>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl p-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">
              Add New Internship
            </h3>
            <form noValidate onSubmit={handleAddSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select name="deptId" value={filters.deptId} onChange={handleFilterChange} className="w-full p-3 border rounded-lg">
                    <option value="">1. Select Department</option>
                    {departments.map((d) => (<option key={d.department_id} value={d.department_id}>{d.department_name}</option>))}
                  </select>
                  <select name="progId" value={filters.progId} onChange={handleFilterChange} className="w-full p-3 border rounded-lg">
                    <option value="">2. Select Program</option>
                    {programs.map((p) => (<option key={p.program_id} value={p.program_id}>{p.program_name}</option>))}
                  </select>
                </div>
                <div className="relative">
                  <input type="text" name="searchTerm" placeholder="3. Search Student by Name or Roll No." value={filters.searchTerm} onChange={handleFilterChange} className="w-full p-3 border rounded-lg" disabled={!filters.progId} />
                  {searchedStudents.length > 0 && filters.searchTerm && (
                    <ul className="absolute z-10 bg-white border rounded-lg mt-1 w-full max-h-48 overflow-y-auto shadow-md">
                      {searchedStudents.map((s) => (
                        <li key={s.userid} onClick={() => {
                            setFormData((prev) => ({ ...prev, user_id: s.userid }));
                            setFilters((prev) => ({ ...prev, searchTerm: `${s.name} (${s.rollno})`}));
                            setSearchedStudents([]);
                          }}
                          className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${formData.user_id === s.userid ? "bg-gray-200" : ""}`}
                        >
                          {s.name} ({s.rollno})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <select name="company_id" value={formData.company_id} onChange={handleInputChange} className="w-full p-3 border rounded-lg" required>
                  <option value="">4. Select Company</option>
                  {companies.map((c) => (<option key={c.company_id} value={c.company_id}>{c.company_name}</option>))}
                </select>
                <select name="session_id" value={formData.session_id} onChange={handleInputChange} className="w-full p-3 border rounded-lg" required>
                  <option value="">5. Select Session</option>
                  {sessions.map((s) => (<option key={s.session_id} value={s.session_id}>{s.session_name}</option>))}
                </select>
                <input type="number" min={1} max={10} name="semester" value={formData.semester} onChange={handleInputChange} placeholder="6. Semester" className="w-full p-3 border rounded-lg" required />
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  7. Certificate (PDF, JPG, JPEG, PNG)
                </label>
                <input
                  type="file"
                  name="certificate"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleInputChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  required
                />
              </div>
              <div className="flex justify-end mt-6 gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-300 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-500 text-white rounded-lg">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">
              Edit Internship
            </h3>
            <form noValidate onSubmit={handleUpdateSubmit}>
              <div className="grid gap-4">
                <select name="user_id" value={formData.user_id} onChange={handleInputChange} className="w-full p-3 border rounded-lg" required>
                  <option value="">Select Student</option>
                  {allStudents.map((s) => (<option key={s.userid} value={s.userid}>{s.name} ({s.rollno})</option>))}
                </select>
                <select name="company_id" value={formData.company_id} onChange={handleInputChange} className="w-full p-3 border rounded-lg" required>
                  <option value="">Select Company</option>
                  {companies.map((c) => (<option key={c.company_id} value={c.company_id}>{c.company_name}</option>))}
                </select>
                <select name="session_id" value={formData.session_id} onChange={handleInputChange} className="w-full p-3 border rounded-lg" required>
                  <option value="">Select Session</option>
                  {sessions.map((s) => (<option key={s.session_id} value={s.session_id}>{s.session_name}</option>))}
                </select>
                <input type="number" name="semester" value={formData.semester} onChange={handleInputChange} placeholder="Semester" className="w-full p-3 border rounded-lg" required />
                <div>
                  <label className="block text-sm font-medium">Certificate (Optional)</label>
                  <input type="file" name="certificate" onChange={handleInputChange} accept=".pdf,.jpg,.jpeg,.png" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
                  {editingInternship && editingInternship.certificate && (
                    <p className="text-xs text-gray-500 mt-1">
                      Current Certificate:{" "}
                      <a href={`http://localhost:8000/uploads/certificates/${editingInternship.certificate}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">
                        View
                      </a>
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 rounded-lg bg-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-purple-500 text-white">Update Internship</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ... Confirmation modal ... */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4">
           <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Are you sure?</h3>
            <p className="text-gray-600 mb-6">Do you really want to perform this action?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowConfirmModal(false)} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Cancel</button>
              <button onClick={confirmAction} className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600">Confirm</button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } } 
        .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default InternshipTable;
