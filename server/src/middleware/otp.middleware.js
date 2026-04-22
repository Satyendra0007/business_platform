/**
 * otp.middleware.js
 *
 * requirePhoneVerified — must be placed AFTER `protect` in route chains.
 * Blocks any action requiring phone verification if the user hasn't completed it.
 */
const requirePhoneVerified = (req, res, next) => {
  if (!req.user?.isPhoneVerified) {
    return res.status(403).json({
      success: false,
      message: 'Phone verification required. Please verify your phone number to access this feature.',
      code: 'PHONE_NOT_VERIFIED'
    });
  }
  next();
};

module.exports = { requirePhoneVerified };
