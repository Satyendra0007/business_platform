/**
 * SupplierOnboardingBanner.jsx
 *
 * Dashboard banner shown ONLY for Suppliers with incomplete onboarding.
 * Displays a two-step progress indicator and a CTA to continue setup.
 *
 * Steps:
 *   1. Register your company
 *   2. Add your first product
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, CheckCircle2, Package, Sparkles } from 'lucide-react';

export default function SupplierOnboardingBanner({ hasCompany, hasProduct }) {
  const navigate = useNavigate();

  // Don't render if onboarding is complete
  if (hasCompany && hasProduct) return null;

  const steps = [
    {
      label: hasCompany ? 'Company registered' : 'Register your company',
      description: hasCompany
        ? 'Company submitted — verification pending. You can continue to the next step.'
        : 'Complete your company profile to establish your business identity.',
      icon: Building2,
      done: hasCompany,
      action: () => navigate('/company/setup?onboarding=1&next=/supplier/products/create'),
    },
    {
      label: 'Add your first product',
      description: 'List your first product to activate your supplier workspace.',
      icon: Package,
      done: hasProduct,
      action: () => navigate('/supplier/products/create?onboarding=1'),
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const currentStep = steps.find((s) => !s.done);

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-[linear-gradient(135deg,#0A2540_0%,#143a6a_55%,#1f548d_100%)] p-6 shadow-[0_22px_60px_rgba(10,37,64,0.18)] sm:p-8">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[#E5A93D]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-sky-400/8 blur-3xl" />

      <div className="relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-sky-100/90 backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 text-[#E5A93D]" />
          Supplier activation
        </div>

        {/* Heading */}
        <h2 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-[1.75rem]">
          Complete your profile to activate your{' '}
          <span className="text-[#E5A93D]">supplier workspace.</span>
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-sky-100/70">
          Just {2 - completedCount} step{2 - completedCount !== 1 ? 's' : ''} remaining.
          Once complete, you'll unlock full access to deals, products, and premium plans.
        </p>

        {/* Progress bar */}
        <div className="mt-5 flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#E5A93D,#f0c260)] transition-all duration-500"
              style={{ width: `${(completedCount / 2) * 100}%` }}
            />
          </div>
          <span className="text-xs font-bold text-white/60">{completedCount}/2</span>
        </div>

        {/* Steps */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCurrent = !step.done && steps.slice(0, index).every((s) => s.done);

            return (
              <button
                key={step.label}
                type="button"
                onClick={step.action}
                disabled={step.done}
                className={`group flex items-start gap-3 rounded-[20px] border p-4 text-left transition ${
                  step.done
                    ? 'cursor-default border-emerald-400/30 bg-emerald-500/10'
                    : isCurrent
                      ? 'border-[#E5A93D]/40 bg-white/8 hover:-translate-y-0.5 hover:bg-white/12'
                      : 'border-white/10 bg-white/5 opacity-60'
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                    step.done
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : isCurrent
                        ? 'bg-[#E5A93D]/20 text-[#E5A93D]'
                        : 'bg-white/10 text-white/40'
                  }`}
                >
                  {step.done ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">
                      Step {index + 1}
                    </span>
                    {step.done && (
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                        Done
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm font-bold text-white">{step.label}</p>
                  <p className="mt-1 text-xs leading-5 text-sky-100/60">{step.description}</p>
                  {isCurrent && (
                    <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#E5A93D] transition group-hover:gap-2.5">
                      Continue setup
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Primary CTA */}
        {currentStep && (
          <button
            type="button"
            onClick={currentStep.action}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#E5A93D] px-6 py-3.5 text-sm font-black text-[#0A2540] shadow-[0_12px_30px_rgba(229,169,61,0.28)] transition hover:-translate-y-0.5 hover:bg-[#d49530]"
          >
            {hasCompany ? 'Add your first product' : 'Complete company setup'}
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </section>
  );
}
