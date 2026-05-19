// src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://ip-tv-stream.onrender.com/api", // ✅ match backend port
});

export default api;
