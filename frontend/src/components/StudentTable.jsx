/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { debounce } from "lodash";
import { HiLockClosed, HiLockOpen } from "react-icons/hi2";

// ====================================================================
// StudentDetailsModal Component
// ====================================================================
const StudentDetailsModal = ({ student, onClose }) => {
  if (!student) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return "N/A";
    }
  };

  const studentFields = [
    { label: "Roll No", value: student.rollno },
    { label: "Name", value: student.name },
    { label: "Mobile No", value: student.mobile },
    { label: "Email", value: student.email },
    { label: "Date of Birth", value: formatDate(student.dob) },
    { label: "Gender", value: student.gender },
    { label: "Caste", value: student.caste || "N/A" },
    { label: "Address", value: student.address || "N/A" },
    {
      label: "10th Percentage",
      value: student.per_10 ? `${student.per_10}%` : "N/A",
    },
    {
      label: "12th Percentage",
      value: student.per_12 ? `${student.per_12}%` : "N/A",
    },
    { label: "Admission Session", value: student.session_name || "N/A" },
    { label: "Program", value: student.program_name || "N/A" },
    { label: "Modified By", value: student.modified_by || "N/A" },
    {
      label: "Last Modified",
      value: student.mod_time
        ? new Date(student.mod_time).toLocaleString()
        : "N/A",
    },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[1000] p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl p-6 md:p-8 animate-fadeIn relative max-h-[95vh] my-4 overflow-y-auto">
        <h3 className="text-2xl font-bold text-gray-800 border-b pb-3 mb-6">
          Details for: {student.name} ({student.rollno})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 text-sm">
          {studentFields.map((field, index) => (
            <div key={index} className="flex flex-col">
              <p className="text-xs font-semibold text-gray-500 uppercase">
                {field.label}
              </p>
              <p className="text-base text-gray-800 break-words">
                {field.value}
              </p>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ====================================================================
// AdminEditStudentModal Component
// ====================================================================
const AdminEditStudentModal = ({
  student,
  onClose,
  onSuccess,
  setToastMessage,
}) => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const formatDOB = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-CA");
    } catch (e) {
      return "";
    }
  };
  const initialFormData = {
    rollno: student.rollno || "",
    name: student.name || "",
    mobile: student.mobile || "",
    email: student.email || "",
    dob: formatDOB(student.dob),
    gender: student.gender || "",
    caste: student.caste || "",
    address: student.address || "",
    per_10: student.per_10 || 0,
    per_12: student.per_12 || 0,
    session_name: student.session_name || "",
    program_name: student.program_name || "",
    session_id: "",
    program_id: "",
  };
  const [formData, setFormData] = useState(initialFormData);
  const [sessions, setSessions] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const hasDataChanged = (currentData) => {
    const originalStateWithIds = {
      ...initialFormData,
      session_id: sessions.find(
        (s) => s.session_name === initialFormData.session_name
      )?.session_id
        ? String(
            sessions.find(
              (s) => s.session_name === initialFormData.session_name
            )?.session_id
          )
        : "",
      program_id: programs.find(
        (p) => p.program_name === initialFormData.program_name
      )?.program_id
        ? String(
            programs.find(
              (p) => p.program_name === initialFormData.program_name
            )?.program_id
          )
        : "",
    };
    const keysToCompare = [
      "rollno",
      "name",
      "mobile",
      "email",
      "dob",
      "gender",
      "caste",
      "address",
      "session_id",
      "program_id",
    ];
    const per_10_changed =
      parseFloat(currentData.per_10 || 0) !==
      parseFloat(originalStateWithIds.per_10 || 0);
    const per_12_changed =
      parseFloat(currentData.per_12 || 0) !==
      parseFloat(originalStateWithIds.per_12 || 0);
    if (per_10_changed || per_12_changed) {
      return true;
    }
    return keysToCompare.some((key) => {
      const currentValue = String(currentData[key] || "").trim();
      const originalValue = String(originalStateWithIds[key] || "").trim();
      return currentValue !== originalValue;
    });
  };
  useEffect(() => {
    Promise.all([api.get("/session_master"), api.get("/program_master")])
      .then(([sessionsRes, programsRes]) => {
        setSessions(sessionsRes.data || []);
        setPrograms(programsRes.data || []);
        setLoadingOptions(false);
      })
      .catch((err) => {
        console.error(err);
        setToastMessage({
          type: "error",
          content: "Failed to load academic options.",
        });
        setLoadingOptions(false);
      });
  }, [setToastMessage]);
  useEffect(() => {
    if (!loadingOptions && sessions.length > 0 && programs.length > 0) {
      const matchedSession = sessions.find(
        (s) => s.session_name === student.session_name
      );
      const matchedProgram = programs.find(
        (p) => p.program_name === student.program_name
      );
      setFormData((prev) => ({
        ...prev,
        session_id: matchedSession ? String(matchedSession.session_id) : "",
        program_id: matchedProgram ? String(matchedProgram.program_id) : "",
      }));
    }
  }, [
    loadingOptions,
    sessions,
    programs,
    student.session_name,
    student.program_name,
    student,
  ]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.rollno) {
      setToastMessage({
        type: "error",
        content: "Name and Roll No are required.",
      });
      return;
    }
    if (!hasDataChanged(formData)) {
      setToastMessage({
        type: "info",
        content: "No changes detected. Update cancelled.",
      });
      onClose();
      return;
    }
    const payload = {
      ...formData,
      mod_by: user.userid,
      session_id: formData.session_id ? Number(formData.session_id) : null,
      program_id: formData.program_id ? Number(formData.program_id) : null,
      per_10: parseFloat(formData.per_10 || 0),
      per_12: parseFloat(formData.per_12 || 0),
    };
    try {
      await api.put(`/adminStudents/${student.userid}`, payload);
      const updatedStudentNames = {
        session_name:
          sessions.find((s) => String(s.session_id) === formData.session_id)
            ?.session_name || student.session_name,
        program_name:
          programs.find((p) => String(p.program_id) === formData.program_id)
            ?.program_name || student.program_name,
      };
      onSuccess({ ...student, ...payload, ...updatedStudentNames });
      onClose();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update student details.";
      setToastMessage({ type: "error", content: errorMessage });
    }
  };
  if (loadingOptions) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[1000] p-4">
        <div className="bg-white p-6 rounded-xl shadow-2xl">
          Loading Edit Form...
        </div>
      </div>
    );
  }
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[1000] p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl p-6 my-4 animate-fadeIn relative max-h-[95vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-6">
          Edit Student Details: {student.name}
        </h3>
        <form onSubmit={handleUpdateSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium">Roll No</label>
              <input
                type="text"
                name="rollno"
                value={formData.rollno}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/\D/g, "");
                  setFormData((prev) => ({ ...prev, rollno: digitsOnly }));
                }}
                className="w-full p-2 border rounded-lg"
                placeholder="Enter Roll No"
                maxLength={12}
                required
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => {
                  const lettersOnly = e.target.value.replace(
                    /[^a-zA-Z\s]/g,
                    ""
                  );
                  setFormData((prev) => ({ ...prev, name: lettersOnly }));
                }}
                className="w-full p-2 border rounded-lg"
                placeholder="Enter Name"
                required
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium">Mobile</label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/\D/g, "");
                  if (digitsOnly.length <= 10) {
                    setFormData((prev) => ({ ...prev, mobile: digitsOnly }));
                  }
                }}
                className="w-full p-2 border rounded-lg"
                placeholder="10-digit Mobile Number"
                maxLength={10}
                required
              />
              {formData.mobile.length > 0 && formData.mobile.length !== 10 && (
                <p className="text-red-500 text-xs mt-1">
                  Phone number must be exactly 10 digits.
                </p>
              )}
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium">Session</label>
              <select
                name="session_id"
                value={formData.session_id}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg bg-white"
              >
                <option value="">Select Session</option>
                {sessions.map((s) => (
                  <option key={s.session_id} value={String(s.session_id)}>
                    {s.session_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium">Program</label>
              <select
                name="program_id"
                value={formData.program_id}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg bg-white"
              >
                <option value="">Select Program</option>
                {programs.map((p) => (
                  <option key={p.program_id} value={String(p.program_id)}>
                    {p.program_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium">10th %</label>
              <input
                type="number"
                step="0.01"
                name="per_10"
                value={formData.per_10}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium">12th %</label>
              <input
                type="number"
                step="0.01"
                name="per_12"
                value={formData.per_12}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg bg-white"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium">Caste</label>
              <input
                type="text"
                name="caste"
                value={formData.caste}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium">DOB</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-gray-300 text-gray-800 hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
            >
              Update Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ====================================================================
// StudentTable Component
// ====================================================================

const StudentTable = ({ setToastMessage }) => {
  const [students, setStudents] = useState([]);
  const [showStudentList, setShowStudentList] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState(null);
  const [confirmModalText, setConfirmModalText] = useState({
    title: "",
    content: "",
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [academicYears, setAcademicYears] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [selectedYearId, setSelectedYearId] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalStudents, setTotalStudents] = useState(0);
  
  // Checkbox Selection State
  const [selectedIds, setSelectedIds] = useState([]);

  const totalPages = Math.ceil(totalStudents / limit);
  const user = JSON.parse(sessionStorage.getItem("user"));

  // Fetch static dropdown data
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [yearsRes, programsRes] = await Promise.all([
          api.get("/academic-year"),
          api.get("/program_master"),
        ]);
        setAcademicYears(yearsRes.data || []);
        setPrograms(programsRes.data || []);
      } catch (err) {
        console.error("Failed to fetch dropdown options:", err);
        setToastMessage({
          type: "error",
          content: "Failed to load academic options.",
        });
      }
    };
    fetchOptions();
  }, [setToastMessage]);

  // Debounce effect for search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Main data fetch function
  const fetchStudents = useCallback(async () => {
    if (!selectedYearId || !showStudentList) {
      setStudents([]);
      setTotalStudents(0);
      setSelectedIds([]); // Clear selection on filter change
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.get("/adminStudents", {
        params: {
          yearId: selectedYearId,
          programId: selectedProgramId,
          search: debouncedSearch,
          page: currentPage,
          limit: limit,
        },
      });
      setStudents(res.data.data || []);
      setTotalStudents(res.data.total || 0);
      setSelectedIds([]); // Clear selection on new data fetch
    } catch (err) {
      console.error(err);
      setToastMessage({
        content: err.response?.data?.message || "Failed to load student data.",
        type: "error",
      });
      setStudents([]);
      setTotalStudents(0);
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedYearId,
    selectedProgramId,
    debouncedSearch,
    currentPage,
    limit,
    showStudentList,
    setToastMessage,
  ]);

  // Effect to call fetchStudents
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // --- Checkbox Logic ---
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = students.map((s) => s.userid);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (userid) => {
    setSelectedIds((prev) => 
      prev.includes(userid) 
        ? prev.filter((id) => id !== userid) 
        : [...prev, userid]
    );
  };

  // --- Handlers ---
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setCurrentPage(1);
    if (name === "year") {
      setSelectedYearId(value);
      if (!value) {
        setShowStudentList(false);
      }
    } else if (name === "program") {
      setSelectedProgramId(value);
    } else if (name === "limit") {
      setLimit(value === "all" ? "all" : Number(value));
    }
  };

  const handleToggleClick = () => {
    if (!selectedYearId) {
      setToastMessage({
        content: "Please select an Academic Year first.",
        type: "error",
      });
      return;
    }
    setShowStudentList(!showStudentList);
    setCurrentPage(1);
    setSearchTerm("");
  };

  const handleViewDetailsClick = (student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
  };

  const handleEditClick = (student) => {
    setSelectedStudent(student);
    setShowEditModal(true);
  };

  const handleEditSuccess = (updatedData) => {
    setShowEditModal(false);
    fetchStudents();
    setToastMessage({
      type: "success",
      content: `Student details for ${updatedData.name} updated successfully.`,
    });
  };

  // --- DELETE: Setup modal ---
  const handleDeleteClick = (student) => {
    setConfirmModalText({
      title: "Are you sure?",
      content: `Do you really want to delete ${student.name}? This cannot be undone.`,
    });
    setActionToConfirm(() => () => executeDelete(student.userid, student.name));
    setShowConfirmModal(true);
  };

  // --- DELETE: The actual API call ---
  const executeDelete = async (userid, studentName) => {
    try {
      await api.delete(`/adminStudents/${userid}`);
      setToastMessage({
        type: "success",
        content: `${studentName}'s record has been deleted.`,
      });
      fetchStudents();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete student record.";
      setToastMessage({ type: "error", content: errorMessage });
    }
  };

  // --- SINGLE Status Actions (Freeze/Unfreeze/Lock/Unlock) ---
  const executeSingleAction = async (userid, action) => {
    try {
      const res = await api.put(`/adminStudents/${userid}/${action}`);
      setToastMessage({ type: "success", content: res.data.message });
      fetchStudents();
    } catch (err) {
      setToastMessage({
        type: "error",
        content: err.response?.data?.message || "An error occurred.",
      });
    }
  };

  // --- BULK ACTIONS ---
  const handleBulkAction = (actionType) => {
    if (selectedIds.length === 0) return;
    
    let actionVerb = "";
    switch(actionType) {
      case "freeze": actionVerb = "freeze"; break;
      case "unfreeze": actionVerb = "unfreeze"; break;
      case "lock": actionVerb = "lock"; break;
      case "unlock": actionVerb = "unlock"; break;
      default: actionVerb = "update";
    }

    setConfirmModalText({
      title: `Bulk ${actionVerb.charAt(0).toUpperCase() + actionVerb.slice(1)}?`,
      content: `Are you sure you want to ${actionVerb} the ${selectedIds.length} selected student(s)?`
    });
    setActionToConfirm(() => () => executeBulkUpdate(actionType));
    setShowConfirmModal(true);
  };

  const executeBulkUpdate = async (action) => {
    try {
      const res = await api.put('/adminStudents/bulk-status', { 
        userids: selectedIds, 
        action: action 
      });
      
      // Handle Failures (Partial Success)
      if (res.data.failures && res.data.failures.length > 0) {
        exportFailureReport(res.data.failures);
        setToastMessage({ 
          type: "warning", 
          content: res.data.message 
        });
      } else {
        setToastMessage({ type: "success", content: res.data.message });
      }
      
      setSelectedIds([]); // Clear selection
      fetchStudents();
    } catch (err) {
      setToastMessage({ type: "error", content: err.response?.data?.message || "Bulk update failed." });
    }
  };

  // Helper: Export Failure Report
  const exportFailureReport = (failures) => {
    const headers = ["Roll No", "Name", "Reason for Failure"];
    const dataRows = failures.map(f => `"${f.rollno}", "${f.name}", "${f.reason}"`);
    const csvString = [headers.join(","), ...dataRows].join("\n");
    
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Freeze_Failures_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Modal Confirmation Action
  const confirmAction = () => {
    if (typeof actionToConfirm === "function") {
      actionToConfirm();
    }
    setShowConfirmModal(false);
    setActionToConfirm(null);
  };

  // --- Helpers (Pagination, Export, Status Text) ---
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
  
  const exportToExcel = () => {
    if (students.length === 0) {
      setToastMessage({ type: "error", content: "No records to export." });
      return;
    }
    const headers = [
      "Roll No",
      "Name",
      "Mobile No",
      "Email",
      "Date of Birth",
      "Gender",
      "Caste",
      "Address",
      "10th Percentage",
      "12th Percentage",
      "Session",
      "Program",
      "Status"
    ];
    const formatDateForCsv = (dateString) => {
      if (!dateString) return "N/A";
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "N/A";
        return date.toISOString().split("T")[0];
      } catch (e) {
        return "N/T";
      }
    };
    const dataRows = students.map((student) => {
      let status = "Active";
      if (student.is_profile_frozen === "Yes") status = "Frozen";
      else if (student.is_profile_locked === "Yes") status = "Locked";

      return [
        `"${(student.rollno || "N/A").toString().replace(/"/g, '""')}"`,
        `"${(student.name || "N/A").replace(/"/g, '""')}"`,
        `"${(student.mobile || "N/A").toString().replace(/"/g, '""')}"`,
        `"${(student.email || "N/A").replace(/"/g, '""')}"`,
        `"${formatDateForCsv(student.dob)}"`,
        `"${(student.gender || "N/A").replace(/"/g, '""')}"`,
        `"${(student.caste || "N/A").replace(/"/g, '""')}"`,
        `"${(student.address || "N/A").replace(/"/g, '""')}"`,
        `"${student.per_10 || "0"}%"`,
        `"${student.per_12 || "0"}%"`,
        `"${(student.session_name || "N/A").replace(/"/g, '""')}"`,
        `"${(student.program_name || "N/A").replace(/"/g, '""')}"`,
        `"${status}"`
      ].join(",");
    });
    const csvString = [headers.join(","), ...dataRows].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Students_Export_Page${currentPage}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastMessage({
      type: "success",
      content: `Exported ${students.length} records from current page.`,
    });
  };

  const getStatusText = (is_profile_frozen, is_profile_locked) => {
    if (is_profile_frozen === "Yes") {
      return (
        <span className="flex items-center justify-center font-semibold text-red-600">
          <HiLockClosed className="mr-1" />
          Frozen
        </span>
      );
    }
    if (is_profile_locked === "Yes") {
      return (
        <span className="flex items-center justify-center font-semibold text-orange-500">
          <HiLockClosed className="mr-1" />
          Locked
        </span>
      );
    }
    return (
      <span className="flex items-center justify-center font-semibold text-green-600">
        <HiLockOpen className="mr-1" />
        Active
      </span>
    );
  };

  const isToggleDisabled = isLoading || !selectedYearId;
  const serialNoOffset =
    limit === "all" || currentPage === 1 ? 0 : (currentPage - 1) * limit;
  const showPagination = showStudentList && !isLoading && limit !== "all";
  const isAllSelected = students.length > 0 && selectedIds.length === students.length;

  return (
    <div className="bg-blue-200 py-2 px-4 rounded-xl shadow-md relative pb-2">
      <h2 className="text-2xl font-bold mb-3">Student Details</h2>

      {/* --- Filters and Action Controls --- */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-3 mb-3">
        <div className="flex items-end gap-2 flex-wrap">
          <div className="flex flex-col w-36 flex-shrink-0">
            <label
              htmlFor="year-select"
              className="block text-xs font-medium text-gray-700 whitespace-nowrap pb-2"
            >
              Academic Year (Required)
            </label>
            <select
              id="year-select"
              name="year"
              value={selectedYearId}
              onChange={handleFilterChange}
              className="p-1.5 border rounded-lg text-xs bg-white focus:outline-none focus:border-gray-400 w-full"
              disabled={isLoading}
            >
              <option value="">-- Select Year --</option>
              {academicYears.map((year) => (
                <option key={year.year_id} value={year.year_id}>
                  {year.year_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col w-36 flex-shrink-0">
            <label
              htmlFor="program-select"
              className="block text-xs font-medium text-gray-700 whitespace-nowrap pb-2"
            >
              Program (Optional)
            </label>
            <select
              id="program-select"
              name="program"
              value={selectedProgramId}
              onChange={handleFilterChange}
              className="p-1.5 border rounded-lg text-xs bg-white focus:outline-none focus:border-gray-400 w-full"
              disabled={isLoading}
            >
              <option value="all">-- All Programs --</option>
              {programs.map((program) => (
                <option key={program.program_id} value={program.program_id}>
                  {program.program_name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleToggleClick}
            className={`px-3 py-1.5 rounded-lg text-white text-xs transition shadow-sm w-auto flex-shrink-0
              ${
                isToggleDisabled
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gray-500 hover:bg-gray-600"
              }`}
            disabled={isToggleDisabled}
          >
            {isLoading
              ? "Loading..."
              : showStudentList
              ? "Hide Records"
              : "Show Records"}
          </button>
        </div>
        {showStudentList && (
          <div className="flex items-end gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search Name or Roll No..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-1 px-2 bg-white border rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none flex-grow md:w-48 md:flex-grow-0"
              disabled={!showStudentList}
            />
            <button
              onClick={exportToExcel}
              className={`px-3 py-1.5 rounded-lg text-white text-xs transition shadow-sm w-auto flex-shrink-0 
                ${
                  students.length === 0
                    ? "bg-green-300 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              disabled={students.length === 0}
            >
              Export Page
            </button>
          </div>
        )}
      </div>

      {/* --- BULK ACTION BAR --- */}
      {selectedIds.length > 0 && (
        <div className="bg-gray-100 p-2 rounded-lg mb-2 flex flex-wrap items-center gap-2 border border-gray-300 animate-fadeIn">
          <span className="text-sm font-bold text-gray-700 mr-2">
            {selectedIds.length} Selected
          </span>
          <button
            onClick={() => handleBulkAction("freeze")}
            className="px-3 py-1 bg-red-500 text-white text-xs rounded-2xl hover:bg-red-600 shadow-sm transition"
          >
            Freeze Selected
          </button>
          <button
            onClick={() => handleBulkAction("unfreeze")}
            className="px-3 py-1 bg-green-500 text-white text-xs rounded-2xl hover:bg-green-600 shadow-sm transition"
          >
            Unfreeze Selected
          </button>
          <button
            onClick={() => handleBulkAction("lock")}
            className="px-3 py-1 bg-orange-500 text-white text-xs rounded-2xl hover:bg-orange-600 shadow-sm transition"
          >
            Lock Selected
          </button>
          <button
            onClick={() => handleBulkAction("unlock")}
            className="px-3 py-1 bg-blue-500 text-white text-xs rounded-2xl hover:bg-blue-600 shadow-sm transition"
          >
            Unlock Selected
          </button>
        </div>
      )}

      {/* --- Pagination Controls (Top) --- */}
      {showStudentList && !isLoading && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-2 text-sm">
          <div className="flex items-center gap-2">
            <label htmlFor="limit-select" className="text-gray-700">
              Records per page:
            </label>
            <select
              id="limit-select"
              name="limit"
              value={limit}
              onChange={handleFilterChange}
              className="p-1 border rounded-lg text-xs bg-white focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value="all">All</option>
            </select>
            {limit !== "all" && (
              <span className="text-gray-600">
                Showing {Math.min(serialNoOffset + 1, totalStudents)} -{" "}
                {Math.min(serialNoOffset + students.length, totalStudents)} of{" "}
                {totalStudents}
              </span>
            )}
            {limit === "all" && (
              <span className="text-gray-600">
                Showing all {totalStudents} records
              </span>
            )}
          </div>
          {limit !== "all" && (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="px-2 py-1 bg-white border rounded-lg shadow-sm text-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <span className="font-semibold">
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-2 py-1 bg-white border rounded-lg shadow-sm text-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- TABLE STRUCTURE --- */}
      {showStudentList && (
        <div className="mt-1">
          {isLoading ? (
            <p className="text-center text-gray-700 py-4">
              Loading student data...
            </p>
          ) : (
            <div className="border rounded-lg overflow-hidden bg-white">
              {students.length > 0 ? (
                <div className="overflow-x-auto no-scrollbar">
                  <div className="min-w-[1300px]">
                    {/* Headers */}
                    <div className="grid grid-cols-[40px_60px_1.2fr_0.8fr_1fr_1fr_1fr_1fr_1fr_1.5fr] bg-gray-300 p-2 font-semibold text-sm">
                      {/* Checkbox Column */}
                      <div className="text-center">
                        <input 
                          type="checkbox" 
                          checked={isAllSelected} 
                          onChange={handleSelectAll}
                          className="w-4 h-4 accent-purple-600 cursor-pointer"
                        />
                      </div>
                      
                      <div>Sl. no.</div>
                      <div className="text-center">Name</div>
                      <div className="text-center">Roll No.</div>
                      <div className="text-center">Program</div>
                      <div className="text-center">Admission Session</div>
                      <div className="text-center">Mobile No.</div>
                      <div className="text-center">Status</div>
                      <div className="text-center">View More</div>
                      <div className="text-right pr-4">Actions</div>
                    </div>

                    {/* Table Body */}
                    <div className="max-h-400 overflow-y-auto no-scrollbar">
                      {students.map((student, index) => {
                        const isFrozen = student.is_profile_frozen === "Yes";
                        const isLocked = student.is_profile_locked === "Yes";
                        const isSelected = selectedIds.includes(student.userid);

                        return (
                          <div
                            key={student.userid}
                            className={`grid grid-cols-[40px_60px_1.2fr_0.8fr_1fr_1fr_1fr_1fr_1fr_1.5fr] items-center p-2 border-t text-sm ${
                              isFrozen || isLocked
                                ? "bg-gray-100 text-gray-500"
                                : "bg-white"
                            }`}
                          >
                            {/* Row Checkbox */}
                            <div className="text-center">
                              <input 
                                type="checkbox" 
                                checked={isSelected} 
                                onChange={() => handleSelectRow(student.userid)}
                                className="w-4 h-4 accent-purple-600 cursor-pointer"
                              />
                            </div>

                            {/* Sl. no. */}
                            <div className="pl-3">
                              {serialNoOffset + index + 1}.
                            </div>
                            {/* Name */}
                            <div className="font-semibold break-words text-center">
                              {student.name}
                            </div>
                            {/* Roll No */}
                            <div className="text-center">
                              {student.rollno || "N/A"}
                            </div>
                            {/* Program */}
                            <div className="break-words text-center">
                              {student.program_name || "N/A"}
                            </div>
                            {/* Admission Session */}
                            <div className="break-words text-center">
                              {student.session_name || "N/A"}
                            </div>
                            {/* Mobile No */}
                            <div className="text-center">
                              {student.mobile || "N/A"}
                            </div>
                            {/* Status */}
                            <div className="text-center">
                              {getStatusText(student.is_profile_frozen, student.is_profile_locked)}
                            </div>
                            {/* View More */}
                            <div className="text-center">
                              <button
                                onClick={() => handleViewDetailsClick(student)}
                                className="bg-purple-500 text-white px-2 py-0.5 rounded-md text-xs hover:bg-purple-600 transition"
                              >
                                View Details
                              </button>
                            </div>

                            {/* --- Actions Column --- */}
                            <div className="flex justify-end gap-0.5">
                              
                              {/* Freeze/Unfreeze Button */}
                              {isFrozen ? (
                                <button
                                  onClick={() => {
                                    setConfirmModalText({
                                      title: "Unfreeze Profile?",
                                      content: `Are you sure you want to unfreeze ${student.name}'s profile? They will be able to edit their details again.`,
                                    });
                                    setActionToConfirm(() => () => executeSingleAction(student.userid, 'unfreeze'));
                                    setShowConfirmModal(true);
                                  }}
                                  className="w-16 bg-green-500 text-white px-2 py-0.5 rounded-md text-xs hover:bg-green-600 transition text-center"
                                  title="Unfreeze Profile"
                                >
                                  Unfreeze
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setConfirmModalText({
                                      title: "Freeze Profile?",
                                      content: `Are you sure you want to freeze ${student.name}'s profile? This will check all requirements.`,
                                    });
                                    setActionToConfirm(() => () => executeSingleAction(student.userid, 'freeze'));
                                    setShowConfirmModal(true);
                                  }}
                                  className="w-16 bg-blue-400 text-white px-2 py-0.5 rounded-md text-xs hover:bg-blue-500 transition text-center"
                                  title="Freeze Profile"
                                >
                                  Freeze
                                </button>
                              )}

                              {/* Lock/Unlock Button (Only visible if not frozen, or disables if frozen) */}
                              {isLocked ? (
                                <button
                                  onClick={() => {
                                    setConfirmModalText({
                                      title: "Unlock Profile?",
                                      content: `Unlock ${student.name}'s basic profile details?`,
                                    });
                                    setActionToConfirm(() => () => executeSingleAction(student.userid, 'unlock'));
                                    setShowConfirmModal(true);
                                  }}
                                  disabled={isFrozen} // Cannot unlock if frozen (freeze has priority)
                                  className="w-14 bg-pink-500 text-white px-2 py-0.5 rounded-md text-xs hover:bg-pink-600 transition text-center disabled:opacity-50 disabled:cursor-not-allowed"
                                  title={isFrozen ? "Unfreeze first" : "Unlock Profile"}
                                >
                                  Unlock
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setConfirmModalText({
                                      title: "Lock Profile?",
                                      content: `Lock ${student.name}'s basic profile details? They can still apply for drives.`,
                                    });
                                    setActionToConfirm(() => () => executeSingleAction(student.userid, 'lock'));
                                    setShowConfirmModal(true);
                                  }}
                                  disabled={isFrozen}
                                  className="w-14 bg-orange-400 text-white px-2 py-0.5 rounded-md text-xs hover:bg-orange-500 transition text-center disabled:opacity-50 disabled:cursor-not-allowed"
                                  title={isFrozen ? "Unfreeze first" : "Lock Profile"}
                                >
                                  Lock
                                </button>
                              )}

                              {/* Edit Button */}
                              <button
                                onClick={() => handleEditClick(student)}
                                className={`px-2 py-0.5 rounded-md text-xs text-white transition ${
                                  isFrozen || isLocked
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-blue-500 hover:bg-blue-600"
                                }`}
                                disabled={isFrozen || isLocked}
                                title={isFrozen || isLocked ? "Profile Locked/Frozen" : "Edit Student"}
                              >
                                Edit
                              </button>
                              
                              {/* Delete Button */}
                              <button
                                onClick={() => handleDeleteClick(student)}
                                className="bg-red-500 text-white px-2 py-0.5 rounded-md text-xs hover:bg-red-600 transition"
                                title="Delete Student"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 p-4 text-sm bg-white w-full">
                  {totalStudents === 0 && searchTerm
                    ? `No students found matching "${searchTerm}".`
                    : "No Student Records found for the selected filters."}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- Modals --- */}
      {showDetailsModal && (
        <StudentDetailsModal
          student={selectedStudent}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
      {showEditModal && selectedStudent && (
        <AdminEditStudentModal
          student={selectedStudent}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
          setToastMessage={setToastMessage}
        />
      )}

      {/* --- CONFIRMATION MODAL --- */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[1000]">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {confirmModalText.title}
            </h3>
            <p className="text-gray-600 mb-6">{confirmModalText.content}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Style for modal animation (unchanged) */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.2s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
};

export default StudentTable;