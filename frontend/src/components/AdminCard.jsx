import React from "react";
import { Link } from "react-router-dom";

const AdminCard = () => {
  const cardItems = [
    {
      name: "Academic Year",
      path: "/admin/8th-sem",
    },
    {
      name: "Academic Session",
      path: "/admin/8th-sem",
    },
    {
      name: "Department",
      path: "/admin/8th-sem",
    },
    {
      name: "Program",
      path: "/admin/8th-sem",
    },
    {
      name: "Company Type",
      path: "/admin/8th-sem",
    },
    {
      name: "Company",
      path: "/admin/8th-sem",
    },
    {
      name: "Placement Drive",
      path: "/admin/8th-sem",
    },
    {
      name: "Notifications",
      path: "/admin/8th-sem",
    },
    {
      name: "Internship",
      path: "/admin/8th-sem",
    },
    {
      name: "Expenditure",
      path: "/admin/8th-sem",
    },
    {
      name: "Students",
      path: "/admin/8th-sem",
    },
    {
      name: "Reports",
      path: "/admin/8th-sem",
    },
  ];

  return (
    <div className="mt-6">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {cardItems.map((item) => (
          <Link
            to={item.path}
            key={item.name}
            className="bg-blue-200 aspect-5/3 flex flex-col items-center justify-center rounded-lg shadow-md hover:shadow-lg hover:bg-blue-400 transition"
          >
            <p className="font-semibold text-center">{item.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminCard;
