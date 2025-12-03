import React, { useState, useEffect } from "react";

import api from "../api/axios";

const ProgramTable = ({ setToastMessage }) => {
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [newProgramName, setNewProgramName] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [actionToConfirm, setActionToConfirm] = useState(null);
  const user = JSON.parse(sessionStorage.getItem("user"));

  const fetchPrograms = async () => {
    try {
      const res = await api.get("/adminPrograms"); // Using the admin-specific route

      setPrograms(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/department");

      setDepartments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPrograms();

    fetchDepartments();
  }, []);

  const handleAddClick = () => {
    setNewProgramName("");

    setSelectedDept("");

    setShowAddModal(true);
  };

  const handleEditClick = (program) => {
    setEditingProgram(program);
    setNewProgramName(program.program_name);
    const dept = departments.find(
      (d) => d.department_name === program.department_name
    );

    if (dept) {
      setSelectedDept(dept.department_id);
    }
    setShowEditModal(true);
  };

  const handleDeleteClick = (program) => {
    setShowEditModal(false);
    setActionToConfirm(
      () => () => deleteProgram(program.program_id, program.program_name)
    );

    setShowConfirmModal(true);
  };

  const handleUpdateClick = (e) => {
    e.preventDefault();

    const originalDept = departments.find(
      (d) => d.department_name === editingProgram.department_name
    );

    if (
      newProgramName.trim() === editingProgram.program_name &&
      Number(selectedDept) === originalDept?.department_id
    ) {
      setToastMessage({
        type: "error",

        content: "No changes were made.",
      });

      setShowEditModal(false);

      return;
    }

    setShowEditModal(false);
    setActionToConfirm(() => () => updateProgram());
    setShowConfirmModal(true);
  };

  const updateProgram = async () => {
    try {
      await api.put(`/adminPrograms/${editingProgram.program_id}`, {
        program_name: newProgramName,

        department_id: selectedDept,

        mod_by: user.userid,
      });

      fetchPrograms();

      setToastMessage({
        type: "success",

        content: "Program updated successfully.",
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update program.";

      setToastMessage({
        type: "error",

        content: errorMessage,
      });
    }
  };

  const deleteProgram = async (programId, programName) => {
    try {
      await api.delete(`/adminPrograms/${programId}`);

      setPrograms(
        programs.filter((program) => program.program_id !== programId)
      );

      setToastMessage({
        type: "success",

        content: `"${programName}" has been deleted.`,
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete program.";

      setToastMessage({
        type: "error",

        content: errorMessage,
      });
    }
  };

  const handleAddProgram = async (e) => {
    e.preventDefault();

    if (!newProgramName.trim() || !selectedDept) {
      setToastMessage({
        type: "error",

        content: "All fields are required.",
      });

      return;
    }

    try {
      await api.post("/adminPrograms", {
        program_name: newProgramName,

        department_id: selectedDept,

        mod_by: user.userid,
      });

      setNewProgramName("");
      setSelectedDept("");
      setShowAddModal(false);
      fetchPrograms();
      setToastMessage({
        type: "success",

        content: "New program added successfully.",
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to add program.";

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
    <h2 className="text-2xl font-bold mb-3">Programs</h2>
    <div className="border rounded-lg overflow-x-auto no-scrollbar">
      <div className="min-w-[900px]">
        <div className="grid grid-cols-12 bg-gray-300 p-2 font-semibold text-sm">
          <div className="col-span-1">S.No.</div>
          <div className="col-span-3 whitespace-nowrap pl-14">Program Name</div>
          <div className="col-span-2 whitespace-nowrap">Department</div>
          <div className="col-span-2 whitespace-nowrap">Modified By</div>
          <div className="col-span-2 whitespace-nowrap">Last Modified</div>
          <div className="text-right col-span-2 whitespace-nowrap pl-3">
            Actions
          </div>
        </div>

        {/* Scrollable Container */}
        <div className="max-h-60 overflow-y-auto">
          {programs.length > 0 ? (
            programs.map((program, index) => (
              <div
                key={program.program_id}
                className="grid grid-cols-12 items-center p-2 border-t bg-white text-sm"
              >
                <div className="col-span-1">{index + 1}</div>
                <div className="col-span-3 whitespace-nowrap pl-14">
                  {program.program_name}
                </div>
                <div className="col-span-2 whitespace-nowrap">
                  {program.department_name}
                </div>
                <div className="col-span-2 whitespace-nowrap">
                  {program.modified_by || "N/A"}
                </div>
                <div className="col-span-2 whitespace-nowrap">
                  {program.mod_time
                    ? new Date(program.mod_time).toLocaleString()
                    : "N/A"}
                </div>

                <div className="flex justify-end gap-2 col-span-2 whitespace-nowrap pl-3">
                  <button
                    onClick={() => handleEditClick(program)}
                    className="bg-blue-500 text-white px-2 py-0.5 rounded-md text-xs hover:bg-blue-600 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(program)}
                    className="bg-red-500 text-white px-2 py-0.5 rounded-md text-xs hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 p-2 text-sm">
              No programs found.
            </p>
            )}
          </div>
        </div>
      </div>

      {/* Add New Program Button */}

      <div className="mt-4 text-right">
        <button
          onClick={handleAddClick}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-600 transition"
        >
          ➕ Add New Program
        </button>
      </div>

      {/* Add Modal */}

      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 animate-fadeIn relative">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">
              Add New Program
            </h3>

            <form onSubmit={handleAddProgram}>
              <input
                type="text"
                value={newProgramName}
                onChange={(e) => setNewProgramName(e.target.value)}
                placeholder="e.g., B.Tech in Computer Science"
                className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Department</option>

                {departments.map((dept) => (
                  <option key={dept.department_id} value={dept.department_id}>
                    {dept.department_name}
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
                  Add Program
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
              Edit Program
            </h3>

            <form onSubmit={handleUpdateClick}>
              <input
                type="text"
                value={newProgramName}
                onChange={(e) => setNewProgramName(e.target.value)}
                className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Department</option>

                {departments.map((dept) => (
                  <option key={dept.department_id} value={dept.department_id}>
                    {dept.department_name}
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
                  Update Program
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
              Do you really want to proceed with this action?
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

export default ProgramTable;