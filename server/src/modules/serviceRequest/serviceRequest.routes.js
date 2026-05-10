const express = require('express');
const rateLimit = require('express-rate-limit');
const { protect } = require('../../middleware/auth.middleware');
const { requireAdmin } = require('../../middleware/admin.middleware');
const {
  createServiceRequest,
  getServiceRequests,
  getServiceRequestById,
  updateServiceRequestStatus,
} = require('./serviceRequest.controller');

// ─── User routes ──────────────────────────────────────────────────────────────

const userRouter = express.Router();

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

userRouter.post('/', protect, submitLimiter, createServiceRequest);

// ─── Admin routes ─────────────────────────────────────────────────────────────

const adminRouter = express.Router();

adminRouter.use(protect, requireAdmin);

adminRouter.get('/', getServiceRequests);
adminRouter.get('/:id', getServiceRequestById);
adminRouter.patch('/:id/status', updateServiceRequestStatus);

module.exports = { userRouter, adminRouter };
