const User = require('../user/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { matchedData } = require('express-validator');
const twilio = require('twilio');

// Lazy-initialise Twilio client so the module still loads even if env
// vars are missing (e.g. tests that don't exercise OTP routes).
let twilioClient;
const getTwilioClient = () => {
  if (!twilioClient) {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  return twilioClient;
};

// ─── Twilio helpers ──────────────────────────────────────────────────────────

/**
 * Sends an OTP SMS to the given E.164 phone via Twilio Verify.
 * Throws if Twilio rejects the request.
 */
const triggerOtp = async (phone) => {
  console.log('[OTP] SEND PHONE:', phone);
  await getTwilioClient()
    .verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
    .verifications.create({ to: phone, channel: 'sms' });
};

/**
 * Verifies an OTP code for the given E.164 phone via Twilio Verify.
 * Returns true if approved, false otherwise.
 */
const checkOtp = async (phone, code) => {
  console.log('[OTP] VERIFY PHONE:', phone);
  console.log('[OTP] OTP CODE:', code);
  const result = await getTwilioClient()
    .verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
    .verificationChecks.create({ to: phone, code });
  console.log('[OTP] TWILIO STATUS:', result.status);
  return result.status === 'approved';
};

// ─── JWT ────────────────────────────────────────────────────────────────────

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'tradafy_super_secret_fallback', {
    expiresIn: '30d',
  });

// ────────────────────────────────────────────────────────────────────────────
// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
//
// Case 1: email exists AND isPhoneVerified = true
//   → 400 "Email already registered"  (do NOT send OTP)
//
// Case 2: email exists AND isPhoneVerified = false
//   → If user.phone exists   → resend OTP to that phone
//   → If user.phone missing  → save incoming phone, then send OTP
//   → 200 with { needsVerification: true, phone }
//
// Case 3: email does NOT exist
//   → Create user (isPhoneVerified = false), send OTP
//   → 201 with { needsVerification: true, phone }
// ────────────────────────────────────────────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    const data = matchedData(req, { locations: ['body'] });
    const { firstName, lastName, email, password, role, profileImage, phone } = data;

    // ── CASE 1 & 2: Email already exists ────────────────────────────────────
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // Case 1 — already fully verified. Hard stop.
      if (existingUser.isPhoneVerified) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists. Please log in.',
          code: 'EMAIL_ALREADY_VERIFIED'
        });
      }

      // Case 2 — exists but not yet verified. Help them complete verification.
      let targetPhone = existingUser.phone;

      if (!targetPhone) {
        // Phone was never saved — accept the one from this request
        if (!phone) {
          return res.status(400).json({
            success: false,
            message: 'Phone number is required to complete verification.',
            code: 'PHONE_REQUIRED'
          });
        }
        // Only update phone for unverified users (safety rule)
        existingUser.phone = phone;
        await existingUser.save();
        targetPhone = phone;
      }

      // Send / resend OTP
      try {
        await triggerOtp(targetPhone);
      } catch (otpErr) {
        console.error('[registerUser] OTP send failed:', otpErr.message);
        return res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
      }

      return res.status(200).json({
        success: true,
        needsVerification: true,
        message: 'Account already exists but phone is not verified. OTP sent.',
        data: { phone: targetPhone }
      });
    }

    // ── CASE 3: Brand-new user ───────────────────────────────────────────────

    // Prevent phone being taken by another account
    if (phone) {
      const phoneExists = await User.findOne({ phone });
      if (phoneExists) {
        return res.status(400).json({
          success: false,
          message: 'A user with that phone number already exists.',
          code: 'PHONE_TAKEN'
        });
      }
    }

    const rolesArray = Array.isArray(role) ? role : [role];

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,             // hashed by pre-save hook
      roles: rolesArray,
      phone,                // E.164 format
      isPhoneVerified: false,
      profileImage: profileImage || undefined
    });

    // Send OTP immediately after creation
    try {
      await triggerOtp(user.phone);
    } catch (otpErr) {
      console.error('[registerUser] OTP send failed for new user:', otpErr.message);
      // User is created but OTP failed — they can resend from the verify page
    }

    return res.status(201).json({
      success: true,
      needsVerification: true,
      message: 'Account created. OTP sent to your phone.',
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roles: user.roles,
        phone: user.phone,
        isPhoneVerified: user.isPhoneVerified,
        profileImage: user.profileImage || null,
        token: generateToken(user._id)
      }
    });

  } catch (error) {
    console.error('[registerUser]', error.message);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
// ────────────────────────────────────────────────────────────────────────────
const loginUser = async (req, res) => {
  try {
    const data = matchedData(req, { locations: ['body'] });
    const { email, password } = data;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account deactivated' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roles: user.roles,
        phone: user.phone || null,
        isPhoneVerified: user.isPhoneVerified,
        profileImage: user.profileImage || null,
        companyId: user.companyId || null,
        plan: user.plan ? String(user.plan).toLowerCase().trim() : 'free',
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    console.error('[loginUser]', error.message);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @desc    Send OTP to a phone number (only for unverified users)
// @route   POST /api/auth/send-otp
// @access  Public
// ────────────────────────────────────────────────────────────────────────────
const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    // Validate E.164 format before touching Twilio
    if (!/^\+[1-9]\d{6,14}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone must be in E.164 format (e.g. +919876543210)'
      });
    }

    // Safety: do not send OTP to an already-verified phone
    const user = await User.findOne({ phone });
    if (user && user.isPhoneVerified) {
      return res.status(400).json({
        success: false,
        message: 'This phone number is already verified.',
        code: 'ALREADY_VERIFIED'
      });
    }

    await triggerOtp(phone);

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('[sendOtp]', error.message);
    res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @desc    Resend OTP — explicit resend endpoint for unverified users
// @route   POST /api/auth/resend-otp
// @access  Public
// ────────────────────────────────────────────────────────────────────────────
const resendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    if (!/^\+[1-9]\d{6,14}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone must be in E.164 format (e.g. +919876543210)'
      });
    }

    // Only resend for users who exist and are not yet verified
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this phone number.' });
    }
    if (user.isPhoneVerified) {
      return res.status(400).json({
        success: false,
        message: 'This phone is already verified.',
        code: 'ALREADY_VERIFIED'
      });
    }

    await triggerOtp(phone);

    res.json({ success: true, message: 'OTP resent successfully' });
  } catch (error) {
    console.error('[resendOtp]', error.message);
    res.status(500).json({ success: false, message: 'Failed to resend OTP. Please try again.' });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @desc    Verify OTP and mark phone as verified
// @route   POST /api/auth/verify-otp
// @access  Public
// ────────────────────────────────────────────────────────────────────────────
const verifyOtp = async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ success: false, message: 'Phone and code are required' });
    }

    // Verify via Twilio — same phone & code, exact E.164 match
    let approved;
    try {
      approved = await checkOtp(phone, String(code).trim());
    } catch (twilioErr) {
      console.error('[verifyOtp] Twilio error:', twilioErr.message);
      return res.status(500).json({ success: false, message: 'OTP check failed. Please try again.' });
    }

    if (!approved) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code. Please try again.' });
    }

    // Mark verified in DB
    const user = await User.findOneAndUpdate(
      { phone },
      { isPhoneVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User with this phone number not found.' });
    }

    res.json({ success: true, message: 'Phone verified successfully', isPhoneVerified: true });
  } catch (error) {
    console.error('[verifyOtp]', error.message);
    res.status(500).json({ success: false, message: 'OTP verification failed. Please try again.' });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @desc    Get current logged-in user profile (with live plan data)
// @route   GET /api/auth/me
// @access  Private (protect)
// ────────────────────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    // req.user is already populated by protect middleware
    const user = req.user;
    res.json({
      success: true,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roles: user.roles,
        phone: user.phone || null,
        isPhoneVerified: user.isPhoneVerified,
        profileImage: user.profileImage || null,
        companyId: user.companyId || null,
        plan: user.plan ? String(user.plan).toLowerCase().trim() : 'free',
        subscriptionStatus:   user.subscriptionStatus   || null,
        stripeSubscriptionId: user.stripeSubscriptionId || null,
      }
    });
  } catch (error) {
    console.error('[getMe]', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// @desc    Update phone for a logged-in user (unverified only) + send OTP
// @route   POST /api/auth/update-phone
// @access  Private (protect)
// ────────────────────────────────────────────────────────────────────────────
const updateUserPhone = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    if (!/^\+[1-9]\d{6,14}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone must be in E.164 format (e.g. +919876543210)'
      });
    }

    const user = req.user; // set by protect middleware

    // Safety: never overwrite phone for a verified user
    if (user.isPhoneVerified) {
      return res.status(400).json({
        success: false,
        message: 'Your phone is already verified. Contact support to change it.',
        code: 'ALREADY_VERIFIED'
      });
    }

    // Ensure phone is not taken by another account
    const phoneExists = await User.findOne({ phone, _id: { $ne: user._id } });
    if (phoneExists) {
      return res.status(400).json({
        success: false,
        message: 'This phone number is already registered to another account.',
        code: 'PHONE_TAKEN'
      });
    }

    // Save the phone number
    await User.findByIdAndUpdate(user._id, { phone });

    // Send OTP via Twilio
    try {
      await triggerOtp(phone);
    } catch (otpErr) {
      console.error('[updateUserPhone] OTP send failed:', otpErr.message);
      return res.status(500).json({ success: false, message: 'Phone saved but OTP failed to send. Use resend.' });
    }

    res.json({
      success: true,
      message: 'Phone number saved. OTP sent.',
      phone
    });
  } catch (error) {
    console.error('[updateUserPhone]', error.message);
    res.status(500).json({ success: false, message: 'Server error updating phone' });
  }
};

module.exports = { registerUser, loginUser, sendOtp, resendOtp, verifyOtp, updateUserPhone, getMe };
