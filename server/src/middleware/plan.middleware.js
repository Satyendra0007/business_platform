/**
 * plan.middleware.js
 *
 * Unified middleware for plan limits + freemium phase access control.
 *
 * Phase system (FREE users only — Business/Premium skip all phase checks):
 *   Phase 1 (totalDeals <= 1): Full access — trial deal
 *   Phase 2 (totalDeals 2–3): Features work, response includes upgradeNudge: true
 *   Phase 3 (totalDeals >= 3): Chat / docs / timeline / shipping BLOCKED
 *
 * All block responses return HTTP 403 with a consistent shape:
 *   { success: false, code, message, plan, phase, limit, current }
 */

const Deal    = require('../modules/deal/deal.model');
const Message = require('../modules/chat/message.model');
const { getPlan, isUnlimited, getPhase, PHASE_INFO, isFeatureBlocked } = require('../config/plans.config');

// ─── Shared response helpers ──────────────────────────────────────────────────

const UPGRADE_MESSAGE = 'To continue and secure your deal, upgrade your plan.';

const limitResponse = (res, { code, message, plan, phase = null, limit = null, current = null }) =>
  res.status(403).json({
    success: false,
    code,
    message,
    plan,
    phase,
    limit:   limit !== null && !isUnlimited(limit) ? limit : 'unlimited',
    current,
  });

// ─── Core helper: get total deals for a company ───────────────────────────────

const getTotalDeals = async (companyId) =>
  Deal.countDocuments({
    isDeleted: false,
    $or: [{ buyerCompanyId: companyId }, { supplierCompanyId: companyId }]
  });

const getActiveDeals = async (companyId) =>
  Deal.countDocuments({
    isDeleted: false,
    status: { $ne: 'closed' },
    $or: [{ buyerCompanyId: companyId }, { supplierCompanyId: companyId }]
  });

// ─── MIDDLEWARE 1: checkDealLimit ─────────────────────────────────────────────
/**
 * Blocks POST /deals when the user has hit their plan's deal limits.
 * Also enforces the Free phase system:
 *   - Free users hitting maxTotalDeals (3) get the phase-3 conversion message.
 *   - Free users hitting maxActiveDeals (1) get an "upgrade or close" message.
 *
 * Requires: req.user.companyId, req.user.plan
 */
const checkDealLimit = async (req, res, next) => {
  try {
    if (!req.user.companyId) return next();

    const plan       = req.user.plan || 'free';
    const planConfig = getPlan(plan);
    const companyId  = req.user.companyId;

    // ── Total deal cap ───────────────────────────────────────────────────────
    if (!isUnlimited(planConfig.maxTotalDeals)) {
      const totalDeals = await getTotalDeals(companyId);

      if (totalDeals >= planConfig.maxTotalDeals) {
        const phase = getPhase(plan, totalDeals);
        return limitResponse(res, {
          code:    'PLAN_LIMIT_TOTAL_DEALS',
          message: plan === 'free'
            ? UPGRADE_MESSAGE
            : `Your ${planConfig.name} plan allows a maximum of ${planConfig.maxTotalDeals} total deals. Upgrade to create more.`,
          plan,
          phase,
          limit:   planConfig.maxTotalDeals,
          current: totalDeals,
        });
      }
    }

    // ── Active deal cap ──────────────────────────────────────────────────────
    if (!isUnlimited(planConfig.maxActiveDeals)) {
      const activeDeals = await getActiveDeals(companyId);

      if (activeDeals >= planConfig.maxActiveDeals) {
        return limitResponse(res, {
          code:    'PLAN_LIMIT_ACTIVE_DEALS',
          message: plan === 'free'
            ? 'Unlock full deal execution to proceed. Close your current deal or upgrade your plan.'
            : `Your ${planConfig.name} plan allows ${planConfig.maxActiveDeals} active deal${planConfig.maxActiveDeals === 1 ? '' : 's'} at a time. Upgrade to manage more.`,
          plan,
          phase:   null,
          limit:   planConfig.maxActiveDeals,
          current: activeDeals,
        });
      }
    }

    next();
  } catch (err) {
    console.error('[checkDealLimit]', err.message);
    next(); // fail open — never block on system error
  }
};

// ─── MIDDLEWARE 2: checkPhaseAccess(featureType) ──────────────────────────────
/**
 * Factory middleware — returns a middleware that enforces phase-based feature access.
 *
 * featureType: 'chat' | 'documents' | 'timeline' | 'shipping'
 *
 * Behavior:
 *   Phase 0 (paid): Allow, no modification
 *   Phase 1:        Allow, no modification
 *   Phase 2:        Allow, attach { upgradeNudge: true, nudgeMessage } to req for controller use
 *   Phase 3:        BLOCK with 403 + UPGRADE_MESSAGE
 *
 * Requires: req.user.companyId, req.user.plan
 */
const checkPhaseAccess = (featureType) => async (req, res, next) => {
  try {
    const plan = req.user.plan || 'free';

    // Paid users bypass all phase checks
    if (plan !== 'free') return next();

    const companyId  = req.user.companyId;
    if (!companyId) return next(); // no company — let controller handle it

    const totalDeals = await getTotalDeals(companyId);
    const phase      = getPhase(plan, totalDeals);
    const phaseInfo  = PHASE_INFO[phase];

    // Phase 3: hard block
    if (isFeatureBlocked(phase, featureType)) {
      return limitResponse(res, {
        code:    `PHASE_LOCKED_${featureType.toUpperCase()}`,
        message: UPGRADE_MESSAGE,
        plan,
        phase,
        limit:   null,
        current: totalDeals,
      });
    }

    // Phase 2: allow but attach nudge info — controllers can include this in responses
    if (phaseInfo.nudge) {
      req.upgradeNudge = {
        phase,
        message: phaseInfo.nudgeMessage,
      };
    }

    next();
  } catch (err) {
    console.error(`[checkPhaseAccess:${featureType}]`, err.message);
    next(); // fail open
  }
};

// ─── MIDDLEWARE 3: checkChatLimit ─────────────────────────────────────────────
/**
 * For Business users: limits chat to maxChats distinct deal threads.
 * For Free users: phase-based access (handled by checkPhaseAccess — call BOTH).
 * For Premium: no limit.
 *
 * Requires: req.user._id, req.user.plan, req.body.dealId
 */
const checkChatLimit = async (req, res, next) => {
  try {
    const plan       = req.user.plan || 'free';
    const planConfig = getPlan(plan);

    // Free users: chat gated by phase (checkPhaseAccess handles this) — skip count check
    if (plan === 'free') return next();

    if (isUnlimited(planConfig.maxChats)) return next();

    const dealId = req.body.dealId;

    const distinctDeals = await Message.distinct('dealId', {
      senderId:  req.user._id,
      isDeleted: false,
    });

    const alreadyInThisDeal = distinctDeals.some((d) => d.toString() === dealId?.toString());
    if (alreadyInThisDeal) return next();

    if (distinctDeals.length >= planConfig.maxChats) {
      return limitResponse(res, {
        code:    'PLAN_LIMIT_CHAT',
        message: `Your ${planConfig.name} plan allows messaging in up to ${planConfig.maxChats} deal thread${planConfig.maxChats === 1 ? '' : 's'}. Upgrade to unlock more.`,
        plan,
        phase:   null,
        limit:   planConfig.maxChats,
        current: distinctDeals.length,
      });
    }

    next();
  } catch (err) {
    console.error('[checkChatLimit]', err.message);
    next();
  }
};

// ─── MIDDLEWARE 4: checkDocumentLimit ─────────────────────────────────────────
/**
 * For Business users: limits documents to maxDocuments per company.
 * For Free users: phase-based access (checkPhaseAccess handles this).
 * For Premium: no limit.
 *
 * Requires: req.user.companyId, req.user.plan
 */
const checkDocumentLimit = async (req, res, next) => {
  try {
    const plan       = req.user.plan || 'free';
    const planConfig = getPlan(plan);

    // Free users: docs gated by phase (checkPhaseAccess handles this)
    if (plan === 'free') return next();

    if (isUnlimited(planConfig.maxDocuments)) return next();

    const Company = require('../modules/company/company.model');
    const company  = await Company.findById(req.user.companyId).select('documents').lean();

    if (!company) return next();

    const currentCount = (company.documents || []).length;

    if (currentCount >= planConfig.maxDocuments) {
      return limitResponse(res, {
        code:    'PLAN_LIMIT_DOCUMENTS',
        message: `Your ${planConfig.name} plan allows up to ${planConfig.maxDocuments} documents. Remove old ones or upgrade.`,
        plan,
        phase:   null,
        limit:   planConfig.maxDocuments,
        current: currentCount,
      });
    }

    next();
  } catch (err) {
    console.error('[checkDocumentLimit]', err.message);
    next();
  }
};

module.exports = {
  checkDealLimit,
  checkPhaseAccess,
  checkChatLimit,
  checkDocumentLimit,
};
