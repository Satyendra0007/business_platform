/**
 * PlanBadge.jsx
 *
 * Compact badge showing the user's current plan.
 * Suitable for dashboard headers, sidebars, nav bars.
 *
 * Props:
 *   plan      — 'free' | 'business' | 'premium'
 *   size      — 'sm' | 'md' (default 'md')
 *   onClick   — optional click handler (e.g. open upgrade modal)
 */
import React from 'react';
import { Sparkles, Building2, Star } from 'lucide-react';
import { getPlan } from '../../lib/plans.config';

const ICON_MAP = { free: Sparkles, business: Building2, premium: Star };

const STYLE_MAP = {
  free: {
    wrapper: 'border-slate-200 bg-slate-50 text-slate-700',
    icon: 'text-slate-500',
    dot: 'bg-slate-400',
  },
  business: {
    wrapper: 'border-blue-200 bg-blue-50 text-blue-800',
    icon: 'text-blue-500',
    dot: 'bg-blue-500',
  },
  premium: {
    wrapper: 'border-amber-200 bg-amber-50 text-amber-800',
    icon: 'text-amber-500',
    dot: 'bg-amber-500',
  },
};

export default function PlanBadge({ plan = 'free', size = 'md', onClick }) {
  const config = getPlan(plan);
  const style  = STYLE_MAP[plan] || STYLE_MAP.free;
  const Icon   = ICON_MAP[plan]  || Sparkles;

  const sizeClass = size === 'sm'
    ? 'gap-1.5 px-2.5 py-1 text-[10px]'
    : 'gap-2 px-3 py-1.5 text-[11px]';

  const iconClass = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center rounded-full border font-bold uppercase tracking-[0.18em] transition hover:opacity-80 ${sizeClass} ${style.wrapper} ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
      title={`${config.name} plan — ${config.price}`}
    >
      <Icon className={`${iconClass} ${style.icon}`} />
      {config.name}
    </button>
  );
}
