/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Homepage from "./pages/Homepage";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import ManageInternships from "./pages/Student/ManageInternships";
import StudentDriveDetail from "./pages/Student/StudentDriveDetails";
import StudentMyPlacement from "./pages/Student/StudentMyPlacement";
import IncompleteRegistrations from "./pages/AdminCards/IncompleteRegistrations";

import EighthSem from "./pages/AdminCards/EighthSem";

// Role-based wrappers
const AdminRoute = ({ children }) => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const isLoggedIn = user?.loggedIn === true || user?.loggedIn === "true";
  const userType = user?.user_type; // "0" = admin
  return isLoggedIn && userType === "0" ? children : <Navigate to="/login" />;
};

const StudentRoute = ({ children }) => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const isLoggedIn = user?.loggedIn === true || user?.loggedIn === "true";
  const userType = user?.user_type; // "1" = student
  return isLoggedIn && userType === "1" ? children : <Navigate to="/login" />;
};

// Public route (for homepage/login/register)
const PublicRoute = ({ children }) => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const isLoggedIn = user?.loggedIn === true || user?.loggedIn === "true";
  const userType = user?.user_type;

  if (isLoggedIn) {
    // Redirect logged-in users based on type
    return userType === "0" ? (
      <Navigate to="/admin-dashboard" />
    ) : (
      <Navigate to="/student-dashboard" />
    );
  }

  return children; // allow access if not logged in
};

const App = () => {
  const [user, setUser] = useState(null);

  // Load user from sessionStorage when app mounts
  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <PublicRoute>
          <Homepage />
        </PublicRoute>
      ),
    },
    {
      path: "/login",
      element: (
        <PublicRoute>
          <Login />
        </PublicRoute>
      ),
    },
    {
      path: "/register",
      element: (
        <PublicRoute>
          <Register />
        </PublicRoute>
      ),
    },
    {
      path: "/admin-dashboard",
      element: (
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      ),
    },
    {
      path: "/forgot-password",
      element: (
        <PublicRoute>
          <ForgotPassword />
        </PublicRoute>
      ),
    },
    {
      path: "/admin/8th-sem",
      element: (
        <AdminRoute>
          <EighthSem />
        </AdminRoute>
      ),
    },
    
    {
      path: "/admin/incomplete-registrations",
      element: (
        <AdminRoute>
          <IncompleteRegistrations />
        </AdminRoute>
      ),
    },
    {
      path: "/student-dashboard",
      element: (
        <StudentRoute>
          <StudentDashboard />
        </StudentRoute>
      ),
    },
    {
      path: "/student/internships",
      element: (
        <StudentRoute>
          <ManageInternships />
        </StudentRoute>
      ),
    },
    {
      path: "/student/drive/:driveId",
      element: (
        <StudentRoute>
          <StudentDriveDetail />
        </StudentRoute>
      ),
    },
    {
      path: "/student/my-placements",
      element: (
        <StudentRoute>
          <StudentMyPlacement />
        </StudentRoute>
      ),
    },
  ]);

  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
