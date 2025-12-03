import React, { useState, useEffect } from "react";
import HeaderDashboard from "../../components/HeaderDashboard";
import Footer from "../../components/Footer";
import NotificationTable from "../../components/NotificationTable";

const Notification = () => {
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
    <div className="min-h-screen flex flex-col bg-white">
      <HeaderDashboard />
      <main className="flex-grow p-6">
        <h1 className="text-3xl font-bold mb-6">Manage Notifications</h1>

        {toastMessage.content && (
          <div
            className={`fixed top-5 left-1/2 transform -translate-x-1/2 p-4 rounded-lg text-white shadow-lg z-[9999] ${
              toastMessage.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {toastMessage.content}
          </div>
        )}

        <NotificationTable setToastMessage={setToastMessage} />
      </main>
      <Footer />
    </div>
  );
};

export default Notification;