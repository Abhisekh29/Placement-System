/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import api from "../api/axios";

const CompanyTypeTable = ({ setToastMessage }) => {
  const [CompanyTypes, setCompanyTypes] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editingCompanyType, seteditingCompanyType] = useState(null);
  const [newCompanyType, setnewCompanyType] = useState("");
  const [actionToConfirm, setActionToConfirm] = useState(null);
  const user = JSON.parse(sessionStorage.getItem("user"));

  const fetchCompanyTypes = async () => {
    try {
      const res = await api.get("/companyType");
      setCompanyTypes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCompanyTypes();
  }, []);

  const handleAddClick = () => {
    setnewCompanyType("");
    setShowAddModal(true);
  };

  const handleEditClick = (companyType) => {
    seteditingCompanyType(companyType);
    setnewCompanyType(companyType.type_name);
    setShowEditModal(true);
  };

  const handleDeleteClick = (companyType) => {
    setShowEditModal(false);
    setActionToConfirm(
      () => () => deletecompanyType(companyType.type_id, companyType.type_name)
    );
    setShowConfirmModal(true);
  };

  const handleUpdateClick = (e) => {
    e.preventDefault();
    if (newCompanyType.trim() === editingCompanyType.type_name) {
      setToastMessage({
        type: "error",
        content: "No changes were made.",
      });
      setShowEditModal(false);
      return;
    }
    setShowEditModal(false);
    setActionToConfirm(() => () => updatecompanyType());
    setShowConfirmModal(true);
  };

  const updatecompanyType = async () => {
    try {
      await api.put(`/companyType/${editingCompanyType.type_id}`, {
        type_name: newCompanyType,
        mod_by: user.userid,
      });
      fetchCompanyTypes();
      setToastMessage({
        type: "success",
        content: "Company Type updated successfully.",
      });
    } catch (err) {
      setToastMessage({
        type: "error",
        content: "Failed to update Company Type.",
      });
    }
  };

  const deletecompanyType = async (companyTypeId, companyTypeName) => {
    try {
      await api.delete(`/companyType/${companyTypeId}`);
      setCompanyTypes(
        CompanyTypes.filter(
          (companyType) => companyType.type_id !== companyTypeId
        )
      );
      setToastMessage({
        type: "success",
        content: `"${companyTypeName}" has been deleted.`,
      });
    } catch (err) {
      // Display the specific error message from the backend
      const errorMessage =
        err.response?.data?.message || "Failed to delete companyType.";
      setToastMessage({
        type: "error",
        content: errorMessage,
      });
    }
  };

  const handleAddcompanyType = async (e) => {
    e.preventDefault();
    if (!newCompanyType.trim()) {
      setToastMessage({
        type: "error",
        content: "companyType name cannot be empty.",
      });
      return;
    }

    try {
      await api.post("/companyType", {
        type_name: newCompanyType,
        mod_by: user.userid,
      });
      setnewCompanyType("");
      setShowAddModal(false);
      fetchCompanyTypes();
      setToastMessage({
        type: "success",
        content: "New Company Type added successfully.",
      });
    } catch (err) {
      setToastMessage({
        type: "error",
        content: "Failed to add Company Type.",
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
    <h2 className="text-2xl font-bold mb-3">Company Types</h2>
    <div className="border rounded-lg overflow-x-auto no-scrollbar">
      <div className="min-w-[700px]">
        {/* Headers */}
        <div className="grid grid-cols-[1fr_2fr_1.5fr_1.2fr_1fr] bg-gray-300 p-2 font-semibold text-sm">
          <div>S.No.</div>
          <div>Company Type Name</div>
          <div>Modified By</div>
          <div>Last Modified</div>
          <div className="text-right">Actions</div>
        </div>

        {/* Scrollable Container */}
        <div className="max-h-60 overflow-y-auto no-scrollbar">
          {CompanyTypes.length > 0 ? (
            CompanyTypes.map((companyType, index) => (
              <div
                key={companyType.type_id}
                 className="grid grid-cols-[1fr_2fr_1.5fr_1.2fr_1fr] items-center p-2 border-t bg-white text-sm"
              >
                <div>{index + 1}</div>
                <div>{companyType.type_name}</div>
                <div className="break-words pr-6">
                  {companyType.modified_by || "N/A"}
                </div>
                <div>
                  {companyType.mod_time
                    ? new Date(companyType.mod_time).toLocaleString()
                    : "N/A"}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleEditClick(companyType)}
                    className="bg-blue-500 text-white px-2 py-0.5 rounded-md text-xs hover:bg-blue-600 transition cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(companyType)}
                    className="bg-red-500 text-white px-2 py-0.5 rounded-md text-xs hover:bg-red-600 transition cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 p-2 text-sm">
              No Company Type found.
            </p>
          )}
          </div>
        </div>
      </div>

      {/* Add New companyType Button */}
      <div className="mt-4 text-right">
        <button
          onClick={handleAddClick}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-600 transition cursor-pointer"
        >
          ➕ Add New Company Type
        </button>
      </div>

      {/* Modals */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 animate-fadeIn relative">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">
              Add New Company Type
            </h3>
            <form onSubmit={handleAddcompanyType}>
              <input
                type="text"
                value={newCompanyType}
                onChange={(e) => setnewCompanyType(e.target.value)}
                placeholder="e.g., Software, Banking"
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
                  Add Company Type
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
              Edit Company Type
            </h3>
            <form onSubmit={handleUpdateClick}>
              <input
                type="text"
                value={newCompanyType}
                onChange={(e) => setnewCompanyType(e.target.value)}
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
                  Update Company type
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

export default CompanyTypeTable;
