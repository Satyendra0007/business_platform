/**
 * PlanStatusBanner.jsx
 *
 * Dashboard banner: shows current plan, freemium phase, and live deal counts.
 * Phase 1 (trial) → blue info tone
 * Phase 2 (soft)  → amber nudge with upgrade CTA
 * Phase 3 (locked)→ rose warning with urgent upgrade CTA
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers, ArrowRight, Star, Sparkles, Building2,
  TrendingUp, ShieldCheck, AlertTriangle, BadgeCheck
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getPlan, getPhase, PHASE_INFO, isUnlimited, formatLimit } from '../../lib/plans.config';
import api from '../../lib/api';

// ─── Usage meter ─────────────────────────────────────────────────────────────
function UsageMeter({ label, used, limit, atLimit }) {
  const pct = isUnlimited(limit) ? 0 : Math.min((used / limit) * 100, 100);
  return (
    <div className={`rounded-2xl border px-3 py-2.5 ${atLimit ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-slate-50/80'}`}>
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[10px] font-bold uppercase tracking-[0.16em] ${atLimit ? 'text-rose-600' : 'text-slate-500'}`}>{label}</span>
        <span className={`text-xs font-black tabular-nums ${atLimit ? 'text-rose-700' : 'text-slate-700'}`}>
          {used} / {formatLimit(limit)}
        </span>
      </div>
      {!isUnlimited(limit) && (
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-500 ${atLimit ? 'bg-rose-500' : pct > 70 ? 'bg-amber-400' : 'bg-[#245c9d]'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Phase badge ─────────────────────────────────────────────────────────────
const PHASE_BADGE = {
  0: { label: 'Full access',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: BadgeCheck },
  1: { label: 'Trial deal',      cls: 'bg-blue-50 text-blue-700 border-blue-200',         icon: BadgeCheck },
  2: { label: 'Soft limitation', cls: 'bg-amber-50 text-amber-700 border-amber-200',      icon: AlertTriangle },
  3: { label: 'Action required', cls: 'bg-rose-50 text-rose-700 border-rose-200',         icon: AlertTriangle },
};

const PLAN_ICON   = { free: Sparkles, business: Building2, premium: Star };
const PLAN_STYLES = {
  free:     { shell: 'border-slate-200 bg-white' },
  business: { shell: 'border-blue-100 bg-[linear-gradient(135deg,#f0f8ff,#f8fbff)]' },
  premium:  { shell: 'border-amber-200 bg-[linear-gradient(135deg,#fffbf0,#fff8e6)]' },
};

export default function PlanStatusBanner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.roles?.includes('admin');

  const [totalDeals,  setTotalDeals]  = useState(0);
  const [activeDeals, setActiveDeals] = useState(0);
  const [loading,     setLoading]     = useState(true);

  const rawPlanKey = user?.subscriptionPlan || user?.plan || 'free';
  const planKey    = String(rawPlanKey).toLowerCase().trim();
  const planConfig = getPlan(planKey);
  const phase      = getPhase(planKey, totalDeals);
  const phaseInfo  = PHASE_INFO[phase];

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        // Two parallel calls: total deals and closed deals
        // activeDeals = total - closed (closest we can get without a dedicated stats endpoint)
        const [totalRes, closedRes] = await Promise.all([
          api.get('/deals?limit=1').catch(() => ({ data: { total: 0 } })),
          api.get('/deals?limit=1&status=closed').catch(() => ({ data: { total: 0 } })),
        ]);

        const total  = totalRes.data?.total  ?? 0;
        const closed = closedRes.data?.total ?? 0;
        const active = Math.max(0, total - closed);

        if (!cancelled) {
          setTotalDeals(total);
          setActiveDeals(active);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Admins don't see this banner
  if (isAdmin) return null;

  const PlanIcon     = PLAN_ICON[planKey]   || Sparkles;
  const styles       = PLAN_STYLES[planKey] || PLAN_STYLES.free;
  const phaseBadge   = PHASE_BADGE[phase]   || PHASE_BADGE[0];
  const PhaseBadgeIcon = phaseBadge.icon;
  const showUpgradeCTA = planKey === 'free';
  const isPhase3     = phase === 3;
  const isPhase2     = phase === 2;

  return (
    <div className={`overflow-hidden rounded-[26px] border p-5 shadow-sm transition-all ${styles.shell} ${isPhase3 ? 'ring-1 ring-rose-300' : ''}`}>
      <div className="flex flex-col gap-4">

        {/* ── Row 1: Plan identity + phase badge + CTA ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
              planKey === 'premium' ? 'bg-amber-100 text-amber-600' :
              planKey === 'business' ? 'bg-blue-100 text-blue-600' :
              'bg-slate-100 text-slate-600'
            }`}>
              <PlanIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-black text-slate-900">{planConfig.name} Plan</p>
                {/* Phase badge — only for free users */}
                {planKey === 'free' && (
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] ${phaseBadge.cls}`}>
                    <PhaseBadgeIcon className="h-3 w-3" />
                    Phase {phase} · {phaseBadge.label}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                {planKey === 'premium'
                  ? 'Unlimited deals, chats, and documents — priority shipping.'
                  : planKey === 'business'
                  ? `€49/month · Max ${planConfig.maxActiveDeals} active deals.`
                  : phaseInfo.description}
              </p>
            </div>
          </div>

          {showUpgradeCTA && (
            <button
              onClick={() => navigate('/premium-plans')}
              className={`inline-flex shrink-0 items-center gap-2 self-start rounded-2xl px-4 py-2.5 text-xs font-bold text-white transition hover:-translate-y-0.5 sm:self-center ${
                isPhase3
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : isPhase2
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-[#0A2540] hover:bg-[#143a6a]'
              }`}
            >
              {isPhase3 ? <AlertTriangle className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
              {isPhase3 ? 'Upgrade Now' : 'Upgrade Plan'}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* ── Phase 2/3 nudge banner ── */}
        {(isPhase2 || isPhase3) && (
          <div className={`flex items-start gap-3 rounded-2xl px-4 py-3 ${
            isPhase3
              ? 'border border-rose-200 bg-rose-50'
              : 'border border-amber-200 bg-amber-50'
          }`}>
            {isPhase3
              ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
              : <ShieldCheck   className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />}
            <p className={`text-xs font-semibold ${isPhase3 ? 'text-rose-800' : 'text-amber-800'}`}>
              {isPhase3
                ? 'To continue and secure your deal, upgrade your plan. Chat, documents, timeline, and shipping are locked.'
                : 'Upgrade to continue managing deals efficiently. You have used all your free deal slots.'}
            </p>
          </div>
        )}

        {/* ── Usage meters ── */}
        {!loading && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
            <UsageMeter
              label="Active Deals"
              used={activeDeals}
              limit={planConfig.maxActiveDeals}
              atLimit={isUnlimited(planConfig.maxActiveDeals) ? false : activeDeals >= planConfig.maxActiveDeals}
            />
            <UsageMeter
              label="Total Deals"
              used={totalDeals}
              limit={planConfig.maxTotalDeals}
              atLimit={isUnlimited(planConfig.maxTotalDeals) ? false : totalDeals >= planConfig.maxTotalDeals}
            />
          </div>
        )}
      </div>
    </div>
  );
}
