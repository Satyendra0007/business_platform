/**
 * UpgradeModal.jsx
 *
 * Shown when a user hits a plan limit OR a phase lock.
 * Uses the PDF-specified UX copy — no technical language.
 *
 * Props:
 *   isOpen   — boolean
 *   onClose  — () => void
 *   reason   — plan limit or phase reason (see REASON_CONFIG keys)
 *   message  — optional override message from API
 *   plan     — user's current plan key
 */
import React, { useState } from 'react';
import {
  X, ArrowRight, Star, Layers, FileText,
  MessageSquare, Ship, TrendingUp, Zap, ShieldCheck, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PLANS } from '../../lib/plans.config';
import { createCheckoutSession } from '../../lib/billingService';

const REASON_CONFIG = {
  // Plan-count limits
  activeDeals: {
    icon: Layers,
    title: 'Active Deal Limit Reached',
    copy: 'Complete your deal without interruption.',
    detail: 'Close an existing deal or upgrade to manage more simultaneously.',
    color: 'blue',
    isPhase: false,
  },
  totalDeals: {
    icon: TrendingUp,
    title: 'Upgrade to Continue',
    copy: 'To continue and secure your deal, upgrade your plan.',
    detail: "You've used all 3 deal slots on the Free plan. Upgrade to keep going.",
    color: 'blue',
    isPhase: true,
  },
  chats: {
    icon: MessageSquare,
    title: 'Chat Limit Reached',
    copy: 'Unlock full deal execution to proceed.',
    detail: 'Upgrade to unlock messaging on unlimited deal threads.',
    color: 'emerald',
    isPhase: false,
  },
  documents: {
    icon: FileText,
    title: 'Document Limit Reached',
    copy: 'Unlock full deal execution to proceed.',
    detail: 'Upgrade to store unlimited documents for all your deals.',
    color: 'violet',
    isPhase: false,
  },
  // Phase locks (freemium)
  phase_chat: {
    icon: MessageSquare,
    title: 'Upgrade to Keep Chatting',
    copy: 'To continue and secure your deal, upgrade your plan.',
    detail: 'Chat is limited on the Free plan after your first deal.',
    color: 'emerald',
    isPhase: true,
  },
  phase_documents: {
    icon: FileText,
    title: 'Upgrade to Upload Documents',
    copy: 'To continue and secure your deal, upgrade your plan.',
    detail: 'Document management requires a Business or Premium plan after your trial deal.',
    color: 'violet',
    isPhase: true,
  },
  phase_timeline: {
    icon: TrendingUp,
    title: 'Upgrade to Progress Your Deal',
    copy: 'To continue and secure your deal, upgrade your plan.',
    detail: 'Deal milestone updates require an upgraded plan after your first deal.',
    color: 'blue',
    isPhase: true,
  },
  phase_shipping: {
    icon: Ship,
    title: 'Upgrade for Shipping Access',
    copy: 'To continue and secure your deal, upgrade your plan.',
    detail: 'Shipping bid interactions require a Business or Premium plan.',
    color: 'sky',
    isPhase: true,
  },
  generic: {
    icon: Zap,
    title: 'Upgrade Your Plan',
    copy: 'Unlock full deal execution to proceed.',
    detail: 'Upgrade to Business or Premium to unlock this feature.',
    color: 'amber',
    isPhase: false,
  },
};

const COLOR_MAP = {
  blue:    { ring: 'ring-blue-100',    icon: 'bg-blue-50 border-blue-200 text-blue-600'   },
  emerald: { ring: 'ring-emerald-100', icon: 'bg-emerald-50 border-emerald-200 text-emerald-600' },
  violet:  { ring: 'ring-violet-100',  icon: 'bg-violet-50 border-violet-200 text-violet-600'  },
  sky:     { ring: 'ring-sky-100',     icon: 'bg-sky-50 border-sky-200 text-sky-600'      },
  amber:   { ring: 'ring-amber-100',   icon: 'bg-amber-50 border-amber-200 text-amber-600'   },
};

const UPGRADE_TARGETS = ['business', 'premium'];

export default function UpgradeModal({ isOpen, onClose, reason = 'generic', message, plan = 'free' }) {
  const navigate = useNavigate();
  const [loading, setLoading]   = useState(null); // planKey being processed
  const [error,   setError]     = useState('');

  if (!isOpen) return null;

  const handleUpgrade = async (planKey) => {
    try {
      setError('');
      setLoading(planKey);
      const url = await createCheckoutSession(planKey);
      // Redirect browser to Stripe Checkout — plan update happens via webhook only
      window.location.assign(url);
    } catch (err) {
      console.error('[UpgradeModal] checkout error:', err);
      setError(err?.response?.data?.message || 'Could not start checkout. Please try again.');
      setLoading(null);
    }
  };

  const config  = REASON_CONFIG[reason] || REASON_CONFIG.generic;
  const Icon    = config.icon;
  const colors  = COLOR_MAP[config.color] || COLOR_MAP.amber;
  const displayMessage = message || config.copy;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl mx-auto px-4 overflow-y-auto max-h-[90vh] rounded-[32px] bg-white shadow-[0_40px_120px_rgba(15,23,42,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient top bar */}
        <div className="h-1.5 w-full bg-[linear-gradient(90deg,#0A2540_0%,#245c9d_50%,#E5A93D_100%)]" />

        <div className="px-7 py-7">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Icon */}
          <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl border ring-4 ${colors.icon} ${colors.ring}`}>
            <Icon className="h-6 w-6" />
          </div>

          {/* Copy */}
          <h2 className="mt-5 text-xl font-black tracking-tight text-slate-900">
            {config.title}
          </h2>
          {/* Primary CTA copy — matches PDF spec */}
          <p className="mt-2 font-semibold text-[#0A2540] text-sm">
            "{displayMessage}"
          </p>
          <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
            {config.detail}
          </p>

          {/* Phase indicator */}
          {config.isPhase && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-2.5">
              <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0" />
              <p className="text-xs font-semibold text-amber-800">
                You've completed your free trial deal. Upgrade to keep your momentum.
              </p>
            </div>
          )}

          {/* Current plan */}
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
            Current plan: <span className="font-black text-slate-900 uppercase">{plan}</span>
          </div>

          {/* Upgrade options — clicking a card starts Stripe Checkout */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6">
            {UPGRADE_TARGETS.filter((p) => p !== plan).map((planKey) => {
              const p = PLANS[planKey];
              const isPremium = planKey === 'premium';
              const isLoading = loading === planKey;
              return (
                <button
                  key={planKey}
                  id={`upgrade-modal-${planKey}-btn`}
                  onClick={() => handleUpgrade(planKey)}
                  disabled={!!loading}
                  className={`relative overflow-hidden rounded-[22px] border p-6 flex flex-col justify-between h-full bg-white shadow text-left transition hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed ${
                    isPremium
                      ? 'border-[#D8B35C]/40 bg-[linear-gradient(160deg,#0F2745,#0B1E36)]'
                      : 'border-blue-100 bg-[linear-gradient(160deg,#f0f8ff,#e8f4fd)]'
                  }`}
                >
                  {isPremium && (
                    <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-amber-400/20 blur-xl" />
                  )}
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-black uppercase tracking-[0.18em] ${isPremium ? 'text-amber-300' : 'text-[#245c9d]'}`}>
                        {p.name}
                      </span>
                      {isPremium && (
                        <span className="rounded-full border border-amber-300/40 bg-amber-400/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.15em] text-amber-200">
                          Recommended
                        </span>
                      )}
                    </div>
                    <div className={`mt-1 text-base font-black ${isPremium ? 'text-white' : 'text-[#0A2540]'}`}>
                      {p.price}
                    </div>
                    <ul className={`mt-2 space-y-1 text-[11px] ${isPremium ? 'text-sky-100/80' : 'text-slate-600'}`}>
                      <li>→ {isFinite(p.maxActiveDeals) ? `${p.maxActiveDeals} active deals` : 'Unlimited deals'}</li>
                      <li>→ {isFinite(p.maxChats) ? `${p.maxChats} chat threads` : 'Unlimited chat'}</li>
                      <li>→ {isFinite(p.maxDocuments) ? `${p.maxDocuments} docs` : 'Unlimited docs'}</li>
                      {isPremium && <li>→ Priority shipping bids</li>}
                    </ul>
                    {isLoading && (
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-white/70">
                        <Loader2 className="h-3 w-3 animate-spin" /> Redirecting to Stripe…
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Inline error */}
          {error && (
            <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-center text-xs font-semibold text-rose-600">
              {error}
            </p>
          )}

          {/* Primary CTA — view all plans on /premium-plans */}
          <button
            id="upgrade-modal-view-plans-btn"
            onClick={() => { onClose(); navigate('/premium-plans'); }}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E5A93D] py-3.5 text-sm font-black text-[#0A2540] transition hover:bg-[#d49530] hover:-translate-y-0.5 active:translate-y-0"
          >
            <Star className="h-4 w-4" /> View Full Plans <ArrowRight className="h-4 w-4" />
          </button>
          <p className="mt-3 text-center text-[11px] text-slate-400">
            Click a plan above to upgrade instantly via Stripe.
          </p>
        </div>
      </div>
    </div>
  );
}
