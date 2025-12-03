import React, { useState, useEffect } from "react";
import api from "../api/axios";

const RejectedStudentTable = ({ setToastMessage }) => {
  const [rejectedStudents, setRejectedStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const user = JSON.parse(sessionStorage.getItem("user"));

  const fetchRejectedStudents = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/adminStudents/rejected");
      setRejectedStudents(res.data || []);
    } catch (err) {
      console.error("Failed to fetch rejected students:", err);
      setToastMessage({
        type: "error",
        content:
          err.response?.data?.message ||
          "Failed to load rejected student data.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRejectedStudents();
  }, []);

  const handleUndoRejectClick = (userData) => {
    setSelectedUser(userData);
    setShowConfirmModal(true);
  };

  const executeUndoReject = async () => {
    if (!user || !user.userid) {
      setToastMessage({
        type: "error",
        content:
          "Error: Admin session data is missing. Please log out and log back in.",
      });
      setShowConfirmModal(false);
      setSelectedUser(null);
      return;
    }

    if (!selectedUser || !selectedUser.userid) {
      setToastMessage({
        type: "error",
        content: "Error: Rejected student data is missing.",
      });
      return;
    }

    const studentIdToUpdate = selectedUser.userid;
    const userName = selectedUser.username;

    try {
      // API call to update the user status to '0' (Pending)
      await api.put(`/users/${studentIdToUpdate}/status`, {
        status: "0",
        mod_by: user.userid,
      });

      // Optimistically update the UI: remove the student from the list
      setRejectedStudents((prev) =>
        prev.filter((s) => s.userid !== studentIdToUpdate)
      );

      setToastMessage({
        type: "success",
        content: `"${userName}" has been moved back to Pending Requests (Re-approval required).`,
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        `Failed to update status for ${userName}.`;
      console.error(errorMessage, err.response?.data);
      setToastMessage({
        type: "error",
        content: errorMessage,
      });
    } finally {
      setShowConfirmModal(false);
      setSelectedUser(null);
    }
  };

  // Function to render one half of the split table
  const renderHalfTable = (data, isOddIndexSplit) => {
    // Filter the students based on their array index (position in the list).
    const filteredData = data.filter((_, index) => {
        // Sl. No. is (index + 1)
        const slNo = index + 1;
        // Check if the Sl. No. matches the required split (Odd or Even)
        return isOddIndexSplit 
            ? slNo % 2 !== 0 // TRUE for 1, 3, 5, 7... (Left Table)
            : slNo % 2 === 0;  // TRUE for 2, 4, 6... (Right Table)
    });
    
    return (
      <div className="flex flex-col border rounded-lg overflow-x-auto w-1/2 overflow-hidden no-scrollbar"> 
        <div className="grid grid-cols-[80px_1fr_120px] bg-gray-300 p-2 font-semibold text-sm">
          <div>Sl. No.</div>
          <div className="col-span-1 text-center">Username</div>
          <div className="text-right pr-5">Action</div>
        </div>
        <div className="max-h-screen overflow-y-auto bg-white no-scrollbar"> 
          {filteredData.length > 0 ? (
            filteredData.map((student) => {
              const originalIndex = rejectedStudents.findIndex(s => s.userid === student.userid);
              if (originalIndex === -1) return null; 

              return (
                <div
                  key={student.userid}
                  className="grid grid-cols-[60px_1fr_120px] items-center p-2 border-t bg-white text-sm"
                >
                  <div className="w-10 pl-3">
                    {originalIndex + 1}. 
                  </div>
                  <div className="font-semibold break-words text-center">
                    {student.username || "N/A"}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleUndoRejectClick(student)}
                      className="bg-green-500 text-white px-3 py-1 rounded-md text-xs hover:bg-green-600 transition whitespace-nowrap"
                    >
                      Undo Reject
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            // Only display the "No records" message if the ENTIRE list is empty.
            rejectedStudents.length === 0 && (
                <p className="text-center text-gray-500 p-4 text-sm bg-white">
                    No rejected student records found.
                </p>
            )
          )}
        </div>
      </div>
    );
  };


  return (
    <div className="bg-blue-200 py-2 px-4 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-3">Rejected Students</h2>

      {isLoading ? (
        <p className="text-center text-gray-700 py-4">
          Loading rejected student data...
        </p>
      ) : (
        <>
          {/* ===== MOBILE VIEW (Single Table) - No changes needed here ===== */}
          <div className="lg:hidden border rounded-lg overflow-x-auto overflow-hidden">
            <div className="grid grid-cols-[80px_1fr_120px] bg-gray-300 p-2 font-semibold text-sm">
              <div>Sl. No.</div>
              <div className="col-span-1 text-center">Username</div>
              <div className="text-right pr-5">Action</div>
            </div>
            <div className="max-h-96 overflow-y-auto no-scrollbar">
              {rejectedStudents.length > 0 ? (
                rejectedStudents.map((student, index) => (
                  <div
                    key={student.userid}
                    className="grid grid-cols-[60px_1fr_120px] items-center p-2 border-t bg-white text-sm"
                  >
                    <div className="w-10 pl-3">{index + 1}.</div>
                    <div className="font-semibold break-words text-center">
                      {student.username || "N/A"}
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleUndoRejectClick(student)}
                        className="bg-green-500 text-white px-3 py-1 rounded-md text-xs hover:bg-green-600 transition whitespace-nowrap"
                      >
                        Undo Reject
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 p-4 text-sm bg-white">
                  No rejected student records found.
                </p>
              )}
            </div>
          </div>

          {/* ===== DESKTOP VIEW (Two Split Tables) - Split by Index & Equal Width (w-1/2) ===== */}
          {/* lg:flex and items-start fix unequal height issue. */}
          <div className="hidden lg:flex gap-6 items-start"> 
            {/* Left side: Odd Sl. No. (1, 3, 5, 7, ...) */}
            {renderHalfTable(rejectedStudents, true)}
            {/* Right side: Even Sl. No. (2, 4, 6, ...) */}
            {renderHalfTable(rejectedStudents, false)}
          </div>
        </>
      )}

      {/* ===== Confirmation Modal ===== */}
      {showConfirmModal && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[1000]">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Confirm Undo Reject
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to move{" "}
              <strong>{selectedUser.username}</strong> back to the Pending
              Requests queue?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeUndoReject}
                className="px-4 py-2 rounded-lg text-white transition bg-green-500 hover:bg-green-600"
              >
                Yes, Undo Reject
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

export default RejectedStudentTable;