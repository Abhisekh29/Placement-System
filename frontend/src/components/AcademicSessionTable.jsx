import React, { useState, useEffect } from "react";
import api from "../api/axios";

const AcademicSessionTable = ({ setToastMessage }) => {
  const [academicSessions, setAcademicSessions] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [newSessionName, setNewSessionName] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [actionToConfirm, setActionToConfirm] = useState(null);
  const user = JSON.parse(sessionStorage.getItem("user"));

  const fetchAcademicSessions = async () => {
    try {
      const res = await api.get("/academic-session");
      setAcademicSessions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const res = await api.get("/academic-year");
      setAcademicYears(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAcademicSessions();
    fetchAcademicYears();
  }, []);

  const handleAddClick = () => {
    setNewSessionName("");
    setSelectedYear("");
    setShowAddModal(true);
  };

  const handleEditClick = (session) => {
    setEditingSession(session);
    setNewSessionName(session.session_name);
    const year = academicYears.find((y) => y.year_name === session.year_name);
    if (year) {
      setSelectedYear(year.year_id);
    }
    setShowEditModal(true);
  };

  const handleDeleteClick = (session) => {
    setShowEditModal(false);
    setActionToConfirm(
      () => () => deleteSession(session.session_id, session.session_name)
    );
    setShowConfirmModal(true);
  };

  const handleUpdateClick = (e) => {
    e.preventDefault();
    const originalYear = academicYears.find(
      (y) => y.year_name === editingSession.year_name
    );
    if (
      newSessionName.trim() === editingSession.session_name &&
      Number(selectedYear) === originalYear?.year_id
    ) {
      setToastMessage({
        type: "error",
        content: "No changes were made.",
      });
      setShowEditModal(false);
      return;
    }
    setShowEditModal(false);
    setActionToConfirm(() => () => updateSession());
    setShowConfirmModal(true);
  };

  const updateSession = async () => {
    try {
      await api.put(`/academic-session/${editingSession.session_id}`, {
        session_name: newSessionName,
        year_id: selectedYear,
        mod_by: user.userid,
      });
      fetchAcademicSessions();
      setToastMessage({
        type: "success",
        content: "Academic session updated successfully.",
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update academic session.";
      setToastMessage({
        type: "error",
        content: errorMessage,
      });
    }
  };

  const deleteSession = async (sessionId, sessionName) => {
    try {
      await api.delete(`/academic-session/${sessionId}`);
      setAcademicSessions(
        academicSessions.filter((session) => session.session_id !== sessionId)
      );
      setToastMessage({
        type: "success",
        content: `"${sessionName}" has been deleted.`,
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete academic session.";
      setToastMessage({
        type: "error",
        content: errorMessage,
      });
    }
  };

  const handleAddSession = async (e) => {
    e.preventDefault();
    if (!newSessionName.trim() || !selectedYear) {
      setToastMessage({
        type: "error",
        content: "All fields are required.",
      });
      return;
    }

    try {
      await api.post("/academic-session", {
        session_name: newSessionName,
        year_id: selectedYear,
        mod_by: user.userid,
      });
      setNewSessionName("");
      setSelectedYear("");
      setShowAddModal(false);
      fetchAcademicSessions();
      setToastMessage({
        type: "success",
        content: "New academic session added successfully.",
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to add academic session.";
      setToastMessage({
        type: "error",
        content: errorMessage,
      });
    }
  };

  const confirmAction = () => {
    if (actionToConfirm) {
      actionToConfirm();
    }
    setShowConfirmModal(false);
  };

  return (
  <div className="bg-blue-200 py-2 px-4 rounded-xl shadow-md">
    <h2 className="text-2xl font-bold mb-3">Academic Sessions</h2>
    <div className="border rounded-lg overflow-x-auto no-scrollbar">
      <div className="min-w-[800px]">
        <div className="grid grid-cols-12 bg-gray-300 p-2 font-semibold text-sm">
          <div className="col-span-1">S.No.</div>
          <div className="col-span-2 whitespace-nowrap">Session Name</div>
          <div className="col-span-2 whitespace-nowrap">Academic Year</div>
          <div className="col-span-3 whitespace-nowrap">Modified By</div>
          <div className="col-span-2 whitespace-nowrap">Last Modified</div>
          <div className="text-right col-span-2 whitespace-nowrap pl-3">
            Actions
          </div>
        </div>

        <div className="max-h-60 overflow-y-auto no-scrollbar">
          {academicSessions.length > 0 ? (
            academicSessions.map((session, index) => (
              <div
                key={session.session_id}
                className="grid grid-cols-12 items-center p-2 border-t bg-white text-sm"
              >
                <div className="col-span-1">{index + 1}</div>
                <div className="col-span-2 whitespace-nowrap">
                  {session.session_name}
                </div>
                <div className="col-span-2 whitespace-nowrap">
                  {session.year_name}
                </div>
                <div className="col-span-3 whitespace-nowrap">
                  {session.modified_by || "N/A"}
                </div>

                <div className="col-span-2 whitespace-nowrap">
                  {session.mod_time
                    ? new Date(session.mod_time).toLocaleString()
                    : "N/A"}
                </div>
                <div className="flex justify-end gap-2 col-span-2 whitespace-nowrap pl-3">
                  <button
                    onClick={() => handleEditClick(session)}
                    className="bg-blue-500 text-white px-2 py-0.5 rounded-md text-xs hover:bg-blue-600 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(session)}
                    className="bg-red-500 text-white px-2 py-0.5 rounded-md text-xs hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 p-2 text-sm">
              No academic sessions found.
            </p>
            )}
          </div>
        </div>
      </div>

      {/* Add New Session Button */}
      <div className="mt-4 text-right">
        <button
          onClick={handleAddClick}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-600 transition"
        >
          ➕ Add New Session
        </button>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 animate-fadeIn relative">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">
              Add New Academic Session
            </h3>
            <form onSubmit={handleAddSession}>
              <input
                type="text"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                placeholder="e.g., Aug-Dec 2022"
                className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Academic Year</option>
                {academicYears.map((year) => (
                  <option key={year.year_id} value={year.year_id}>
                    {year.year_name}
                  </option>
                ))}
              </select>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition"
                >
                  Add Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 animate-fadeIn relative">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">
              Edit Academic Session
            </h3>
            <form onSubmit={handleUpdateClick}>
              <input
                type="text"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Academic Year</option>
                {academicYears.map((year) => (
                  <option key={year.year_id} value={year.year_id}>
                    {year.year_name}
                  </option>
                ))}
              </select>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition"
                >
                  Update Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Are you sure?
            </h3>
            <p className="text-gray-600 mb-6">
              Do you really want to proceed with this action? This cannot be
              undone.
            </p>
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

export default AcademicSessionTable;
