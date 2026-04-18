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
 * Extracts the most useful error message from an Axios error.
 *
 * Backend validation errors arrive as:
 *   { success: false, message: 'Validation failed', errors: [{field, message}] }
 *
 * We prefer the first specific field message over the generic top-level one.
 */
function extractApiError(error, fallback) {
  const data = error.response?.data;
  if (data) {
    // First specific field-level message (express-validator format)
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors[0].message;
    }
    // Top-level message (e.g. 'Invalid credentials')
    if (data.message) return data.message;
  }
  // Axios network error or thrown Error object
  return error.message || fallback;
}

/**
 * Logs the user in with email + password.
 * Saves the JWT token and user profile to localStorage.
 * @returns {Object} user — { _id, firstName, lastName, email, roles, companyId?, profileImage? }
 */
export const login = async (email, password) => {
  try {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.success) {
      saveToken(data.data.token);
      const user = {
        _id:          data.data._id,
        firstName:    data.data.firstName,
        lastName:     data.data.lastName,
        name:         `${data.data.firstName} ${data.data.lastName}`,
        email:        data.data.email,
        roles:        data.data.roles,
        // Derive a single primary role for UI convenience
        role:         data.data.roles?.[0] || 'buyer',
        companyId:    data.data.companyId    || null,
        profileImage: data.data.profileImage || null,   // ← Cloudinary URL or null
      };
      saveUser(user);
      return user;
    }
    throw new Error(data.message || 'Login failed');
  } catch (error) {
    throw new Error(extractApiError(error, 'Login failed. Please try again.'));
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
    throw new Error(extractApiError(error, 'Registration failed. Please try again.'));
  }
};
