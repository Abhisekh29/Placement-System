import React, { useState, useEffect } from "react";
import api from "../api/axios";

const initialFormState = {
  date: new Date().toLocaleDateString("en-CA"), // Default to today
  text: "",
};

const NotificationTable = ({ setToastMessage }) => {
  const [notifications, setNotifications] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [actionToConfirm, setActionToConfirm] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const user = JSON.parse(sessionStorage.getItem("user"));

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddClick = () => {
    setFormData(initialFormState);
    setShowAddModal(true);
  };

  const handleEditClick = (notification) => {
    setEditingNotification(notification);
    setFormData({
      date: new Date(notification.date).toLocaleDateString("en-CA"),
      text: notification.text,
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (notification) => {
    setActionToConfirm(
      () => () => deleteNotification(notification.nid, notification.text)
    );
    setShowConfirmModal(true);
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    const noChanges =
      new Date(formData.date).toLocaleDateString("en-CA") === new Date(editingNotification.date).toLocaleDateString("en-CA") &&
      formData.text.trim() === editingNotification.text;

    if (noChanges) {
      setToastMessage({ type: "error", content: "No changes were made." });
      setShowEditModal(false);
      return;
    }
    setShowEditModal(false);
    setActionToConfirm(() => () => updateNotification());
    setShowConfirmModal(true);
  };
  
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.date || !formData.text.trim()) {
      setToastMessage({ type: "error", content: "All fields are required." });
      return;
    }
    addNotification();
  };

  const updateNotification = async () => {
    try {
      await api.put(`/notifications/${editingNotification.nid}`, {
        ...formData,
        mod_by: user.userid,
      });
      fetchNotifications();
      setToastMessage({
        type: "success",
        content: "Notification updated successfully.",
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update notification.";
      setToastMessage({ type: "error", content: errorMessage });
    }
  };

  const deleteNotification = async (nid, text) => {
    try {
      await api.delete(`/notifications/${nid}`);
      setNotifications(notifications.filter((n) => n.nid !== nid));
      setToastMessage({
        type: "success",
        content: `Notification "${text.substring(0, 20)}..." has been deleted.`,
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete notification.";
      setToastMessage({ type: "error", content: errorMessage });
    }
  };

  const addNotification = async () => {
    try {
      await api.post("/notifications", {
        ...formData,
        mod_by: user.userid,
      });
      setShowAddModal(false);
      fetchNotifications();
      setToastMessage({
        type: "success",
        content: "New notification added successfully.",
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to add notification.";
      setToastMessage({ type: "error", content: errorMessage });
    }
  };

  const confirmAction = () => {
    if (actionToConfirm) actionToConfirm();
    setShowConfirmModal(false);
  };

  return (
  <div className="bg-blue-200 py-2 px-4 rounded-xl shadow-md">
    <h2 className="text-2xl font-bold mb-3">Notifications</h2>
    <div className="border rounded-lg overflow-x-auto no-scrollbar">
      <div className="min-w-[900px]">
        <div className="grid grid-cols-[0.5fr_2fr_1fr_minmax(140px,1fr)_minmax(180px,1fr)_1fr] bg-gray-300 p-2 font-semibold text-sm">
  <div>S.No.</div>
  <div>Notification Text</div>
  <div>Date</div>
  <div>Modified By</div>
  <div>Last Modified</div>
  <div className="text-right">Actions</div>
</div>

<div className="max-h-96 overflow-y-auto no-scrollbar">
  {notifications.length > 0 ? (
    notifications.map((item, index) => (
      <div
        key={item.nid}
        className="grid grid-cols-[0.5fr_2fr_1fr_minmax(140px,1fr)_minmax(180px,1fr)_1fr] items-center p-2 border-t bg-white text-sm"
      >
        <div>{index + 1}</div>
        <div className="pr-6">{item.text}</div>
        <div>{new Date(item.date).toLocaleDateString("en-IN")}</div>
        <div className="break-words pr-6">{item.modified_by || "N/A"}</div>
        <div className="break-words pr-6">{new Date(item.mod_time).toLocaleString()}</div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => handleEditClick(item)}
            className="bg-blue-500 text-white px-2 py-0.5 rounded-md text-xs cursor-pointer"
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteClick(item)}
            className="bg-red-500 text-white px-2 py-0.5 rounded-md text-xs cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
            ))
          ) : (
            <p className="text-center text-gray-500 p-4">
              No notifications found.
            </p>
          )}
          </div>
        </div>
      </div>
      <div className="mt-4 text-right">
        <button onClick={handleAddClick} className="bg-purple-500 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-600 transition cursor-pointer">
          ➕ Add New Notification
        </button>
      </div>

      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">
              {showAddModal ? "Add New Notification" : "Edit Notification"}
            </h3>
            <form onSubmit={showAddModal ? handleAddSubmit : handleUpdateSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Date</label>
                  <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full p-3 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Notification Text</label>
                  <textarea name="text" value={formData.text} onChange={handleInputChange} rows="4" placeholder="Enter notification details..." className="w-full p-3 border rounded-lg"></textarea>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => showAddModal ? setShowAddModal(false) : setShowEditModal(false)} className="px-4 py-2 rounded-lg bg-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-purple-500 text-white">
                  {showAddModal ? "Add Notification" : "Update Notification"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfirmModal && (
         <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
           <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Are you sure?</h3>
            <p className="text-gray-600 mb-6">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowConfirmModal(false)} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Cancel</button>
              <button onClick={confirmAction} className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600">Confirm</button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } } .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }`}</style>
    </div>
  );
};

export default NotificationTable;