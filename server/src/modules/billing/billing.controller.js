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

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
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

// ───────────────────────────────────────────────────────────────────────────────
// @desc    Create a Stripe Checkout session for a subscription upgrade
// @route   POST /api/billing/create-checkout-session
// @access  Private (protect)
// ───────────────────────────────────────────────────────────────────────────────
const createCheckoutSession = async (req, res) => {
  try {
    const { plan } = req.body;

    // Validate plan
    const priceId = PLAN_PRICE_IDS[plan?.toLowerCase()];
    if (!priceId) {
      return res.status(400).json({
        success: false,
        message: `Invalid plan. Must be 'business' or 'premium'.`,
      });
    }

    const user = req.user;

    // Prevent downgrade via checkout
    if (user.plan === plan?.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: `You are already on the ${plan} plan.`,
      });
    }

    // ── Resolve or create Stripe customer ─────────────────────────────────────
    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: { userId: user._id.toString() },
      });
      stripeCustomerId = customer.id;
      // Persist immediately so we don't create duplicates on retry
      await User.findByIdAndUpdate(user._id, { stripeCustomerId });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // ── Create Checkout session (subscription mode) ────────────────────────────
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { userId: user._id.toString(), plan: plan.toLowerCase() },
      // Allow customers to change quantity or switch plans during checkout
      allow_promotion_codes: true,
      success_url: `${frontendUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/pricing?canceled=1`,
    });

    res.json({ success: true, url: session.url });
  } catch (err) {
    console.error('[createCheckoutSession]', err.message);
    res.status(500).json({ success: false, message: 'Failed to create checkout session.' });
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
