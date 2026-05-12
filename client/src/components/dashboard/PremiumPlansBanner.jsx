import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PremiumPlansBanner() {
  const navigate = useNavigate();

  return (
    <section className="rounded-[26px] border border-slate-200 bg-[linear-gradient(135deg,#0c1f38_0%,#11305a_58%,#1a4a87_100%)] px-5 py-5 text-white shadow-[0_16px_50px_rgba(15,23,42,0.12)] sm:px-6 sm:py-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-200">
            <Sparkles className="h-3.5 w-3.5" />
            Plan status
          </div>
          <h2 className="mt-3 text-3xl font-black tracking-tight">
            Stay ahead of your next deal wave
          </h2>
          <p className="mt-2 max-w-xl text-sm text-sky-100/85">
            Review the plan that fits your team before your next round of sourcing, bidding, and shipping work.
          </p>
        </div>

        <button
          onClick={() => navigate('/premium-plans')}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-black text-[#0f2846] transition hover:-translate-y-0.5"
        >
          Review plans
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
