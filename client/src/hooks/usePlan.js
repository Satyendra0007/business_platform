/**
 * usePlan.js
 *
 * Hook that exposes the current user's plan config, freemium phase,
 * and helpers to check limits and whether a feature is blocked.
 *
 * Usage:
 *   const { plan, planConfig, phase, phaseInfo, isAtLimit, isBlocked } = usePlan();
 *
 *   // Check if a feature is hard-locked (Phase 3 for free users)
 *   if (isBlocked('chat')) showUpgradeModal();
 *
 *   // Check if a numeric limit is reached
 *   if (isAtLimit('activeDeals', currentActiveCount)) ...
 */
import { useAuth } from './useAuth';
import { getPlan, isUnlimited, getPhase, PHASE_INFO } from '../lib/plans.config';

export function usePlan() {
  const { user } = useAuth();
  const planKey    = user?.plan || 'free';
  const planConfig = getPlan(planKey);

  // totalDeals needs to come from live data; we default to 0 here and let
  // components pass the actual count to getPhase() when they have it.
  // For phase-gated UI (disable buttons etc.) components should call
  // getPhase(planKey, liveTotalDeals) directly.
  const phase     = 0; // computed per-component with live totalDeals
  const phaseInfo = PHASE_INFO[phase] || PHASE_INFO[0];

  /**
   * Returns true if the current value is at or beyond the plan's limit.
   * @param {'activeDeals'|'totalDeals'|'chats'|'documents'} limitKey
   * @param {number} currentValue
   */
  const isAtLimit = (limitKey, currentValue) => {
    const limitMap = {
      activeDeals: planConfig.maxActiveDeals,
      totalDeals:  planConfig.maxTotalDeals,
      chats:       planConfig.maxChats,
      documents:   planConfig.maxDocuments,
    };
    const limit = limitMap[limitKey];
    if (limit === undefined) return false;
    if (isUnlimited(limit)) return false;
    return currentValue >= limit;
  };

  /**
   * Returns true if a feature is hard-blocked at the given phase.
   * Pass the live totalDeals so phase is accurate.
   * @param {'chat'|'documents'|'timeline'|'shipping'} featureType
   * @param {number} totalDeals
   */
  const isBlocked = (featureType, totalDeals = 0) => {
    if (planKey !== 'free') return false;
    const currentPhase = getPhase(planKey, totalDeals);
    if (currentPhase < 3) return false;
    return ['chat', 'documents', 'timeline', 'shipping'].includes(featureType);
  };

  /**
   * Returns true if a Phase 2 nudge should be shown.
   * @param {number} totalDeals
   */
  const isNudgePhase = (totalDeals = 0) => {
    if (planKey !== 'free') return false;
    return getPhase(planKey, totalDeals) === 2;
  };

  return {
    plan:       planKey,
    planConfig,
    phase,
    phaseInfo,
    isAtLimit,
    isBlocked,
    isNudgePhase,
  };
}
