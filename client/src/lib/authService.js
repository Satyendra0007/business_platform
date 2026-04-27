/**
 * authService.js — Auth API wrappers
 *
 * - login(email, password)  → POST /api/auth/login
 * - register(data)          → POST /api/auth/register
 * - sendOtp(phone)          → POST /api/auth/send-otp
 * - verifyOtp(phone, code)  → POST /api/auth/verify-otp
 *
 * All functions return data on success and throw a
 * user-friendly error string on failure.
 */

import api, { saveToken, saveUser } from './api';
import { getPrimaryRole } from './userRole';

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
  return error.response?.data?.message || error.message || fallback;
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
        _id:             data.data._id,
        firstName:       data.data.firstName,
        lastName:        data.data.lastName,
        name:            `${data.data.firstName} ${data.data.lastName}`,
        email:           data.data.email,
        roles:           data.data.roles,
        // Derive a single primary role for UI convenience
        role:            getPrimaryRole(data.data),
        companyId:       data.data.companyId     || null,
        profileImage:    data.data.profileImage  || null,
        phone:           data.data.phone         || null,
        isPhoneVerified: data.data.isPhoneVerified ?? false,
        plan:            data.data.plan          || 'free',
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
 * @param {{ firstName, lastName, email, password, role, phone }} formData
 * @returns {{ phone: string, needsVerification: boolean }} on success
 * @throws with .code = 'EMAIL_ALREADY_VERIFIED' when account is fully registered
 */
export const register = async (formData) => {
  try {
    const { data } = await api.post('/auth/register', formData);
    if (data.success) {
      // Both new users (201) and existing-unverified (200) return needsVerification: true
      return { phone: data.data?.phone || formData.phone, needsVerification: data.needsVerification };
    }
    const err = new Error(data.message || 'Registration failed');
    err.code = data.code;
    throw err;
  } catch (error) {
    // Re-throw API errors that already have a code set
    if (error.code) throw error;
    // Surface the backend error code for EMAIL_ALREADY_VERIFIED etc.
    const backendCode = error.response?.data?.code;
    const msg = extractApiError(error, 'Registration failed. Please try again.');
    const err = new Error(msg);
    if (backendCode) err.code = backendCode;
    throw err;
  }
};

/**
 * Sends an OTP to the given phone number via Twilio.
 * @param {string} phone — E.164 format, e.g. +919876543210
 */
export const sendOtp = async (phone) => {
  try {
    const { data } = await api.post('/auth/send-otp', { phone });
    if (data.success) return true;
    throw new Error(data.message || 'Failed to send OTP');
  } catch (error) {
    throw new Error(extractApiError(error, 'Failed to send OTP. Please try again.'));
  }
};

/**
 * Resends OTP for an existing unverified user.
 * @param {string} phone — E.164 format
 */
export const resendOtp = async (phone) => {
  try {
    const { data } = await api.post('/auth/resend-otp', { phone });
    if (data.success) return true;
    throw new Error(data.message || 'Failed to resend OTP');
  } catch (error) {
    throw new Error(extractApiError(error, 'Failed to resend OTP. Please try again.'));
  }
};

/**
 * Updates phone for a logged-in user who has no phone or an unverified phone.
 * Requires a valid Bearer token in the request header.
 * @param {string} phone — E.164 format
 * @returns {{ phone: string }} canonical phone saved in DB
 */
export const updatePhone = async (phone) => {
  try {
    const { data } = await api.post('/auth/update-phone', { phone });
    if (data.success) return { phone: data.phone };
    const err = new Error(data.message || 'Failed to update phone');
    err.code = data.code;
    throw err;
  } catch (error) {
    if (error.code) throw error;
    const backendCode = error.response?.data?.code;
    const msg = extractApiError(error, 'Failed to update phone. Please try again.');
    const err = new Error(msg);
    if (backendCode) err.code = backendCode;
    throw err;
  }
};

/**
 * Verifies the OTP code for a given phone number.
 * @param {string} phone — E.164 format
 * @param {string} code  — 6-digit OTP
 * @returns {boolean} true on success
 */
export const verifyOtp = async (phone, code) => {
  try {
    const { data } = await api.post('/auth/verify-otp', { phone, code });
    if (data.success) return true;
    throw new Error(data.message || 'OTP verification failed');
  } catch (error) {
    throw new Error(extractApiError(error, 'OTP verification failed. Please try again.'));
  }
};
