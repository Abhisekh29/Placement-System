import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    user_type: "1", // default: student
  });

  const [err, setErr] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/register", formData);
      console.log(res.data); // response is already JSON
      navigate("/login");
    } catch (error) {
      setErr(error.response?.data);
      console.error(error.response?.data || error.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h2 className="mb-6 text-center text-3xl font-bold text-gray-800">
          Create New Account
        </h2>
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* User Type */}
          <div className="relative flex bg-gray-100 rounded-full shadow-inner p-1 w-full max-w-[260px] mx-auto">
            {/* Admin Option */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, user_type: "0" })}
              className={`relative z-10 flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                formData.user_type === "0"
                  ? "text-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Admin
            </button>

            {/* Student Option */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, user_type: "1" })}
              className={`relative z-10 flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                formData.user_type === "1"
                  ? "text-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Student
            </button>

            {/* Animated background indicator */}
            <div
              className={`absolute top-1 bottom-1 w-1/2 rounded-full bg-gradient-to-r transition-all duration-300 ${
                formData.user_type === "0"
                  ? "left-1 from-blue-400 to-blue-600 "
                  : "left-[calc(8rem+0.25rem)] from-purple-400 to-purple-600"
              }`}
            ></div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-700 
                focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-700 
                focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full rounded-xl bg-blue-500 px-4 py-2 font-semibold text-white 
              transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            Register
          </button>
        </form>

        {err && <p className="pt-4 text-red-600 text-center">{err}</p>}

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="h-px flex-1 bg-gray-300"></div>
          <span className="px-3 text-sm text-gray-500">or</span>
          <div className="h-px flex-1 bg-gray-300"></div>
        </div>

        {/* Signup link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to={"/login"} className="text-indigo-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
