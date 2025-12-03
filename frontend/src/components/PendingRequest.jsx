/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import api from "../api/axios";

const PendingRequest = ({ setToastMessage }) => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State for the search term
  const user = JSON.parse(sessionStorage.getItem("user"));

  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const res = await api.get("/users/pending");
        setPendingUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch pending users:", err);
        setToastMessage({
          type: "error",
          content: "Failed to load pending requests.",
        });
      }
    };
    fetchPendingUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Depend on setToastMessage to avoid lint warning if needed

  const handleAction = async (userId, username, status) => {
    try {
      await api.put(`/users/${userId}/status`, {
        status: status,
        mod_by: user.userid,
      });
      setPendingUsers(pendingUsers.filter((user) => user.userid !== userId));
      setToastMessage({
        type: status === "1" ? "success" : "error",
        content: `${username} has been ${ status === "1" ? "accepted" : "rejected" }.`,
      });
    } catch (err) {
      setToastMessage({
        type: "error",
        content: `An error occurred while updating ${username}.`,
      });
      console.error("Error updating user status:", err);
    }
  };

  // Filter users based on search term (case-insensitive)
  const filteredUsers = pendingUsers.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to format date/time
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    try {
      return new Date(dateTimeString).toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  return (
    <div className="bg-blue-200 py-3 px-4 rounded-xl shadow-md">
      {/* Header with Search Box */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-3 gap-2">
        <h2 className="text-2xl font-bold">Pending Requests</h2>

        <div className="flex items-center border rounded-lg bg-white px-2 py-1 shadow-sm sm:w-48">
          <img
            src="/search.png"
            alt="Search"
            className="w-4 h-4 opacity-60 mr-2"
          />
          <input
            type="text"
            placeholder="Search with username"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm focus:outline-none"
          />
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-white">
        {/* Headers - Visible only on medium screens and up */}
        <div className="hidden md:grid grid-cols-[0.4fr_1fr_1fr_1fr_auto] gap-x-2 bg-gray-300 p-2 font-semibold text-sm border-b items-center">
          <div className="text-center px-1 w-12">Sl.No.</div>{" "}
          <div className="px-2">Username</div>
          <div className="px-2">User Type</div>
          <div className="px-2">Added / Last Modified</div>
          <div className="text-right px-2 w-32">Actions</div>{" "}
        </div>

        {/* Scrollable Container */}
        <div className="max-h-120 overflow-y-auto hide-scrollbar">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((request, index) => (
              <div
                key={request.userid}
                // Mobile: Block layout with padding
                // Desktop (md+): Grid layout matching header
                className="block md:grid md:grid-cols-[0.4fr_1fr_1fr_1fr_auto] md:gap-x-2 items-center p-3 md:p-2 border-t text-sm"
              >
                <div className="flex md:hidden justify-between items-center mb-2">
                  <div className="flex flex-col">
                    <span className="font-semibold">
                      {index + 1}. {request.username}
                    </span>
                    <span className="text-gray-600 text-xs">
                      ({request.user_type === "0" ? "Admin" : "Student"})
                    </span>
                    <span className="text-xs text-gray-500 mt-0.5">
                      {formatDateTime(request.mod_time)}
                    </span>
                  </div>

                  <div className="flex gap-1 ml-2 shrink-0">
                    <button
                      onClick={() =>
                        handleAction(request.userid, request.username, "1")
                      }
                      className="bg-green-500 text-white px-2 py-1 rounded-md text-[10px] hover:bg-green-600 transition whitespace-nowrap"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() =>
                        handleAction(request.userid, request.username, "2")
                      }
                      className="bg-red-500 text-white px-2 py-1 rounded-md text-[10px] hover:bg-red-600 transition whitespace-nowrap"
                    >
                      Reject
                    </button>
                  </div>
                </div>

                {/* --- Desktop View Cells (hidden on mobile) --- */}
                <div className="hidden md:block text-center px-1 w-12">
                  {index + 1}.
                </div>
                <div className="hidden md:block break-words px-2 min-w-0 overflow-hidden whitespace-normal">
                  {request.username}
                </div>
                <div className="hidden md:block break-words px-2 min-w-0">
                  {request.user_type === "0" ? "Admin" : "Student"}
                </div>
                <div className="hidden md:block break-words px-2 pr-6 min-w-0 overflow-hidden">
                  {formatDateTime(request.mod_time)}
                </div>
                <div className="hidden md:flex justify-end gap-2 md:px-2 md:w-32">
                  <button
                    onClick={() =>
                      handleAction(request.userid, request.username, "1")
                    }
                    className="bg-green-500 text-white px-3 py-1 rounded-md text-xs hover:bg-green-600 transition whitespace-nowrap"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() =>
                      handleAction(request.userid, request.username, "2")
                    }
                    className="bg-red-500 text-white px-3 py-1 rounded-md text-xs hover:bg-red-600 transition whitespace-nowrap"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          ) : (
            // Display message based on whether there's a search term or not
            <p className="text-center text-gray-500 p-2 text-sm">
              {searchTerm
                ? `No pending requests found matching "${searchTerm}".`
                : "No pending requests."}
            </p>
          )}
        </div>
      </div>
      <style>
        {`
          /* --- Hide scrollbar --- */
          .hide-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;  /* Chrome, Safari, and Opera */
          }
        `}
      </style>
    </div>
  );
};

export default PendingRequest;
