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

import AcademicYear from "./pages/AdminCards/AcademicYear";
import Department from "./pages/AdminCards/Department";
import CompanyType from "./pages/AdminCards/CompanyType";
import AcademicSession from "./pages/AdminCards/AcademicSession";
import Program from "./pages/AdminCards/Program";
import Student from "./pages/AdminCards/Students";
import Company from "./pages/AdminCards/Company";
import Expenditure from "./pages/AdminCards/Expenditure";
import Notification from "./pages/AdminCards/Notification";
import Internship from "./pages/AdminCards/Internship";
import RejectedStudent from "./pages/AdminCards/RejectedStudent"; 
import PlacementDrive from "./pages/AdminCards/PlacementDrive";
import ManageInternships from "./pages/Student/ManageInternships";
import StudentDriveDetail from "./pages/Student/StudentDriveDetails";
import StudentMyPlacement from "./pages/Student/StudentMyPlacement";
import IncompleteRegistrations from "./pages/AdminCards/IncompleteRegistrations";
import InternshipRequirement from "./pages/AdminCards/InternshipRequirement";
import Reports from "./pages/AdminCards/Reports";

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
      path: "/admin/academic-year",
      element: (
        <AdminRoute>
          <AcademicYear />
        </AdminRoute>
      ),
    },
    {
      path: "/admin/academic-session",
      element: (
        <AdminRoute>
          <AcademicSession />
        </AdminRoute>
      ),
    },
    {
      path: "/admin/department",
      element: (
        <AdminRoute>
          <Department />
        </AdminRoute>
      ),
    },
    {
      path: "/admin/program",
      element: (
        <AdminRoute>
          <Program />
        </AdminRoute>
      ),
    },
    {
      path: "/admin/company-type",
      element: (
        <AdminRoute>
          <CompanyType />
        </AdminRoute>
      ),
    },
    {
      path: "/admin/company",
      element: (
        <AdminRoute>
          <Company />
        </AdminRoute>
      ),
    },
    {
      path: "/admin/placement-drive",
      element: (
        <AdminRoute>
          <PlacementDrive />
        </AdminRoute>
      ),
    },
    {
      path: "/admin/notifications",
      element: (
        <AdminRoute>
          <Notification />
        </AdminRoute>
      ),
    },
    {
      path: "/admin/internship",
      element: (
        <AdminRoute>
          <Internship />
        </AdminRoute>
      ),
    },
    {
      path: "/admin/internship-requirements",
      element: (
        <AdminRoute>
          <InternshipRequirement />
        </AdminRoute>
      ),
    },
    {
      path: "/admin/expenditure",
      element: (
        <AdminRoute>
          <Expenditure />
        </AdminRoute>
      ),
    },
    
    {
      path: "/admin/students",
      element: (
        <AdminRoute>
          <Student />
        </AdminRoute>
      ),
    },
    {
      path: "/admin/rejected-students",
      element: (
        <AdminRoute>
          <RejectedStudent/>
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
      path: "/admin/reports",
      element: (
        <AdminRoute>
          <Reports />
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
