import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "../api/axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import _isEqual from "lodash/isEqual"; // Import lodash for deep comparison

// Zod schema for strict validation
const studentSchema = z.object({
  rollno: z
    .number({ invalid_type_error: "Roll Number must be a number" })
    .int("Roll Number must be an integer")
    .positive("Roll Number must be positive"),
  name: z
    .string()
    .regex(/^[A-Za-z\s]+$/, "Name can only contain letters and spaces")
    .min(1, "Full Name is required"),
  mobile: z
    .string()
    .regex(/^\d{10}$/, "Mobile number must be exactly 10 digits"),
  email: z.email("Invalid email"),
  dob: z.string().min(1, "Date of Birth is required"),
  gender: z.enum(["Male", "Female", "Other"], "Select a valid gender"),
  caste: z.string().nonempty("Caste is required"),
  address: z.string().nonempty("Address is required"),

  per_10: z
    .number({ invalid_type_error: "Enter a number" })
    .min(0, "Must be between 0-100")
    .max(100, "Must be between 0-100")
    .refine(
      (val) => /^\d+(\.\d{1,2})?$/.test(String(val)),
      "Up to 2 decimal places only"
    ),
  per_12: z
    .number({ invalid_type_error: "Enter a number" })
    .min(0, "Must be between 0-100")
    .max(100, "Must be between 0-100")
    .refine(
      (val) => /^\d+(\.\d{1,2})?$/.test(String(val)),
      "Up to 2 decimal places only"
    ),
  session_id: z.number({ invalid_type_error: "Select a session" }),
  program_id: z.number({ invalid_type_error: "Select a program" }),
});

const StudentForm = ({
  existingData,
  onSuccess,
  onNoChanges,
  onErrorToast,
}) => {
  const [sessions, setSessions] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [initialFormData, setInitialFormData] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(studentSchema),
    mode: "onChange",
  });

  // Fetch dropdown data
  useEffect(() => {
    api
      .get("/session_master")
      .then((res) => setSessions(res.data))
      .catch((err) => console.error(err));

    api
      .get("/program_master")
      .then((res) => setPrograms(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Populate form and store initial data
  useEffect(() => {
    if (existingData && sessions.length > 0 && programs.length > 0) {
      const dataToSet = {
        ...existingData,
        dob: existingData.dob
          ? new Date(existingData.dob).toLocaleDateString("en-CA")
          : "",
        address: existingData.address || "",
        caste: existingData.caste || "",
        mobile: existingData.mobile ? String(existingData.mobile) : "",
        session_id: existingData.session_id
          ? Number(existingData.session_id)
          : "",
        program_id: existingData.program_id
          ? Number(existingData.program_id)
          : "",
      };
      reset(dataToSet);
      setInitialFormData(dataToSet); // Store the formatted initial data
    } else {
      setInitialFormData(null);
    }
  }, [existingData, sessions, programs, reset]);

  // Normalize data for comparison (handle potential type differences)
  const normalizeData = (data) => {
    if (!data) return {};
    return {
      ...data,
      rollno: Number(data.rollno || 0),
      mobile: String(data.mobile || ""),
      dob: data.dob ? new Date(data.dob).toLocaleDateString("en-CA") : "", // Ensure consistent date format
      caste: data.caste || "",
      address: data.address || "",
      per_10: Number(parseFloat(data.per_10 || 0).toFixed(2)), // Ensure number and fixed decimals
      per_12: Number(parseFloat(data.per_12 || 0).toFixed(2)), // Ensure number and fixed decimals
      session_id: Number(data.session_id || 0),
      program_id: Number(data.program_id || 0),
    };
  };

  const onSubmit = async (data) => {
    // --- CHANGE DETECTION ---
    if (existingData && initialFormData) {
      // Only check if editing existing data
      const currentNormalized = normalizeData(data);
      const initialNormalized = normalizeData(initialFormData);

      // Use lodash isEqual for deep comparison, ignoring irrelevant fields if necessary
      // Select only the fields present in the schema for comparison
      const fieldsToCompare = Object.keys(studentSchema.shape);
      const currentSubset = Object.fromEntries(
        fieldsToCompare.map((key) => [key, currentNormalized[key]])
      );
      const initialSubset = Object.fromEntries(
        fieldsToCompare.map((key) => [key, initialNormalized[key]])
      );

      if (_isEqual(currentSubset, initialSubset)) {
        if (onNoChanges) onNoChanges(); // Call the no changes handler
        return; // Stop submission
      }
    }

    // Proceed with submission if new data or changes detected
    try {
      const user = JSON.parse(sessionStorage.getItem("user"));
      const payload = {
        ...data,
        userid: user.userid,
        mod_by: user.userid,
        rollno: Number(data.rollno),
        per_10: Number(data.per_10),
        per_12: Number(data.per_12),
        session_id: Number(data.session_id),
        program_id: Number(data.program_id),
        address: data.address || "",
        caste: data.caste || "",
      };

      if (existingData) {
        await api.put(`/student_master/${user.userid}`, payload);
      } else {
        await api.post("/student_master", payload);
        reset();
      }

      if (onSuccess) onSuccess(payload);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "An unexpected error occurred.";

      // Detect duplicate / conflict from backend
      if (message.toLowerCase().includes("status code 500")) {
        if (onErrorToast) onErrorToast("Roll No, Phone or Email already exists");}
      else {
        if (onErrorToast) onErrorToast(message);
      }

      console.error(message);
    }
  };

  return (
    <main className="flex-grow p-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-xl shadow-md max-w-lg mx-auto space-y-4"
      >
        {/* Roll Number */}
        <div>
          <label className="block mb-1 font-medium">Roll Number</label>
          <input
            type="number"
            {...register("rollno", { valueAsNumber: true })}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
              errors.rollno
                ? "border-red-500 focus:ring-red-200"
                : "focus:ring-blue-200"
            }`}
          />
          {errors.rollno && (
            <p className="text-red-600 mt-1">
              {"Roll is required and should be a positive integer"}
            </p>
          )}
        </div>

        {/* Name */}
        <div>
          <label className="block mb-1 font-medium">Full Name</label>
          <input
            type="text"
            {...register("name")}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
              errors.name
                ? "border-red-500 focus:ring-red-200"
                : "focus:ring-blue-200"
            }`}
          />
          {errors.name && (
            <p className="text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Mobile */}
        <div>
          <label className="block mb-1 font-medium">Mobile</label>
          <input
            type="text"
            {...register("mobile")}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
              errors.mobile
                ? "border-red-500 focus:ring-red-200"
                : "focus:ring-blue-200"
            }`}
          />
          {errors.mobile && (
            <p className="text-red-600 mt-1">{errors.mobile.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            placeholder="abhisekh@gmail.com"
            {...register("email")}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
              errors.email
                ? "border-red-500 focus:ring-red-200"
                : "focus:ring-blue-200"
            }`}
          />
          {errors.email && (
            <p className="text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* DOB */}
        <div>
          <label className="block mb-1 font-medium">Date of Birth</label>
          <Controller
            control={control}
            name="dob"
            render={({ field }) => (
              <DatePicker
                placeholderText="Select Date of Birth"
                selected={field.value ? new Date(field.value) : null}
                onChange={(date) => {
                  if (date) {
                    const localDate = new Date(
                      date.getTime() - date.getTimezoneOffset() * 60000
                    )
                      .toISOString()
                      .split("T")[0];
                    field.onChange(localDate);
                  } else {
                    field.onChange("");
                  }
                }}
                dateFormat="yyyy-MM-dd"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                  errors.dob
                    ? "border-red-500 focus:ring-red-200"
                    : "focus:ring-blue-200"
                }`}
                maxDate={new Date()}
              />
            )}
          />
          {errors.dob && (
            <p className="text-red-600 mt-1">{"Date of Birth is required"}</p>
          )}
        </div>

        {/* Gender */}
        <div>
          <label className="block mb-1 font-medium">Gender</label>
          <select
            {...register("gender")}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
              errors.gender
                ? "border-red-500 focus:ring-red-200"
                : "focus:ring-blue-200"
            }`}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {errors.gender && (
            <p className="text-red-600 mt-1">{errors.gender.message}</p>
          )}
        </div>

        {/* Caste */}
        <div>
          <label className="block mb-1 font-medium">Caste</label>
          <select
            {...register("caste")}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Select Caste</option>
            <option value="General">General</option>
            <option value="OBC-NCL">OBC-NCL</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
          </select>
          {errors.caste && (
            <p className="text-red-600 mt-1">{errors.caste.message}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block mb-1 font-medium">Address</label>
          <textarea
            {...register("address")}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          {errors.address && (
            <p className="text-red-600 mt-1">{errors.address.message}</p>
          )}
        </div>

        {/* Percentages */}
        <div>
          <label className="block mb-1 font-medium">10th Percentage</label>
          <input
            type="number"
            step="0.01"
            {...register("per_10", { valueAsNumber: true })}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
              errors.per_10
                ? "border-red-500 focus:ring-red-200"
                : "focus:ring-blue-200"
            }`}
          />
          {errors.per_10 && (
            <p className="text-red-600 mt-1">
              {"10th Percentage should be decimal between 1 to 100"}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">12th Percentage</label>
          <input
            type="number"
            step="0.01"
            {...register("per_12", { valueAsNumber: true })}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
              errors.per_12
                ? "border-red-500 focus:ring-red-200"
                : "focus:ring-blue-200"
            }`}
          />
          {errors.per_12 && (
            <p className="text-red-600 mt-1">
              {"10th Percentage should be decimal between 1 to 100"}
            </p>
          )}
        </div>

        {/* Session */}
        <div>
          <label className="block mb-1 font-medium">Session</label>
          <select
            {...register("session_id", { valueAsNumber: true })}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
              errors.session_id
                ? "border-red-500 focus:ring-red-200"
                : "focus:ring-blue-200"
            }`}
          >
            <option value="">Select Session</option>
            {sessions.map((s) => (
              <option key={s.session_id} value={s.session_id}>
                {s.session_name}
              </option>
            ))}
          </select>
          {errors.session_id && (
            <p className="text-red-600 mt-1">{"Select a valid session"}</p>
          )}
        </div>

        {/* Program */}
        <div>
          <label className="block mb-1 font-medium">Program</label>
          <select
            {...register("program_id", { valueAsNumber: true })}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
              errors.program_id
                ? "border-red-500 focus:ring-red-200"
                : "focus:ring-blue-200"
            }`}
          >
            <option value="">Select Program</option>
            {programs.map((p) => (
              <option key={p.program_id} value={p.program_id}>
                {p.program_name}
              </option>
            ))}
          </select>
          {errors.program_id && (
            <p className="text-red-600 mt-1">{"Select a valid program"}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          {existingData ? "Update" : "Save"}
        </button>
      </form>
    </main>
  );
};

export default StudentForm;
