/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import api from "../api/axios";

const AcademicYearTable = ({ setToastMessage }) => {
  const [academicYears, setAcademicYears] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editingYear, setEditingYear] = useState(null);
  const [newYearName, setNewYearName] = useState("");
  const [actionToConfirm, setActionToConfirm] = useState(null);
  const user = JSON.parse(sessionStorage.getItem("user"));

  const fetchAcademicYears = async () => {
    try {
      const res = await api.get("/academic-year");
      setAcademicYears(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const handleAddClick = () => {
    setNewYearName("");
    setShowAddModal(true);
  };

  const handleEditClick = (year) => {
    setEditingYear(year);
    setNewYearName(year.year_name);
    setShowEditModal(true);
  };

  const handleDeleteClick = (year) => {
    setShowEditModal(false);
    setActionToConfirm(() => () => deleteYear(year.year_id, year.year_name));
    setShowConfirmModal(true);
  };

  const handleUpdateClick = (e) => {
    e.preventDefault();
    if (newYearName.trim() === editingYear.year_name) {
      setToastMessage({
        type: "error",
        content: "No changes were made.",
      });
      setShowEditModal(false);
      return;
    }
    setShowEditModal(false);
    setActionToConfirm(() => () => updateYear());
    setShowConfirmModal(true);
  };

  const updateYear = async () => {
    try {
      await api.put(`/academic-year/${editingYear.year_id}`, {
        year_name: newYearName,
        mod_by: user.userid,
      });
      fetchAcademicYears();
      setToastMessage({
        type: "success",
        content: "Academic year updated successfully.",
      });
    } catch (err) {
      setToastMessage({
        type: "error",
        content: "Failed to update academic year.",
      });
    }
  };

  const deleteYear = async (yearId, yearName) => {
    try {
      await api.delete(`/academic-year/${yearId}`);
      setAcademicYears(academicYears.filter((year) => year.year_id !== yearId));
      setToastMessage({
        type: "success",
        content: `"${yearName}" has been deleted.`,
      });
    } catch (err) {
      // Display the specific error message from the backend
      const errorMessage =
        err.response?.data?.message || "Failed to delete academic year.";
      setToastMessage({
        type: "error",
        content: errorMessage,
      });
    }
  };

  const handleAddYear = async (e) => {
    e.preventDefault();
    if (!newYearName.trim()) {
      setToastMessage({ type: "error", content: "Year name cannot be empty." });
      return;
    }

    try {
      await api.post("/academic-year", {
        year_name: newYearName,
        mod_by: user.userid,
      });
      setNewYearName("");
      setShowAddModal(false);
      fetchAcademicYears();
      setToastMessage({
        type: "success",
        content: "New Academic Year added successfully.",
      });
    } catch (err) {
      setToastMessage({
        type: "error",
        content: "Failed to add Academic Year.",
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
      <h2 className="text-2xl font-bold mb-3">Departments</h2>
      <div className="border rounded-lg overflow-x-auto no-scrollbar">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-12 bg-gray-300 p-2 font-semibold text-sm">
            <div className="col-span-1">S.No.</div>
            <div className="col-span-4 whitespace-nowrap pl-20">Year Name</div>
            <div className="col-span-3 whitespace-nowrap">Modified By</div>
            <div className="col-span-2 whitespace-nowrap">Last Modified</div>
            <div className="text-right col-span-2 whitespace-nowrap pl-3">
              Actions
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto no-scrollbar">
            {academicYears.length > 0 ? (
              academicYears.map((year, index) => (
                <div
                  key={year.year_id}
                  className="grid grid-cols-12 items-center p-2 border-t bg-white text-sm"
                >
                  <div className="col-span-1">{index + 1}</div>
                  <div className="col-span-4 pl-20 break-words">{year.year_name}</div>
                  <div className="col-span-3 break-words">
                    {year.modified_by || "N/A"}
                  </div>
                  <div className="col-span-2">
                    {year.mod_time
                      ? new Date(year.mod_time).toLocaleString()
                      : "N/A"}
                  </div>
                  <div className="flex justify-end gap-2 col-span-2">
                    <button
                      onClick={() => handleEditClick(year)}
                      className="bg-blue-500 text-white px-2 py-0.5 rounded-md text-xs hover:bg-blue-600 transition cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(year)}
                      className="bg-red-500 text-white px-2 py-0.5 rounded-md text-xs hover:bg-red-600 transition cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 p-2 text-sm">
                No academic years found.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Add New Year Button */}
      <div className="mt-4 text-right">
        <button
          onClick={handleAddClick}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-600 transition cursor-pointer"
        >
          ➕ Add New Academic Year
        </button>
      </div>

      {/* Modals */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 animate-fadeIn relative">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">
              Add New Academic Year
            </h3>
            <form onSubmit={handleAddYear}>
              <input
                type="text"
                value={newYearName}
                onChange={(e) => setNewYearName(e.target.value)}
                placeholder="e.g., 2024-2025"
                className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition cursor-pointer"
                >
                  Add Year
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 animate-fadeIn relative">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">
              Edit Academic Year
            </h3>
            <form onSubmit={handleUpdateClick}>
              <input
                type="text"
                value={newYearName}
                onChange={(e) => setNewYearName(e.target.value)}
                className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition cursor-pointer"
                >
                  Update Year
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
            <p className="text-gray-600 mb-6">
              Do you really want to proceed with this action? This cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition cursor-pointer"
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

export default AcademicYearTable;