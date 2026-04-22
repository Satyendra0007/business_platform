import React, { useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  FileText,
  Gavel,
  Loader2,
  LockKeyhole,
  MessageSquare,
  Package,
  Ship,
  Sparkles,
  Star,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { createCheckoutSession } from '../../lib/billingService';

const plans = [
  {
    name: 'Free',
    badge: 'Starter',
    price: '€0',
    icon: Sparkles,
    summary: 'Get started with one real deal before the workspace soft-limits.',
    metrics: [
      ['Deals', '1 full deal -> max 3 total'],
      ['Chat', 'Limited / locked after trial'],
      ['Documents', 'Limited'],
      ['Shipping', 'Basic access'],
      ['Legal', 'Not included'],
      ['Visibility', 'Low'],
      ['Insights', 'Not included'],
      ['Trust', 'Not included'],
    ],
    bestFor: 'First-time users',
  },
  {
    name: 'Business',
    badge: 'Scale',
    price: '€49 / month',
    icon: Building2,
    summary: 'Built for active traders who manage several deals at once.',
    metrics: [
      ['Deals', 'Max 5 active'],
      ['Chat', 'Max 5 active'],
      ['Documents', 'Max 50'],
      ['Shipping', 'Standard bids'],
      ['Legal', 'Not included'],
      ['Visibility', 'Standard'],
      ['Insights', 'Not included'],
      ['Trust', 'Not included'],
    ],
    bestFor: 'Active traders',
  },
  {
    name: 'Premium',
    badge: 'Pro',
    price: '€99 / month',
    icon: Star,
    highlighted: true,
    summary: 'The premium plan for serious traders who want faster and safer closes.',
    metrics: [
      ['Deals', 'Unlimited'],
      ['Chat', 'Unlimited'],
      ['Documents', 'Unlimited'],
      ['Shipping', 'Priority bids'],
      ['Legal', 'Light review included'],
      ['Visibility', 'Boosted ranking'],
      ['Insights', 'Credibility insights'],
      ['Trust', 'Verified badge'],
    ],
    bestFor: 'Serious traders',
  },
];

const phases = [
  {
    title: 'Phase 1',
    label: 'Full experience',
    description: 'New users receive one fully unlocked deal so they can experience the platform in action.',
    icon: BadgeCheck,
  },
  {
    title: 'Phase 2',
    label: 'Soft limitation',
    description: 'After the first deal, usage becomes limited and users see the value of upgrading to continue.',
    icon: TrendingUp,
  },
  {
    title: 'Phase 3',
    label: 'Conversion trigger',
    description: 'At the moment of real deal risk or extra deal creation, the upgrade prompt appears with clarity.',
    icon: LockKeyhole,
  },
];

const premiumIncludes = [
  { icon: Gavel, label: 'Legal support' },
  { icon: FileText, label: 'Advanced document flow' },
  { icon: MessageSquare, label: 'High-trust deal communication' },
  { icon: Ship, label: 'Shipping interaction visibility' },
  { icon: Package, label: 'Execution-ready workspace' },
];

const addOns = [
  'Legal Review: EUR 250',
  'Legal Support (Lawyer): Custom',
  'Credibility Report: EUR 250',
  'Business Expansion Support: Custom',
  'Private Labeling: Custom',
  'Offline Verification / Trust Label: EUR 1,000',
];

export default function PremiumMembershipSection({ compact = false }) {
  const { user } = useAuth();
  const userPlan = user?.plan || 'free';

  const [checkoutLoading, setCheckoutLoading] = useState(null); // planKey in progress
  const [checkoutError,   setCheckoutError]   = useState('');

  const handleUpgrade = async (planKey) => {
    if (!user) { window.location.href = '/login'; return; }
    try {
      setCheckoutError('');
      setCheckoutLoading(planKey);
      const url = await createCheckoutSession(planKey);
      window.location.href = url; // redirect to Stripe Checkout
    } catch (err) {
      console.error('[PricingSection] checkout error:', err);
      setCheckoutError(err?.response?.data?.message || 'Could not start checkout. Try again.');
      setCheckoutLoading(null);
    }
  };
  const shellClass = compact
    ? 'relative overflow-hidden rounded-[32px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-4 py-6 text-slate-900 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:px-5 sm:py-7 lg:px-6'
    : 'relative overflow-hidden rounded-[38px] border border-[#102a4a] bg-[linear-gradient(180deg,#071120_0%,#0a1930_45%,#07101d_100%)] px-5 py-10 text-white shadow-[0_30px_90px_rgba(3,7,20,0.45)] sm:px-7 sm:py-12 lg:px-10';
  const bodyTone = compact ? 'text-slate-600' : 'text-slate-300';
  const cardShell = compact
    ? 'rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]'
    : 'rounded-[26px] border border-white/10 bg-white/5 p-4 backdrop-blur premium-shadow';
  const planShell = compact
    ? 'relative overflow-hidden rounded-[28px] border p-4 shadow-[0_16px_40px_rgba(15,23,42,0.10)]'
    : 'relative overflow-hidden rounded-[30px] border p-5 shadow-[0_24px_60px_rgba(3,7,20,0.28)]';
  const textMuted = compact ? 'text-slate-600' : 'text-slate-300';

  if (compact) {
    return (
      <section className={shellClass}>
        <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-[#245c9d]/10 blur-[90px]" />
        <div className="pointer-events-none absolute right-[-5rem] top-10 h-80 w-80 rounded-full bg-[#E5A93D]/8 blur-[110px]" />

        <div className="relative flex flex-col gap-4">
          <div className="flex flex-col gap-2 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-[#245c9d] backdrop-blur">
                TRADAFY Pricing Overview
              </div>
              <h2 className="mt-3 text-[1.55rem] font-black tracking-tight text-[#0A2540] sm:text-[1.9rem]">
                Free, Business, and Premium plans built for real trade execution.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Clear pricing, clear limits, and real upgrade triggers. Users get value first, then move into Business or Premium when their deal activity grows.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-700">
              Premium: €99 / month
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <article
                  key={plan.name}
                  className={`relative h-full overflow-hidden rounded-[24px] border p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)] ${
                    plan.highlighted
                      ? 'border-[#D8B35C]/35 bg-[linear-gradient(180deg,#0F2745_0%,#0B1E36_100%)]'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="relative flex h-full flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${plan.highlighted ? 'bg-white/10' : 'bg-slate-100'}`}>
                          <Icon className={`h-5 w-5 ${plan.highlighted ? 'text-amber-300' : 'text-[#245c9d]'}`} />
                        </div>
                        <div>
                          <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${plan.highlighted ? 'text-sky-100/70' : 'text-slate-400'}`}>{plan.badge}</div>
                          <h3 className={`mt-1 text-[1.35rem] font-black tracking-tight ${plan.highlighted ? 'text-white' : 'text-[#0A2540]'}`}>{plan.name}</h3>
                        </div>
                      </div>
                      {plan.highlighted ? (
                        <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-700">
                          Recommended
                        </div>
                      ) : null}
                    </div>

                    <div className={`mt-3 rounded-[18px] border p-3.5 ${plan.highlighted ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                      <div className={`text-[10px] font-black uppercase tracking-[0.22em] ${plan.highlighted ? 'text-slate-300' : 'text-slate-400'}`}>Price</div>
                      <div className={`mt-1 text-lg font-black ${plan.highlighted ? 'text-white' : 'text-[#0A2540]'}`}>{plan.price}</div>
                      <div className={`mt-1 text-sm leading-5 ${plan.highlighted ? 'text-slate-300' : 'text-slate-600'}`}>{plan.summary}</div>
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {plan.metrics.slice(0, 4).map(([label, value]) => (
                        <div key={label} className={`rounded-2xl px-3 py-2 ${plan.highlighted ? 'bg-white/5 text-white' : 'bg-slate-50 text-slate-700'}`}>
                          <div className={`text-[9px] font-black uppercase tracking-[0.16em] ${plan.highlighted ? 'text-sky-100/70' : 'text-slate-400'}`}>{label}</div>
                          <div className="mt-1 text-sm font-semibold leading-5">{value}</div>
                        </div>
                      ))}
                    </div>

                    {plan.highlighted ? (
                      <div className="mt-3 rounded-[18px] border border-white/10 bg-white/5 p-3">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-200/90">
                          Premium includes
                        </div>
                        <div className="mt-2 grid gap-2">
                          {premiumIncludes.slice(0, 3).map((item) => {
                            const MiniIcon = item.icon;
                            return (
                              <div key={item.label} className="flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2 text-sm font-semibold text-white/90">
                                <MiniIcon className="h-4 w-4 text-amber-300" />
                                {item.label}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}

                    <div className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold ${plan.highlighted ? 'border border-white/10 bg-white/5 text-slate-200' : 'border border-slate-200 bg-slate-50 text-slate-700'}`}>
                      Best for: <span className={plan.highlighted ? 'text-white' : 'text-[#0A2540]'}>{plan.bestFor}</span>
                    </div>

                    {/* ── Checkout CTA (compact view) ── */}
                    {plan.name !== 'Free' && (
                      userPlan === plan.name.toLowerCase() ? (
                        <div className="mt-3 flex items-center justify-center gap-1.5 rounded-2xl border border-emerald-200 bg-emerald-50 py-2 text-xs font-black text-emerald-700">
                          ✓ Current Plan
                        </div>
                      ) : (
                        <button
                          id={`pricing-compact-${plan.name.toLowerCase()}-btn`}
                          onClick={() => handleUpgrade(plan.name.toLowerCase())}
                          disabled={!!checkoutLoading}
                          className={`mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-2.5 text-xs font-black transition hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed ${
                            plan.highlighted
                              ? 'bg-[#E5A93D] text-[#0A2540] hover:bg-[#d49530]'
                              : 'bg-[#0A2540] text-white hover:bg-[#0d2d4d]'
                          }`}
                        >
                          {checkoutLoading === plan.name.toLowerCase() ? (
                            <><Loader2 className="h-3 w-3 animate-spin" /> Redirecting…</>
                          ) : (
                            <>Upgrade to {plan.name} <ArrowRight className="h-3 w-3" /></>
                          )}
                        </button>
                      )
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {/* Compact view checkout error */}
          {checkoutError && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-center text-xs font-semibold text-rose-600">
              {checkoutError}
            </p>
          )}

          <div className="grid gap-3 2xl:grid-cols-[1fr_1fr] xl:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#245c9d]">Upgrade triggers</div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {[
                  'Open chat after soft limitation',
                  'Upload documents',
                  'Progress deal milestones',
                  'Access shipping bids beyond limit',
                  'Create a 4th deal',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[#245c9d]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(135deg,#ffffff,#f8fbff)] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#245c9d]">Additional paid services</div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {addOns.map((item) => (
                  <div key={item} className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={shellClass}>
      <div className={`pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full blur-[90px] ${compact ? 'bg-[#245c9d]/10' : 'bg-[#245c9d]/20'}`} />
      <div className={`pointer-events-none absolute right-[-5rem] top-10 h-80 w-80 rounded-full blur-[110px] ${compact ? 'bg-[#E5A93D]/8' : 'bg-[#E5A93D]/12'}`} />

      <div className="relative flex flex-col gap-6">
        <div className="max-w-3xl">
          <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] backdrop-blur ${compact ? 'border-slate-200 bg-white text-[#245c9d]' : 'border-white/10 bg-white/8 text-sky-100/80'}`}>
            TRADAFY Pricing Overview
          </div>
          <h2 className={`mt-3 font-black tracking-tight sm:text-4xl ${compact ? 'text-[2rem] text-[#0A2540] lg:text-[2.4rem]' : 'text-3xl text-white lg:text-[3.4rem]'}`}>
            Free, Business, and Premium plans built for real trade execution.
          </h2>
          <p className={`mt-3 max-w-3xl text-sm leading-7 sm:text-[15px] ${bodyTone}`}>
            Clear pricing, clear limits, and real upgrade triggers. Users get value first, then move into Business or Premium when their deal activity grows.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.98fr_1.02fr]">
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
            {phases.map((phase, index) => {
              const Icon = phase.icon;
              return (
                <div
                  key={phase.title}
                  className={cardShell}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${compact ? 'bg-[#f3f7fb] text-[#245c9d]' : 'bg-white/10 text-white'}`}>
                      <Icon className={`h-5 w-5 ${compact ? 'text-[#245c9d]' : 'text-amber-300'}`} />
                    </div>
                    <div>
                      <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${compact ? 'text-slate-400' : 'text-sky-100/70'}`}>
                        {phase.title}
                      </div>
                      <h3 className={`mt-1 text-[1rem] font-semibold ${compact ? 'text-[#0A2540]' : 'text-white'}`}>{phase.label}</h3>
                    </div>
                  </div>
                  <p className={`mt-2.5 text-sm leading-6 ${textMuted}`}>{phase.description}</p>
                  <div className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${compact ? 'border-slate-200 bg-slate-50 text-slate-700' : 'border-white/10 bg-white/5 text-slate-200'}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {index === 0 ? 'Full access to one deal' : index === 1 ? 'Upgrade nudges appear' : 'Blocked at critical moments'}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <article
                  key={plan.name}
                  className={`relative h-full overflow-hidden ${planShell} ${
                    plan.highlighted
                      ? compact
                        ? 'border-[#D8B35C]/40 bg-[linear-gradient(180deg,#0F2745_0%,#0B1E36_100%)] ring-1 ring-[#D8B35C]/25'
                        : 'border-[#E5A93D]/50 bg-[linear-gradient(180deg,#1b4b82_0%,#0f2745_55%,#07101d_100%)] ring-1 ring-[#E5A93D]/40'
                      : compact
                        ? 'border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]'
                        : 'border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))]'
                  }`}
                >
                  {plan.highlighted ? (
                    <>
                      <div className="absolute -right-10 top-0 h-32 w-32 rounded-full bg-[#E5A93D]/20 blur-3xl" />
                      <div className="absolute -left-8 bottom-0 h-28 w-28 rounded-full bg-sky-400/15 blur-3xl" />
                    </>
                  ) : null}

                  <div className="relative flex h-full flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${compact ? 'bg-slate-100 text-[#0A2540]' : 'bg-white/10'}`}>
                          <Icon className={`h-5.5 w-5.5 ${plan.highlighted ? 'text-amber-300' : compact ? 'text-[#245c9d]' : 'text-sky-100'}`} />
                        </div>
                        <div>
                          <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${compact ? 'text-slate-400' : 'text-sky-100/70'}`}>{plan.badge}</div>
                          <h3 className={`mt-1 font-black tracking-tight ${compact ? 'text-[1.5rem] text-[#0A2540]' : 'text-2xl text-white'}`}>{plan.name}</h3>
                        </div>
                      </div>
                      {plan.highlighted ? (
                        <div className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${compact ? 'border border-amber-200 bg-amber-50 text-amber-700' : 'border border-amber-300/30 bg-amber-300/10 text-amber-200'}`}>
                          Recommended
                        </div>
                      ) : null}
                    </div>

                    <div className={`mt-4 rounded-[22px] border p-4 ${compact ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-white/5'}`}>
                      <div className={`text-[10px] font-black uppercase tracking-[0.22em] ${compact ? 'text-slate-400' : 'text-slate-300'}`}>Plan price</div>
                      <div className={`mt-1 font-black ${compact ? 'text-lg text-[#0A2540]' : 'text-xl text-white'}`}>{plan.price}</div>
                      <p className={`mt-2 text-sm leading-6 ${textMuted}`}>{plan.summary}</p>
                    </div>

                    <div className={`mt-4 rounded-[22px] border p-4 ${compact ? 'border-slate-200 bg-white' : 'border-white/10 bg-white/4'}`}>
                      <div className={`text-[10px] font-black uppercase tracking-[0.22em] ${compact ? 'text-slate-400' : 'text-slate-300'}`}>Plan details</div>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {plan.metrics.map(([label, value]) => (
                          <div key={label} className={`rounded-2xl px-3 py-2.5 ${compact ? 'bg-slate-50 text-slate-700' : 'bg-white/5 text-slate-100'}`}>
                            <div className={`text-[9px] font-black uppercase tracking-[0.16em] ${compact ? 'text-slate-400' : 'text-sky-100/70'}`}>{label}</div>
                            <div className={`mt-1 text-sm font-semibold leading-5 ${compact ? 'text-[#0A2540]' : 'text-white/95'}`}>{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {plan.highlighted ? (
                      <div className={`mt-4 rounded-[22px] p-4 ${compact ? 'border border-slate-200 bg-white' : 'border border-white/10 bg-white/6'}`}>
                        <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${compact ? 'text-[#245c9d]' : 'text-amber-200/90'}`}>
                          Premium includes
                        </div>
                        <div className="mt-3 grid gap-2">
                          {premiumIncludes.map((item) => {
                            const MiniIcon = item.icon;
                            return (
                              <div key={item.label} className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold ${compact ? 'bg-slate-50 text-slate-700' : 'bg-white/5 text-white/90'}`}>
                                <MiniIcon className={`h-4 w-4 ${compact ? 'text-[#245c9d]' : 'text-amber-300'}`} />
                                {item.label}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}

                    <div className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold ${compact ? 'border border-slate-200 bg-slate-50 text-slate-700' : 'border border-white/10 bg-white/5 text-slate-200'}`}>
                      Best for: <span className={compact ? 'text-[#0A2540]' : 'text-white'}>{plan.bestFor}</span>
                    </div>

                    {/* ── Checkout CTA (full view) ── */}
                    {plan.name !== 'Free' && (
                      userPlan === plan.name.toLowerCase() ? (
                        <div className="mt-4 flex items-center justify-center gap-1.5 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 py-2.5 text-xs font-black text-emerald-300">
                          ✓ Your Current Plan
                        </div>
                      ) : (
                        <button
                          id={`pricing-full-${plan.name.toLowerCase()}-btn`}
                          onClick={() => handleUpgrade(plan.name.toLowerCase())}
                          disabled={!!checkoutLoading}
                          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black transition hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed ${
                            plan.highlighted
                              ? 'bg-[#E5A93D] text-[#0A2540] hover:bg-[#d49530] shadow-[0_8px_24px_rgba(229,169,61,0.35)]'
                              : 'bg-white/10 text-white hover:bg-white/15 border border-white/10'
                          }`}
                        >
                          {checkoutLoading === plan.name.toLowerCase() ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting to Stripe…</>
                          ) : (
                            <>Upgrade to {plan.name} <ArrowRight className="h-4 w-4" /></>
                          )}
                        </button>
                      )
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Full view checkout error */}
        {checkoutError && (
          <p className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-5 py-3 text-center text-sm font-semibold text-rose-300">
            {checkoutError}
          </p>
        )}

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className={`rounded-[28px] p-5 backdrop-blur ${compact ? 'border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)]' : 'border border-white/10 bg-white/5'}`}>
            <div className={`text-[10px] font-black uppercase tracking-[0.22em] ${compact ? 'text-slate-400' : 'text-sky-100/70'}`}>Upgrade triggers</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                'Open chat after soft limitation',
                'Upload documents',
                'Progress deal milestones',
                'Access shipping bids beyond limit',
                'Create a 4th deal',
              ].map((item) => (
                <div key={item} className={`flex items-start gap-2 rounded-2xl px-3 py-3 text-sm ${compact ? 'border border-slate-200 bg-slate-50 text-slate-700' : 'border border-white/8 bg-white/5 text-slate-200'}`}>
                  <ArrowRight className={`mt-0.5 h-4 w-4 shrink-0 ${compact ? 'text-[#245c9d]' : 'text-amber-300'}`} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-[28px] p-5 backdrop-blur ${compact ? 'border border-slate-200 bg-[linear-gradient(135deg,#ffffff,#f8fbff)] shadow-[0_12px_30px_rgba(15,23,42,0.06)]' : 'border border-white/10 bg-[linear-gradient(135deg,rgba(229,169,61,0.15),rgba(255,255,255,0.05))]'}`}>
            <div className={`text-[10px] font-black uppercase tracking-[0.22em] ${compact ? 'text-[#245c9d]' : 'text-amber-200/90'}`}>Additional paid services</div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {addOns.map((item) => (
                <div key={item} className={`rounded-2xl px-3 py-3 text-sm font-semibold ${compact ? 'border border-slate-200 bg-white text-slate-700' : 'border border-white/10 bg-[#071120]/40 text-white/90'}`}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
