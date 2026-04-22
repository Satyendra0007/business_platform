const express = require('express');
const router = express.Router();

const {
  createShippingRequest,
  getShippingRequest,
  getShippingBids,
  acceptBid,
  listOpenRequests,
  submitBid
} = require('./shipping.controller');

const { createRequestValidation, submitBidValidation } = require('./shipping.validator');
const { validateRequest } = require('../../middleware/validate.middleware');
const { protect } = require('../../middleware/auth.middleware');
const { requireShippingAgent, requireParticipantRole } = require('../../middleware/shippingAgent.middleware');
const { checkPhaseAccess } = require('../../middleware/plan.middleware');

// All shipping routes require authentication
router.use(protect);

// ── BUYER / SUPPLIER ROUTES ───────────────────────────────────────────────────

// Create a new freight request for a deal (deal must be in 'shipping_request' status)
router.post(
  '/request',
  requireParticipantRole,
  checkPhaseAccess('shipping'),     // Free Phase-3 users cannot raise shipping requests
  createRequestValidation,
  validateRequest,
  createShippingRequest
);

// View the shipping request attached to a specific deal
router.get(
  '/request/:dealId',
  requireParticipantRole,
  getShippingRequest
);

// View all bids submitted for a shipping request
router.get(
  '/bids/:requestId',
  getShippingBids
);

// Accept a specific bid — triggers deal status → 'shipping'
router.post(
  '/bid/:id/accept',
  requireParticipantRole,
  checkPhaseAccess('shipping'),     // Free Phase-3 users cannot accept bids
  acceptBid
);

// ── SHIPPING AGENT ROUTES ─────────────────────────────────────────────────────

// Browse all open freight requests (cargo details only — no deal pricing exposed)
router.get(
  '/requests',
  requireShippingAgent,
  listOpenRequests
);

// Submit a freight bid on an open request
router.post(
  '/bid',
  requireShippingAgent,
  submitBidValidation,
  validateRequest,
  submitBid
);

module.exports = router;
