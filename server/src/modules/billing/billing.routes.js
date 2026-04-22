/**
 * billing.routes.js
 *
 * CRITICAL: The webhook route uses express.raw() — it MUST be registered
 * BEFORE express.json() in index.js so Stripe can verify the raw body signature.
 *
 * This file exports two routers:
 *   webhookRouter — mounts at /api/billing/webhook  (raw body, no auth)
 *   billingRouter — mounts at /api/billing           (JSON body, protected)
 */
const express    = require('express');
const { protect } = require('../../middleware/auth.middleware');
const {
  createCheckoutSession,
  handleWebhook,
  getBillingStatus,
} = require('./billing.controller');

// ── Webhook router — raw body, NO auth guard ──────────────────────────────────
const webhookRouter = express.Router();
webhookRouter.post(
  '/webhook',
  express.raw({ type: 'application/json' }),  // raw body REQUIRED for Stripe sig verification
  handleWebhook
);

// ── Billing router — parsed JSON, protected ───────────────────────────────────
const billingRouter = express.Router();
billingRouter.use(protect);
billingRouter.post('/create-checkout-session', createCheckoutSession);
billingRouter.get('/status', getBillingStatus);

module.exports = { webhookRouter, billingRouter };
