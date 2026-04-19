import React from 'react';
import { getDealSupportAction } from './dealSupportData';

export default function DealSupportSection({ section }) {
  const Icon = section.icon;

  return (
    <section className="overflow-hidden rounded-[26px] border border-slate-200/70 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
      <div className={`bg-gradient-to-r ${section.accent} px-4 py-2.5`}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 text-[#4f6280] shadow-sm">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">{section.badge}</p>
            <h2 className="mt-0.5 text-[1.02rem] font-semibold tracking-[-0.02em] text-slate-800">{section.title}</h2>
          </div>
        </div>
      </div>

      <div className="-mt-6 space-y-1.5 px-3 pb-2.5 pt-0">
        {section.cards.map(({ component: Card, actionKey }, index) => (
          <div key={`${section.key}-${index}`} className={index === 0 ? 'translate-y-0' : '-translate-y-[5px]'}>
            {React.createElement(Card, { action: getDealSupportAction(actionKey) })}
          </div>
        ))}
      </div>
    </section>
  );
}
