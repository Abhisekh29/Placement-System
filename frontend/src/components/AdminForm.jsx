// /* eslint-disable no-unused-vars */
// import React, { useState, useEffect } from "react";
// import api from "../api/axios";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";

// // This form is for first-time profile creation OR editing in a modal
// const AdminForm = ({ existingData = null, onSuccess, onErrorToast }) => {
//   const [formData, setFormData] = useState({
//     name: "",
//     mobile: "",
//     email: "",
//     dob: null,
//   });
//   const [initialData, setInitialData] = useState(formData);
//   const [errors, setErrors] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const user = JSON.parse(sessionStorage.getItem("user"));

//   // Pre-populate form if existingData is provided (for editing)
//   useEffect(() => {
//     if (existingData) {
//       const data = {
//         name: existingData.name || "",
//         mobile: existingData.mobile || "",
//         email: existingData.email || "",
//         dob: existingData.dob ? new Date(existingData.dob) : null,
//       };
//       setFormData(data);
//       setInitialData(data); // Set initial state for "no changes" check
//     }
//   }, [existingData]);

//   // Validation function
//   const validate = () => {
//     const newErrors = {};
//     // Name validation (only letters and spaces)
//     if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
//       newErrors.name = "Name must contain only letters and spaces.";
//     }
//     // Mobile validation (exactly 10 digits)
//     if (!/^\d{10}$/.test(formData.mobile)) {
//       newErrors.mobile = "Mobile number must be exactly 10 digits.";
//     }
//     // Email validation (basic regex)
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//       newErrors.email = "Please enter a valid email address.";
//     }
//     // DOB validation (must be selected)
//     if (!formData.dob) {
//       newErrors.dob = "Date of Birth is required.";
//     }
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0; // Return true if no errors
//   };

//   const handleChange = (e) => {
//     setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//     setErrors((prev) => ({ ...prev, [e.target.name]: null })); // Clear error on change
//   };

//   const handleDateChange = (date) => {
//     setFormData((prev) => ({ ...prev, dob: date }));
//     setErrors((prev) => ({ ...prev, dob: null })); // Clear error
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validate()) {
//       onErrorToast("Please fix the errors in the form.");
//       return;
//     }

//     // Check for changes if we are editing
//     if (existingData) {
//       const noChanges =
//         formData.name === initialData.name &&
//         formData.mobile === initialData.mobile &&
//         formData.email === initialData.email &&
//         formData.dob.getTime() === initialData.dob.getTime();

//       if (noChanges) {
//         onErrorToast("No changes were made.");
//         onSuccess(formData); // Call success to close modal
//         return;
//       }
//     }

//     setIsSubmitting(true);

//     // Format date to YYYY-MM-DD for backend
//     const formattedDOB = formData.dob
//       ? formData.dob.toLocaleDateString("en-CA") // YYYY-MM-DD format
//       : "";

//     try {
//       const res = await api.post("/admin/details", {
//         name: formData.name,
//         mobile: formData.mobile,
//         email: formData.email,
//         dob: formattedDOB,
//       });

//       // Call the onSuccess callback with the new data
//       onSuccess(res.data);
//     } catch (err) {
//       onErrorToast(err.response?.data || "An error occurred.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-1 border-blue-600 p-8 rounded-2xl shadow-2xl max-w-lg mx-auto">
//       <h2 className="text-2xl font-extrabold mb-8 text-gray-800 text-center">
//         {existingData ? "Edit Account Details" : "Complete Your Admin Profile"}
//       </h2>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         {/* Full Name */}
//         <div>
//           <label className="block text-sm font-semibold text-gray-900 mb-2">
//             Full Name
//           </label>
//           <input
//             type="text"
//             name="name"
//             value={formData.name}
//             onChange={handleChange}
//             placeholder="Enter your full name"
//             className={`w-full px-4 py-3 rounded-lg border text-gray-900 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none ${
//               errors.name ? "border-red-500" : "border-gray-600"
//             }`}
//           />
//           {errors.name && (
//             <p className="text-red-600 text-xs mt-1">{errors.name}</p>
//           )}
//         </div>

//         {/* Mobile */}
//         <div>
//           <label className="block text-sm font-semibold text-gray-900 mb-2">
//             Mobile Number
//           </label>
//           <input
//             type="text"
//             name="mobile"
//             value={formData.mobile}
//             onChange={handleChange}
//             maxLength={10}
//             placeholder="10-digit mobile number"
//             className={`w-full px-4 py-3 rounded-lg border text-gray-900 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none ${
//               errors.mobile ? "border-red-500" : "border-gray-600"
//             }`}
//           />
//           {errors.mobile && (
//             <p className="text-red-600 text-xs mt-1">{errors.mobile}</p>
//           )}
//         </div>

//         {/* Email */}
//         <div>
//           <label className="block text-sm font-semibold text-gray-900 mb-2">
//             Email Address
//           </label>
//           <input
//             type="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             placeholder="example@domain.com"
//             className={`w-full px-4 py-3 rounded-lg border text-gray-900 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none ${
//               errors.email ? "border-red-500" : "border-gray-600"
//             }`}
//           />
//           {errors.email && (
//             <p className="text-red-600 text-xs mt-1">{errors.email}</p>
//           )}
//         </div>

//         {/* DOB */}
//         <div>
//           <label className="block text-sm font-semibold text-gray-900 mb-2">
//             Date of Birth
//           </label>
//           <DatePicker
//             selected={formData.dob}
//             onChange={handleDateChange}
//             placeholderText="YYYY-MM-DD"
//             dateFormat="yyyy-MM-dd"
//             showMonthDropdown
//             showYearDropdown
//             dropdownMode="select"
//             maxDate={new Date()}
//             className={`w-full px-4 py-3 rounded-lg border text-gray-900 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none ${
//               errors.dob ? "border-red-500" : "border-gray-600"
//             }`}
//           />
//           {errors.dob && (
//             <p className="text-red-600 text-xs mt-1">{errors.dob}</p>
//           )}
//         </div>

//         {/* Submit */}
//         <div className="pt-4">
//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className={`w-full py-3 rounded-lg text-white font-semibold transition-all ${
//               isSubmitting
//                 ? "bg-blue-400 cursor-not-allowed"
//                 : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
//             }`}
//           >
//             {isSubmitting ? "Saving..." : "Save Details"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default AdminForm;

import React, { useState, useEffect } from "react";
import api from "../api/axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// This component is now an all-in-one modal: it fetches its own data and handles updates.
const AdminForm = ({ onClose, onSuccess, onErrorToast }) => {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    dob: null,
  });

  // State to hold the original data for "no changes" comparison
  const [initialData, setInitialData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // For fetching data

  // Fetch the admin's current details when the modal opens
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get("/admin/details");
        if (res.data.length > 0) {
          const data = res.data[0];
          // Set both initial and form data
          const populatedData = {
            name: data.name || "",
            mobile: data.mobile || "",
            email: data.email || "",
            dob: data.dob ? new Date(data.dob) : null,
          };
          setFormData(populatedData);
          setInitialData(populatedData); // Save for comparison
        }
      } catch (err) {
        console.error(err);
        onErrorToast("Could not load your details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [onErrorToast]);

  // Validation function
  const validate = () => {
    const newErrors = {};
    if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      newErrors.name = "Name must contain only letters and spaces.";
    }
    if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Mobile number must be exactly 10 digits.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!formData.dob) {
      newErrors.dob = "Date of Birth is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: null }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({ ...prev, dob: date }));
    setErrors((prev) => ({ ...prev, dob: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Do not show toast on validation error.
    // The errors will appear inside the form.
    if (!validate()) {
      return;
    }

    // Improved "no changes" check (handles null dates)
    if (initialData) {
      let dobChanged = false;
      if (formData.dob && initialData.dob) {
        // Both dates exist, compare their time
        dobChanged = formData.dob.getTime() !== initialData.dob.getTime();
      } else if (formData.dob !== initialData.dob) {
        // One is null and the other isn't
        dobChanged = true;
      }

      const noChanges =
        formData.name.trim() === (initialData.name || "").trim() &&
        formData.mobile.trim() === (initialData.mobile || "").trim() &&
        formData.email.trim() === (initialData.email || "").trim() &&
        !dobChanged;

      if (noChanges) {
        onErrorToast("No changes were made."); // This toast is allowed
        onClose(); // Just close the modal
        return;
      }
    }

    setIsSubmitting(true);

    const formattedDOB = formData.dob
      ? formData.dob.toLocaleDateString("en-CA") // YYYY-MM-DD
      : "";

    try {
      const res = await api.post("/admin/details", {
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email,
        dob: formattedDOB,
      });

      // Call the onSuccess callback from AdminDashboard
      onSuccess(res.data);
    } catch (err) {
      onErrorToast(err.response?.data || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. FIX: Added modal wrapper
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[9990] p-4"
      onClick={onClose} // Click backdrop to close
    >
      <div
        className="bg-white w-full max-w-lg rounded-xl shadow-2xl animate-fadeIn relative"
        onClick={(e) => e.stopPropagation()} // Click modal to prevent closing
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-6 text-xl text-gray-500 hover:text-red-600 hover:drop-shadow-[0_0_6px_rgba(239,68,68,0.8)] transition-all duration-200"
          title="Close"
        >
          ✕
        </button>
        {isLoading ? (
          <p className="text-center p-8">Loading account details...</p>
        ) : (
          // This is your form design from before
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl">
            <h2 className="text-2xl font-extrabold mb-8 text-gray-800 text-center">
              {initialData
                ? "Edit Account Details"
                : "Complete Your Admin Profile"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={`w-full px-4 py-3 rounded-lg border text-gray-900 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none ${
                    errors.name ? "border-red-500" : "border-gray-600"
                  }`}
                />
                {errors.name && (
                  <p className="text-red-600 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Mobile Number
                </label>
                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  className={`w-full px-4 py-3 rounded-lg border text-gray-900 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none ${
                    errors.mobile ? "border-red-500" : "border-gray-600"
                  }`}
                />
                {errors.mobile && (
                  <p className="text-red-600 text-xs mt-1">{errors.mobile}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="abhisekh@gmail.com"
                  className={`w-full px-4 py-3 rounded-lg border text-gray-900 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none ${
                    errors.email ? "border-red-500" : "border-gray-600"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-600 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* DOB */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Date of Birth
                </label>
                <DatePicker
                  selected={formData.dob}
                  onChange={handleDateChange}
                  placeholderText="YYYY-MM-DD"
                  dateFormat="yyyy-MM-dd"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  maxDate={new Date()}
                  className={`w-full px-4 py-3 rounded-lg border text-gray-900 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none ${
                    errors.dob ? "border-red-500" : "border-gray-600"
                  }`}
                />
                {errors.dob && (
                  <p className="text-red-600 text-xs mt-1">{errors.dob}</p>
                )}
              </div>

              {/* Submit */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 rounded-lg text-white font-semibold transition-all ${
                    isSubmitting
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
                  }`}
                >
                  {isSubmitting ? "Saving..." : "Save Details"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminForm;
