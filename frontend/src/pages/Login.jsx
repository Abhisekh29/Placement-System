import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get("sessionExpired");

  useEffect(() => {
    if (sessionExpired) {
      setErr("Your session has expired. Please log in again.");
    }
  }, [sessionExpired]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(null); // Clear previous errors on a new submission
    try {
      const res = await api.post("/auth/login", formData);

      if (res.data.is_enable === "0") {
        setErr(
          "Your account is not verified yet. Please wait for admin approval."
        );
      } else if (res.data.is_enable === "2") {
        setErr("Your account has been rejected. Contact admin for details.");
      } else if (res.data.is_enable === "1") {
        // Account verified
        sessionStorage.setItem(
          "user",
          JSON.stringify({
            userid: res.data.userid,
            username: res.data.username,
            user_type: res.data.user_type,
            is_enable: res.data.is_enable,
            mod_by: res.data.mod_by,
            mod_time: res.data.mod_time,
            loggedIn: true,
          })
        );
        if (res.data.user_type === "0") {
          navigate("/admin-dashboard");
        } else if (res.data.user_type === "1") {
          navigate("/student-dashboard");
        }
      }
    } catch (error) {
      setErr(error.response?.data || error.message || "Something went wrong");
      console.error(error.response?.data || error.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h2 className="mb-6 text-center text-3xl font-bold text-gray-800">
          Welcome
        </h2>
        <form className="space-y-5" onSubmit={handleSubmit}>
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
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>
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
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              required
            />
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-blue-600 hover:bg-blue-50 px-1 py-1 rounded-lg transition"
              >
                Forgot password?
              </Link>
            </div>
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-blue-500 px-4 py-2 font-semibold text-white transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            Login
          </button>
        </form>
        {err && <p className="pt-4 text-red-600 text-center">{err}</p>}
        <div className="my-6 flex items-center">
          <div className="h-px flex-1 bg-gray-300"></div>
          <span className="px-3 text-sm text-gray-500">or</span>
          <div className="h-px flex-1 bg-gray-300"></div>
        </div>
        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link to={"/register"} className="text-indigo-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
