import axios from "axios";

let baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
if (baseURL && !baseURL.endsWith('/api')) {
  baseURL = baseURL.replace(/\/$/, '') + '/api';
}

const API = axios.create({
  baseURL
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Response error handler
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("hasGym");
      localStorage.removeItem("user");
      window.location.href = "/";
    }

    if (err.response?.status === 403 && err.response?.data?.message?.includes("deactivated")) {
      // Gym account deactivated
      window.dispatchEvent(new CustomEvent("gym:deactivated"));
    }

    return Promise.reject(err);
  }
);

export default API;