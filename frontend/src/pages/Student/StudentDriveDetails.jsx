import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import HeaderDashboard from "../../components/HeaderDashboard";
import Footer from "../../components/Footer";
import { HiExclamationTriangle } from "react-icons/hi2";

const StudentDriveDetails = () => {
  const { driveId } = useParams(); // Get driveId from URL
  

  // State for this page
  const [drive, setDrive] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appliedDriveIds, setAppliedDriveIds] = useState([]); // List of IDs student has applied to
  const [isApplying, setIsApplying] = useState(false); // For button loading state

  // Add state for the confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Toast message state
  const [toastMessage, setToastMessage] = useState({ type: "", content: "" });

  const [isFrozen, setIsFrozen] = useState(false);
  useEffect(() => {
    const status = JSON.parse(sessionStorage.getItem("studentStatus"));
    if (status) {
      setIsFrozen(status.isFrozen);
    }
  }, []);

  useEffect(() => {
    if (toastMessage.content) {
      const timer = setTimeout(() => {
        setToastMessage({ type: "", content: "" });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Fetch drive details and student's application status
  useEffect(() => {
    const fetchDriveData = async () => {
      if (!driveId) return;
      setIsLoading(true);
      setError(null);
      try {
        // Fetch both drive details and applied drives list in parallel
        const [detailsRes, appliedRes] = await Promise.all([
          api.get(`/student-placement-drives/details/${driveId}`),
          api.get("/student-placements/applied-drives", {
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'Expires': '0',
            },
          }),
        ]);

        setDrive(detailsRes.data);
        setAppliedDriveIds(appliedRes.data || []);
      } catch (err) {
        console.error("Failed to fetch drive data:", err);
        setError(err.response?.data?.message || "Could not load drive details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDriveData();
  }, [driveId]);

  // This function now just OPENS the modal
  const handleApplyClick = () => {
    setShowConfirmModal(true);
  };

  // This new function contains the API logic
  const executeApply = async () => {
    setShowConfirmModal(false); // Close modal
    setIsApplying(true); // Set loading state on button
    setError(null);
    try {
      await api.post("/student-placements/apply", {
        drive_id: driveId,
      });

      // Success: Add this drive ID to our local state to disable the button
      setAppliedDriveIds((prev) => [...prev, Number(driveId)]);
      setToastMessage({
        type: "success",
        content: "Application submitted successfully!",
      });

    } catch (err) {
      const msg = err.response?.data?.message || "Application failed.";
      // Handle the "already applied" error
      if (err.response?.status === 409) {
        setToastMessage({ type: "error", content: msg });
        // Ensure button is disabled if server says "already applied"
        if (!appliedDriveIds.includes(Number(driveId))) {
          setAppliedDriveIds((prev) => [...prev, Number(driveId)]);
        }
      } else {
        setToastMessage({ type: "error", content: msg });
      }
    } finally {
      setIsApplying(false); // Remove loading state
    }
  };

  // Check if student has already applied
  const hasApplied = appliedDriveIds.includes(Number(driveId));

  const getButtonProps = () => {
    if (isFrozen) {
      return {
        text: "Profile Frozen",
        disabled: true,
        className: "bg-gray-400 text-gray-700 cursor-not-allowed",
      };
    }
    if (hasApplied) {
      return {
        text: "Applied",
        disabled: true,
        className: "bg-gray-400 text-gray-700 cursor-not-allowed",
      };
    }
    if (isApplying) {
      return {
        text: "Applying...",
        disabled: true,
        className: "opacity-70 cursor-wait bg-blue-600 text-white",
      };
    }
    return {
      text: "Apply",
      disabled: false,
      className: "bg-blue-600 text-white hover:bg-blue-700",
    };
  };

  const buttonProps = getButtonProps();

  const renderContent = () => {
    if (isLoading) {
      return (
        <p className="text-center text-gray-600">Loading drive details...</p>
      );
    }
    if (error) {
      return <p className="text-center text-red-600">{error}</p>;
    }
    if (drive) {
      return (
        <div className="bg-gray-50 p-6 rounded-lg shadow-md h-full flex flex-col relative border border-black">

          <div className="absolute top-6 right-6">
            <button
              onClick={handleApplyClick}
              disabled={buttonProps.disabled}
              className={`px-6 py-2 rounded-lg font-semibold transition ${buttonProps.className}`}
            >
              {buttonProps.text}
            </button>
          </div>

          {/* THIS IS THE NEW, CORRECTED BLOCK - REPLACE WITH THIS */}
          <div className="space-y-3 text-lg">

            {/* Drive Name */}
            <div className="flex">
              <span className="font-semibold text-gray-700 w-32 flex-shrink-0">Drive Name:</span>
              <span className="text-gray-900 pl-4">{drive.drive_name}</span>
            </div>

            {/* Company */}
            <div className="flex">
              <span className="font-semibold text-gray-700 w-32 flex-shrink-0">Company:</span>
              <span className="text-gray-900 pl-4">{drive.company_name}</span>
            </div>

            {/* CTC */}
            <div className="flex">
              <span className="font-semibold text-gray-700 w-32 flex-shrink-0">CTC:</span>
              <span className="text-gray-900 pl-4">{Number(drive.ctc).toFixed(2)} LPA</span>
            </div>

            {/* Description */}
            <div className="pt-2 flex items-start">
              <span className="font-semibold text-gray-700 w-32 flex-shrink-0">Description:</span>
              <div className="pl-4">
                <p className="text-gray-900 whitespace-pre-wrap">
                  {drive.drive_description || "No description provided."}
                </p>
              </div>
            </div>

          </div>
        </div>
      );
    }
    return <p>Drive details not found.</p>;
  };

  return (
    <div className="h-screen flex flex-col bg-white relative overflow-y-auto no-scrollbar">
      <HeaderDashboard />

      {/* Toast Message */}
      {toastMessage.content && (
        <div
          className={`fixed top-5 left-1/2 transform -translate-x-1/2 p-4 rounded-lg text-white shadow-lg z-[9999] ${toastMessage.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
        >
          {toastMessage.content}
        </div>
      )}

      <main className="flex-grow p-6 md:p-10 flex flex-col">
        {isFrozen && !isLoading && (
          <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded-lg flex items-center">
            <HiExclamationTriangle className="h-5 w-5 mr-3" />
            <p className="text-sm">
              Your profile is frozen. You cannot apply for new placement drives.
            </p>
          </div>
        )}
        {renderContent()}
      </main>

      {/* --- Added new warning sentence --- */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Confirm Application
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to apply for the drive: <br />
              <strong className="text-gray-800">{drive.drive_name}</strong>?
              <br /><br />
              <span className="font-semibold text-red-600">Please note: This action cannot be undone.</span>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={executeApply}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add the Modal Animation Style */}
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

      <Footer />
    </div>
  );
};

export default StudentDriveDetails;