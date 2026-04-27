const express = require('express');
const rateLimit = require('express-rate-limit');
const { protect } = require('../../middleware/auth.middleware');
const { submitDealSupportRequest } = require('./dealSupport.controller');

const router = express.Router();

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many deal support requests. Please try again later.' },
});

router.post('/submit', protect, submitLimiter, submitDealSupportRequest);

module.exports = router;

