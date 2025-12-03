import React, { useState, useEffect } from "react";
import api from "../api/axios";

// --- Description Modal ---
const DescriptionModal = ({ content, onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4">
    <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl p-6 animate-fadeIn relative max-h-[85vh] flex flex-col">
      <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">
        Drive Description
      </h3>
      <div className="text-gray-700 whitespace-pre-wrap break-words overflow-y-auto no-scrollbar flex-1 min-h-0">
        {content || "No description provided."}
      </div>
      <div className="flex justify-end mt-4">
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

// --- View More Modal ---
const ViewMoreModal = ({ placement, onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4">
    <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 animate-fadeIn relative">
      <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">
        Application Details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <p className="text-sm font-semibold text-gray-500">Role</p>
          <p className="text-base text-gray-800">{placement.role || "N/A"}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500">Place of Posting</p>
          <p className="text-base text-gray-800">{placement.place || "N/A"}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500">Offer Letter</p>
          {placement.offerletter_file_name ? (
            <a
              href={`http://localhost:8000/uploads/offer_letters/${placement.offerletter_file_name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="pl-1 text-blue-500 hover:underline"
            >
              View Offer Letter
            </a>
          ) : (
            "N/A"
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500">Modified By</p>
          <p className="text-base text-gray-800">{placement.modified_by || "N/A"}</p>
        </div>
        <div className="md:col-span-2">
          <p className="text-sm font-semibold text-gray-500">Last Modified</p>
          <p className="text-base text-gray-800">
            {placement.mod_time ? new Date(placement.mod_time).toLocaleString() : "N/A"}
          </p>
        </div>
      </div>
      <div className="flex justify-end mt-6">
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

// --- Main Table Component ---
const StudentPlacementTable = ({ setToastMessage, isFrozen }) => {
  const [placements, setPlacements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [showViewMoreModal, setShowViewMoreModal] = useState(false);
  const [selectedPlacement, setSelectedPlacement] = useState(null);
  const [selectedDescription, setSelectedDescription] = useState("");
  const [actionToConfirm, setActionToConfirm] = useState(null);

  const [formData, setFormData] = useState({
    is_selected: "No",
    role: "",
    place: "",
    ctc: "",
    offerletter_file_name: null,
  });

  // Fetch placements
  const fetchMyPlacements = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/student-placements/my-placements");
      setPlacements(res.data || []);
    } catch (err) {
      console.error("Failed to fetch placements:", err);
      setToastMessage({
        type: "error",
        content: err.response?.data?.message || "Failed to load applications.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPlacements();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEditClick = (placement) => {
    setSelectedPlacement(placement);
    setFormData({
      is_selected: placement.is_selected || "No",
      role: placement.role || "",
      place: placement.place || "",
      ctc: placement.ctc || "",
      offerletter_file_name: null,
    });
    setShowEditModal(true);
  };

  const handleDescriptionClick = (description) => {
    setSelectedDescription(description || "No description provided.");
    setShowDescriptionModal(true);
  };

  const handleViewMoreClick = (placement) => {
    setSelectedPlacement(placement);
    setShowViewMoreModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "offerletter_file_name") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else if (name === "is_selected") {
      setFormData((prev) => {
        let newCtc = prev.ctc;
        
        if (value === "Yes") {
            if (!newCtc && selectedPlacement) {
                newCtc = selectedPlacement.drive_ctc;
            }
        }
        return {
           ...prev,
           [name]: value,
           ctc: newCtc
        };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();

    if (formData.is_selected === "Yes") {
      const missingFields = [];
      if (!formData.role.trim()) missingFields.push("Role");
      if (!formData.place.trim()) missingFields.push("Place");
      if (!formData.ctc) missingFields.push("CTC");
      if (!formData.offerletter_file_name && !selectedPlacement.offerletter_file_name)
        missingFields.push("Offer Letter");

      if (missingFields.length > 0) {
        const fieldList = missingFields.join(", ");
        const verb = missingFields.length > 1 ? "are" : "is";
        setToastMessage({
          type: "error",
          content: `${fieldList} ${verb} required.`,
        });
        return;
      }
    }

    const noChanges =
      formData.is_selected === selectedPlacement.is_selected &&
      formData.role.trim() === (selectedPlacement.role || "").trim() &&
      formData.place.trim() === (selectedPlacement.place || "").trim() &&
      Number(formData.ctc) === Number(selectedPlacement.ctc || 0) &&
      !formData.offerletter_file_name;

    if (noChanges) {
      setToastMessage({ type: "info", content: "No changes detected." });
      setShowEditModal(false);
      return;
    }

    setActionToConfirm(() => () => executeUpdate());
    setShowConfirmModal(true);
  };

  const executeUpdate = async () => {
    if (!selectedPlacement) return;
    setShowConfirmModal(false);
    setShowEditModal(false);

    const data = new FormData();
    data.append("is_selected", formData.is_selected);
    data.append("role", formData.role);
    data.append("place", formData.place);
    data.append("ctc", formData.ctc);
    if (formData.offerletter_file_name) {
      data.append("offerletter_file_name", formData.offerletter_file_name);
    }

    try {
      await api.put(`/student-placements/my-placements/${selectedPlacement.drive_id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setToastMessage({ type: "success", content: "Application updated!" });
      fetchMyPlacements();
    } catch (err) {
      setToastMessage({
        type: "error",
        content: err.response?.data?.message || "Failed to update application.",
      });
    }
  };

  const confirmAction = () => {
    if (typeof actionToConfirm === "function") {
      actionToConfirm();
    }
    setActionToConfirm(null);
  };

  // --- Display Status Helper ---
  const getStatusText = (status) => {
    switch (status) {
      case "Yes":
        return <span className="font-semibold text-green-600">Yes</span>;
      case "Pending":
        return <span className="font-semibold text-orange-400">Pending</span>;
      default:
        return <span className="font-semibold text-red-600">No</span>;
    }
  };

  if (isLoading) {
    return <p className="text-center">Loading applications...</p>;
  }

  return (
    <div className="bg-blue-200 py-4 px-4 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-3">Application History</h2>

      <div className="border rounded-lg overflow-x-auto no-scrollbar">
        <div className="min-w-[1000px]">
          {/* Table Header */}
          <div className="grid grid-cols-[0.5fr_2fr_1.5fr_1fr_1.5fr_1fr_1fr_1fr] bg-gray-300 p-2 font-semibold text-sm">
            <div>Sl.No.</div>
            <div>Drive Name</div>
            <div>Company</div>
            <div>CTC</div>
            <div>Description</div>
            <div className="text-center">Selected</div>
            <div className="text-center">View More</div>
            <div className="text-right">Actions</div>
          </div>

          {/* Table Body */}
          <div className="max-h-96 overflow-y-auto no-scrollbar">
            {placements.length > 0 ? (
              placements.map((placement, index) => (
                <div
                  key={placement.drive_id}
                  className="grid grid-cols-[0.5fr_2fr_1.5fr_1fr_1.5fr_1fr_1fr_1fr] items-center p-2 border-t bg-white text-sm"
                >
                  <div className="pl-2">{index + 1}.</div>
                  <div className="font-semibold pr-2">{placement.drive_name}</div>
                  <div className="pr-2">{placement.company_name}</div>
                  <div className="pr-2">
                    {placement.is_selected === "Yes" && placement.ctc
                      ? `₹${Number(placement.ctc).toFixed(2)} LPA`
                      : "N/A"}
                  </div>
                  <div
                    className="pr-2 text-gray-700 hover:underline truncate cursor-pointer"
                    onClick={() => handleDescriptionClick(placement.drive_description)}
                    title={placement.drive_description || "Click to view full description"}
                  >
                    {placement.drive_description || "N/A"}
                  </div>
                  <div className="text-center">{getStatusText(placement.is_selected)}</div>
                  <div className="text-center">
                    <button
                      onClick={() => handleViewMoreClick(placement)}
                      className="bg-purple-500 text-white px-3 py-1 rounded-md text-xs hover:bg-purple-600 transition"
                    >
                      View More
                    </button>
                  </div>
                  <div className="text-right">
                    <button
                      onClick={() => handleEditClick(placement)}
                      disabled={isFrozen}
                      title={isFrozen ? "Profile is frozen" : "Edit Application"}
                      className={`px-3 py-1 rounded-md text-xs text-white transition ${
                        isFrozen
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-500 hover:bg-blue-600"
                      }`}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 p-4">
                You have not applied to any placement drives yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      {showDescriptionModal && (
        <DescriptionModal content={selectedDescription} onClose={() => setShowDescriptionModal(false)} />
      )}
      {showViewMoreModal && selectedPlacement && (
        <ViewMoreModal placement={selectedPlacement} onClose={() => setShowViewMoreModal(false)} />
      )}

      {/* --- Edit Modal --- */}
      {showEditModal && selectedPlacement && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 animate-fadeIn relative">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">
              Edit Application / Job
            </h3>

            <form onSubmit={handleUpdateSubmit}>
              <div className="space-y-4">
                {/* Selection dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Are you selected?
                  </label>
                  <select
                    name="is_selected"
                    value={formData.is_selected}
                    onChange={handleFormChange}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                {/* Conditional fields */}
                {formData.is_selected === "Yes" && (
                  <div className="space-y-4 p-4 border rounded-lg bg-gray-50 animate-fadeIn">
                    {/* Role */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <input
                        type="text"
                        name="role"
                        value={formData.role}
                        onChange={handleFormChange}
                        placeholder="e.g., SDE Intern, Analyst"
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>

                    {/* Place */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Place
                      </label>
                      <input
                        type="text"
                        name="place"
                        value={formData.place}
                        onChange={handleFormChange}
                        placeholder="e.g., Bangalore, Remote"
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>

                    {/* CTC Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CTC (in LPA)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="ctc"
                        value={formData.ctc}
                        onChange={handleFormChange}
                        placeholder="e.g., 12.5"
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>

                    {/* Offer Letter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Upload Offer Letter (PDF, JPG, JPEG, PNG)
                      </label>
                      <input
                        type="file"
                        name="offerletter_file_name"
                        onChange={handleFormChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                      />
                      {selectedPlacement.offerletter_file_name && (
                        <p className="text-xs text-gray-500 mt-2">
                          Current Offer Letter:{" "}
                          <a
                            href={`http://localhost:8000/uploads/offer_letters/${selectedPlacement.offerletter_file_name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            View
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Confirm Modal --- */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Are you sure?</h3>
            <p className="text-gray-600 mb-6">Do you really want to update this application?</p>
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

      {/* Animation Style */}
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

export default StudentPlacementTable;
