/**
 * api.js
 * ------
 * Thin axios wrapper. Reads the auth token from localStorage and attaches
 * it as a Bearer header on every request. All backend calls in the app
 * go through this module so there is a single place to change the base
 * URL, add interceptors, or handle 401s globally.
 */

import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("aeromind_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("aeromind_token");
      localStorage.removeItem("aeromind_user");
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (payload) => api.post("/auth/register", payload),
  login: (payload) => api.post("/auth/login", payload),
  me: () => api.get("/auth/me"),
};

export const missionApi = {
  calculateRoute: (payload) => api.post("/route/calculate", payload),
  create: (payload) => api.post("/missions", payload),
  list: () => api.get("/missions"),
  get: (id) => api.get(`/missions/${id}`),
  start: (id) => api.post(`/missions/${id}/start`),
  pause: (id) => api.post(`/missions/${id}/pause`),
  resume: (id) => api.post(`/missions/${id}/resume`),
  stop: (id) => api.post(`/missions/${id}/stop`),
  complete: (id, payload) => api.post(`/missions/${id}/complete`, payload),
  addLog: (id, payload) => api.post(`/missions/${id}/log`, payload),
  addBatteryLog: (id, payload) => api.post(`/missions/${id}/battery`, payload),
};

export const analyticsApi = {
  summary: () => api.get("/analytics/summary"),
};

export default api;
