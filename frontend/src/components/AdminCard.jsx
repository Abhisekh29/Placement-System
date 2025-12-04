
import React from "react";
import { Link } from "react-router-dom";

const AdminCard = () => {
  const cardItems = [
    {
      name: "Academic Year",
      path: "/admin/academic-year",
    },
    {
      name: "Academic Session",
      path: "/admin/academic-session",
    },
    {
      name: "Department",
      path: "/admin/department",
    },
    {
      name: "Program",
      path: "/admin/program",
    },
    {
      name: "Company Type",
      path: "/admin/company-type",
    },
    {
      name: "Company",
      path: "/admin/company",
    },
    {
      name: "Placement Drive",
      path: "/admin/placement-drive",
    },
    {
      name: "Notifications",
      path: "/admin/notifications",
    },
    {
      name: "Internship",
      path: "/admin/internship",
    },
    {
      name: "Expenditure",
      path: "/admin/expenditure",
    },
    {
      name: "Students",
      path: "/admin/students",
    },
    {
      name: "Reports",
      path: "/admin/reports",
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
