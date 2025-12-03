// // import React from "react";
// // import { Link } from "react-router-dom";

// // const AdminCard = () => {
// //   const cardItems = [
// //     {
// //       name: "Academic Year",
// //       path: "/admin/academic-year",
// //       imgSrc: "/year.svg",
// //     },
// //     {
// //       name: "Academic Session",
// //       path: "/admin/academic-session",
// //       imgSrc: "/session.svg",
// //     },
// //     {
// //       name: "Department",
// //       path: "/admin/department",
// //       imgSrc: "/department.svg",
// //     },
// //     {
// //       name: "Program",
// //       path: "/admin/program",
// //       imgSrc: "/program.svg",
// //     },
// //     {
// //       name: "Company Type",
// //       path: "/admin/company-type",
// //       imgSrc: "/key.svg",
// //     },
// //     {
// //       name: "Company",
// //       path: "/admin/company",
// //       imgSrc: "/company.svg",
// //     },
// //     {
// //       name: "Placement Drive",
// //       path: "/admin/placement-drive",
// //       imgSrc: "/drive.svg",
// //     },
// //     {
// //       name: "Notifications",
// //       path: "/admin/notifications",
// //       imgSrc: "/notification.svg",
// //     },
// //     {
// //       name: "Internship",
// //       path: "/admin/internship",
// //       imgSrc: "/internship.svg",
// //     },
// //     {
// //       name: "Expenditure",
// //       path: "/admin/expenditure",
// //       imgSrc: "/exp.svg",
// //     },
// //     {
// //       name: "Students",
// //       path: "/admin/students",
// //       imgSrc: "/users.svg",
// //     },
// //     {
// //       name: "Reports",
// //       path: "/admin/reports",
// //       imgSrc: "/reports.svg",
// //     },
// //   ];

// //   return (
// //     <div className="mt-6">
// //       <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
// //         {cardItems.map((item) => (
// //           <Link
// //             to={item.path}
// //             key={item.name}
// //             className="bg-blue-200 aspect-[5/3] flex flex-col items-center justify-center rounded-lg shadow-md hover:shadow-lg hover:bg-blue-400 transition"
// //           >
// //             <img src={item.imgSrc} alt={item.name} className="h-10 w-10 mb-2" />
// //             <p className="font-semibold text-center">{item.name}</p>
// //           </Link>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // };

// // export default AdminCard;



import React from "react";
import { Link } from "react-router-dom";
import {
  HiCalendar,
  HiOfficeBuilding,
  HiBriefcase,
  HiCollection,
  HiAcademicCap,
  HiBell,
  HiCurrencyDollar,
  HiUsers,
  HiIdentification,
  HiClipboardList,
} 
from "react-icons/hi";
import { HiBuildingOffice2 } from "react-icons/hi2"
import { FaTimeline } from "react-icons/fa6";

const AdminCard = () => {
  const cardItems = [
    { name: "Academic Year", path: "/admin/academic-year", icon: <HiCalendar /> },
    { name: "Academic Session", path: "/admin/academic-session", icon: <FaTimeline /> },
    { name: "Department", path: "/admin/department", icon: <HiBuildingOffice2 /> },
    { name: "Program", path: "/admin/program", icon: <HiAcademicCap /> },
    { name: "Company Type", path: "/admin/company-type", icon: <HiCollection /> },
    { name: "Company", path: "/admin/company", icon: <HiOfficeBuilding /> },
    { name: "Placement Drive", path: "/admin/placement-drive", icon: <HiBriefcase /> },
    { name: "Notifications", path: "/admin/notifications", icon: <HiBell /> },
    { name: "Internship", path: "/admin/internship", icon: <HiIdentification /> },
    { name: "Expenditure", path: "/admin/expenditure", icon: <HiCurrencyDollar /> },
    { name: "Students", path: "/admin/students", icon: <HiUsers /> },
    { name: "Reports", path: "/admin/reports", icon: <HiClipboardList /> },
  ];

  return (
    <div className="mt-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
        {cardItems.map((item, index) => (
          <Link
            to={item.path}
            key={index}
            className="group relative flex flex-col items-center justify-center p-4 h-36
                       bg-gradient-to-br from-blue-100 to-blue-200
                       rounded-xl shadow-sm border border-blue-400
                       transition-all duration-300 ease-out
                       hover:-translate-y-1 hover:shadow-xl hover:scale-[1.03]
                       hover:from-purple-100 hover:to-purple-200"
          >
            {/* Icon */}
            <div
              className="text-blue-700 text-4xl transition-transform duration-500
                         group-hover:scale-125 group-hover:rotate-6
                         group-hover:text-purple-700"
            >
              {item.icon}
            </div>

            {/* Label */}
            <p
              className="mt-3 text-sm font-semibold text-blue-900 text-center
                         transition-colors duration-300 group-hover:text-purple-800"
            >
              {item.name}
            </p>

            {/* Softer Glow Effect */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-40 transition duration-500 bg-gradient-to-br from-purple-300 to-blue-300 blur-md -z-10"></div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminCard;


// import React from "react";
// import { Link } from "react-router-dom";
// import {
//   HiCalendar,
//   HiClock,
//   HiOfficeBuilding,
//   HiBriefcase,
//   HiKey,
//   HiAcademicCap,
//   HiSpeakerphone,
//   HiCurrencyDollar,
//   HiUsers,
//   HiChartBar,
//   HiBookOpen,
//   HiIdentification,
// } from "react-icons/hi";

// const AdminCard = () => {
//   const cardItems = [
//     { name: "Academic Year", path: "/admin/academic-year", icon: <HiCalendar /> },
//     { name: "Academic Session", path: "/admin/academic-session", icon: <HiClock /> },
//     { name: "Department", path: "/admin/department", icon: <HiBookOpen /> },
//     { name: "Program", path: "/admin/program", icon: <HiAcademicCap /> },
//     { name: "Company Type", path: "/admin/company-type", icon: <HiKey /> },
//     { name: "Company", path: "/admin/company", icon: <HiOfficeBuilding /> },
//     { name: "Placement Drive", path: "/admin/placement-drive", icon: <HiBriefcase /> },
//     { name: "Notifications", path: "/admin/notifications", icon: <HiSpeakerphone /> },
//     { name: "Internship", path: "/admin/internship", icon: <HiIdentification /> },
//     { name: "Expenditure", path: "/admin/expenditure", icon: <HiCurrencyDollar /> },
//     { name: "Students", path: "/admin/students", icon: <HiUsers /> },
//     { name: "Reports", path: "/admin/reports", icon: <HiChartBar /> },
//   ];

//   return (
//     <div className="mt-6">
//       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
//         {cardItems.map((item, index) => (
//           <Link
//             to={item.path}
//             key={index}
//             className="group relative flex flex-col items-center justify-center p-4 h-36
//                        bg-blue-100 rounded-xl border border-blue-200 shadow-sm
//                        transition-all duration-300 ease-out
//                        hover:-translate-y-[3px] hover:bg-blue-600 hover:shadow-md"
//           >
//             {/* Icon */}
//             <div
//               className="text-blue-700 text-4xl transition-all duration-300
//                          group-hover:text-white group-hover:scale-110"
//             >
//               {item.icon}
//             </div>

//             {/* Label */}
//             <p
//               className="mt-3 text-sm font-semibold text-blue-900 text-center
//                          transition-colors duration-300 group-hover:text-white"
//             >
//               {item.name}
//             </p>
//           </Link>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default AdminCard;
