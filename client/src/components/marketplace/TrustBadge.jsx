/**
 * TrustBadge.jsx
 *
 * Reusable trust indicator badges for marketplace listings.
 * Used in product cards, company rows, deal pages.
 */
import React from 'react';
import { ShieldCheck, Star, Clock, ShieldAlert } from 'lucide-react';

const BADGE_MAP = {
  verified: {
    label: 'Verified',
    cls: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    Icon: ShieldCheck,
  },
  premium: {
    label: 'Premium Supplier',
    cls: 'border-violet-200 bg-violet-50 text-violet-700',
    Icon: Star,
  },
  pending: {
    label: 'Pending Review',
    cls: 'border-amber-200 bg-amber-50 text-amber-700',
    Icon: Clock,
  },
  unverified: {
    label: 'Unverified',
    cls: 'border-slate-200 bg-slate-50 text-slate-500',
    Icon: ShieldAlert,
  },
};

/**
 * @param {string} type - 'verified'|'premium'|'pending'|'unverified'
 * @param {object} company - Optional company object to auto-compute type
 * @param {'sm'|'md'} size
 */
export default function TrustBadge({ type, company, size = 'sm' }) {
  let finalType = type;
  if (company) {
    if (company.plan === 'premium') finalType = 'premium';
    else if (company.verificationStatus === 'approved') finalType = 'verified';
    else if (company.verificationStatus === 'pending') finalType = 'pending';
    else finalType = 'unverified';
  }

  const config = BADGE_MAP[finalType] || BADGE_MAP.unverified;
  const { label, cls, Icon } = config;

  const textSize = size === 'md' ? 'text-[11px]' : 'text-[9px]';
  const padding  = size === 'md' ? 'px-2.5 py-1' : 'px-2 py-0.5';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-bold uppercase tracking-[0.14em] ${textSize} ${padding} ${cls}`}
    >
      <Icon className={size === 'md' ? 'h-3.5 w-3.5' : 'h-3 w-3'} />
      {label}
    </span>
  );
}
