import React, { useState, useEffect } from "react";
import HeaderDashboard from "../../components/HeaderDashboard";
import Footer from "../../components/Footer";
import StudentTable from "../../components/StudentTable";
import { Link } from "react-router-dom"; // <-- Crucial Import

const Student = () => {
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
      {/* <main> now manages the vertical stack */}
      <main className="flex-grow p-6 flex flex-col">
        {/* Header/Title Row, updated to include the link */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Students</h1>

          {/* The actual navigation link/button */}
          <Link
            to="/admin/rejected-students"
            className="text-red-600 font-medium transition-transform transform hover:scale-110 hover:text-red-700"
          >
            Rejected Users
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

        {/* 1. Student Table (the active students list) */}
        <StudentTable setToastMessage={setToastMessage} />

        {/* 2. The link button is now positioned in the header/title block */}
      </main>
      <Footer />
    </div>
  );
};

export default Student;
