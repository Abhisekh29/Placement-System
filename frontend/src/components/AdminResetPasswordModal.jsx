import React, { useState } from "react";
import api from "../api/axios";

// This modal is for an ADMIN to reset another user's password
const AdminResetPasswordModal = ({ user, onClose, onSuccess, onErrorToast }) => {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [err, setErr] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErr("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (formData.newPassword !== formData.confirmPassword) {
      setErr("Passwords do not match.");
      return;
    }
    if (formData.newPassword.length < 4) {
      setErr("Password must be at least 4 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Calls the admin-protected reset-password route
      const res = await api.put(`/users/${user.userid}/reset-password`, {
        newPassword: formData.newPassword,
      });
      
      onSuccess(res.data); // Pass success message back to the page
      onClose(); // Close modal

    } catch (error) {
      const errorMsg = error.response?.data || "An unexpected error occurred.";
      setErr(errorMsg);
      onErrorToast(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[9990] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 animate-fadeIn relative"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">
          Reset Password
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Set a temporary password for user: <strong>{user.username}</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              New Temporary Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2"
              required
            />
          </div>

          {err && <p className="text-red-600 text-sm text-center">{err}</p>}
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Resetting..." : "Set Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminResetPasswordModal;