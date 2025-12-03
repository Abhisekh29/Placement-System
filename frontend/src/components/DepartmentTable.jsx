/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import api from "../api/axios";

const DepartmentTable = ({ setToastMessage }) => {
  const [Departments, setDepartments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [newDepartment, setnewDepartment] = useState("");
  const [actionToConfirm, setActionToConfirm] = useState(null);
  const user = JSON.parse(sessionStorage.getItem("user"));

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/department");
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleAddClick = () => {
    setnewDepartment("");
    setShowAddModal(true);
  };

  const handleEditClick = (department) => {
    setEditingDepartment(department);
    setnewDepartment(department.department_name);
    setShowEditModal(true);
  };

  const handleDeleteClick = (department) => {
    setShowEditModal(false);
    setActionToConfirm(
      () => () =>
        deleteDepartment(department.department_id, department.department_name)
    );
    setShowConfirmModal(true);
  };

  const handleUpdateClick = (e) => {
    e.preventDefault();
    if (newDepartment.trim() === editingDepartment.department_name) {
      setToastMessage({
        type: "error",
        content: "No changes were made.",
      });
      setShowEditModal(false);
      return;
    }
    setShowEditModal(false);
    setActionToConfirm(() => () => updateDepartment());
    setShowConfirmModal(true);
  };

  const updateDepartment = async () => {
    try {
      await api.put(`/department/${editingDepartment.department_id}`, {
        department_name: newDepartment,
        mod_by: user.userid,
      });
      fetchDepartments();
      setToastMessage({
        type: "success",
        content: "Department updated successfully.",
      });
    } catch (err) {
      setToastMessage({
        type: "error",
        content: "Failed to update department.",
      });
    }
  };

  const deleteDepartment = async (departmentId, departmentName) => {
    try {
      await api.delete(`/department/${departmentId}`);
      setDepartments(
        Departments.filter(
          (department) => department.department_id !== departmentId
        )
      );
      setToastMessage({
        type: "success",
        content: `"${departmentName}" has been deleted.`,
      });
    } catch (err) {
      // Display the specific error message from the backend
      const errorMessage =
        err.response?.data?.message || "Failed to delete Department.";
      setToastMessage({
        type: "error",
        content: errorMessage,
      });
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!newDepartment.trim()) {
      setToastMessage({
        type: "error",
        content: "Department name cannot be empty.",
      });
      return;
    }

    try {
      await api.post("/department", {
        department_name: newDepartment,
        mod_by: user.userid,
      });
      setnewDepartment("");
      setShowAddModal(false);
      fetchDepartments();
      setToastMessage({
        type: "success",
        content: "New Department added successfully.",
      });
    } catch (err) {
      setToastMessage({
        type: "error",
        content: "Failed to add Department.",
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
          <div className="grid grid-cols-12 bg-gray-300 p-2 font-semibold text-sm no">
            <div className="col-span-1">S.No.</div>
            <div className="col-span-4 whitespace-nowrap pl-20">Department Name</div>
            <div className="col-span-3 whitespace-nowrap">Modified By</div>
            <div className="col-span-2 whitespace-nowrap">Last Modified</div>
            <div className="text-right col-span-2 whitespace-nowrap pl-3">
              Actions
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto no-scrollbar">
            {Departments.length > 0 ? (
              Departments.map((department, index) => (
                <div
                  key={department.department_id}
                  className="grid grid-cols-12 items-center p-2 border-t bg-white text-sm"
                >
                  <div className="col-span-1">{index + 1}</div>
                  <div className="col-span-4 pl-20 break-words">
                    {department.department_name}
                  </div>
                  <div className="col-span-3 break-words">
                    {department.modified_by || "N/A"}
                  </div>
                  <div className="col-span-2">
                    {department.mod_time
                      ? new Date(department.mod_time).toLocaleString()
                      : "N/A"}
                  </div>
                  <div className="flex justify-end gap-2 col-span-2 pl-3">
                    <button
                      onClick={() => handleEditClick(department)}
                      className="bg-blue-500 text-white px-2 py-0.5 rounded-md text-xs hover:bg-blue-600 transition cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(department)}
                      className="bg-red-500 text-white px-2 py-0.5 rounded-md text-xs hover:bg-red-600 transition cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 p-2 text-sm">
                No department found.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 text-right">
        <button
          onClick={handleAddClick}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-600 transition cursor-pointer"
        >
          ➕ Add New department
        </button>
      </div>

      {/* Modals */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 animate-fadeIn relative">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">
              Add New department
            </h3>
            <form onSubmit={handleAddDepartment}>
              <input
                type="text"
                value={newDepartment}
                onChange={(e) => setnewDepartment(e.target.value)}
                placeholder="e.g., Information Technology"
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
                  Add department
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
              Edit department
            </h3>
            <form onSubmit={handleUpdateClick}>
              <input
                type="text"
                value={newDepartment}
                onChange={(e) => setnewDepartment(e.target.value)}
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
                  Update department
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

export default DepartmentTable;