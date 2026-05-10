import React from 'react';
import { getDealSupportAction } from './dealSupportData';

export default function DealSupportSection({ section, onLaunch }) {
  const Icon = section.icon;

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
      <div className={`bg-gradient-to-r ${section.accent} px-5 py-4`}>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/85 text-[#4f6280] shadow-sm">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">{section.badge}</p>
            <h2 className="mt-0.5 text-[1.05rem] font-semibold tracking-[-0.02em] text-slate-800">{section.title}</h2>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-4 sm:p-5">
        {section.cards.map(({ component: Card, actionKey }, index) => (
          <div key={`${section.key}-${index}`}>
            {React.createElement(Card, {
              action: getDealSupportAction(actionKey),
              compact: true,
              onOpenVerification: () => onLaunch('verification'),
              onOpenForm: () => onLaunch(actionKey),
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
