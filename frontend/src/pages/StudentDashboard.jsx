import React, { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import HeaderDashboard from "../components/HeaderDashboard";
import Footer from "../components/Footer";
import StudentForm from "../components/StudentForm";
import Profile from "../components/Profile";
import InternshipDashboardWidget from "../components/InternshipDashboardWidget";
import PlacementDashboardWidget from "../components/PlacementDashboardWidget";
import { IoSettingsSharp } from "react-icons/io5"; //
import ChangePasswordModal from "../components/ChangePasswordModal";
import { HiExclamationTriangle } from "react-icons/hi2";

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success"); // 'success', 'info', 'error'
  const [showToast, setShowToast] = useState(false);
  const user = JSON.parse(sessionStorage.getItem("user"));

  // --- Add state for dropdown and modal ---
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null); // Ref for detecting outside clicks

  const [isFrozen, setIsFrozen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const res = await api.get(`/student_master/${user.userid}`);
        if (res.data.length > 0) {
          setStudentData(res.data[0]);
          // Save the statuses to state and session storage
          const frozen = res.data[0].is_profile_frozen === "Yes";
          const locked = res.data[0].is_profile_locked === "Yes";
          
          setIsFrozen(frozen);
          setIsLocked(locked);
          
          sessionStorage.setItem(
            "studentStatus",
            JSON.stringify({ isFrozen: frozen })
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.userid) {
      fetchStudentDetails();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.userid]);

  // --- Add effect to close dropdown on outside click ---
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

  // Keep handleEdit the same
  const handleEdit = () => setEditMode(true);

  // Handle successful update
  const handleFormSuccess = (data) => {
    setStudentData(data);
    setEditMode(false);
    setToastMessage("Details updated successfully!");
    setToastType("success"); // Set type to success
    setShowToast(true);

    setTimeout(() => setShowToast(false), 4000);
  };

  // Handle case where no changes were made
  const handleNoChanges = () => {
    setEditMode(false); // Still exit edit mode
    setToastMessage("No changes were made.");
    setToastType("error"); // Set type to warning/error
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  if (loading) {
    return null;
  }

  // Determine toast background color based on type
  const getToastBgColor = () => {
    switch (toastType) {
      case "success":
        return "bg-green-500";
      case "info":
        return "bg-blue-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white relative overflow-y-auto no-scrollbar">
      <HeaderDashboard />

      {/* Toast container - Use dynamic background color */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        {showToast && (
          <div
            className={`${getToastBgColor()} text-white px-6 py-3 rounded-lg shadow-lg animate-slideDown`}
          >
            {toastMessage}
          </div>
        )}
      </div>

      <main className="flex-grow p-6">
        <div className="flex justify-between items-center mb-6">
          {/* Left Side: Title + Welcome */}
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Student Dashboard
            </h1>
            <p className="font-semibold text-lg text-gray-700">
              Welcome,{" "}
              <span className="font-bold text-lg text-purple-600">
                {studentData?.name || user.username}
              </span>
            </p>
          </div>

          {/* Right Side: Settings Dropdown */}
          <div className="relative" ref={dropdownRef}>
            {/* Settings Button */}

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

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-2xl z-[9999] overflow-hidden animate-fadeIn">
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
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- ADDED FROZEN WARNING BANNER --- */}
        {isFrozen && (
          <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded-lg flex items-center">
            <HiExclamationTriangle className="h-6 w-6 mr-3" />
            <div>
              <p className="font-bold">Your profile is frozen.</p>
              <p className="text-sm">
                You can view your historical data but cannot edit your profile or
                apply for new drives.
              </p>
            </div>
          </div>
        )}
        
        {studentData && !editMode ? (
          <>
            <Profile 
              studentData={studentData} 
              onEdit={handleEdit} 
              isFrozen={isFrozen} 
              isLocked={isLocked} 
            />
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <InternshipDashboardWidget />
              <PlacementDashboardWidget isFrozen={isFrozen}/>
            </div>
          </>
        ) : (
          <StudentForm
            existingData={studentData}
            onSuccess={handleFormSuccess}
            onNoChanges={handleNoChanges}
            onErrorToast={(msg) => {
              setToastMessage(msg);
              setToastType("error");
              setShowToast(true);
              setTimeout(() => setShowToast(false), 4000);
            }}
          />
        )}
      </main>
      <Footer />

      {/* --- Render the Modal (conditionally) --- */}
      {showModal && <ChangePasswordModal onClose={() => setShowModal(false)} />}

    </div>
  );
};

export default StudentDashboard;