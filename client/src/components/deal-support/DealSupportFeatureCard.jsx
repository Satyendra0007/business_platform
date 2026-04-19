import React from 'react';

export default function DealSupportFeatureCard({ item }) {
  const Icon = item.icon;

  return (
    <article className="rounded-[24px] border border-white/90 bg-white/95 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(15,23,42,0.1)]">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#f2f6fb] text-[#50607b]">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[1.05rem] font-semibold tracking-[-0.02em] text-slate-800">{item.title}</h3>
            {item.tag ? (
              <span className="rounded-full border border-sky-100 bg-sky-50 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-sky-700">
                {item.tag}
              </span>
            ) : null}
            {item.marker ? (
              <span className="rounded-full border border-amber-100 bg-amber-50 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-amber-700">
                {item.marker}
              </span>
            ) : null}
          </div>
          <p className="mt-1.5 text-sm leading-6 text-slate-500">{item.description}</p>

          {item.pricing ? (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-600">
              <span>{item.pricing}</span>
              <span className="text-slate-400">|</span>
              <span>Pro Exclusive</span>
            </div>
          ) : null}

          <button
            type="button"
            className="mt-4 inline-flex items-center justify-center rounded-xl bg-[linear-gradient(135deg,#3d6fae,#467bb6)] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_18px_rgba(61,111,174,0.2)] transition hover:opacity-95"
          >
            {item.cta}
          </button>
        </div>
      </div>
    </article>
  );
}
