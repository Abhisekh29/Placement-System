/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Marquee from "react-easy-marquee";

const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Unknown Date";
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (e) {
    return "Error Date";
  }
};

const NotificationTicker = ({ notifications }) => {
  const reversedNotifications = [...notifications].reverse();
  const blankItems = Array(12).fill({ text: "", date: "" });
  const finalData = [...reversedNotifications, ...blankItems];

  return (
    <div className="h-full overflow-hidden">
      <Marquee
        axis="Y"
        height="100%"
        reverse
        duration={24000}
        loop={0}
        pauseOnHover
        style={{ height: "100%", overflow: "hidden" }}
      >
        {finalData.map((notif, index) => {
          const formattedDate = formatDate(notif.date);
          const isBlank = notif.text === "";

          return (
            <div
              key={index}
              className={`notification-item flex items-start gap-3 py-3 px-3 transition-all duration-300 ${
                !isBlank
                  ? "hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-md hover:scale-[1.01] rounded-xl"
                  : ""
              }`}
            >
              {!isBlank && (
                <>
                  <div className="w-1.5 h-10 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full shadow-sm flex-shrink-0" />
                  <div className="flex flex-col flex-1">
                    <span
                      className={`text-blue-600 font-semibold text-sm ${
                        index % 2 === 0
                          ? "animate-tilt"
                          : "animate-tilt-reverse"
                      }`}
                      style={{
                        animationDelay: `${index * 0.1}s`,
                      }}
                    >
                      {formattedDate}
                    </span>

                    <span className="text-red-600 text-base leading-snug break-words whitespace-normal">
                      {notif.text}
                    </span>

                    <div className="h-px mt-3 bg-blue-300" />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </Marquee>
    </div>
  );
};

const Homepage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/homeNotifications");
        if (Array.isArray(res.data)) {
          const sortedData = res.data.sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          });
          setNotifications(sortedData);
        } else {
          setError("Unexpected data format: Expected an array.");
        }
      } catch (err) {
        const message = `Failed to load notifications. Check if your API server is running and reachable.`;
        setError(message);
        console.error("Error fetching home notifications:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  let notificationContent;

  if (loading) {
    notificationContent = (
      <p className="text-center text-gray-500 py-4">Loading notifications...</p>
    );
  } else if (error) {
    notificationContent = (
      <p className="p-2 text-red-700 bg-red-100 border border-red-300 rounded text-sm overflow-auto">
        {error}
      </p>
    );
  } else if (notifications.length === 0) {
    notificationContent = (
      <p className="text-center text-gray-500 p-4">
        No new notifications available.
      </p>
    );
  } else {
    notificationContent = (
      <div className="flex-1 h-full min-h-0">
        <NotificationTicker
          key={`notifications-count-${notifications.length}`}
          notifications={notifications}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 md:p-10">
        <div className="flex flex-col items-center justify-center text-center">
          <img
            src="gur.png"
            alt="Placement"
            className="w-full rounded-lg shadow-lg"
          />
          <h1 className="mt-6 text-2xl font-bold text-gray-800">
            Training & Placement Cell Management System
          </h1>
        </div>
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-6 h-40">
            <Link
              to={"/login"}
              className="flex flex-col items-center justify-center p-6 bg-blue-100 rounded-lg shadow-md 
               hover:bg-blue-200 transform transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <img
                src="student.svg"
                alt="Student"
                className="w-12 h-12 mb-2 transition-transform duration-300 group-hover:scale-110"
              />
              <h2 className="font-semibold text-blue-600 text-center">
                Student Login
              </h2>
            </Link>
            <Link
              to={"/login"}
              className="flex flex-col items-center justify-center p-6 bg-green-100 rounded-lg shadow-md 
               hover:bg-green-200 transform transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <img
                src="admin.svg"
                alt="Admin"
                className="w-12 h-12 mb-2 transition-transform duration-300 group-hover:scale-110"
              />
              <h2 className="font-semibold text-green-600 text-center">
                Admin Login
              </h2>
            </Link>
          </div>
          <div className="p-6 pt-4 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border border-blue-100 overflow-hidden h-84 flex flex-col backdrop-blur-sm">
            <div className="flex items-center justify-between pb-3 border-b border-blue-200">
              <h3 className="text-xl font-bold text-blue-600 flex items-center gap-2">
                🔔 Latest Notifications
              </h3>
              <span className="text-xs text-gray-500 italic">
                Hover to pause scroll
              </span>
            </div>
            <div className="mt-3 flex-1 h-full min-h-0">
              {notificationContent}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Homepage;
