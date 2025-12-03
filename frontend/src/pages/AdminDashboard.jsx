import React, { useState, useEffect, useRef } from "react";
import HeaderDashboard from "../components/HeaderDashboard";
import Footer from "../components/Footer";
import PendingRequest from "../components/PendingRequest";
import AdminCard from "../components/AdminCard";
import { IoSettingsSharp } from "react-icons/io5";
import ChangePasswordModal from "../components/ChangePasswordModal";
import api from "../api/axios"; 
import AdminForm from "../components/AdminForm";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const [toastMessage, setToastMessage] = useState({ type: "", content: "" });

  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [adminDetails, setAdminDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);

  // Toast message handler
  useEffect(() => {
    if (toastMessage.content) {
      const timer = setTimeout(() => {
        setToastMessage({ type: "", content: "" });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Dropdown close handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  useEffect(() => {
    const fetchAdminDetails = async () => {
      try {
        const res = await api.get("/admin/details");
        if (res.data.length > 0) {
          setAdminDetails(res.data[0]);
        } else {
          setAdminDetails(null);
        }
        setIsLoadingDetails(false); // Set loading false only on success
      } catch (err) {
        // Check if the error is an auth error (401 or 403)
        // If it is, the axios interceptor is already handling the redirect.
        // We must NOT set state here, or we'll get the flicker.
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.error("Auth error in AdminDashboard, interceptor will handle.");
          // Do not set state. Let the interceptor redirect.
          // Do not set isLoadingDetails to false.
          return; 
        }

        // It's a different error (e.g., server offline, 500)
        console.error("Failed to fetch admin details:", err);
        setToastMessage({ type: "error", content: "Failed to load profile." });
        setAdminDetails(null); // Treat as first-time login on other errors
        setIsLoadingDetails(false);
      } 
    };
    fetchAdminDetails();
  }, []);

  // Custom toast function
  const showToast = (type, content) => {
    setToastMessage({ type, content });
  };

  if (isLoadingDetails) {
    return null;
  }

  // First-time login: Show the form full-screen
  if (!adminDetails) {
    return (
      <div className="h-screen flex flex-col bg-white relative overflow-y-auto no-scrollbar">
        <HeaderDashboard />
        <main className="flex-grow p-6 flex items-center justify-center">
          <AdminForm
            onSuccess={(data) => {
              setAdminDetails(data);
              showToast("success", "Profile created successfully!");
            }}
            onErrorToast={(msg) => showToast("error", msg)}
          />
        </main>
        <Footer />
      </div>
    );
  }

  // Main dashboard
  return (
    <div className="h-screen flex flex-col bg-white relative overflow-y-auto no-scrollbar">
      <HeaderDashboard />

      <main className="flex-grow p-6">
        {/* Welcome Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Admin Dashboard
            </h1>
            <p className="font-semibold text-lg text-gray-700">
              Welcome,{" "}
              <span className="font-bold text-lg text-purple-600">
                {adminDetails?.name || user.username}
              </span>
            </p>
          </div>

          {/* Settings Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown((prev) => !prev)}
              className="group p-2 rounded-full text-gray-600 hover:text-purple-600 hover:bg-purple-100 transition-colors duration-200"
              title="Settings"
            >
              <IoSettingsSharp
                size={26}
                className="transform transition-transform duration-300 group-hover:rotate-90"
              />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-2xl shadow-2xl z-[9999] overflow-hidden animate-fadeIn">
                <div className="p-2">
                  <button
                    onClick={() => {
                      setShowModal(true);
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors duration-200"
                  >
                    <span>🔒</span>
                    <span>Change Password</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowAccountModal(true);
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors duration-200"
                  >
                    <span>👤</span>
                    <span>Account Details</span>
                  </button>

                  <Link
                    to="/admin/incomplete-registrations"
                    onClick={() => setShowDropdown(false)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors duration-200"
                  >
                    <span>⚠️</span>
                    <span>Incomplete Registrations</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Toast Message */}
        {toastMessage.content && (
          <div
            className={`fixed top-5 left-1/2 transform -translate-x-1/2 p-4 rounded-lg text-white ${
              toastMessage.type === "success"
                ? "bg-green-500"
                : "bg-red-500"
            }`}
          >
            {toastMessage.content}
          </div>
        )}

        {/* Main Dashboard Content */}
        <AdminCard />
        <div className="mt-8">
          <PendingRequest setToastMessage={setToastMessage} />
        </div>
      </main>

      <Footer />

      {/* Render Modals */}
      {showModal && <ChangePasswordModal onClose={() => setShowModal(false)} />}

      {showAccountModal && (
        <AdminForm
          onClose={() => setShowAccountModal(false)}
          onSuccess={(data) => {
            setAdminDetails(data); // Update state with new details
            setShowAccountModal(false);
            showToast("success", "Account details updated!");
          }}
          onErrorToast={(msg) => {
            showToast(
              msg === "No changes were made." ? "info" : "error",
              msg
            );
          }}
        />
      )}

      {/* Animation Style */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.1s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
};

export default AdminDashboard;