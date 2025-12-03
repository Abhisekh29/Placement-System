import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { PiEye, PiEyeClosed } from "react-icons/pi";
import { HiOutlineLockClosed } from "react-icons/hi2";

const PlacementDashboardWidget = ({ isFrozen }) => {
  const [drives, setDrives] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isFrozen) {
      setIsLoading(false);
      return;
    }

    const fetchActiveDrives = async () => {
      setIsLoading(true);
      try {
        const res = await api.get("/student-placement-drives/active");
        setDrives(res.data);
      } catch (err) {
        console.error("Failed to fetch active drives:", err);
        setError("Could not load placement drives.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveDrives();
  }, [isFrozen]);

  const handleViewDetails = (driveId) => {
    navigate(`/student/drive/${driveId}`);
  };

  const renderContent = () => {
    if (isFrozen) {
      return (
        <div className="flex flex-col items-center justify-center text-center text-gray-500 h-full py-4">
          <HiOutlineLockClosed className="w-10 h-10 text-yellow-500 mb-2" />
          <p className="font-semibold text-red-700">Profile Frozen</p>
          <p className="text-sm text-red-600">
            Active drives are hidden while your profile is frozen.
          </p>
        </div>
      );
    }

    if (isLoading) {
      return <p className="text-gray-500 text-center">Loading drives...</p>;
    }

    if (error) {
      return <p className="text-red-500 text-center">{error}</p>;
    }

    if (drives.length === 0) {
      return (
        <p className="text-gray-500 text-center">
          No active placement drives found at this time.
        </p>
      );
    }

    return (
      <div className="border rounded-lg overflow-x-auto no-scrollbar">
        <div className="min-w-[400px]">
          {/* Table Header */}
          <div className="grid grid-cols-[0.5fr_2fr_1.5fr_1fr] bg-gray-200 p-2 font-semibold text-sm">
            <div>Sl.No.</div>
            <div>Drive Name</div>
            <div>Company</div>
            <div className="text-center">Details</div>
          </div>
          {/* Table Body */}
          <div className="max-h-54 overflow-y-auto no-scrollbar">
            {drives.map((drive, index) => (
              <div
                key={drive.drive_id}
                className="grid grid-cols-[0.5fr_2fr_1.5fr_1fr] items-center p-2 border-t bg-white text-sm"
              >
                <div className="pl-2">{index + 1}.</div>
                <div className="font-medium truncate pr-2">
                  {drive.drive_name}
                </div>
                <div className="truncate pr-2">{drive.company_name}</div>
                <div className="text-center">

                  <button
                    onClick={() => handleViewDetails(drive.drive_id)}
                    className="group relative text-blue-600"
                    title="View Details"
                  >
                    <div className="relative w-5 h-2 flex items-center justify-center">
                      <PiEyeClosed
                        size={23}
                        className="absolute transition-opacity duration-300 ease-in-out opacity-100 group-hover:opacity-0"
                      />
                      <PiEye
                        size={23}
                        className="absolute transition-all duration-300 ease-in-out 
                     opacity-100 group-hover:opacity-100 
                     transform scale-y-0 group-hover:scale-y-100 group-hover:scale-110"
                      />
                    </div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-blue-100 p-6 rounded-xl shadow-xl border border-blue-400 min-h-[200px] flex flex-col">
      <h3 className="text-xl font-bold text-gray-800 border-b border-gray-600 pb-2 mb-4">
        Active Placement Drives
      </h3>
      {/* 2. Add flex-grow to the content to push the button down */}
      <div className="flex-grow">
        {renderContent()}
      </div>
      {/* 3. Add the "Manage Drives" button at the bottom */}
      <div className="mt-4 text-right">
        <Link
          to="/student/my-placements"
          className="bg-purple-500 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-600 transition text-sm font-medium"
        >
          Manage My Applications
        </Link>
      </div>
      <style>{`
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `}</style>
    </div>
  );
};

export default PlacementDashboardWidget;