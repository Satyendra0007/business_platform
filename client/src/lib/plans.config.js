/**
 * plans.config.js — Frontend (mirrors server/src/config/plans.config.js)
 *
 * Phase system (FREE users only):
 *   Phase 1 → totalDeals <= 1: Full trial access
 *   Phase 2 → totalDeals 2–3: Soft limited (nudge shown, features work)
 *   Phase 3 → totalDeals >= 3: Hard locked (chat, docs, timeline, shipping blocked)
 *
 * Business & Premium → Phase 0 (no restrictions)
 */

export const PLANS = {
  free: {
    name: 'Free',
    badge: 'Starter',
    price: '€0',
    color: 'slate',
    maxActiveDeals:   1,
    maxTotalDeals:    3,
    maxChats:         Infinity,   // gated by phase
    maxDocuments:     Infinity,   // gated by phase
    shippingPriority: 0,
  },
  business: {
    name: 'Business',
    badge: 'Scale',
    price: '€49 / month',
    color: 'blue',
    maxActiveDeals:   5,
    maxTotalDeals:    Infinity,
    maxChats:         5,
    maxDocuments:     50,
    shippingPriority: 1,
  },
  premium: {
    name: 'Premium',
    badge: 'Pro',
    price: '€99 / month',
    color: 'amber',
    maxActiveDeals:   Infinity,
    maxTotalDeals:    Infinity,
    maxChats:         Infinity,
    maxDocuments:     Infinity,
    shippingPriority: 2,
  },
};

export const getPlan = (planKey) => PLANS[planKey] || PLANS.free;
export const isUnlimited = (value) => !isFinite(value);
export const formatLimit = (value) => (isUnlimited(value) ? 'Unlimited' : value);

/**
 * Determine freemium phase from plan key + total deal count.
 * @param {string} planKey
 * @param {number} totalDeals
 * @returns {0|1|2|3}
 */
export const getPhase = (planKey, totalDeals) => {
  if (planKey !== 'free') return 0;
  if (totalDeals <= 1)    return 1;  // 0–1 deals: full trial
  if (totalDeals < 3)     return 2;  // exactly 2 deals: soft limit + nudge
  return 3;                          // 3 deals (at cap): hard lock — conversion trigger
};

export const PHASE_INFO = {
  0: { label: 'Full access',     color: 'emerald', description: 'No restrictions on your plan.' },
  1: { label: 'Trial deal',      color: 'blue',    description: 'Full platform access on your first deal.' },
  2: { label: 'Soft limitation', color: 'amber',   description: 'Upgrade to continue managing deals efficiently.' },
  3: { label: 'Upgrade required',color: 'rose',    description: 'To continue and secure your deal, upgrade your plan.' },
};

/** Error codes returned by the backend check middleware */
export const PLAN_LIMIT_CODES = {
  PLAN_LIMIT_TOTAL_DEALS:   { reason: 'totalDeals',  feature: null },
  PLAN_LIMIT_ACTIVE_DEALS:  { reason: 'activeDeals', feature: null },
  PLAN_LIMIT_CHAT:          { reason: 'chats',       feature: 'chat' },
  PLAN_LIMIT_DOCUMENTS:     { reason: 'documents',   feature: 'documents' },
  PHASE_LOCKED_CHAT:        { reason: 'phase',       feature: 'chat' },
  PHASE_LOCKED_DOCUMENTS:   { reason: 'phase',       feature: 'documents' },
  PHASE_LOCKED_TIMELINE:    { reason: 'phase',       feature: 'timeline' },
  PHASE_LOCKED_SHIPPING:    { reason: 'phase',       feature: 'shipping' },
};
