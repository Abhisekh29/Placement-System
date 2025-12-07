import express from "express";
import authRoutes from "./routes/auth.js";
import sessionRoutes from "./routes/session.js";
import programRoutes from "./routes/program.js";
import userRoutes from "./routes/user.js";
import adminRoutes from "./routes/admin.js";
import studentRoutes from "./routes/student.js";
import studentInternshipRoutes from "./routes/studentInternship.js";
import studentPlacementDriveRoute from "./routes/studentPlacementDrive.js";
import studentPlacementRoute from "./routes/studentPlacement.js";
import homeNotificationRoutes from "./routes/homeNotification.js";
import companyRoutes from "./routes/company.js"; 
import academicYearRoutes from "./routes/academicYear.js";
import departmentRoutes from "./routes/department.js";
import companyTypeRoutes from "./routes/companyType.js";
import filterRoutes from "./routes/filters.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// ✅ Enable CORS
app.use(cors({
  origin: "http://localhost:5173", // allow your frontend
  credentials: true, // if you plan to use cookies/sessions
}));

app.use(express.json());
app.use(cookieParser());

// Open Routes
app.use("/api/auth", authRoutes);

// Student Routes
app.use("/api/session_master", sessionRoutes);
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
app.use("/api/filters", filterRoutes);

// File Upload Route
app.use('/uploads', express.static('uploads'));

// At Home Page Routes
app.use("/api/homeNotifications", homeNotificationRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));