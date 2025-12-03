import React, { useState, useEffect } from "react";
import HeaderDashboard from "../../components/HeaderDashboard";
import Footer from "../../components/Footer";
import RejectedStudentTable from "../../components/RejectedStudentTable";
import { Link } from "react-router-dom"; // Need Link to go back to active students

const RejectedStudent = () => {
  const [toastMessage, setToastMessage] = useState({ type: "", content: "" });

  useEffect(() => {
    if (toastMessage.content) {
      const timer = setTimeout(() => {
        setToastMessage({ type: "", content: "" });
      }, 4000); // Hide the toast after 4 seconds
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <HeaderDashboard />
      <main className="flex-grow p-6 flex flex-col">
        {/* Title and Back Button */}
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Manage Rejected Users</h1>
            <Link 
                to="/admin/students" 
                className="bg-blue-500 text-white px-12 py-2 rounded-lg shadow-xl transition hover:bg-blue-600 text-sm font-medium"
            >
                Back
            </Link>
        </div>

        {toastMessage.content && (
          <div
            className={`fixed top-5 left-1/2 transform -translate-x-1/2 p-4 rounded-lg text-white shadow-lg z-[9999] ${
              toastMessage.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {toastMessage.content}
          </div>
        )}

        <RejectedStudentTable setToastMessage={setToastMessage} />
      </main>
      <Footer />
    </div>
  );
};

export default RejectedStudent;
