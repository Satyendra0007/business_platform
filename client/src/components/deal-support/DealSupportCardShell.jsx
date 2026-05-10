import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function DealSupportCardShell({ icon, title, description, cta, tag, marker, pricing, action, compact = false, onOpenForm }) {
  const isNavigate = action?.kind === 'navigate';
  const isMailto = action?.kind === 'mailto';
  const buttonLabel = action?.label || cta;
  const mailtoHref = isMailto
    ? `mailto:global@tradafy.app?subject=${encodeURIComponent(action.subject || '')}&body=${encodeURIComponent(action.body || '')}`
    : '';

  const buttonProps = isNavigate
    ? { onClick: () => window.location.assign(action.to) }
    : isMailto
      ? { onClick: () => window.location.href = mailtoHref }
      : {};

  if (compact) {
    return (
      <article className="group rounded-[22px] border border-slate-200/80 bg-white p-3.5 shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(15,23,42,0.1)]">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#f2f6fb] text-[#50607b] transition group-hover:-translate-y-0.5 group-hover:bg-[#eaf1fb]">
            {React.createElement(icon, { className: 'h-4.5 w-4.5' })}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[0.96rem] font-semibold tracking-[-0.02em] text-slate-800">{title}</h3>
              {tag ? (
                <span className="rounded-full border border-sky-100 bg-sky-50 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.16em] text-sky-700">
                  {tag}
                </span>
              ) : null}
              {marker ? (
                <span className="rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.16em] text-amber-700">
                  {marker}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-[0.78rem] leading-5 text-slate-500">{description}</p>

            {pricing ? (
              <div className="mt-2.5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[9px] font-medium text-slate-600">
                <span>{pricing}</span>
                <span className="text-slate-400">|</span>
                <span>Pro Exclusive</span>
              </div>
            ) : null}

            <button
              type="button"
              {...buttonProps}
              onClick={onOpenForm || buttonProps.onClick}
              className="mt-2.5 inline-flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#3d6fae,#467bb6)] px-3.5 py-1.5 text-[0.82rem] font-semibold text-white shadow-[0_10px_18px_rgba(61,111,174,0.2)] transition hover:opacity-95"
            >
              {buttonLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className="group rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_16px_36px_rgba(15,23,42,0.06)]"
    >
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#f2f6fb] text-[#50607b] transition group-hover:-translate-y-0.5 group-hover:bg-[#eaf1fb]">
          {React.createElement(icon, { className: 'h-4.5 w-4.5' })}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[0.96rem] font-semibold tracking-[-0.02em] text-slate-800">{title}</h3>
            {tag ? (
              <span className="rounded-full border border-sky-100 bg-sky-50 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.16em] text-sky-700">
                {tag}
              </span>
            ) : null}
            {marker ? (
              <span className="rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.16em] text-amber-700">
                {marker}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-[0.78rem] leading-5 text-slate-500">{description}</p>

          {pricing ? (
            <div className="mt-2.5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[9px] font-medium text-slate-600">
              <span>{pricing}</span>
              <span className="text-slate-400">|</span>
              <span>Pro Exclusive</span>
            </div>
          ) : null}

          <button
            type="button"
            {...buttonProps}
            onClick={onOpenForm || buttonProps.onClick}
            className="mt-2.5 inline-flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#3d6fae,#467bb6)] px-3.5 py-1.5 text-[0.82rem] font-semibold text-white shadow-[0_10px_18px_rgba(61,111,174,0.2)] transition hover:opacity-95"
          >
            {buttonLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
