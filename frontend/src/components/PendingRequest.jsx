import React from "react";

const PendingRequest = () => {

  return (
    <div className="bg-blue-200 py-4 px-6 rounded-xl shadow-md h-full min-h-[300px] flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Pending Requests</h2>
      </div>
      <div className="grow flex flex-col items-center justify-center text-center">
        <p className="text-lg">
          This section will be developed in 8th semester.
        </p>
      </div>
    </div>
  );
};

export default PendingRequest;