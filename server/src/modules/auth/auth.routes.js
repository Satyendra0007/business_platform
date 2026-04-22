const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { registerUser, loginUser, sendOtp, resendOtp, verifyOtp, updateUserPhone, getMe } = require('./auth.controller');
const { registerValidation, loginValidation } = require('./auth.validator');
const { validateRequest } = require('../../middleware/validate.middleware');
const { protect } = require('../../middleware/auth.middleware');

// Stricter rate limiter specifically for OTP endpoints — 5 requests per 15 minutes per IP
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many OTP requests. Please wait 15 minutes before trying again.' }
});

router.post('/register', registerValidation, validateRequest, registerUser);
router.post('/login', loginValidation, validateRequest, loginUser);
router.get('/me', protect, getMe);   // live user profile + plan info

// OTP routes — rate limited
router.post('/send-otp',   otpLimiter, sendOtp);
router.post('/resend-otp', otpLimiter, resendOtp);
router.post('/verify-otp', otpLimiter, verifyOtp);

// Protected: logged-in user adds/updates their phone (unverified only)
router.post('/update-phone', protect, otpLimiter, updateUserPhone);

module.exports = router;
