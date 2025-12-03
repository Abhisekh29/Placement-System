import express from "express";
import authRoutes from "./routes/auth.js"
import sessionRoutes from "./routes/session.js"
import programRoutes from "./routes/program.js"
import adminProgramRoutes from "./routes/adminProgram.js"
import adminStudentRoutes from "./routes/adminStudent.js"
import studentRoutes from "./routes/student.js"
import userRoutes from "./routes/user.js";
import academicYearRoutes from "./routes/academicYear.js";
import departmentRoutes from "./routes/department.js";
import companyTypeRoutes from "./routes/companyType.js";
import academicSessionRoutes from "./routes/academicSession.js";
import companyRoutes from "./routes/company.js";
import adminCompanyRoutes from "./routes/adminCompany.js";
import expenditureRoutes from "./routes/expenditure.js";
import notificationRoutes from "./routes/notification.js";
import internshipRoutes from "./routes/internship.js";
import filterRoutes from "./routes/filters.js";
import homeNotificationRoutes from "./routes/homeNotification.js"
import placementDriveRoutes from "./routes/placementDrive.js"
import studentInternshipRoutes from "./routes/studentInternship.js"
import studentPlacementDriveRoute from "./routes/studentPlacementDrive.js"
import studentPlacementRoute from "./routes/studentPlacement.js"
import internshipRequirementRoutes from "./routes/internshipRequirement.js";
import adminRoutes from "./routes/admin.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import reportRoutes from "./routes/reports.js";

const app = express()

// ✅ Enable CORS
app.use(cors({
  origin: "http://localhost:5173", // allow your frontend
  credentials: true, // if you plan to use cookies/sessions
}));

app.use(express.json())
app.use(cookieParser())

// Open Routes
app.use("/api/auth", authRoutes);

// Student Routes
app.use("/api/session_master", sessionRoutes)
app.use("/api/program_master", programRoutes);
app.use("/api/student_master", studentRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/student-internships", studentInternshipRoutes);
app.use("/api/student-placement-drives", studentPlacementDriveRoute);
app.use("/api/student-placements", studentPlacementRoute);

// Admin Routes
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/academic-year", academicYearRoutes);
app.use("/api/department", departmentRoutes);
app.use("/api/companyType", companyTypeRoutes);
app.use("/api/academic-session", academicSessionRoutes);
app.use("/api/adminPrograms", adminProgramRoutes);
app.use("/api/adminStudents", adminStudentRoutes);
app.use("/api/adminCompany", adminCompanyRoutes);
app.use("/api/expenditure", expenditureRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/filters", filterRoutes);
app.use("/api/placementDrive", placementDriveRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/internship-requirements", internshipRequirementRoutes);
app.use("/api/reports", reportRoutes);

// Both Student & Admin Routes

// File Upload Route
app.use('/uploads', express.static('uploads'));

// At Home Page Routes
app.use("/api/homeNotifications", homeNotificationRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));