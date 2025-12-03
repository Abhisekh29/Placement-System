import React, { useEffect, useState } from "react";
import { HiPencil } from "react-icons/hi";
import api from "../api/axios";

const Profile = ({ studentData, onEdit, isFrozen, isLocked }) => {
  const [sessions, setSessions] = useState([]);
  const [programs, setPrograms] = useState([]);

  // Fetch sessions and programs from backend
  useEffect(() => {
    api
      .get("/session_master")
      .then((res) => setSessions(res.data))
      .catch((err) => console.error("Error fetching sessions:", err));

    api
      .get("/program_master")
      .then((res) => setPrograms(res.data))
      .catch((err) => console.error("Error fetching programs:", err));
  }, []);

  // Resolve session and program names
  const sessionName =
    sessions.find((s) => s.session_id === studentData.session_id)
      ?.session_name || studentData.session_id;

  const programName =
    programs.find((p) => p.program_id === studentData.program_id)
      ?.program_name || studentData.program_id;

  return (
    <div className="bg-blue-100 p-6 md:p-8 rounded-xl shadow-md max-w mx-auto border-blue-400 border-2">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-800">Student Profile</h2>
          {/* Show Locked badge if locked but NOT frozen (since Frozen has its own big banner) */}
          {isLocked && !isFrozen && (
            <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full font-semibold border border-orange-400">
              Locked
            </span>
          )}
        </div>
        
        <button
          onClick={onEdit}
          disabled={isFrozen || isLocked}
          className={`flex items-center text-white px-4 py-2 rounded-lg transition ${
            isFrozen || isLocked
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
          title={
            isFrozen
              ? "Profile is Frozen"
              : isLocked
              ? "Profile details are Locked"
              : "Edit Profile"
          }
        >
          <HiPencil className="h-5 w-5 mr-2" />
          Edit
        </button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-6">
        {/* Row 1 */}
        <div>
          <p className="text-sm font-semibold text-gray-500">Roll No</p>
          <p className="text-lg">{studentData.rollno}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500">Name</p>
          <p className="text-lg">{studentData.name}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500">Email</p>
          <p className="text-lg break-words">{studentData.email}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500">Mobile</p>
          <p className="text-lg">{studentData.mobile}</p>
        </div>

        {/* Row 2 */}
        <div>
          <p className="text-sm font-semibold text-gray-500">Date of Birth</p>
          <p className="text-lg">
            {new Date(studentData.dob).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500">Gender</p>
          <p className="text-lg">{studentData.gender}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500">Caste</p>
          <p className="text-lg">{studentData.caste || "N/A"}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500">Address</p>
          <p className="text-lg">{studentData.address || "N/A"}</p>
        </div>

        {/* Row 3 */}
        <div>
          <p className="text-sm font-semibold text-gray-500">10th Percentage</p>
          <p className="text-lg">{studentData.per_10}%</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500">12th Percentage</p>
          <p className="text-lg">{studentData.per_12}%</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500">Session</p>
          <p className="text-lg">{sessionName}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500">Program</p>
          <p className="text-lg">{programName}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;