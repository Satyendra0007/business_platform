/**
 * useUpgradeModal.js
 *
 * Handles upgrade modal state and intercepts plan/phase limit API errors.
 *
 * Usage:
 *   const { showUpgrade, hideUpgrade, UpgradeModalElement } = useUpgradeModal();
 *
 *   // Auto-detect plan limit errors:
 *   const result = await guardAction(() => api.post('/deals', data));
 *
 *   // Or manually trigger for a specific feature:
 *   showUpgrade('PHASE_LOCKED_CHAT', 'To continue...');
 */
import React, { useState, useCallback } from 'react';
import UpgradeModal from '../components/plan/UpgradeModal';
import { useAuth } from './useAuth';
import { PLAN_LIMIT_CODES } from '../lib/plans.config';

const CODE_TO_REASON = {
  PLAN_LIMIT_ACTIVE_DEALS:  'activeDeals',
  PLAN_LIMIT_TOTAL_DEALS:   'totalDeals',
  PLAN_LIMIT_CHAT:          'chats',
  PLAN_LIMIT_DOCUMENTS:     'documents',
  PHASE_LOCKED_CHAT:        'phase_chat',
  PHASE_LOCKED_DOCUMENTS:   'phase_documents',
  PHASE_LOCKED_TIMELINE:    'phase_timeline',
  PHASE_LOCKED_SHIPPING:    'phase_shipping',
};

export function useUpgradeModal() {
  const { user } = useAuth();
  const [modal, setModal] = useState({ isOpen: false, reason: 'generic', message: '' });

  const showUpgrade = useCallback((code, message) => {
    const reason = CODE_TO_REASON[code] || 'generic';
    setModal({ isOpen: true, reason, message: message || '' });
  }, []);

  const hideUpgrade = useCallback(() => {
    setModal((m) => ({ ...m, isOpen: false }));
  }, []);

  /**
   * Wraps an async action. If it throws/returns a plan/phase limit error, opens the modal.
   * Otherwise re-throws for normal error handling.
   */
  const guardAction = useCallback(async (fn) => {
    try {
      return await fn();
    } catch (err) {
      // Axios error shape
      const data = err?.response?.data;
      const code = data?.code || err?.code;

      if (code && (code.startsWith('PLAN_LIMIT') || code.startsWith('PHASE_LOCKED'))) {
        showUpgrade(code, data?.message || err?.message);
        return null; // signal to caller that action was blocked
      }
      throw err; // re-throw unrelated errors
    }
  }, [showUpgrade]);

  const UpgradeModalElement = (
    <UpgradeModal
      isOpen={modal.isOpen}
      onClose={hideUpgrade}
      reason={modal.reason}
      message={modal.message}
      plan={user?.plan || 'free'}
    />
  );

  return { upgradeModal: modal, showUpgrade, hideUpgrade, guardAction, UpgradeModalElement };
}
