// src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000/api", // ✅ match backend port
});

export default api;
