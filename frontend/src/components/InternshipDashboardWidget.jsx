import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";

const InternshipDashboardWidget = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentInternships = async () => {
      try {
        // Point to the new student-specific API
        const res = await api.get("/student-internships");
        setInternships(res.data || []);
      } catch (err) {
        console.error("Failed to load student internships for widget:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentInternships();
  }, []);

  return (
    <div className="bg-blue-100 p-6 rounded-xl shadow-xl border border-blue-400 min-h-[200px] flex flex-col">
      <h3 className="text-xl font-bold text-gray-800 border-b border-gray-600 pb-2 mb-4">
        My Internships
      </h3>

      {/* Table Container */}
      <div className="flex-grow min-h-0">
        {loading ? (
          <p className="text-gray-500 text-sm">Loading internships...</p>
        ) : internships.length === 0 ? (
          <p className="text-gray-500 text-sm">
            You have not added any internship records yet.
          </p>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-[0.5fr_1fr_1fr_1fr] bg-gray-200 p-2 font-semibold text-sm">
              <div>Sl. No.</div>
              <div className="text-center">Company</div>
              <div className="text-center">Semester</div>
              <div className="text-center">Certificate</div>
            </div>
            <div className="max-h-54 overflow-y-auto no-scrollbar">
              {internships.map((internship, index) => (
                <div
                  key={internship.internship_id}
                  className="grid grid-cols-[0.5fr_1fr_1fr_1fr] items-center p-2 border-t bg-white text-sm"
                >
                  {/* Added index + 1 */}
                  <div className="pl-4">{index + 1}.</div>
                  <div className="font-medium truncate pr-2 text-center">
                    {internship.company_name}
                  </div>
                  <div className="text-center">{internship.semester}</div>
                  <div className="text-center">
                    {internship.certificate ? (
                      <a
                        href={`http://localhost:8000/uploads/certificates/${internship.certificate}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Button */}
      <div className="mt-4 text-right flex-shrink-0">
        <Link
          to="/student/internships"
          className="bg-purple-500 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-600 transition text-sm font-medium"
        >
          Manage Internships
        </Link>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default InternshipDashboardWidget;