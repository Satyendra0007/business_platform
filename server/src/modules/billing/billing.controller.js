/**
 * billing.controller.js
 *
 * Handles Stripe subscription checkout and webhook processing.
 *
 * Security rules:
 *  - NEVER trust the frontend for plan upgrades.
 *  - ONLY the Stripe webhook (verified by signature) updates the DB.
 *  - stripeCustomerId is retrieved or created on demand.
 */

let stripeClient = null;
const User = require('../user/user.model');

// ─── Plan → Stripe Price ID map ───────────────────────────────────────────────
// Set STRIPE_BUSINESS_PRICE_ID and STRIPE_PREMIUM_PRICE_ID in server .env
const PLAN_PRICE_IDS = {
  business: process.env.STRIPE_BUSINESS_PRICE_ID,
  premium: process.env.STRIPE_PREMIUM_PRICE_ID,
};

// ─── Plan key from Stripe Price ID (reverse lookup for webhook) ───────────────
const priceIdToPlan = () => ({
  [process.env.STRIPE_BUSINESS_PRICE_ID]: 'business',
  [process.env.STRIPE_PREMIUM_PRICE_ID]: 'premium',
});

const getStripeClient = () => {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!stripeClient) {
    stripeClient = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
};

const getFrontendUrl = () => (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');

const isStaleStripeCustomerError = (err) => {
  const message = String(err?.message || '');
  const rawCode = err?.raw?.code || err?.code;
  return (
    rawCode === 'resource_missing' ||
    /No such customer/i.test(message) ||
    (/customer/i.test(message) && err?.statusCode === 404)
  );
};

const createOrRefreshStripeCustomer = async (user) => {
  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error('Stripe is not configured on the server.');
  }

  const customer = await stripe.customers.create({
    email: user.email,
    name: [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.email,
    metadata: { userId: user._id.toString() },
  });

  await User.findByIdAndUpdate(user._id, { stripeCustomerId: customer.id });
  return customer.id;
};

const createStripeCheckoutSession = async ({ customerId, priceId, user, plan }) => {
  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error('Stripe is not configured on the server.');
  }

  const frontendUrl = getFrontendUrl();

  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { userId: user._id.toString(), plan },
    allow_promotion_codes: true,
    success_url: `${frontendUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${frontendUrl}/pricing?canceled=1`,
  });
};

// ───────────────────────────────────────────────────────────────────────────────
// @desc    Create a Stripe Checkout session for a subscription upgrade
// @route   POST /api/billing/create-checkout-session
// @access  Private (protect)
// ───────────────────────────────────────────────────────────────────────────────
const createCheckoutSession = async (req, res) => {
  try {
    const { plan } = req.body;
    const normalizedPlan = plan?.toLowerCase();

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Stripe is not configured on the server.',
      });
    }

    if (!PLAN_PRICE_IDS.business || !PLAN_PRICE_IDS.premium) {
      return res.status(500).json({
        success: false,
        message: 'Stripe plan prices are missing on the server.',
      });
    }

    // Validate plan
    const priceId = PLAN_PRICE_IDS[normalizedPlan];
    if (!priceId) {
      return res.status(400).json({
        success: false,
        message: `Invalid plan. Must be 'business' or 'premium'.`,
      });
    }

    const user = req.user;

    // Prevent downgrade via checkout
    if (user.plan === normalizedPlan) {
      return res.status(400).json({
        success: false,
        message: `You are already on the ${plan} plan.`,
      });
    }

    // ── Resolve or create Stripe customer ─────────────────────────────────────
    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      stripeCustomerId = await createOrRefreshStripeCustomer(user);
    }

    // ── Create Checkout session (subscription mode) ────────────────────────────
    let session;
    try {
      session = await createStripeCheckoutSession({
        customerId: stripeCustomerId,
        priceId,
        user,
        plan: normalizedPlan,
      });
    } catch (err) {
      if (stripeCustomerId && isStaleStripeCustomerError(err)) {
        console.warn('[createCheckoutSession] Recreating stale Stripe customer:', user._id.toString());
        await User.findByIdAndUpdate(user._id, { stripeCustomerId: null });
        stripeCustomerId = await createOrRefreshStripeCustomer(user);
        session = await createStripeCheckoutSession({
          customerId: stripeCustomerId,
          priceId,
          user,
          plan: normalizedPlan,
        });
      } else {
        throw err;
      }
    }

    res.json({ success: true, url: session.url });
  } catch (err) {
    console.error('[createCheckoutSession]', {
      message: err.message,
      code: err.code,
      rawCode: err.raw?.code,
      type: err.type,
    });
    res.status(500).json({
      success: false,
      message: err?.message || 'Failed to create checkout session.',
    });
  }
};

// ───────────────────────────────────────────────────────────────────────────────
// @desc    Stripe webhook receiver — ONLY place that updates plan in DB
// @route   POST /api/billing/webhook
// @access  Public (Stripe — verified by signature)
//
// IMPORTANT: This route requires raw body (not JSON-parsed).
//            It must be registered BEFORE express.json() in index.js.
// ───────────────────────────────────────────────────────────────────────────────
const handleWebhook = async (req, res) => {
  const stripe = getStripeClient();
  if (!stripe) {
    return res.status(500).json({
      success: false,
      message: 'Stripe is not configured on the server.',
    });
  }

  const sig = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    // Verify the event came from Stripe (protects against spoofing)
    event = stripe.webhooks.constructEvent(req.body, sig, secret);
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', err.message);
    return res.status(400).json({ success: false, message: `Webhook error: ${err.message}` });
  }

  console.log(`[Webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {

      // ── Payment succeeded → activate plan ──────────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object;

        // Only handle subscription checkouts
        if (session.mode !== 'subscription') break;

        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;           // 'business' | 'premium'
        const subId = session.subscription;
        const custId = session.customer;

        if (!userId || !plan) {
          console.error('[Webhook] Missing metadata in session:', session.id);
          break;
        }

        await User.findByIdAndUpdate(userId, {
          plan,
          stripeCustomerId: custId,
          stripeSubscriptionId: subId,
          subscriptionStatus: 'active',
        });

        console.log(`[Webhook] ✓ Upgraded user ${userId} to ${plan}`);
        break;
      }

      // ── Subscription renewed (keep status fresh) ───────────────────────────
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const subId = invoice.subscription;
        if (!subId) break;

        await User.findOneAndUpdate(
          { stripeSubscriptionId: subId },
          { subscriptionStatus: 'active' }
        );
        break;
      }

      // ── Payment failed → mark as past_due ─────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subId = invoice.subscription;
        if (!subId) break;

        await User.findOneAndUpdate(
          { stripeSubscriptionId: subId },
          { subscriptionStatus: 'past_due' }
        );
        console.log(`[Webhook] ⚠ Payment failed for subscription ${subId}`);
        break;
      }

      // ── Subscription cancelled → downgrade to Free ─────────────────────────
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const subId = sub.id;

        await User.findOneAndUpdate(
          { stripeSubscriptionId: subId },
          {
            plan: 'free',
            subscriptionStatus: 'canceled',
            stripeSubscriptionId: null,
          }
        );
        console.log(`[Webhook] ✓ Downgraded subscription ${subId} to free`);
        break;
      }

      // ── Subscription status changed (paused, unpaid, etc.) ─────────────────
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const subId = sub.id;
        const status = sub.status; // 'active' | 'past_due' | 'unpaid' | 'trialing'

        const update = { subscriptionStatus: status };

        // If the subscription is no longer active in any way, downgrade plan
        if (!['active', 'trialing'].includes(status)) {
          update.plan = 'free';
        } else {
          // Re-derive plan from price ID in case of plan switch
          const priceId = sub.items?.data?.[0]?.price?.id;
          const mappedPlan = priceIdToPlan()[priceId];
          if (mappedPlan) update.plan = mappedPlan;
        }

        await User.findOneAndUpdate({ stripeSubscriptionId: subId }, update);
        console.log(`[Webhook] ✓ Updated subscription ${subId} → status: ${status}`);
        break;
      }

      default:
        // Unhandled event — log and acknowledge
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error(`[Webhook] Error handling ${event.type}:`, err.message);
    // Return 200 so Stripe doesn't retry infinitely for DB errors
    return res.status(200).json({ received: true, warning: err.message });
  }

  res.status(200).json({ received: true });
};

// ───────────────────────────────────────────────────────────────────────────────
// @desc    Get current billing/subscription status for the logged-in user
// @route   GET /api/billing/status
// @access  Private (protect)
// ───────────────────────────────────────────────────────────────────────────────
const getBillingStatus = async (req, res) => {
  try {
    const user = req.user;
    res.json({
      success: true,
      data: {
        plan: user.plan || 'free',
        subscriptionStatus: user.subscriptionStatus || null,
        stripeSubscriptionId: user.stripeSubscriptionId || null,
      },
    });
  } catch (err) {
    console.error('[getBillingStatus]', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createCheckoutSession, handleWebhook, getBillingStatus };
