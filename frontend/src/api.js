
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("examToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function saveSession(data) {
  localStorage.setItem("examToken", data.token);
  localStorage.setItem("examUser", JSON.stringify(data.user));
}

export function clearSession() {
  localStorage.removeItem("examToken");
  localStorage.removeItem("examUser");
}

export function getSavedUser() {
  try {
    return JSON.parse(localStorage.getItem("examUser") || "null");
  } catch {
    return null;
  }
}

export default api;
