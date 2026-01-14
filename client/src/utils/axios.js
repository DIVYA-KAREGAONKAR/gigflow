import axios from "axios";

const api = axios.create({
  // ✅ Uses Render URL in production, localhost in development
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

// Remove api.defaults.withCredentials = true; (it's already in axios.create)

export default api;