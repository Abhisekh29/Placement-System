/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "../../api/axios";
import { debounce } from "lodash";
import { ArrowUp } from "lucide-react";

// --- Simple Description Modal ---
const DescriptionModal = ({ content, onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[1100] p-4">
    <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl p-6 animate-fadeIn relative max-h-[85vh] flex flex-col">
      <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4 shrink-0">
        Drive Description
      </h3>
      <div className="text-gray-700 whitespace-pre-wrap break-words overflow-y-auto no-scrollbar flex-1 min-h-0">
        {content || "No description provided."}
      </div>
      <div className="flex justify-end mt-4 shrink-0">
        <button
          onClick={onClose}
          className="px-6 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition"
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

const PlacementDriveReportTable = ({ setToastMessage, selectedYear }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isActiveFilter, setIsActiveFilter] = useState("all");
  const [filters, setFilters] = useState({
    drive_name: "",
    company_name: "",
    ctc: "",
    count_apply: "",
    count_selected: "",
  });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [showDescModal, setShowDescModal] = useState(false);
  const [selectedDesc, setSelectedDesc] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "drive_name",
    direction: "ascending",
  });
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce filter inputs
  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedFilters(filters);
      setCurrentPage(1);
    }, 300);
    handler();
    return () => handler.cancel();
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
        isActive: isActiveFilter,
        driveName: debouncedFilters.drive_name,
        companyName: debouncedFilters.company_name,
        ctc: debouncedFilters.ctc,
        countApply: debouncedFilters.count_apply,
        countSelected: debouncedFilters.count_selected,
      };
      const res = await api.get("/reports/placement-drive-stats", { params });
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
  }, [
    selectedYear,
    isActiveFilter,
    debouncedFilters,
    setToastMessage,
  ]);

  // Fetch data when relevant state changes
  useEffect(() => {
    fetchData();
  }, [fetchData, selectedYear, isActiveFilter]);

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
              absolute top-full right-full mt-1 ml-1 bg-black/60
              text-white text-[10px] px-2 py-1 rounded
              opacity-0 group-hover:opacity-100 pointer-events-none
              whitespace-nowrap transition-opacity duration-150 z-50
            "
          >
            {nextSortText}
          </div>
        </div>
      </div>
    );
  };

  // --- Pagination Logic ---
  const paginatedData = useMemo(() => {
    if (rowsPerPage === "all") return sortedData;
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + parseInt(rowsPerPage, 10);
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, rowsPerPage]);

  const totalPages =
    rowsPerPage === "all" ? 1 : Math.ceil(sortedData.length / rowsPerPage);

  const serialNoOffset =
    rowsPerPage === "all" ? 0 : (currentPage - 1) * parseInt(rowsPerPage, 10);

  // --- Helpers ---
  const formatCTC = (ctc) => {
    const val = parseFloat(ctc);
    return isNaN(val) ? "N/A" : `₹${val.toFixed(2)} LPA`;
  };

  const handleDescriptionClick = (desc) => {
    setSelectedDesc(desc);
    setShowDescModal(true);
  };

  // --- Event Handlers ---
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

  // --- Export to Excel ---
  const handleExportExcel = useCallback(() => {
    const dataToExport = rowsPerPage === "all" ? sortedData : paginatedData;
    if (dataToExport.length === 0) {
      setToastMessage({ type: "error", content: "No data to export." });
      return;
    }
    setIsExporting(true);
    const headers = ["Sl. No.", "Drive Name", "Company Name", "CTC (LPA)", "Status", "Description", "Count Apply", "Count Selected"];
    const exportSerialNoOffset = rowsPerPage === "all" ? 0 : serialNoOffset;
    const dataRows = dataToExport.map((item, index) =>
      [
        `"${exportSerialNoOffset + index + 1}"`,
        `"${(item.drive_name || "N/A").replace(/"/g, '""')}"`,
        `"${(item.company_name || "N/A").replace(/"/g, '""')}"`,
        `"${item.ctc || 0}"`,
        `"${item.is_active === "1" ? "Active" : "Closed"}"`,
        `"${(item.description || "N/A").replace(/"/g, '""').replace(/\n/g, " ")}"`,
        `"${item.count_apply || 0}"`,
        `"${item.count_selected || 0}"`,
      ].join(",")
    );
    const csvString = [headers.join(","), ...dataRows].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const yearName = selectedYear ? selectedYear.year_name.replace(/[^a-zA-Z0-9]/g, "_") : "Report";
    const exportType = rowsPerPage === "all" ? "All_Records" : `Page_${currentPage}`;
    const fileName = `Drive_Stats_${yearName}_${exportType}.csv`;
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    setIsExporting(false);
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
    setToastMessage,
  ]);

  // --- RENDER ---
  if (!selectedYear) {
    return (
      <div className="text-center text-gray-500 italic py-6">
        Select an Academic Year above and click "Show Reports" to view data.
      </div>
    );
  }

  return (
    <div>
      {/* Header & Export Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold mb-3">
          Placement Drive Stats
        </h2>
        <button
          onClick={handleExportExcel}
          disabled={isLoading || isExporting || data.length === 0}
          className={`px-3 py-1.5 rounded-lg text-white text-xs transition shadow-sm ${isLoading || isExporting || data.length === 0
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
        {/* Pagination Controls */}
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

        {/* Filters & Table */}
        <div className="overflow-x-auto no-scrollbar">
          <div className="min-w-[1100px]">
            {/* Filters Row */}
            <div className="grid grid-cols-[0.8fr_2fr_2fr_1fr_1fr_1.2fr_1fr_0.5fr] items-center pb-1">
              <div className="p-2"></div>
              <div className="p-2 pl-3">
                <input
                  type="text"
                  name="drive_name"
                  value={filters.drive_name}
                  onChange={handleFilterChange}
                  placeholder="Search Drive..."
                  className="w-full lg:w-45 bg-white text-xs p-1 border rounded-lg"
                />
              </div>
              <div className="p-2 pl-8">
                <input
                  type="text"
                  name="company_name"
                  value={filters.company_name}
                  onChange={handleFilterChange}
                  placeholder="Search Company..."
                  className="w-full lg:w-33 bg-white text-xs p-1 border rounded-lg"
                />
              </div>
              <div className="p-2 pl-9">
                <input
                  type="text"
                  name="ctc"
                  value={filters.ctc}
                  onChange={handleFilterChange}
                  placeholder="Search CTC..."
                  className="w-24 bg-white text-xs p-1 border rounded-lg"
                />
              </div>
              <div className="p-2 pl-7 text-center">
                <select
                  value={isActiveFilter}
                  onChange={(e) => {
                    setIsActiveFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-17 bg-white text-xs p-1 border rounded-lg focus:outline-none focus:border-gray-400"
                >
                  <option value="all">All</option>
                  <option value="1">Active</option>
                  <option value="0">Closed</option>
                </select>
              </div>
              <div className="p-2"></div>
              <div className="p-2">
                <input
                  type="text"
                  name="count_apply"
                  value={filters.count_apply}
                  onChange={handleFilterChange}
                  placeholder="Search..."
                  className="w-28 bg-white text-xs p-1 border rounded-lg text-left"
                />
              </div>
              <div className="p-2">
                <input
                  type="text"
                  name="count_selected"
                  value={filters.count_selected}
                  onChange={handleFilterChange}
                  placeholder="Search..."
                  className="w-30 bg-white text-xs p-1 border rounded-lg text-left"
                />
              </div>
            </div>

            {/* Table Header */}
            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-[0.8fr_2fr_2fr_1fr_1fr_1.2fr_1fr_0.5fr] bg-gray-300 font-semibold text-sm sticky top-0">
                <div className="p-2 whitespace-nowrap text-left">Sl. No.</div>
                <div className="p-2 pl-3 text-left whitespace-nowrap">
                  <SortButton
                    columnKey="drive_name"
                    columnName="Drive Name"
                  />
                </div>
                <div className="p-2 pl-7 text-left whitespace-nowrap">
                  <SortButton
                    columnKey="company_name"
                    columnName="Company Name"
                  />
                </div>
                <div className="p-2 pl-11 text-left whitespace-nowrap">
                  <SortButton columnKey="ctc" columnName="CTC" />
                </div>
                <div className="p-2 pl-13 text-left whitespace-nowrap">
                  Status
                </div>
                <div className="p-2 pl-8 text-left whitespace-nowrap">
                  Description
                </div>
                <div className="p-2 text-left whitespace-nowrap">
                  <SortButton
                    columnKey="count_apply"
                    columnName="Count Applied"
                  />
                </div>
                <div className="p-2 text-left whitespace-nowrap">
                  <SortButton
                    columnKey="count_selected"
                    columnName="Count Selected"
                  />
                </div>
              </div>

              {/* Table Body */}
              <div className="max-h-[500px] overflow-y-auto no-scrollbar">
                {isLoading ? (
                  <p className="text-center text-gray-500 p-4">
                    Loading data...
                  </p>
                ) : sortedData.length > 0 ? (
                  paginatedData.map((item, index) => (
                    <div
                      key={item.drive_id}
                      className="grid grid-cols-[0.8fr_2fr_2fr_1fr_1fr_1.2fr_1fr_0.5fr] items-center border-t bg-white text-sm hover:bg-gray-50"
                    >
                      <div className="p-2 text-left pl-5">
                        {serialNoOffset + index + 1}.
                      </div>
                      <div className="p-2 font-medium text-left">{item.drive_name}</div>
                      <div className="p-2 whitespace-nowrap text-left">{item.company_name}</div>
                      <div className="p-2 whitespace-nowrap text-left">{formatCTC(item.ctc)}</div>
                      <div className="p-2 text-left">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${item.is_active === "1"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                            }`}
                        >
                          {item.is_active === "1" ? "Active" : "Closed"}
                        </span>
                      </div>
                      <div className="p-2 text-left">
                        <span
                          onClick={() =>
                            handleDescriptionClick(item.description)
                          }
                          className="text-blue-600 hover:underline cursor-pointer"
                        >
                          View
                        </span>
                      </div>
                      <div className="p-2 pr-30 text-center">
                        {item.count_apply}
                      </div>
                      <div className="p-2 pr-15 text-center ">
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

      {/* Description Modal */}
      {showDescModal && (
        <DescriptionModal
          content={selectedDesc}
          onClose={() => setShowDescModal(false)}
        />
      )}

      <style>{`
         @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
         .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
        `}</style>
    </div>
  );
};

export default PlacementDriveReportTable;