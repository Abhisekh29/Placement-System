import React, { useState, useEffect } from "react";
import api from "../api/axios";
import AdminForm from "./AdminForm"; // Import the form

// This modal fetches data and passes it to AdminForm for editing
const AdminAccountModal = ({ onClose, onSuccess, onErrorToast }) => {
  const [existingData, setExistingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the admin's current details when the modal opens
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get("/admin/details");
        if (res.data.length > 0) {
          setExistingData(res.data[0]);
        }
      } catch (err) {
        console.error(err);
        onErrorToast("Could not load your details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [onErrorToast]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[9990] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-3xl rounded-xl shadow-2xl p-4 animate-fadeIn relative"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading ? (
          <p className="text-center p-8">Loading account details...</p>
        ) : (
          <AdminForm
            existingData={existingData}
            onSuccess={onSuccess} // Pass the success handler from AdminDashboard
            onErrorToast={onErrorToast} // Pass the toast handler
          />
        )}
      </div>
    </div>
  );
};

export default AdminAccountModal;