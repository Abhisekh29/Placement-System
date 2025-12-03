import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import api from "../../api/axios";
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/react";
import { FaChevronDown, FaCheck } from "react-icons/fa";

import HeaderDashboard from "../../components/HeaderDashboard";
import Footer from "../../components/Footer";

import StudentPlacementReportTable from "../../components/Reports/StudentPlacementReportTable";
import PlacementDriveReportTable from "../../components/Reports/PlacementDriveReportTable";
import SelectedStudentReportTable from "../../components/Reports/SelectedStudentReportTable";
import ExpenditureReportTable from "../../components/Reports/ExpenditureReportTable";
import StudentInternshipReportTable from "../../components/Reports/StudentInternshipReportTable";

const Reports = () => {
  const [academicYears, setAcademicYears] = useState([]);
  const [activeYear, setActiveYear] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [isLoadingYears, setIsLoadingYears] = useState(true);

  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const res = await api.get("/academic-year");
        setAcademicYears(res.data);
      } catch (err) {
        console.error("Failed to fetch years");
        toast.error("Failed to load Academic Years");
      } finally {
        setIsLoadingYears(false);
      }
    };
    fetchAcademicYears();
  }, []);

  // Auto-update if reports are already visible
  useEffect(() => {
    if (activeYear && selectedYear && activeYear.year_id !== selectedYear.year_id) {
      setActiveYear(selectedYear);
    }
  }, [selectedYear, activeYear]);

  // The "Show Reports" Button Handler
  const handleShowReports = () => {
    if (selectedYear) {
      setActiveYear(selectedYear);
    } else {
      toast.error("Please select an Academic Year.");
    }
  };

  // The "Hide Reports" Button Handler
  const handleHideReports = () => {
    setActiveYear(null);
  };

  const handleChildToast = (toastData) => {
    if (toastData.type === 'success') {
      toast.success(toastData.content);
    } else if (toastData.type === 'error') {
      toast.error(toastData.content);
    } else {
      toast(toastData.content); // Default
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Toaster position="top-right" reverseOrder={false} />
      <HeaderDashboard />

      <main className="grow p-6 bg-slate-50">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Admin Reports
        </h1>

        {/* --- Global Filter Section --- */}
        <div className="flex flex-col sm:flex-row items-center gap-2 mb-6 bg-blue-100 p-1.5 rounded-xl shadow-md border border-gray-400 w-fit">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Academic Year :
          </label>

          {/* Custom Dropdown */}
          <div className="w-48 relative z-50">
            <Listbox value={selectedYear} onChange={setSelectedYear}>
              <div className="relative">
                <ListboxButton className="relative w-full cursor-default rounded-lg bg-white py-1.5 pl-3 pr-8 text-left shadow-sm border text-sm leading-5 h-8">
                  <span className="block truncate">
                    {selectedYear ? selectedYear.year_name : "Select Academic Year"}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <FaChevronDown className="h-3 w-3 text-gray-400" aria-hidden="true" />
                  </span>
                </ListboxButton>
                <ListboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {academicYears.map((year) => (
                    <ListboxOption
                      key={year.year_id}
                      value={year}
                      className={({ focus }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${focus ? "bg-purple-100 text-purple-900" : "text-gray-900"
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                            {year.year_name}
                          </span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-600">
                              <FaCheck className="h-3 w-3" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </div>
            </Listbox>
          </div>
          {!activeYear ? (
            <button
              onClick={handleShowReports}
              disabled={!selectedYear}
              className={`px-1 rounded-lg w-26 text-white text-sm transition shadow-sm h-7 ${!selectedYear
                ? "bg-gray-400 cursor-not-allowed" // Disabled style
                : "bg-gray-600 hover:bg-gray-700" // Enabled style
                }`}
            >
              Show Reports
            </button>
          ) : (
            <button
              onClick={handleHideReports}
              className="px-1 rounded-lg w-26 text-white text-sm transition shadow-sm h-7 bg-red-600 hover:bg-red-700"
            >
              Hide Reports
            </button>
          )}
        </div>
        {activeYear && (
          <div className="space-y-8">
            {/* 1. Student Placement Stats */}
            <div className="bg-blue-200 py-4 px-4 rounded-xl shadow-md">
              <StudentPlacementReportTable selectedYear={activeYear} setToastMessage={handleChildToast} />
            </div>

            {/* 2. Drive Stats */}
            <div className="bg-purple-200 py-4 px-4 rounded-xl shadow-md">
              <PlacementDriveReportTable selectedYear={activeYear} setToastMessage={handleChildToast} />
            </div>

            {/* 3. Selected Student stats */}
            <div className="bg-orange-200 py-4 px-4 rounded-xl shadow-md">
              <SelectedStudentReportTable selectedYear={activeYear} setToastMessage={handleChildToast} />
            </div>

            {/* 4. Expenditure stats */}
            <div className="bg-green-200 py-4 px-4 rounded-xl shadow-md">
              <ExpenditureReportTable selectedYear={activeYear} setToastMessage={handleChildToast} />
            </div>

            {/* 5. Student Internship Stats */}
            <div className="bg-red-200 py-4 px-4 rounded-xl shadow-md">
              <StudentInternshipReportTable selectedYear={activeYear} setToastMessage={handleChildToast} />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Reports;