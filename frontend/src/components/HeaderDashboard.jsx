/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const HeaderDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user"));

  const handleLogout = async () => {
    try {
      const res = await api.post("/auth/logout", {});

      console.log(res.data);

      // Clear sessionStorage
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("studentStatus");

      // Redirect to homepage
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000); // update every second
    return () => clearInterval(timer); // cleanup on unmount
  }, []);

  return (
    <nav className="flex justify-between items-center py-2 px-10 bg-blue-500 text-white">
      <div className="w-50">
        <img src="/logo.png" alt="" />
      </div>

      <div className="flex flex-col items-center text-center">
        <button
          onClick={handleLogout}
          className="px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition cursor-pointer"
        >
          Logout
        </button>
        <span className="text-xs mt-1">
          {dateTime.toLocaleDateString()} {dateTime.toLocaleTimeString()}
        </span>
      </div>
    </nav>
  );
};

export default HeaderDashboard;
