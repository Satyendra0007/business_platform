/**
 * trustScore.js
 *
 * Lightweight utility to compute a company's trust score (0-100)
 * and whether it qualifies for a marketplace visibility boost.
 *
 * Inputs (from user + company documents):
 *   - isVerified  (+40) — company.verificationStatus === 'verified'
 *   - isPremium   (+30) — user.plan === 'premium' && subscriptionStatus === 'active'
 *   - isActive    (+20) — company.isActive === true
 *   - hasDocuments (+10) — company.documents.length > 0
 *
 * Call this whenever:
 *   - A company's verificationStatus changes
 *   - A user's plan or subscriptionStatus changes
 */

/**
 * @param {Object} opts
 * @param {string} opts.verificationStatus
 * @param {boolean} opts.isActive
 * @param {Array}  opts.documents
 * @param {string} opts.userPlan
 * @param {string} opts.subscriptionStatus
 * @returns {{ score: number, visibilityBoost: boolean }}
 */
function computeTrustScore({ verificationStatus, isActive, documents = [], userPlan, subscriptionStatus }) {
  let score = 0;

  if (verificationStatus === 'verified') score += 40;
  if (userPlan === 'premium' && subscriptionStatus === 'active') score += 30;
  if (isActive) score += 20;
  if (documents && documents.length > 0) score += 10;

  // Visibility boost: Premium + Verified qualifies for marketplace priority
  const visibilityBoost = userPlan === 'premium' && subscriptionStatus === 'active';

  return { score: Math.min(score, 100), visibilityBoost };
}

module.exports = { computeTrustScore };
