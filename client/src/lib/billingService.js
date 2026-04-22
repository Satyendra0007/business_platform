/**
 * billingService.js
 *
 * Frontend billing API layer.
 *
 * Security rules enforced here:
 *  - Plan is NEVER updated from the frontend.
 *  - We only redirect to Stripe; the webhook updates the DB.
 *  - getBillingStatus() is used for UI display only — not for access control.
 */

import api from './api';

/**
 * POST /billing/create-checkout-session
 *
 * @param {'business'|'premium'} plan
 * @returns {Promise<string>} Stripe Checkout URL to redirect the browser to
 */
export const createCheckoutSession = async (plan) => {
  const res = await api.post('/billing/create-checkout-session', { plan });
  return res.data.url; // redirect the user here
};

/**
 * GET /billing/status
 *
 * Returns the current billing status for the logged-in user.
 * Used for UI display — NOT for access control (that's the server's job).
 *
 * @returns {Promise<{ plan: string, subscriptionStatus: string|null, stripeSubscriptionId: string|null }>}
 */
export const getBillingStatus = async () => {
  const res = await api.get('/billing/status');
  return res.data.data;
};
