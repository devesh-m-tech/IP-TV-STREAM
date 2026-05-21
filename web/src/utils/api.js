// src/utils/api.js
import axios from "axios";

const baseURL = window.location.hostname === "localhost"
  ? "http://localhost:4000/api"
  : "https://ip-tv-stream.onrender.com/api";

const api = axios.create({
  baseURL,
});

export default api;
