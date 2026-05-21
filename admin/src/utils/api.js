// admin-ui/src/utils/api.js
import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || (
    window.location.hostname === "localhost"
      ? "http://localhost:4000/api"
      : "https://ip-tv-stream.onrender.com/api"
  ),
  headers: { "Content-Type": "application/json" },
});

// attach admin token if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
