// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
});

// Add a response interceptor
api.interceptors.response.use(
  (response) => response, // Directly return successful responses
  (error) => {
    if (!error.response) {
      console.error("Server appears to be offline:", error.message);
      return Promise.reject({
        ...error,
        code: "ERR_NETWORK",
        message: "Server is offline or unreachable.",
      });
    }
    // Check if the error is for an expired token
    if (error.response && error.response.status === 401 || error.response.status === 403) {
      const errorMsg = error.response.data?.message || "";
      if (errorMsg.includes("profile is frozen")) {
        // This is a "frozen" error, not a session error.
        // Stop the interceptor here and let the component's 'catch' block handle it.
        return Promise.reject(error);
      }
      // Clear user from session storage
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("studentStatus")
      // Redirect to login page with a message
      window.location.href = "/login?sessionExpired=true";
    }
    return Promise.reject(error);
  }
);

export default api;
