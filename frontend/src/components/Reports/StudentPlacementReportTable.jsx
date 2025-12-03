import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "../../api/axios";
import { debounce } from "lodash";
import { ArrowUp } from "lucide-react";

const StudentPlacementReportTable = ({ setToastMessage, selectedYear }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // State for column filters
  const [filters, setFilters] = useState({
    student_name: "",
    rollno: "",
    program_name: "",
    session_name: "",
    count_apply: "",
    count_selected: "",
  });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  // --- Sorting State ---
  const [sortConfig, setSortConfig] = useState({
    key: "student_name", // Default sort key
    direction: "ascending", // Default sort direction
  });

  // --- Client-side Pagination State ---
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce the filter inputs
  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedFilters(filters);
      setCurrentPage(1);
    }, 300);
    handler();
    return () => {
      handler.cancel();
    };
  }, [filters]);

  // Main data fetch function
  const fetchData = useCallback(async () => {
    if (!selectedYear) {
      setData([]);
      return;
    }
    setIsLoading(true);
    try {
      const params = {
        yearId: selectedYear.year_id,
        studentName: debouncedFilters.student_name,
        rollNo: debouncedFilters.rollno,
        programName: debouncedFilters.program_name,
        sessionName: debouncedFilters.session_name,
        countApply: debouncedFilters.count_apply,
        countSelected: debouncedFilters.count_selected,
      };
      const res = await api.get("/reports/student-placement-stats", { params });
      setData(res.data);
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to fetch report data:", err);
      setToastMessage({
        type: "error",
        content: err.response?.data?.message || "Failed to load report data.",
      });
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear, debouncedFilters, setToastMessage]);

  // Fetch data when selectedYear or debouncedFilters change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

          {/* Tooltip bottom-right */}
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


  // --- Client-side pagination logic ---
  const paginatedData = useMemo(() => {
    if (rowsPerPage === "all") {
      return sortedData;
    }
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + parseInt(rowsPerPage, 10);
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, rowsPerPage]);

  const totalPages =
    rowsPerPage === "all" ? 1 : Math.ceil(sortedData.length / rowsPerPage);

  // Calculate the starting serial number for the current page
  const serialNoOffset =
    rowsPerPage === "all" ? 0 : (currentPage - 1) * parseInt(rowsPerPage, 10);

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

  {/* --- 
    EXPORT FUNCTION 
    This function now exports 'paginatedData' if a page size (10, 50) is selected,
    and 'sortedData' (all filtered data) if 'all' is selected.
  --- */}
  const handleExportExcel = useCallback(() => {
    // 1. Determine which data set to export
    const dataToExport = rowsPerPage === "all" ? sortedData : paginatedData;

    if (dataToExport.length === 0) {
      setToastMessage({ type: "error", content: "No data to export." });
      return;
    }
    setIsExporting(true);

    const headers = [
      "Sl. No.",
      "Student Name",
      "Roll No.",
      "Program Name",
      "Academic Session",
      "Count Apply",
      "Count Selected",
    ];

    // 2. Determine the correct starting serial number for the export
    // If exporting a specific page, use the page's offset
    // If exporting "all", start from 0
    const exportSerialNoOffset = rowsPerPage === "all" ? 0 : serialNoOffset;

    const dataRows = dataToExport.map((item, index) => // 3. Use dataToExport
      [
        `"${exportSerialNoOffset + index + 1}"`, // 4. Use offset for correct Sl. No.
        `"${(item.student_name || "N/A").replace(/"/g, '""')}"`,
        `"${(item.rollno || "N/A").replace(/"/g, '""')}"`,
        `"${(item.program_name || "N/A").replace(/"/g, '""')}"`,
        `"${(item.session_name || "N/A").replace(/"/g, '""')}"`,
        `"${item.count_apply || 0}"`,
        `"${item.count_selected || 0}"`,
      ].join(",")
    );

    const csvString = [headers.join(","), ...dataRows].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const yearName = selectedYear
      ? selectedYear.year_name.replace(/[^a-zA-Z0-9]/g, "_")
      : "Report";

    // 5. (Optional) Add page number or "All" to file name
    const exportType = rowsPerPage === "all" ? "All_Records" : `Page_${currentPage}`;
    const fileName = `Student_Placement_Stats_${yearName}_${exportType}.csv`;

    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    setIsExporting(false);
    setToastMessage({
      type: "success",
      content: `Exported ${dataToExport.length} records.`, // 6. Use dataToExport.length
    });
  }, [
    paginatedData, // Dependency added
    sortedData,
    rowsPerPage, // Dependency added
    currentPage, // Dependency added
    serialNoOffset, // Dependency added
    selectedYear,
    setToastMessage
  ]); // 7. Updated dependencies

  // --- Render (Design kept, Control bar removed) ---
  if (!selectedYear) {
    return (
      <div className="text-center text-gray-500 italic py-6">
        Select an Academic Year above and click "Show Reports" to view data.
      </div>
    );
  }

  return (
    <div>
      {/* --- NEW HEADER: Title + Export Button --- */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold mb-3">
          Student Placement Application Stats
        </h2>
        <button
          onClick={handleExportExcel}
          disabled={isLoading || isExporting || paginatedData.length === 0} // Check paginatedData
          className={`px-3 py-1.5 rounded-lg text-white text-xs transition shadow-sm ${isLoading || isExporting || paginatedData.length === 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
            }`}
          title="Export current table data to CSV"
        >
          {isExporting ? "Exporting..." : "Export to Excel"}
        </button>
      </div>

      {/* --- Pagination Controls --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm mb-2">
        <div className="flex items-center gap-2">
          <label
            htmlFor="limit-select-report"
            className="text-gray-700 text-sm "
          >
            Records per page:
          </label>
          <select
            id="limit-select-report"
            name="limit"
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

      {/* --- Filters & Table Container --- */}
      <div className="overflow-x-auto no-scrollbar">
        <div className="min-w-[1000px]">
          {/* --- Filters Row--- */}
          <div className="grid grid-cols-[0.5fr_1.5fr_1fr_1.5fr_1.5fr_1fr_0.5fr] items-center pb-1">
            <div className="p-2"></div>
            <div className="pl-10 pr-2 py-2">
              <input
                type="text"
                name="student_name"
                value={filters.student_name}
                onChange={handleFilterChange}
                placeholder="Search Name..."
                className="w-full lg:w-39 bg-white text-xs p-1 border rounded-lg"
              />
            </div>
            <div className="p-2">
              <input
                type="text"
                name="rollno"
                value={filters.rollno}
                onChange={handleFilterChange}
                placeholder="Search Roll No..."
                className="w-full lg:w-32 bg-white text-xs p-1 border rounded-lg"
              />
            </div>
            <div className="p-2">
              <input
                type="text"
                name="program_name"
                value={filters.program_name}
                onChange={handleFilterChange}
                placeholder="Search Program..."
                className="w-full lg:w-39 bg-white text-xs p-1 border rounded-lg"
              />
            </div>
            <div className="p-2">
              <input
                type="text"
                name="session_name"
                value={filters.session_name}
                onChange={handleFilterChange}
                placeholder="Search Session..."
                className="w-full lg:w-45 bg-white text-xs p-1 border rounded-lg"
              />
            </div>
            <div className="p-2">
              <input
                type="text"
                name="count_apply"
                value={filters.count_apply}
                onChange={handleFilterChange}
                placeholder="Search..."
                className="w-26 bg-white text-xs p-1 border rounded-lg"
              />
            </div>
            <div className="p-2">
              <input
                type="text"
                name="count_selected"
                value={filters.count_selected}
                onChange={handleFilterChange}
                placeholder="Search..."
                className="w-30 bg-white text-xs p-1 border rounded-lg"
              />
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            {/* --- Table Header--- */}
            <div className="grid grid-cols-[0.5fr_1.5fr_1fr_1.5fr_1.5fr_1fr_0.5fr] bg-gray-300 font-semibold text-sm sticky top-0">
              <div className="p-2 whitespace-nowrap">Sl. No.</div>
              <div className="pl-10 pr-2 py-2 text-left whitespace-nowrap">
                <SortButton
                  columnKey="student_name"
                  columnName="Student Name"
                />
              </div>
              <div className="p-2 text-left whitespace-nowrap">
                <SortButton columnKey="rollno" columnName="Roll No." />
              </div>
              <div className="p-2 text-left whitespace-nowrap">
                <SortButton
                  columnKey="program_name"
                  columnName="Program Name"
                />
              </div>
              <div className="p-2 text-left whitespace-nowrap">
                <SortButton
                  columnKey="session_name"
                  columnName="Academic Session"
                />
              </div>
              <div className="p-2 text-center whitespace-nowrap">
                <SortButton columnKey="count_apply" columnName="Count Apply" />
              </div>
              <div className="p-2 text-right whitespace-nowrap">
                <SortButton
                  columnKey="count_selected"
                  columnName="Count Selected"
                />
              </div>
            </div>

            {/* Table Body */}
            <div className="max-h-[500px] overflow-y-auto no-scrollbar">
              {isLoading ? (
                <p className="text-center text-gray-500 p-4">Loading data...</p>
              ) : sortedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <div
                    key={serialNoOffset + index} // Use offset + index for unique key
                    className="grid grid-cols-[0.5fr_1.3fr_0.8fr_1.5fr_1.5fr_1fr_0.5fr] items-center border-t bg-white text-sm hover:bg-gray-50"
                  >
                    <div className="pl-5">{serialNoOffset + index + 1}.</div>
                    <div className="pl-8 py-2 font-medium">
                      {item.student_name}
                    </div>
                    <div className="p-2 lg:pl-3">{item.rollno}</div>
                    <div className="p-2 pl-4 lg:pl-9 ">{item.program_name}</div>
                    <div className="p-2">{item.session_name}</div>
                    <div className="p-2 text-left">{item.count_apply}</div>
                    <div className="p-2 pr-16 text-center">
                      {item.count_selected}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 p-4">
                  No data found for the selected filters.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPlacementReportTable;