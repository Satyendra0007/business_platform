/**
 * api.js - Central Axios instance for Tradafy frontend
 *
 * - Targets /api in local dev (proxied by Vite)
 * - Targets VITE_API_BASE_URL/api when that env var is provided
 * - Automatically attaches Bearer token to every request
 * - Automatically logs out the user on 401 Unauthorized
 */

import axios from 'axios';

const TOKEN_KEY = 'tradafy-token';
const USER_KEY = 'tradafy-user';

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

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');
const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const normalizedApiBaseUrl = rawApiBaseUrl ? trimTrailingSlash(rawApiBaseUrl) : '';
const resolvedBaseUrl = rawApiBaseUrl
  ? (normalizedApiBaseUrl.endsWith('/api') ? normalizedApiBaseUrl : `${normalizedApiBaseUrl}/api`)
  : '/api';

const api = axios.create({
  baseURL: resolvedBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = error.config?.url?.startsWith('/auth/');
    if (error.response?.status === 401 && !isAuthRoute) {
      clearSession();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


export default api;
