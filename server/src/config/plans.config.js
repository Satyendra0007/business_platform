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
 * Business & Premium users are always on Phase 0 (no restrictions).
 */

const PLANS = {
  free: {
    name: 'Free',
    badge: 'Starter',
    price: '€0',
    maxActiveDeals:   1,          // max deals not in 'closed' state
    maxTotalDeals:    3,          // max deals ever created (including closed)
    maxChats:         Infinity,   // chat gated by phase, not a simple count
    maxDocuments:     Infinity,   // docs gated by phase, not a count
    shippingPriority: 0,
  },
  business: {
    name: 'Business',
    badge: 'Scale',
    price: '€49 / month',
    maxActiveDeals:   5,
    maxTotalDeals:    Infinity,
    maxChats:         5,          // max active chat threads
    maxDocuments:     50,
    shippingPriority: 1,
  },
  premium: {
    name: 'Premium',
    badge: 'Pro',
    price: '€99 / month',
    maxActiveDeals:   Infinity,
    maxTotalDeals:    Infinity,
    maxChats:         Infinity,
    maxDocuments:     Infinity,
    shippingPriority: 2,          // bids sorted first
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
 * Business and Premium users always return phase 0 (no restrictions).
 *
 * Phase 0 → paid plan (Business / Premium) — no restrictions, skip all phase checks
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
