import React, { useState, useEffect, useCallback } from "react";
import HeaderDashboard from "../../components/HeaderDashboard";
import Footer from "../../components/Footer";
import api from "../../api/axios";
import AdminResetPasswordModal from "../../components/AdminResetPasswordModal";

const IncompleteRegistrations = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState({ type: "", content: "" });
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce effect for search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Update fetch function to use debounced search
  const fetchIncompleteUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/users/incomplete", {
        params: {
          search: debouncedSearch, // Pass search term to backend
        },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch incomplete users:", err);
      setToastMessage({
        type: "error",
        content: "Failed to load user data.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch]);

  // Fetch incomplete users on load and when search changes
  useEffect(() => {
    fetchIncompleteUsers();
  }, [fetchIncompleteUsers]);

  // Toast message handler
  useEffect(() => {
    if (toastMessage.content) {
      const timer = setTimeout(() => {
        setToastMessage({ type: "", content: "" });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Modal open handler
  const handleResetClick = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  // Modal success handler
  const handleResetSuccess = (message) => {
    setToastMessage({ type: "success", content: message });
  };

  const getUserType = (type) => {
    return type === "0" ? "Admin" : "Student";
  };

  return (
    <div className="h-screen flex flex-col bg-white relative overflow-y-auto no-scrollbar">
      <HeaderDashboard />

      {toastMessage.content && (
        <div
          className={`fixed top-5 left-1/2 transform -translate-x-1/2 p-4 rounded-lg text-white z-[1000] ${
            toastMessage.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toastMessage.content}
        </div>
      )}

      <main className="flex-grow p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Incomplete Registrations
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-gray-600">
              These users have created an account but have not logged in to
              complete their profile. If they have forgotten their password, you
              can set a temporary one here.
            </p>

            {/* Search bar */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by username..."
                className="w-full py-1 px-4 bg-white border border-gray-400 rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        <div className="bg-blue-200 py-4 px-4 rounded-xl shadow-md">
          {isLoading ? (
            <p className="text-center p-4">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-center p-4">
              {debouncedSearch
                ? `No users found matching "${debouncedSearch}".`
                : "No incomplete registrations found."}
            </p>
          ) : (
            <div className="border rounded-lg overflow-x-auto no-scrollbar">
              <div className="min-w-[600px]">
                {/* Table Header */}
                <div className="grid grid-cols-[0.5fr_1.5fr_2fr_2fr] bg-gray-300 p-2 font-semibold text-sm">
                  <div>Sl. No.</div>
                  <div className="text-center">Username</div>
                  <div className="text-center">Account Type</div>
                  <div className="text-right">Actions</div>
                </div>
                {/* Table Body */}
                <div className="max-h-400 overflow-y-auto no-scrollbar">
                  {users.map((user, index) => (
                    <div
                      key={user.userid}
                      className="grid grid-cols-[0.5fr_1.5fr_2fr_2fr] items-center p-2 border-t bg-white text-sm"
                    >
                      <div className="pl-3">{index + 1}.</div>
                      <div className="font-semibold pr-2 text-center">{user.username}</div>
                      <div className="pr-2 text-center">{getUserType(user.user_type)}</div>
                      <div className="text-right">
                        <button
                          onClick={() => handleResetClick(user)}
                          className="bg-red-500 text-white px-3 py-1 rounded-md text-xs hover:bg-red-600 transition"
                        >
                          Set Temporary Password
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {showModal && selectedUser && (
        <AdminResetPasswordModal
          user={selectedUser}
          onClose={() => setShowModal(false)}
          onSuccess={handleResetSuccess}
          onErrorToast={(msg) =>
            setToastMessage({ type: "error", content: msg })
          }
        />
      )}

      <Footer />
    </div>
  );
};

export default IncompleteRegistrations;
