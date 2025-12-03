/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { debounce } from "lodash"; // Import debounce

const initialFormState = {
  session_id: "",
  expense_on: "",
  amount: "",
  bill_file: null,
};

const ExpenditureTable = ({ setToastMessage }) => {
  // ---  NEW PAGINATION & SEARCH STATE ---
  const [expenditures, setExpenditures] = useState([]); // Will hold paged data
  const [sessions, setSessions] = useState([]); // For modals
  const [isLoading, setIsLoading] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalExpenditures, setTotalExpenditures] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  const totalPages = Math.ceil(totalExpenditures / limit);
  const serialNoOffset = (limit === "all" || currentPage === 1) ? 0 : (currentPage - 1) * limit;
  // ---  END NEW STATE ---

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExpenditure, setEditingExpenditure] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [actionToConfirm, setActionToConfirm] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const user = JSON.parse(sessionStorage.getItem("user"));
  
  // ---  DEBOUNCE EFFECT for search ---
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);


  // ---  REFACTORED fetchExpenditures ---
  const fetchExpenditures = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/expenditure", {
        params: {
          search: debouncedSearch,
          page: currentPage,
          limit: limit,
        },
      });
      setExpenditures(res.data.data || []);
      setTotalExpenditures(res.data.total || 0);
    } catch (err) {
      console.error(err);
      setToastMessage({
        type: "error",
        content: "Failed to load expenditure data."
      });
      setExpenditures([]);
      setTotalExpenditures(0);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, currentPage, limit, setToastMessage]);

  // Fetch sessions for the modal (only once)
  const fetchSessions = async () => {
    try {
      const res = await api.get("/academic-session");
      setSessions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Effect to re-fetch data when filters change
  useEffect(() => {
    fetchExpenditures();
  }, [fetchExpenditures]);


  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "bill_file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  
  // ---  NEW Filter Change Handler ---
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setCurrentPage(1); // Reset page on limit change
    setLimit(value === "all" ? "all" : Number(value));
  };
  
  // --- Pagination Button Handlers ---
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // --- Modal Handlers (Modified to re-fetch) ---
  const handleAddClick = () => {
    setFormData(initialFormState);
    setShowAddModal(true);
  };

  const handleEditClick = (expenditure) => {
    setEditingExpenditure(expenditure);
    setFormData({
      session_id: expenditure.session_id,
      expense_on: expenditure.expense_on,
      amount: expenditure.amount,
      bill_file: null,
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (expenditure) => {
    setActionToConfirm(
      () => () => deleteExpenditure(expenditure.exp_id, expenditure.expense_on)
    );
    setShowConfirmModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.session_id ||
      !formData.expense_on ||
      !formData.amount ||
      !formData.bill_file
    ) {
      setToastMessage({
        type: "error",
        content: "All fields, including bill file, are required.",
      });
      return;
    }

    const data = new FormData();
    data.append("session_id", formData.session_id);
    data.append("expense_on", formData.expense_on);
    data.append("amount", formData.amount);
    data.append("bill_file", formData.bill_file);
    data.append("mod_by", user.userid);

    try {
      await api.post("/expenditure", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setShowAddModal(false);
      fetchExpenditures(); //  REFRESH DATA
      setToastMessage({
        type: "success",
        content: "Expenditure added successfully.",
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to add expenditure.";
      setToastMessage({ type: "error", content: errorMessage });
    }
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    const noChanges =
      Number(formData.session_id) === editingExpenditure.session_id &&
      formData.expense_on.trim() === editingExpenditure.expense_on &&
      Number(formData.amount) === Number(editingExpenditure.amount) &&
      !formData.bill_file;

    if (noChanges) {
      setToastMessage({ type: "info", content: "No changes were made." });
      setShowEditModal(false);
      return;
    }

    setShowEditModal(false);
    setActionToConfirm(() => () => updateExpenditure());
    setShowConfirmModal(true);
  };

  const updateExpenditure = async () => {
    const data = new FormData();
    data.append("session_id", formData.session_id);
    data.append("expense_on", formData.expense_on);
    data.append("amount", formData.amount);
    if (formData.bill_file) {
      data.append("bill_file", formData.bill_file);
    }
    data.append("mod_by", user.userid);

    try {
      await api.put(`/expenditure/${editingExpenditure.exp_id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchExpenditures(); //  REFRESH DATA
      setToastMessage({
        type: "success",
        content: "Expenditure updated successfully.",
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update expenditure.";
      setToastMessage({ type: "error", content: errorMessage });
    }
  };

  const deleteExpenditure = async (expId, expenseOn) => {
    try {
      await api.delete(`/expenditure/${expId}`);
      fetchExpenditures(); //  REFRESH DATA
      setToastMessage({
        type: "success",
        content: `"${expenseOn}" has been deleted.`,
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete expenditure.";
      setToastMessage({ type: "error", content: errorMessage });
    }
  };

  const confirmAction = () => {
    if (actionToConfirm) actionToConfirm();
    setShowConfirmModal(false);
  };
  
  const showPagination = !isLoading && limit !== "all";

  return (
    <div className="bg-blue-200 py-2 px-4 rounded-xl shadow-md">
      {/*  NEW Search Bar  */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-3 mt-1 gap-2">
        <h2 className="text-2xl font-bold">Expenditures</h2>
        <input
          type="text"
          placeholder="Search description or session..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full py-1 px-2 bg-white border rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none md:w-60"
        />
      </div>

      {/*  NEW Pagination Controls (Top)  */}
      {!isLoading && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-2 text-sm">
          <div className="flex items-center gap-2">
            <label htmlFor="limit-select" className="text-gray-700">Records per page:</label>
            <select
              id="limit-select"
              name="limit"
              value={limit}
              onChange={handleFilterChange}
              className="p-1 border rounded-lg text-xs bg-white focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value="all">All</option>
            </select>
            {limit !== "all" && (
              <span className="text-gray-600">
                Showing {Math.min(serialNoOffset + 1, totalExpenditures)} - {Math.min(serialNoOffset + expenditures.length, totalExpenditures)} of {totalExpenditures}
              </span>
            )}
            {limit === "all" && totalExpenditures > 0 && (
              <span className="text-gray-600">
                Showing all {totalExpenditures} records
              </span>
            )}
          </div>
          
          {limit !== "all" && (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-white border rounded-lg shadow-sm text-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <span className="font-semibold">
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1 bg-white border rounded-lg shadow-sm text-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- Table --- */}
      <div className="border rounded-lg max-h-400 overflow-x-auto no-scrollbar">
        <div className="min-w-[1000px]">
          <div className="grid grid-cols-[0.5fr_2fr_1.5fr_1.2fr_1.2fr_1.5fr_1.5fr_1fr] bg-gray-300 p-2 font-semibold text-sm rounded-t-lg">
            <div>Sl. No.</div>
            <div>Expense On</div>
            <div>Session</div>
            <div>Amount</div>
            <div>Bill</div>
            <div>Modified By</div>
            <div>Last Modified</div>
            <div className="text-right">Actions</div>
          </div>
          
          {/*  Table Body  */}
          <div className="overflow-y-auto no-scrollbar">
            {isLoading ? (
              <p className="text-center text-gray-700 p-4">Loading data...</p>
            ) : expenditures.length > 0 ? (
              expenditures.map((exp, index) => (
                <div
                  key={exp.exp_id}
                  className="grid grid-cols-[0.5fr_2fr_1.5fr_1.2fr_1.2fr_1.5fr_1.5fr_1fr] items-center p-2 border-t bg-white text-sm"
                >
                  <div className="pl-3">{serialNoOffset + index + 1}.</div>
                  <div className="font-semibold">
                    {exp.expense_on}
                  </div>
                  <div>{exp.session_name}</div>
                  <div>
                    ₹{Number(exp.amount).toFixed(2)}
                  </div>
                  <div>
                    <a
                      href={`http://localhost:8000/uploads/expenditure/${exp.bill_file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      View Bill
                    </a>
                  </div>
                  <div className="break-words">
                    {exp.modified_by || "N/A"}
                  </div>
                  <div>
                    {new Date(exp.mod_time).toLocaleString()}
                  </div>
                  <div className="flex justify-end gap-2 whitespace-nowrap">
                    <button
                      onClick={() => handleEditClick(exp)}
                      className="bg-blue-500 text-white px-2 py-0.5 rounded-md text-xs hover:bg-blue-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(exp)}
                      className="bg-red-500 text-white px-2 py-0.5 rounded-md text-xs hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 p-4 text-sm">
                {searchTerm
                  ? `No expenditures found matching "${searchTerm}".`
                  : "No expenditures found."}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4 text-right">
        <button
          onClick={handleAddClick}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-600 transition"
        >
          ➕ Add New Expenditure
        </button>
      </div>

      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 animate-fadeIn relative">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">
              {showAddModal ? "Add New Expenditure" : "Edit Expenditure"}
            </h3>
            <form
              onSubmit={showAddModal ? handleAddSubmit : handleUpdateSubmit}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="expense_on"
                  value={formData.expense_on}
                  onChange={handleInputChange}
                  placeholder="Expense Description"
                  className="w-full md:col-span-2 p-3 border rounded-lg"
                />
                <select
                  name="session_id"
                  value={formData.session_id}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">Select Session</option>
                  {sessions.map((s) => (
                    <option key={s.session_id} value={s.session_id}>
                      {s.session_name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  step="0.01"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="Amount"
                  className="w-full p-3 border rounded-lg"
                />
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {showAddModal
                      ? "Bill (PDF, JPG, JPEG, PNG)"
                      : "Upload New Bill (Optional)"}
                  </label>
                  <input
                    type="file"
                    name="bill_file"
                    onChange={handleInputChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                  {showEditModal && (
                    <p className="text-xs text-gray-500 mt-1">
                      Current Bill:
                      <a
                        href={`http://localhost:8000/uploads/expenditure/${editingExpenditure.bill_file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline ml-1"
                      >
                        View
                      </a>
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() =>
                    showAddModal
                      ? setShowAddModal(false)
                      : setShowEditModal(false)
                  }
                  className="px-4 py-2 rounded-lg bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-500 text-white"
                >
                  {showAddModal ? "Add Expenditure" : "Update Expenditure"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Are you sure?
            </h3>
            <p className="text-gray-600 mb-6">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } } .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }`}</style>
    </div>
  );
};

export default ExpenditureTable;
