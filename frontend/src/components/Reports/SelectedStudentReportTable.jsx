/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { debounce } from "lodash";
import api from "../../api/axios";
import { ArrowUp } from "lucide-react"; 

// Define the 10 columns structure
const TABLE_GRID_COLS =
  "0.5fr 1.8fr 1fr 1.2fr 1.5fr 1.5fr 0.9fr 0.8fr 1.2fr 1fr";
const MIN_TABLE_WIDTH = "min-w-[1400px] lg:min-w-0";
const TABLE_WRAPPER_CLASSES = `w-full ${MIN_TABLE_WIDTH}`;

const SelectedStudentReportTable = ({ setToastMessage, selectedYear }) => {
  // --- All state hooks (useState, etc.) are unchanged ---
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState({
    student_name: "",
    rollno: "",
    program_name: "",
    drive_name: "",
    company_name: "",
    company_type: "",
    ctc: "",
    role: "",
    place: "",
  });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // --- Sorting State ---
  const [sortConfig, setSortConfig] = useState({
    key: "student_name", // Default sort key
    direction: "ascending", // Default sort direction
  });

  // Debounce filters
  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedFilters(filters);
      setCurrentPage(1);
    }, 300);
    handler();
    return () => handler.cancel();
  }, [filters]);

  // Fetch data with applied filters
  const fetchData = useCallback(async () => {
    if (!selectedYear) {
      setData([]);
      return;
    }
    setIsLoading(true);
    try {
      const params = {
        yearId: selectedYear.year_id, // USE PROP
        studentName: debouncedFilters.student_name,
        rollNo: debouncedFilters.rollno,
        programName: debouncedFilters.program_name,
        driveName: debouncedFilters.drive_name,
        companyName: debouncedFilters.company_name,
        company_type: debouncedFilters.company_type,
        ctc: debouncedFilters.ctc,
        role: debouncedFilters.role,
        place: debouncedFilters.place,
      };
      const res = await api.get("/reports/selected-students", { params });
      setData(res.data);
      setCurrentPage(1); // Reset page on new data fetch
    } catch (err) {
      console.error("Failed to fetch report:", err);
      setToastMessage({
        type: "error",
        content: err.response?.data?.message || "Failed to load report data.",
      });
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear, debouncedFilters, setToastMessage]); // USE PROP

  useEffect(() => {
    fetchData();
  }, [fetchData, selectedYear]); // USE PROP

// --- Sorting Logic ---
const sortedData = useMemo(() => {
  let sortableData = [...data];
  if (sortConfig.key) {
    sortableData.sort((a, b) => {
      const aValue = a[sortConfig.key] ?? "";
      const bValue = b[sortConfig.key] ?? "";

      // Check if both values are numeric
      const aNum = Number(aValue);
      const bNum = Number(bValue);
      if (!isNaN(aNum) && !isNaN(bNum) && aValue !== "" && bValue !== "") {
        // Numeric comparison
        const comparison = aNum - bNum;
        return sortConfig.direction === "ascending" ? comparison : -comparison;
      }
      // String comparison (case-insensitive)
      const comparison = String(aValue).localeCompare(String(bValue), undefined, {
        sensitivity: "base",
      });
      return sortConfig.direction === "ascending" ? comparison : -comparison;
    });
  }
  return sortableData;
}, [data, sortConfig]);

  // --- handleSort and SortButton ---
  const handleSort = (key) => {
    let direction = "ascending";
    if (
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page on sort
  };

  const SortButton = ({ columnKey, columnName }) => {
    const isActive = sortConfig.key === columnKey;
    const isDesc = isActive && sortConfig.direction === "descending";

    const nextSortText = isActive
      ? isDesc
        ? `Sort ${columnName} by desc`
        : `Sort ${columnName} by asc`
      : `Sort ${columnName} by asc`;

    return (
      <div className="flex items-center gap-1 relative overflow-visible">
        <span>{columnName}</span>
        <div className="relative group overflow-visible">
          <button onClick={() => handleSort(columnKey)}>
            <ArrowUp
              size={18}
              className={`
                transition-transform duration-300 ease-in-out
                ${isActive ? "text-blue-600" : "text-gray-400"}
                ${isDesc ? "rotate-180" : "rotate-0"}
              `}
            />
          </button>
          <div
            className="
              absolute
              top-full right-full
              mt-1 ml-1
              bg-black/60   
              text-white text-[10px]
              px-2 py-1 rounded
              opacity-0 group-hover:opacity-100
              pointer-events-none
              whitespace-nowrap
              transition-opacity duration-150
              z-50
            "
          >
            {nextSortText}
          </div>
        </div>
      </div>
    );
  };

  // --- paginatedData ---
  const paginatedData = useMemo(() => {
    if (rowsPerPage === "all") return sortedData;
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + parseInt(rowsPerPage, 10);
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, rowsPerPage]);

  // --- totalPages ---
  const totalPages =
    rowsPerPage === "all" ? 1 : Math.ceil(sortedData.length / rowsPerPage);
  const serialNoOffset =
    rowsPerPage === "all" ? 0 : (currentPage - 1) * parseInt(rowsPerPage, 10);

  const formatCTC = (ctc) => {
    const val = parseFloat(ctc);
    return isNaN(val) ? "N/A" : `₹${val.toFixed(2)} LPA`;
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(e.target.value);
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  // --- Export logic ---
  const handleExportExcel = useCallback(() => {
    const dataToExport = rowsPerPage === "all" ? sortedData : paginatedData;
    if (dataToExport.length === 0) {
      setToastMessage({ type: "error", content: "No data to export." });
      return;
    }
    setIsLoading(true);

    const headers = [
      "Sl. No.",
      "Student Name",
      "Roll No.",
      "Program",
      "Drive Name",
      "Company",
      "Type",
      "CTC (LPA)",
      "Role",
      "Place",
    ];
    const exportSerialNoOffset = rowsPerPage === "all" ? 0 : serialNoOffset;

    const dataRows = dataToExport.map((item, index) =>
      [
        `"${exportSerialNoOffset + index + 1}"`,
        `"${(item.student_name || "").replace(/"/g, '""')}"`,
        `"${(item.rollno || "").replace(/"/g, '""')}"`,
        `"${(item.program_name || "").replace(/"/g, '""')}"`,
        `"${(item.drive_name || "").replace(/"/g, '""')}"`,
        `"${(item.company_name || "").replace(/"/g, '""')}"`,
        `"${(item.company_type || "").replace(/"/g, '""')}"`,
        `"${item.ctc || 0}"`,
        `"${(item.role || "").replace(/"/g, '""')}"`,
        `"${(item.place || "").replace(/"/g, '""')}"`,
      ].join(",")
    );

    const csvString = [headers.join(","), ...dataRows].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const yearName =
      selectedYear // USE PROP
        ? selectedYear.year_name.replace(/[^a-zA-Z0-9]/g, "_")
        : "Report";
    const exportType = rowsPerPage === "all" ? "All_Records" : `Page_${currentPage}`;
    const fileName = `Selected_Students_${yearName}_${exportType}.csv`;  
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    setIsLoading(false);
    setToastMessage({
      type: "success",
      content: `Exported ${dataToExport.length} records.`,
    });
  }, [
    paginatedData,
    sortedData,
    rowsPerPage,
    currentPage,
    serialNoOffset,
    selectedYear,
    setToastMessage
  ]); // USE PROP

  if (!selectedYear) {
    return (
      <div className="text-center text-gray-500 italic py-6">
        Select an Academic Year above and click "Show Reports" to view data.
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold mb-3">
          Selected Students Stats
        </h2>
        <button
          onClick={handleExportExcel}
          disabled={isLoading || isExporting || data.length === 0}
          className={`px-3 py-1.5 rounded-lg text-white text-xs transition shadow-sm ${
            isLoading || isExporting || data.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
          title="Export current table data to CSV"
        >
          {isExporting ? "Exporting..." : "Export to Excel"}
        </button>
      </div>

      {/* Table Container */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm mb-2">
          <div className="flex items-center gap-2">
            <label className="text-gray-700 text-sm">Records per page:</label>
            <select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              className="p-1 border rounded-lg text-xs bg-white focus:outline-none focus:border-gray-400"
            >
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value="all">All</option>
            </select>
            {rowsPerPage !== "all" && (
              <span className="text-gray-600">
                Showing {Math.min(serialNoOffset + 1, sortedData.length)} -{" "}
                {Math.min(serialNoOffset + paginatedData.length, sortedData.length)}{" "}
                of {sortedData.length}
              </span>
            )}
            {rowsPerPage === "all" && (
              <span className="text-gray-600">
                Showing all {sortedData.length} records
              </span>
            )}
          </div>
          {rowsPerPage !== "all" && (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="px-2 py-1 bg-white border rounded-lg shadow-sm text-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <span className="font-semibold">
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-2 py-1 bg-white border rounded-lg shadow-sm text-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        {/* Outer container for horizontal scroll on mobile/tablet */}
        <div className="overflow-x-auto no-scrollbar">
          {/* Inner div enforces minimum width */}
          <div className={TABLE_WRAPPER_CLASSES}>
            <div
              className={`grid items-center pb-1`}
              style={{ gridTemplateColumns: TABLE_GRID_COLS }}
            >
              <div className="p-2"></div>
              <div className="pl-10 pr-2 py-2">
                <input
                  type="text"
                  name="student_name"
                  value={filters.student_name}
                  onChange={handleFilterChange}
                  placeholder="Search Name..."
                  className="w-full bg-white text-xs p-1 border rounded-lg"
                />
              </div>

              <div className="p-2">
                <input
                  type="text"
                  name="rollno"
                  value={filters.rollno}
                  onChange={handleFilterChange}
                  placeholder="Search Roll..."
                  className="w-full bg-white text-xs p-1 border rounded-lg"
                />
              </div>
              <div className="p-2">
                <input
                  type="text"
                  name="program_name"
                  value={filters.program_name}
                  onChange={handleFilterChange}
                  placeholder="Search Program..."
                  className="w-full bg-white text-xs p-1 border rounded-lg"
                />
              </div>
              <div className="p-2">
                <input
                  type="text"
                  name="drive_name"
                  value={filters.drive_name}
                  onChange={handleFilterChange}
                  placeholder="Search Drive..."
                  className="w-full bg-white text-xs p-1 border rounded-lg"
                />
              </div>
              <div className="p-2">
                <input
                  type="text"
                  name="company_name"
                  value={filters.company_name}
                  onChange={handleFilterChange}
                  placeholder="Search Company..."
                  className="w-full bg-white text-xs p-1 border rounded-lg"
                />
              </div>
              <div className="p-2">
                <input
                  type="text"
                  name="company_type"
                  value={filters.company_type}
                  onChange={handleFilterChange}
                  placeholder="Search Type..."
                  className="w-full bg-white text-xs p-1 border rounded-lg"
                />
              </div>
              <div className="p-2">
                <input
                  type="text"
                  name="ctc"
                  value={filters.ctc}
                  onChange={handleFilterChange}
                  placeholder="Search CTC..."
                  className="w-full bg-white text-xs p-1 border rounded-lg"
                />
              </div>
              <div className="p-2">
                <input
                  type="text"
                  name="role"
                  value={filters.role}
                  onChange={handleFilterChange}
                  placeholder="Search Role..."
                  className="w-full bg-white text-xs p-1 border rounded-lg"
                />
              </div>
              <div className="p-2">
                <input
                  type="text"
                  name="place"
                  value={filters.place}
                  onChange={handleFilterChange}
                  placeholder="Search Place..."
                  className="w-full bg-white text-xs p-1 border rounded-lg"
                />
              </div>
            </div>

            {/* Header */}
            <div className="border rounded-lg overflow-hidden">
              <div
                className={`grid bg-gray-300 font-semibold text-sm sticky top-0`}
                style={{ gridTemplateColumns: TABLE_GRID_COLS }}
              >
                <div className="p-2 whitespace-nowrap">Sl. No.</div>
                <div className="pl-10 pr-2 py-2 text-left whitespace-nowrap">
                  <SortButton columnKey="student_name" columnName="Student Name" />
                </div>
                <div className="p-2 text-left whitespace-nowrap">
                  <SortButton columnKey="rollno" columnName="Roll No." />
                </div>
                <div className="p-2 text-left whitespace-nowrap">
                  <SortButton columnKey="program_name" columnName="Program" />
                </div>
                <div className="p-2 text-left whitespace-nowrap">
                  <SortButton columnKey="drive_name" columnName="Drive Name" />
                </div>
                <div className="p-2 text-left whitespace-nowRrap">
                  <SortButton columnKey="company_name" columnName="Company" />
                </div>
                <div className="p-2 text-left whitespace-nowrap">
                  <SortButton columnKey="company_type" columnName="Type" />
                </div>
                <div className="p-2 text-left whitespace-nowrap">
                  <SortButton columnKey="ctc" columnName="CTC" />
                </div>
                <div className="p-2 text-left whitespace-nowrap">
                  <SortButton columnKey="role" columnName="Role" />
                </div>
                <div className="p-2 text-left whitespace-nowrap">
                  <SortButton columnKey="place" columnName="Place" />
                </div>
              </div>

              {/* Body */}
              <div className="max-h-[500px] overflow-y-auto no-scrollbar">
                {isLoading ? (
                  <p className="text-center text-gray-500 p-4">
                    Loading data...
                  </p>
                ) : sortedData.length > 0 ? (
                  paginatedData.map((item, index) => (
                    <div
                      key={`${item.user_id}-${item.drive_id}-${index}`}
                      className={`grid items-center border-t bg-white text-sm hover:bg-gray-50`}
                      style={{ gridTemplateColumns: TABLE_GRID_COLS }}
                    >
                      <div className="p-2 pl-5">
                        {serialNoOffset + index + 1}.
                      </div>
                      <div className="pl-10 pr-2 py-2 font-medium">
                        {item.student_name}
                      </div>
                      <div className="p-2">{item.rollno}</div>
                      <div className="p-2">{item.program_name}</div>
                      <div className="p-2">{item.drive_name}</div>
                      <div className="p-2">{item.company_name}</div>
                      <div className="p-2">{item.company_type}</div>
                      <div className="p-2">{formatCTC(item.ctc)}</div>
                      <div className="p-2">{item.role || "N/A"}</div>
                      <div className="p-2">{item.place || "N/A"}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 p-4">
                    No selected students found for these filters.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
         @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
         .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
       `}</style>
    </div>
  );
};

export default SelectedStudentReportTable;