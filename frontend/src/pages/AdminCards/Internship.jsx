import React, { useState , useEffect} from "react";
import HeaderDashboard from "../../components/HeaderDashboard";
import Footer from "../../components/Footer";
import InternshipTable from "../../components/InternshipTable";
import { HiBookOpen } from "react-icons/hi";
import { Link } from "react-router-dom";

const Internship = () => {
  const [showModal, setShowModal] = useState(false);
  const [toastMessage, setToastMessage] = useState({ type: "", content: "" });

  useEffect(() => {
    if (toastMessage.content) {
      const timer = setTimeout(() => {
        setToastMessage({ type: "", content: "" });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  return (
    <div className="h-screen flex flex-col bg-white relative overflow-y-auto no-scrollbar">
      <HeaderDashboard />

      {toastMessage.content && (
        <div
          className={`fixed top-5 left-1/2 transform -translate-x-1/2 p-4 rounded-lg text-white z-9999 ${
            toastMessage.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toastMessage.content}
        </div>
      )}

      <main className="flex-grow p-6">
        {/* --- Update Header --- */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Manage Internships
          </h1>
          <div className="flex gap-4">
            {/* --- Add New Button --- */}
            <Link
              to="/admin/internship-requirements"
              className="flex items-center gap-1 px-4 rounded-lg font-medium text-purple-500 hover:text-purple-600 transition"
              title="Set Internship Requirements"
            >
              <HiBookOpen size={20} />
              Set Requirements
            </Link>
          </div>
        </div>

        <InternshipTable
          showModal={showModal}
          setShowModal={setShowModal}
          setToastMessage={setToastMessage}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Internship;