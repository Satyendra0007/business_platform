/**
 * api.js — Central Axios instance for Tradafy frontend
 *
 * - Targets /api (proxied to http://localhost:5004 via vite.config.js)
 * - Automatically attaches Bearer token to every request
 * - Automatically logs out the user on 401 Unauthorized
 */

import axios from 'axios';

const TOKEN_KEY = 'tradafy-token';
const USER_KEY = 'tradafy-user';

// ─── Token helpers ────────────────────────────────────────────────────────────

export const saveToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export const saveUser = (user) => localStorage.setItem(USER_KEY, JSON.stringify(user));
export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
};
export const removeUser = () => localStorage.removeItem(USER_KEY);

export const clearSession = () => {
  removeToken();
  removeUser();
};

// ─── Axios instance ───────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 globally — but NOT on auth routes.
// A 401 from /auth/login means "wrong credentials" (public route).
// A 401 from any other route means the session expired → auto-logout.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = error.config?.url?.startsWith('/auth/');
    if (error.response?.status === 401 && !isAuthRoute) {
      // Session expired — clear local state and force a fresh login
      clearSession();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
