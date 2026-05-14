/**
 * plans.config.js
 *
 * Single source of truth for all plan limits and the freemium phase system.
 *
 * Plan identifiers: 'free' | 'business' | 'premium'
 *
 * Phase system (FREE users only — based on total deals ever created):
 *   Phase 1 → totalDeals <= 1 : Full access (trial deal)
 *   Phase 2 → totalDeals 2–3  : Soft limits  (features work, upgrade nudge shown)
 *   Phase 3 → totalDeals >= 3 : Hard lock    (chat / docs / timeline / shipping blocked)
 *
 * Activate & Premium users are always on Phase 0 (no restrictions).
 */

const PLANS = {
  free: {
    name: 'Buyer Access',
    badge: 'Starter',
    price: '$0',
    maxActiveDeals:   1,
    maxTotalDeals:    3,
    maxChats:         Infinity,
    maxDocuments:     Infinity,
    maxProducts:      1,          // onboarding: allows first product, then upgrade required
    shippingPriority: 0,
  },
  business: {
    // DB enum: 'business' — display name: 'Activate'
    name: 'Activate',
    badge: 'Scale',
    price: '$29 / month',
    maxActiveDeals:   5,
    maxTotalDeals:    Infinity,
    maxChats:         5,
    maxDocuments:     50,
    maxProducts:      5,          // Activate plan: up to 5 product listings
    shippingPriority: 1,
  },
  premium: {
    name: 'Premium',
    badge: 'Pro',
    price: '$59 / month',
    maxActiveDeals:   Infinity,
    maxTotalDeals:    Infinity,
    maxChats:         Infinity,
    maxDocuments:     Infinity,
    maxProducts:      Infinity,   // unlimited
    shippingPriority: 2,
  },
};

/**
 * Returns the plan config for a given plan key.
 * Falls back to 'free' for unknown/missing values.
 */
const getPlan = (planKey) => PLANS[planKey] || PLANS.free;

/**
 * Returns true if the value represents "no limit".
 */
const isUnlimited = (value) => !isFinite(value);

/**
 * Determines the freemium phase for a FREE user based on their total deal count.
 * Activate and Premium users always return phase 0 (no restrictions).
 *
 * Phase 0 → paid plan (Activate / Premium) — no restrictions, skip all phase checks
 * Phase 1 → totalDeals <= 1  — full trial experience
 * Phase 2 → totalDeals 2–3  — soft limits, show upgrade nudge
 * Phase 3 → totalDeals >= 3  — hard lock: chat, docs, timeline, shipping blocked
 *
 * @param {string} planKey  — user's plan ('free' | 'business' | 'premium')
 * @param {number} totalDeals — total number of deals the user/company has ever had
 * @returns {0|1|2|3}
 */
const getPhase = (planKey, totalDeals) => {
  if (planKey !== 'free') return 0;           // paid users — no phase restriction
  if (totalDeals <= 1)    return 1;           // 0–1 deals: full trial experience
  if (totalDeals < 3)     return 2;           // exactly 2 deals: soft limitation + nudge
  return 3;                                   // 3 deals (at the cap): hard lock — conversion trigger
};

/**
 * Phase descriptors used in API responses and frontend messaging.
 */
const PHASE_INFO = {
  0: { label: 'No restriction', blocked: false, nudge: false },
  1: { label: 'Full experience', blocked: false, nudge: false },
  2: { label: 'Soft limitation', blocked: false, nudge: true,
       nudgeMessage: 'Upgrade to continue managing deals efficiently.' },
  3: { label: 'Hard lock', blocked: true,  nudge: true,
       nudgeMessage: 'To continue and secure your deal, upgrade your plan.' },
};

/**
 * Returns true if the given phase blocks a feature type.
 * Feature types: 'chat' | 'documents' | 'timeline' | 'shipping'
 * All four are blocked at Phase 3.
 */
const isFeatureBlocked = (phase, featureType) => {
  if (phase < 3) return false;
  const blockedFeatures = ['chat', 'documents', 'timeline', 'shipping'];
  return blockedFeatures.includes(featureType);
};

module.exports = { PLANS, getPlan, isUnlimited, getPhase, PHASE_INFO, isFeatureBlocked };
