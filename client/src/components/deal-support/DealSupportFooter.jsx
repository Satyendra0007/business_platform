import React from 'react';

export default function DealSupportFooter({ pills }) {
  return (
    <section className="overflow-hidden rounded-[20px] bg-[linear-gradient(135deg,#142b4d_0%,#20395f_55%,#0f2340_100%)] px-4 py-3 text-white shadow-[0_22px_60px_rgba(15,23,42,0.18)] sm:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[1.1rem] font-medium tracking-[-0.03em] sm:text-[1.25rem]">
            Proven across $2B+ in successful deal execution on Tradify
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {pills.map(({ label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-[11px] font-medium text-slate-100/95 backdrop-blur"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-slate-200/80" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
