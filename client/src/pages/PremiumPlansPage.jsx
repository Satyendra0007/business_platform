import React from 'react';
import { AppShell } from '../components/ui';
import PremiumMembershipSection from '../components/membership/PremiumMembershipSection';

export default function PremiumPlansPage() {
  return (
    <AppShell title="Premium Plans" subtitle="Upgrade to premium execution, premium support, and a stronger trade workspace.">
      <div className="space-y-4">
        <section className="flex items-center justify-between gap-3 rounded-[22px] border border-[#d8e2ef] bg-white px-4 py-3 shadow-[0_14px_38px_rgba(15,23,42,0.06)]">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#245c9d]">
              Premium comparison
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Free, Business, and Premium are shown below with no extra hero section in the way.
            </p>
          </div>
          <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
            Compare plans
          </div>
        </section>

        <div id="premium-plan-cards" className="-mt-1 sm:-mt-2 lg:-mt-2">
          <PremiumMembershipSection compact={false} />
        </div>

        <section className="grid gap-4 rounded-[30px] border border-[#d8e2ef] bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:grid-cols-3 sm:p-6">
          {[
            { label: 'Legal review', value: 'Priority access', detail: 'Premium users get a smoother path to the support tools.' },
            { label: 'Documents', value: 'Cleaner flow', detail: 'Keep your execution workspace organized and premium-grade.' },
            { label: 'Visibility', value: 'Boosted profile', detail: 'Make your company and offers stand out with more trust.' },
          ].map((item) => (
            <div key={item.label} className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f7faff_100%)] p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{item.label}</div>
              <div className="mt-2 text-lg font-black text-[#0A2540]">{item.value}</div>
              <p className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</p>
            </div>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
