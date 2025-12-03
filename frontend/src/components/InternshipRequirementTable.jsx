import React, { useState, useEffect, useMemo } from "react";
import api from "../api/axios";

const initialFormState = {
  program_id: "",
  semester: "",
  internship_count: 1,
};

const InternshipRequirementTable = ({ setToastMessage }) => {
  const [requirements, setRequirements] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReq, setEditingReq] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [actionToConfirm, setActionToConfirm] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const user = JSON.parse(sessionStorage.getItem("user"));

  // --- SET UP DEBOUNCED SEARCH ---
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500); // 500ms delay
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const [modalContent, setModalContent] = useState({
    title: "Are you sure?",
    text: "",
    confirmText: "Confirm",
    confirmColor: "bg-red-500 hover:bg-red-600",
  });

  const fetchRequirements = async () => {
    try {
      const res = await api.get("/internship-requirements");
      setRequirements(res.data);
    } catch (err) {
      console.error(err);
      setToastMessage({
        type: "error",
        content: "Failed to load requirements.",
      });
    }
  };

  const fetchPrograms = async () => {
    try {
      const res = await api.get("/adminPrograms");
      setPrograms(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequirements();
    fetchPrograms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- UPDATE FILTER LOGIC TO USE DEBOUNCED SEARCH ---
  const filteredRequirements = useMemo(() => {
    const searchLower = debouncedSearch.toLowerCase();
    
    if (!searchLower) {
      return requirements; // Return all if search is empty
    }

    return requirements.filter((req) => {
      const programMatch = req.program_name
        .toLowerCase()
        .includes(searchLower);
      const semesterMatch = String(req.semester).includes(searchLower);

      return programMatch || semesterMatch;
    });
  }, [requirements, debouncedSearch]); // Depends on debounced value

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddClick = () => {
    setFormData(initialFormState);
    setShowAddModal(true);
  };

  const handleEditClick = (req) => {
    setEditingReq(req);
    setFormData({
      program_id: req.program_id,
      semester: req.semester,
      internship_count: req.internship_count,
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (req) => {
    setModalContent({
      title: "Confirm Deletion",
      text: `Do you really want to delete the rule for ${req.program_name} (Sem ${req.semester})?`,
      confirmText: "Delete",
      confirmColor: "bg-red-500 hover:bg-red-600",
    });
    setActionToConfirm(
      () => () => deleteRequirement(req.req_id, req.program_name, req.semester)
    );
    setShowConfirmModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/internship-requirements", {
        ...formData,
        mod_by: user.userid,
      });
      setShowAddModal(false);
      fetchRequirements(); 
      setToastMessage({
        type: "success",
        content: "Requirement added successfully.",
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to add requirement.";
      setToastMessage({ type: "error", content: errorMessage });
    }
  };

  const updateRequirement = async () => {
    try {
      await api.put(`/internship-requirements/${editingReq.req_id}`, {
        ...formData,
        mod_by: user.userid,
      });
      fetchRequirements(); 
      setToastMessage({
        type: "success",
        content: "Requirement updated successfully.",
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update requirement.";
      setToastMessage({ type: "error", content: errorMessage });
    }
  };

  const deleteRequirement = async (reqId, programName, semester) => {
    try {
      await api.delete(`/internship-requirements/${reqId}`);
      fetchRequirements(); 
      setToastMessage({
        type: "success",
        content: `Requirement for ${programName} (Sem ${semester}) deleted.`,
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete requirement.";
      setToastMessage({ type: "error", content: errorMessage });
    }
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    const noChanges =
      Number(formData.program_id) === editingReq.program_id &&
      Number(formData.semester) === editingReq.semester &&
      Number(formData.internship_count) === editingReq.internship_count;

    if (noChanges) {
      setToastMessage({ type: "warning", content: "No changes were made." });
      setShowEditModal(false);
      return;
    }
    setShowEditModal(false);

    setModalContent({
      title: "Confirm Update",
      text: "Are you sure you want to update this rule?",
      confirmText: "Update",
      confirmColor: "bg-blue-500 hover:bg-blue-600",
    });
    setActionToConfirm(() => () => updateRequirement());
    setShowConfirmModal(true);
  };

  const confirmAction = () => {
    if (actionToConfirm) actionToConfirm();
    setShowConfirmModal(false);
  };

  return (
    <div className="bg-blue-200 py-4 px-4 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-2xl font-bold">Defined Rules</h2>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search Program or Semester..."
            value={searchTerm} // Live value
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-54 h-8 p-2 bg-white border rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>
      </div>

      {/* --- Main Table --- */}
      <div className="border rounded-lg overflow-x-auto no-scrollbar">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-[0.5fr_1.5fr_1fr_1fr_1.5fr_1.5fr_1fr] bg-gray-300 p-2 font-semibold text-sm">
            <div>Sl.No.</div>
            <div className="text-center">Program</div>
            <div className="text-center">Semester</div>
            <div className="text-center">Count</div>
            <div className="text-center">Modified By</div>
            <div className="text-center">Last Modified</div>
            <div className="text-right">Actions</div>
          </div>
          <div className="max-h-96 overflow-y-auto no-scrollbar">
            {/* --- RENDER THE FILTERED LIST --- */}
            {filteredRequirements.length > 0 ? (
              filteredRequirements.map((req, index) => (
                <div
                  key={req.req_id}
                  className="grid grid-cols-[0.5fr_1.5fr_1fr_1fr_1.5fr_1.5fr_1fr] items-center p-2 border-t bg-white text-sm"
                >
                  <div className="pl-3">{index + 1}.</div>
                  <div className="font-semibold text-center">{req.program_name}</div>
                  <div className="text-center">{req.semester}</div>
                  <div className="text-center">{req.internship_count}</div>
                  <div className="text-center">{req.modified_by || "N/A"}</div>
                  <div className="text-center">
                    {new Date(req.mod_time).toLocaleString()}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEditClick(req)}
                      className="bg-blue-500 text-white px-2 py-0.5 rounded-md text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(req)}
                      className="bg-red-500 text-white px-2 py-0.5 rounded-md text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              // --- Show debounced search term in message ---
              <p className="text-center text-gray-500 p-4">
                {requirements.length > 0
                  ? `No rules match "${debouncedSearch}".`
                  : 'No internship requirements defined. Click "Add New Rule" to start.'}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <button
          onClick={handleAddClick}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-600"
        >
          ➕ Add New Rule
        </button>
      </div>

      {/* --- Add/Edit Modal --- */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">
              {showAddModal ? "Add New Rule" : "Edit Rule"}
            </h3>
            <form
              onSubmit={showAddModal ? handleAddSubmit : handleUpdateSubmit}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Program
                  </label>
                  <select
                    name="program_id"
                    value={formData.program_id}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg mt-1"
                    required
                  >
                    <option value="">Select Program</option>
                    {programs.map((p) => (
                      <option key={p.program_id} value={p.program_id}>
                        {p.program_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Semester
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    placeholder="Semester (e.g., 6)"
                    className="w-full p-3 border rounded-lg mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Required Internship Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    name="internship_count"
                    value={formData.internship_count}
                    onChange={handleInputChange}
                    placeholder="e.g., 1"
                    className="w-full p-3 border rounded-lg mt-1"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    showAddModal
                      ? setShowAddModal(false)
                      : setShowEditModal(false)
                  }
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg"
                >
                  {showAddModal ? "Add Rule" : "Update Rule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Dynamic Confirm Modal --- */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {modalContent.title}
            </h3>
            <p className="text-gray-600 mb-6">{modalContent.text}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`px-4 py-2 rounded-lg text-white ${modalContent.confirmColor}`}
              >
                {modalContent.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default InternshipRequirementTable;