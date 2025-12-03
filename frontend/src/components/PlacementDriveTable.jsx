/* eslint-disable no-unused-vars */
// import React, { useEffect, useState } from "react";
// import api from "../api/axios";

// const initialForm = {
//   drive_name: "",
//   session_id: "",
//   company_id: "",
//   drive_description: "",
//   ctc: "",
//   is_active: "1", // '1' = Active, '0' = Closed
// };

// const DescriptionModal = ({ drive, onClose }) => (
//   <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[1000] p-4">
//     <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl p-6 animate-fadeIn relative max-h-[85vh] flex flex-col">
//       <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4 flex-shrink-0">
//         Description for: {drive.drive_name}
//       </h3>
//       <div className="text-base text-gray-700 whitespace-pre-wrap break-words overflow-y-auto flex-1 min-h-0">
//         {drive.drive_description || "No description provided."}
//       </div>
//       <div className="flex justify-end mt-4 flex-shrink-0">
//         <button
//           onClick={onClose}
//           className="px-6 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition"
//         >
//           Close
//         </button>
//       </div>
//     </div>
//   </div>
// );

// const DriveDetailsModal = ({ drive, onClose }) => (
//   <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[1000] p-4">
//     <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 animate-fadeIn relative">
//       <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">
//         Details for: {drive.drive_name}
//       </h3>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
//         <div>
//           <p className="text-sm font-semibold text-gray-500">Session Name</p>
//           <p className="text-base text-gray-800">
//             {drive.session_name || "N/A"}
//           </p>
//         </div>
//         <div>
//           <p className="text-sm font-semibold text-gray-500">Modified By</p>
//           <p className="text-base text-gray-800">
//             {drive.modified_by || "N/A"}
//           </p>
//         </div>
//         <div>
//           <p className="text-sm font-semibold text-gray-500">Last Modified</p>
//           <p className="text-base text-gray-800">
//             {drive.mod_time ? new Date(drive.mod_time).toLocaleString() : "N/A"}
//           </p>
//         </div>
//       </div>
//       <div className="flex justify-end mt-6">
//         <button
//           onClick={onClose}
//           className="px-6 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition"
//         >
//           Close
//         </button>
//       </div>
//     </div>
//   </div>
// );

// const PlacementDriveTable = ({ setToastMessage }) => {
//   const [drives, setDrives] = useState([]);
//   const [sessions, setSessions] = useState([]);
//   const [companies, setCompanies] = useState([]);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showConfirmModal, setShowConfirmModal] = useState(false);
//   const [showDescriptionModal, setShowDescriptionModal] = useState(false);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [editingDrive, setEditingDrive] = useState(null);
//   const [selectedDrive, setSelectedDrive] = useState(null);
//   const [formData, setFormData] = useState(initialForm);
//   const [actionToConfirm, setActionToConfirm] = useState(null);

//   // --- 1. Add state for the search bar ---
//   const [searchQuery, setSearchQuery] = useState("");

//   // safe read of session user
//   const user = (() => {
//     try {
//       return JSON.parse(sessionStorage.getItem("user")) || {};
//     } catch {
//       return {};
//     }
//   })();

//   // Fetch data
//   const fetchData = async () => {
//     try {
//       const [drivesRes, sessionsRes, companiesRes] = await Promise.all([
//         api.get("/placementDrive"),
//         api.get("/academic-session"),
//         api.get("/adminCompany"),
//       ]);
//       // const sortedDrives = (drivesRes.data || []).sort(
//       //   (a, b) => a.drive_id - b.drive_id
//       // );
//       setDrives(drivesRes.data || []);
//       setSessions(sessionsRes.data || []);
//       setCompanies(companiesRes.data || []);
//     } catch (err) {
//       console.error("Failed to fetch data:", err);
//       setToastMessage &&
//         setToastMessage({ type: "error", content: "Failed to load data." });
//     }
//   };

//   useEffect(() => {
//     fetchData();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Handlers
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((p) => ({ ...p, [name]: value }));
//   };

//   const handleAddClick = () => {
//     setFormData(initialForm);
//     setEditingDrive(null);
//     setShowAddModal(true);
//   };

//   const handleEditClick = (drive) => {
//     setEditingDrive(drive);
//     setFormData({
//       drive_name: drive.drive_name || "",
//       session_id: drive.session_id,
//       company_id: drive.company_id,
//       drive_description: drive.drive_description || "",
//       ctc: drive.ctc,
//       is_active: drive.is_active,
//     });
//     setShowEditModal(true);
//   };

//   const handleDescriptionClick = (drive) => {
//     setSelectedDrive(drive);
//     setShowDescriptionModal(true);
//   };

//   const handleViewDetailsClick = (drive) => {
//     setSelectedDrive(drive);
//     setShowDetailsModal(true);
//   };

//   const handleDeleteClick = (drive) => {
//     setActionToConfirm(
//       () => () => deleteDrive(drive.drive_id, drive.drive_name)
//     );
//     setShowConfirmModal(true);
//   };

//   const handleToggleStatusClick = (drive) => {
//     const newStatus = drive.is_active === "1" ? "0" : "1";
//     setActionToConfirm(
//       () => () => toggleDriveStatus(drive.drive_id, newStatus, drive.drive_name)
//     );
//     setShowConfirmModal(true);
//   };

//   // Add
//   const handleAddSubmit = async (e) => {
//     e.preventDefault();
//     if (
//       !formData.drive_name.trim() ||
//       !formData.session_id ||
//       !formData.company_id ||
//       !formData.ctc
//     ) {
//       setToastMessage &&
//         setToastMessage({
//           type: "error",
//           content: "Name, Session, Company, and CTC are required.",
//         });
//       return;
//     }
//     if (Number(formData.ctc) < 0) {
//       setToastMessage &&
//         setToastMessage({ type: "error", content: "CTC cannot be negative." });
//       return;
//     }
//     try {
//       await api.post("/placementDrive", {
//         ...formData,
//         ctc: Number(formData.ctc),
//         mod_by: user.userid,
//       });
//       setShowAddModal(false);
//       await fetchData();
//       setToastMessage &&
//         setToastMessage &&
//         setToastMessage({
//           type: "success",
//           content: `New drive "${formData.drive_name}" added.`,
//         });
//     } catch (err) {
//       const msg = err.response?.data?.message || "Failed to add drive.";
//       setToastMessage && setToastMessage({ type: "error", content: msg });
//     }
//   };

//   // Update
//   const handleUpdateSubmit = (e) => {
//     e.preventDefault();
//     if (!editingDrive) return;
//     if (Number(formData.ctc) < 0) {
//       setToastMessage &&
//         setToastMessage({ type: "error", content: "CTC cannot be negative." });
//       return;
//     }
//     const noChanges =
//       formData.drive_name.trim() === (editingDrive.drive_name || "") &&
//       Number(formData.session_id) === Number(editingDrive.session_id) &&
//       Number(formData.company_id) === Number(editingDrive.company_id) &&
//       Number(formData.ctc) === Number(editingDrive.ctc) &&
//       formData.drive_description.trim() ===
//       (editingDrive.drive_description || "");
//     if (noChanges) {
//       setToastMessage &&
//         setToastMessage({ type: "info", content: "No changes detected." });
//       setShowEditModal(false);
//       return;
//     }
//     // Confirm update
//     setShowEditModal(false);
//     setActionToConfirm(() => () => updateDrive());
//     setShowConfirmModal(true);
//   };

//   const updateDrive = async () => {
//     if (!editingDrive) return;
//     const id = editingDrive.drive_id;
//     try {
//       await api.put(`/placementDrive/${id}`, {
//         ...formData,
//         ctc: Number(formData.ctc),
//         mod_by: user.userid,
//       });
//       await fetchData();
//       setEditingDrive(null);
//       setToastMessage &&
//         setToastMessage({
//           type: "success",
//           content: "Drive updated successfully.",
//         });
//     } catch (err) {
//       const msg = err.response?.data?.message || "Failed to update drive.";
//       setToastMessage && setToastMessage({ type: "error", content: msg });
//     }
//   };

//   const deleteDrive = async (driveId, driveName) => {
//     try {
//       await api.delete(`/placementDrive/${driveId}`);
//       setDrives((prev) => prev.filter((d) => d.drive_id !== driveId));
//       setToastMessage &&
//         setToastMessage({
//           type: "success",
//           content: `"${driveName}" deleted successfully.`,
//         });
//       setShowConfirmModal(false);
//     } catch (err) {
//       const msg = err.response?.data?.message || "Failed to delete drive.";
//       setToastMessage && setToastMessage({ type: "error", content: msg });
//     }
//   };

//   const toggleDriveStatus = async (driveId, newStatus, driveName) => {
//     const statusText = newStatus === "0" ? "Closed" : "Active";
//     try {
//       await api.put(`/placementDrive/status/${driveId}`, {
//         is_active: newStatus,
//         mod_by: user.userid,
//       });
//       await fetchData();
//       setToastMessage &&
//         setToastMessage({
//           type: "success",
//           content: `"${driveName}" status set to ${statusText}.`,
//         });
//       setShowConfirmModal(false);
//     } catch (err) {
//       const msg =
//         err.response?.data?.message || `Failed to set status to ${statusText}.`;
//       setToastMessage && setToastMessage({ type: "error", content: msg });
//     }
//   };

//   const confirmAction = () => {
//     if (actionToConfirm) actionToConfirm();
//     setActionToConfirm(null);
//     setShowConfirmModal(false);
//   };

//   return (
//     <div className="bg-blue-200 py-4 px-4 rounded-xl shadow-md">
//       <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
//         <h2 className="text-2xl font-bold">Placement Drives</h2>

//         <input
//           type="text"
//           placeholder="Search by Drive or Company name"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           className="w-full sm:w-60 p-1 border bg-white rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
//         />
//       </div>

//       <div
//         className={`border rounded-lg overflow-x-auto no-scrollbar ${drives.length > 8 ? "max-h-96 overflow-y-auto" : ""
//           }`}
//       >
//         <table className="min-w-[1240px] w-full text-sm table-fixed border-collapse">
//           <thead className="sticky top-0 z-10 bg-gray-300 font-semibold text-sm border-b border-black">
//             <tr>
//               <th className="p-2 text-center w-[60px] whitespace-nowrap">
//                 Sl. No.
//               </th>
//               <th className="p-2 text-left w-[220px] pl-8 whitespace-nowrap">
//                 Drive Name
//               </th>
//               <th className="p-2 text-left w-[200px] pl-10 whitespace-nowrap">
//                 Company
//               </th>
//               <th className="p-2 text-center w-[120px] pr-25 whitespace-nowrap">
//                 CTC
//               </th>
//               <th className="p-2 text-left w-[240px] whitespace-nowrap">
//                 Description
//               </th>
//               <th className="p-2 text-center w-[100px] whitespace-nowrap">
//                 Status
//               </th>
//               <th className="p-2 text-center w-[90px] whitespace-nowrap">
//                 Details
//               </th>
//               <th className="p-2 text-right w-[220px] pr-16 whitespace-nowrap">
//                 Actions
//               </th>
//             </tr>
//           </thead>

//           <tbody className="bg-white">
//             {/* --- 3. Add filter logic --- */}
//             {(() => {
//               const filteredDrives = drives.filter((drive) => {
//                 if (!searchQuery.trim()) return true; // Show all if search is empty

//                 const q = searchQuery.toLowerCase().trim();
//                 const driveName = (drive.drive_name || "").toLowerCase();
//                 const companyName = (drive.company_name || "").toLowerCase();

//                 return driveName.includes(q) || companyName.includes(q);
//               });

//               // Check if filtered array is empty
//               if (filteredDrives.length === 0) {
//                 return (
//                   <tr>
//                     <td colSpan="8" className="p-4 text-center text-gray-500">
//                       {searchQuery.trim()
//                         ? `No drives found matching "${searchQuery}"`
//                         : "No placement drives found."}
//                     </td>
//                   </tr>
//                 );
//               }

//               // Map over the filtered array
//               return filteredDrives.map((drive, index) => (
//                 <tr
//                   key={drive.drive_id}
//                   className="hover:bg-gray-50 align-top border-b border-black"
//                 >
//                   <td className="p-2 text-center align-middle">{index + 1}.</td>
//                   <td className="p-2 pl-8 font-medium align-middle break-words">
//                     {drive.drive_name}
//                   </td>
//                   <td className="p-2 align-middle break-words pl-10">
//                     {drive.company_name}
//                   </td>
//                   <td className="p-2 text-center align-middle whitespace-nowrap pr-96">
//                     ₹{Number(drive.ctc || 0).toFixed(2)} LPA
//                   </td>
//                   <td
//                     className="p-2 align-middle cursor-pointer text-gray-700 hover:underline whitespace-nowrap overflow-hidden text-ellipsis"
//                     onClick={() => handleDescriptionClick(drive)}
//                     title={
//                       drive.drive_description ||
//                       "Click to view full description"
//                     }
//                   >
//                     {drive.drive_description || "N/A"}
//                   </td>
//                   <td className="p-2 text-center align-middle">
//                     <span
//                       className={`px-3 py-0.5 rounded-full text-xs font-semibold ${drive.is_active === "1"
//                           ? "bg-green-100 text-green-800"
//                           : "bg-red-100 text-red-800"
//                         }`}
//                     >
//                       {drive.is_active === "1" ? "Active" : "Closed"}
//                     </span>
//                   </td>
//                   <td className="p-2 text-center align-middle">
//                     <button
//                       onClick={() => handleViewDetailsClick(drive)}
//                       className="text-blue-500 hover:underline text-xs"
//                     >
//                       View
//                     </button>
//                   </td>
//                   <td className="p-2 text-right align-middle space-x-2">
//                     <button
//                       onClick={() => handleToggleStatusClick(drive)}
//                       className={`w-20 px-2 py-0.5 text-xs rounded-md text-white text-center transition ${drive.is_active === "0"
//                           ? "bg-green-500 hover:bg-green-600"
//                           : "bg-red-500 hover:bg-red-600"
//                         }`}
//                     >
//                       {drive.is_active === "0" ? "Set Active" : "Set Closed"}
//                     </button>
//                     <button
//                       onClick={() => handleEditClick(drive)}
//                       className="bg-blue-500 text-white px-2 py-0.5 rounded-md text-xs hover:bg-blue-600 transition"
//                     >
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => handleDeleteClick(drive)}
//                       className="bg-red-500 text-white px-2 py-0.5 rounded-md text-xs hover:bg-red-600 transition"
//                     >
//                       Delete
//                     </button>
//                   </td>
//                 </tr>
//               ));
//             })()}
//           </tbody>
//         </table>
//       </div>

//       <div className="mt-4 text-right">
//         <button
//           onClick={handleAddClick}
//           className="bg-purple-500 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-600 transition"
//         >
//           ➕ Add New Drive
//         </button>
//       </div>

//       {/* Add / Edit modal */}
//       {(showAddModal || showEditModal) && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
//           <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 animate-fadeIn relative">
//             <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">
//               {showAddModal
//                 ? "Add New Placement Drive"
//                 : "Edit Placement Drive"}
//             </h3>

//             <form
//               onSubmit={showAddModal ? handleAddSubmit : handleUpdateSubmit}
//             >
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <input
//                   type="text"
//                   name="drive_name"
//                   value={formData.drive_name}
//                   onChange={handleInputChange}
//                   placeholder="Drive Name*"
//                   className="w-full md:col-span-2 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
//                 />

//                 <select
//                   name="session_id"
//                   value={formData.session_id}
//                   onChange={handleInputChange}
//                   className="p-3 border rounded-lg"
//                 >
//                   <option value="">Select Session*</option>
//                   {sessions.map((s) => (
//                     <option key={s.session_id} value={s.session_id}>
//                       {s.session_name} ({s.year_name})
//                     </option>
//                   ))}
//                 </select>

//                 <select
//                   name="company_id"
//                   value={formData.company_id}
//                   onChange={handleInputChange}
//                   className="p-3 border rounded-lg"
//                 >
//                   <option value="">Select Company*</option>
//                   {companies.map((c) => (
//                     <option key={c.company_id} value={c.company_id}>
//                       {c.company_name}
//                     </option>
//                   ))}
//                 </select>

//                 <input
//                   type="number"
//                   name="ctc"
//                   min="0"
//                   step="0.01"
//                   value={formData.ctc}
//                   onChange={handleInputChange}
//                   placeholder="CTC (LPA)*"
//                   className="p-3 border rounded-lg"
//                 />

//                 {showEditModal && editingDrive && (
//                   <div className="w-full p-3 border rounded-lg bg-gray-100 text-gray-700">
//                     Current Status:{" "}
//                     <span className="font-semibold">
//                       {editingDrive.is_active === "1" ? "Active" : "Closed"}
//                     </span>
//                   </div>
//                 )}

//                 <textarea
//                   name="drive_description"
//                   value={formData.drive_description}
//                   onChange={handleInputChange}
//                   placeholder="Drive Description (e.g., Eligibility, Selection process...)"
//                   rows="4"
//                   className="w-full md:col-span-2 p-3 border rounded-lg"
//                 />
//               </div>

//               <div className="flex justify-end gap-3 mt-4">
//                 <button
//                   type="button"
//                   onClick={() =>
//                     showAddModal
//                       ? setShowAddModal(false)
//                       : setShowEditModal(false)
//                   }
//                   className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition"
//                 >
//                   {showAddModal ? "Add Drive" : "Update Drive"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {showDescriptionModal && selectedDrive && (
//         <DescriptionModal
//           drive={selectedDrive}
//           onClose={() => setShowDescriptionModal(false)}
//         />
//       )}

//       {showDetailsModal && selectedDrive && (
//         <DriveDetailsModal
//           drive={selectedDrive}
//           onClose={() => setShowDetailsModal(false)}
//         />
//       )}

//       {showConfirmModal && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
//           <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 animate-fadeIn">
//             <h3 className="text-xl font-bold text-gray-800 mb-4">
//               Confirm Action
//             </h3>
//             <p className="text-gray-600 mb-6">
//               Are you sure you want to proceed?
//             </p>
//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={() => setShowConfirmModal(false)}
//                 className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmAction}
//                 className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg"
//               >
//                 Confirm
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <style>{`
//         @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px);} to { opacity: 1; transform: translateY(0);} }
//         .animate-fadeIn { animation: fadeIn 0.16s ease-out forwards; }
//       `}</style>
//     </div>
//   );
// };

// export default PlacementDriveTable;

import React, { useEffect, useState, useCallback } from "react";
import api from "../api/axios";

const initialForm = {
  drive_name: "",
  session_id: "",
  company_id: "",
  drive_description: "",
  ctc: "",
  is_active: "1", // '1' = Active
};

// --- Description Modal ---
const DescriptionModal = ({ drive, onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[1000] p-4">
    <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl p-6 animate-fadeIn relative max-h-[85vh] flex flex-col">
      <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4 flex-shrink-0">
        Description for: {drive.drive_name}
      </h3>
      <div className="text-base text-gray-700 whitespace-pre-wrap break-words overflow-y-auto flex-1 min-h-0">
        {drive.drive_description || "No description provided."}
      </div>
      <div className="flex justify-end mt-4 flex-shrink-0">
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

// --- DriveDetailsModal ---
const DriveDetailsModal = ({ drive, onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[1000] p-4">
    <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 animate-fadeIn relative">
      <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">
        Details for: {drive.drive_name}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <p className="text-sm font-semibold text-gray-500">Session Name</p>
          <p className="text-base text-gray-800">
            {drive.session_name || "N/A"}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500">Modified By</p>
          <p className="text-base text-gray-800">
            {drive.modified_by || "N/A"}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500">Last Modified</p>
          <p className="text-base text-gray-800">
            {drive.mod_time ? new Date(drive.mod_time).toLocaleString() : "N/A"}
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

const PlacementDriveTable = ({ setToastMessage }) => {
  const [drives, setDrives] = useState([]); //  Will now hold paged data
  const [sessions, setSessions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingDrive, setEditingDrive] = useState(null);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [actionToConfirm, setActionToConfirm] = useState(null);

  // ---  NEW PAGINATION & SEARCH STATE ---
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalDrives, setTotalDrives] = useState(0);
  const [searchTerm, setSearchTerm] = useState(""); // Replaces your 'searchQuery'
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  const totalPages = Math.ceil(totalDrives / limit);
  const serialNoOffset = (limit === "all" || currentPage === 1) ? 0 : (currentPage - 1) * limit;
  // ---  END NEW STATE ---

  const user = (() => {
    try {
      return JSON.parse(sessionStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  })();
  
  // ---  DEBOUNCE EFFECT for search ---
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // --- Renamed to fetchPlacementDrives ---
  const fetchPlacementDrives = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch paged drives
      const drivesRes = await api.get("/placementDrive", {
        params: {
          search: debouncedSearch,
          page: currentPage,
          limit: limit,
        },
      });
      setDrives(drivesRes.data.data || []);
      setTotalDrives(drivesRes.data.total || 0);
      
      // 2. Fetch modal data (only if needed)
      if (sessions.length === 0 || companies.length === 0) {
        const [sessionsRes, companiesRes] = await Promise.all([
          api.get("/academic-session"),
          api.get("/adminCompany"),
        ]);
        setSessions(sessionsRes.data || []);
        setCompanies(companiesRes.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setToastMessage &&
        setToastMessage({ type: "error", content: "Failed to load data." });
      setDrives([]);
      setTotalDrives(0);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, currentPage, limit, setToastMessage, sessions.length, companies.length]);

  useEffect(() => {
    fetchPlacementDrives();
  }, [fetchPlacementDrives]); // Runs when dependencies change

  // --- Original handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleAddClick = () => {
    setFormData(initialForm);
    setEditingDrive(null);
    setShowAddModal(true);
  };

  const handleEditClick = (drive) => {
    setEditingDrive(drive);
    setFormData({
      drive_name: drive.drive_name || "",
      session_id: drive.session_id,
      company_id: drive.company_id,
      drive_description: drive.drive_description || "",
      ctc: drive.ctc,
      is_active: drive.is_active,
    });
    setShowEditModal(true);
  };

  const handleDescriptionClick = (drive) => {
    setSelectedDrive(drive);
    setShowDescriptionModal(true);
  };

  const handleViewDetailsClick = (drive) => {
    setSelectedDrive(drive);
    setShowDetailsModal(true);
  };

  const handleDeleteClick = (drive) => {
    setActionToConfirm(
      () => () => deleteDrive(drive.drive_id, drive.drive_name)
    );
    setShowConfirmModal(true);
  };

  const handleToggleStatusClick = (drive) => {
    const newStatus = drive.is_active === "1" ? "0" : "1";
    setActionToConfirm(
      () => () => toggleDriveStatus(drive.drive_id, newStatus, drive.drive_name)
    );
    setShowConfirmModal(true);
  };
  
  // --- Pagination and Export Handlers ---
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

  const exportToExcel = () => {
    if (drives.length === 0) {
      setToastMessage({ type: "error", content: "No records to export." });
      return;
    }
    const headers = [
      "Drive Name", "Company", "Session", "CTC (LPA)", "Status", "Description", "Modified By", "Last Modified"
    ];
    const dataRows = drives.map((drive) =>
      [
        `"${(drive.drive_name || "N/A").replace(/"/g, '""')}"`,
        `"${(drive.company_name || "N/A").replace(/"/g, '""')}"`,
        `"${(drive.session_name || "N/A").replace(/"/g, '""')}"`,
        `"${drive.ctc || 0}"`,
        `"${drive.is_active === '1' ? 'Active' : 'Closed'}"`, 
        `"${(drive.drive_description || "N/A").replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        `"${(drive.modified_by || "N/A").replace(/"/g, '""')}"`,
        `"${new Date(drive.mod_time).toLocaleString()}"`,
      ].join(",")
    );
    const csvString = [headers.join(","), ...dataRows].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const fileName = `PlacementDrives_Page${currentPage}_${new Date().toISOString().split("T")[0]}.csv`;
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastMessage({
      type: "success",
      content: `Exported ${drives.length} records from current page.`,
    });
  };
  
  // --- CRUD functions ---

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.drive_name.trim() || !formData.session_id || !formData.company_id || !formData.ctc) {
      setToastMessage && setToastMessage({ type: "error", content: "Name, Session, Company, and CTC are required." });
      return;
    }
    if (Number(formData.ctc) < 0) {
      setToastMessage && setToastMessage({ type: "error", content: "CTC cannot be negative." });
      return;
    }
    try {
      await api.post("/placementDrive", {
        ...formData,
        ctc: Number(formData.ctc),
        mod_by: user.userid,
      });
      setShowAddModal(false);
      fetchPlacementDrives();
      setToastMessage &&
        setToastMessage({
          type: "success",
          content: `New drive "${formData.drive_name}" added.`,
        });
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add drive.";
      setToastMessage && setToastMessage({ type: "error", content: msg });
    }
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    if (!editingDrive) return;
    if (Number(formData.ctc) < 0) {
      setToastMessage && setToastMessage({ type: "error", content: "CTC cannot be negative." });
      return;
    }
    const noChanges =
      formData.drive_name.trim() === (editingDrive.drive_name || "") &&
      Number(formData.session_id) === Number(editingDrive.session_id) &&
      Number(formData.company_id) === Number(editingDrive.company_id) &&
      Number(formData.ctc) === Number(editingDrive.ctc) &&
      formData.drive_description.trim() === (editingDrive.drive_description || "");
    
    if (noChanges) {
      setToastMessage && setToastMessage({ type: "info", content: "No changes detected." });
      setShowEditModal(false);
      return;
    }
    setShowEditModal(false);
    setActionToConfirm(() => () => updateDrive());
    setShowConfirmModal(true);
  };

  const updateDrive = async () => {
    if (!editingDrive) return;
    const id = editingDrive.drive_id;
    try {
      await api.put(`/placementDrive/${id}`, {
        ...formData,
        ctc: Number(formData.ctc),
        mod_by: user.userid,
      });
      fetchPlacementDrives();
      setEditingDrive(null);
      setToastMessage &&
        setToastMessage({
          type: "success",
          content: "Drive updated successfully.",
        });
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update drive.";
      setToastMessage && setToastMessage({ type: "error", content: msg });
    }
  };

  const deleteDrive = async (driveId, driveName) => {
    try {
      await api.delete(`/placementDrive/${driveId}`);
      fetchPlacementDrives();
      setToastMessage &&
        setToastMessage({
          type: "success",
          content: `"${driveName}" deleted successfully.`,
        });
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete drive.";
      setToastMessage && setToastMessage({ type: "error", content: msg });
    }
  };

  const toggleDriveStatus = async (driveId, newStatus, driveName) => {
    const statusText = newStatus === "0" ? "Closed" : "Active";
    try {
      await api.put(`/placementDrive/status/${driveId}`, {
        is_active: newStatus,
        mod_by: user.userid,
      });
      fetchPlacementDrives();
      setToastMessage &&
        setToastMessage({
          type: "success",
          content: `"${driveName}" status set to ${statusText}.`,
        });
    } catch (err) {
      const msg = err.response?.data?.message || `Failed to set status to ${statusText}.`;
      setToastMessage && setToastMessage({ type: "error", content: msg });
    }
  };

  const confirmAction = () => {
    if (actionToConfirm) actionToConfirm();
    setActionToConfirm(null);
    setShowConfirmModal(false);
  };

  return (
    <div className="bg-blue-200 py-4 px-4 rounded-xl shadow-md">
      {/* Search Bar + Export  */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
        <h2 className="text-2xl font-bold">Placement Drives</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by Drive or Company name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-60 p-1 border bg-white rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          <button
            onClick={exportToExcel}
            className={`px-3 py-1.5 rounded-lg text-white text-xs transition shadow-sm w-auto flex-shrink-0 
              ${drives.length === 0 ? "bg-green-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
            disabled={drives.length === 0}
          >
            Export Page
          </button>
        </div>
      </div>
      
      {/*  NEW: Pagination Controls (Top)  */}
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
                Showing {Math.min(serialNoOffset + 1, totalDrives)} - {Math.min(serialNoOffset + drives.length, totalDrives)} of {totalDrives}
              </span>
            )}
            {limit === "all" && totalDrives > 0 && (
              <span className="text-gray-600">
                Showing all {totalDrives} records
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

      {/* Table */}
      <div className="max-h-400 border rounded-lg overflow-x-auto no-scrollbar">
        <table className="min-w-[1240px] w-full text-sm table-fixed border-collapse">
          <thead className="sticky top-0 z-10 bg-gray-300 font-semibold text-sm border-b border-black">
            <tr>
              <th className="p-2 text-center w-[60px] whitespace-nowrap">
                Sl. No.
              </th>
              <th className="p-2 text-left w-[220px] pl-8 whitespace-nowrap">
                Drive Name
              </th>
              <th className="p-2 text-left w-[200px] pl-10 whitespace-nowrap">
                Company
              </th>
              <th className="p-2 text-center w-[120px] pr-25 whitespace-nowrap">
                CTC
              </th>
              <th className="p-2 text-left w-[240px] whitespace-nowrap">
                Description
              </th>
              <th className="p-2 text-center w-[100px] whitespace-nowrap">
                Status
              </th>
              <th className="p-2 text-center w-[90px] whitespace-nowrap">
                Details
              </th>
              <th className="p-2 text-right w-[220px] pr-16 whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white">
            {/* Loading/No Data/Map logic  */}
            {isLoading ? (
              <tr>
                <td colSpan="8" className="p-4 text-center text-gray-500">
                  Loading drives...
                </td>
              </tr>
            ) : drives.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-4 text-center text-gray-500">
                  {searchTerm.trim()
                    ? `No drives found matching "${searchTerm}"`
                    : "No placement drives found."}
                </td>
              </tr>
            ) : (
              drives.map((drive, index) => (
                <tr
                  key={drive.drive_id}
                  className="hover:bg-gray-50 align-top border-b border-black"
                >
                  <td className="p-2 text-center align-middle">{serialNoOffset + index + 1}.</td>
                  
                  <td className="p-2 pl-8 font-medium align-middle break-words">
                    {drive.drive_name}
                  </td>
                  <td className="p-2 align-middle break-words pl-10">
                    {drive.company_name}
                  </td>
                  <td className="p-2 text-center align-middle whitespace-nowrap pr-96">
                    ₹{Number(drive.ctc || 0).toFixed(2)} LPA
                  </td>
                  <td
                    className="p-2 align-middle cursor-pointer text-gray-700 hover:underline whitespace-nowrap overflow-hidden text-ellipsis"
                    onClick={() => handleDescriptionClick(drive)}
                    title={
                      drive.drive_description ||
                      "Click to view full description"
                    }
                  >
                    {drive.drive_description || "N/A"}
                  </td>
                  <td className="p-2 text-center align-middle">
                    <span
                      className={`px-3 py-0.5 rounded-full text-xs font-semibold ${drive.is_active === "1"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                        }`}
                    >
                      {drive.is_active === "1" ? "Active" : "Closed"}
                    </span>
                  </td>
                  <td className="p-2 text-center align-middle">
                    <button
                      onClick={() => handleViewDetailsClick(drive)}
                      className="text-blue-500 hover:underline text-xs"
                    >
                      View
                    </button>
                  </td>
                  <td className="p-2 text-right align-middle space-x-2">
                    <button
                      onClick={() => handleToggleStatusClick(drive)}
                      className={`w-20 px-2 py-0.5 text-xs rounded-md text-white text-center transition ${drive.is_active === "0"
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-red-500 hover:bg-red-600"
                        }`}
                    >
                      {drive.is_active === "0" ? "Set Active" : "Set Closed"}
                    </button>
                    <button
                      onClick={() => handleEditClick(drive)}
                      className="bg-blue-500 text-white px-2 py-0.5 rounded-md text-xs hover:bg-blue-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(drive)}
                      className="bg-red-500 text-white px-2 py-0.5 rounded-md text-xs hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Button */}
      <div className="mt-4 text-right">
        <button
          onClick={handleAddClick}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-600 transition"
        >
          ➕ Add New Drive
        </button>
      </div>

      {/* Add / Edit modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 animate-fadeIn relative">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">
              {showAddModal
                ? "Add New Placement Drive"
                : "Edit Placement Drive"}
            </h3>
            <form
              onSubmit={showAddModal ? handleAddSubmit : handleUpdateSubmit}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="drive_name"
                  value={formData.drive_name}
                  onChange={handleInputChange}
                  placeholder="Drive Name*"
                  className="w-full md:col-span-2 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <select
                  name="session_id"
                  value={formData.session_id}
                  onChange={handleInputChange}
                  className="p-3 border rounded-lg"
                >
                  <option value="">Select Session*</option>
                  {sessions.map((s) => (
                    <option key={s.session_id} value={s.session_id}>
                      {s.session_name} ({s.year_name})
                    </option>
                  ))}
                </select>
                <select
                  name="company_id"
                  value={formData.company_id}
                  onChange={handleInputChange}
                  className="p-3 border rounded-lg"
                >
                  <option value="">Select Company*</option>
                  {companies.map((c) => (
                    <option key={c.company_id} value={c.company_id}>
                      {c.company_name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  name="ctc"
                  min="0"
                  step="0.01"
                  value={formData.ctc}
                  onChange={handleInputChange}
                  placeholder="CTC (LPA)*"
                  className="p-3 border rounded-lg"
                />
                {showEditModal && editingDrive && (
                  <div className="w-full p-3 border rounded-lg bg-gray-100 text-gray-700">
                    Current Status:{" "}
                    <span className="font-semibold">
                      {editingDrive.is_active === "1" ? "Active" : "Closed"}
                    </span>
                  </div>
                )}
                <textarea
                  name="drive_description"
                  value={formData.drive_description}
                  onChange={handleInputChange}
                  placeholder="Drive Description (e.g., Eligibility, Selection process...)"
                  rows="4"
                  className="w-full md:col-span-2 p-3 border rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() =>
                    showAddModal
                      ? setShowAddModal(false)
                      : setShowEditModal(false)
                  }
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition"
                >
                  {showAddModal ? "Add Drive" : "Update Drive"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showDescriptionModal && selectedDrive && (
        <DescriptionModal
          drive={selectedDrive}
          onClose={() => setShowDescriptionModal(false)}
        />
      )}
      
      {showDetailsModal && selectedDrive && (
        <DriveDetailsModal
          drive={selectedDrive}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
      
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Confirm Action
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to proceed?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px);} to { opacity: 1; transform: translateY(0);} }
        .animate-fadeIn { animation: fadeIn 0.16s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default PlacementDriveTable;