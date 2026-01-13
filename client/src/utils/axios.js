import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // ⭐ FIX HERE
  withCredentials: true,
});
api.defaults.withCredentials = true;

export default api;
