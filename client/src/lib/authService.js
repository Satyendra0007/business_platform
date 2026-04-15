/**
 * authService.js — Auth API wrappers
 *
 * - login(email, password)  → POST /api/auth/login
 * - register(data)          → POST /api/auth/register
 *
 * Both functions return the user object on success and throw a
 * user-friendly error string on failure.
 */

import api, { saveToken, saveUser } from './api';

/**
 * Logs the user in with email + password.
 * Saves the JWT token and user profile to localStorage.
 * @returns {Object} user — { _id, firstName, lastName, email, roles, companyId? }
 */
export const login = async (email, password) => {
  try {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.success) {
      saveToken(data.data.token);
      const user = {
        _id: data.data._id,
        firstName: data.data.firstName,
        lastName: data.data.lastName,
        name: `${data.data.firstName} ${data.data.lastName}`,
        email: data.data.email,
        roles: data.data.roles,
        // Derive a single primary role for UI convenience
        role: data.data.roles?.[0] || 'buyer',
        companyId: data.data.companyId || null,
      };
      saveUser(user);
      return user;
    }
    throw new Error(data.message || 'Login failed');
  } catch (error) {
    // Prefer the API error message over Axios network errors
    const msg = error.response?.data?.message || error.message || 'Login failed. Please try again.';
    throw new Error(msg);
  }
};

/**
 * Registers a new user.
 * @param {{ firstName, lastName, email, password, role }} formData
 * @returns {Object} user — newly created user data (without token — user must login after)
 */
export const register = async (formData) => {
  try {
    const { data } = await api.post('/auth/register', formData);
    if (data.success) {
      return data.data;
    }
    throw new Error(data.message || 'Registration failed');
  } catch (error) {
    const msg = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
    throw new Error(msg);
  }
};
