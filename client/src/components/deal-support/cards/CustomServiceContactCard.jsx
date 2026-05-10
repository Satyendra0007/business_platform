import React from 'react';
import { Headphones, MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '+32470381856'; // Replace with actual WhatsApp number
const DEFAULT_MESSAGE = 'Hello Tradafy, I need customer service support.';

export default function CustomServiceContactCard({ compact = false }) {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  if (compact) {
    return (
      <article className="group rounded-[22px] border border-slate-200/80 bg-white p-3.5 shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(15,23,42,0.1)]">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#e8f5e9] text-[#25d366] transition group-hover:-translate-y-0.5">
            <MessageCircle className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[0.96rem] font-semibold tracking-[-0.02em] text-slate-800">Customer Service</h3>
              <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                WhatsApp
              </span>
            </div>
            <p className="mt-1 text-[0.78rem] leading-5 text-slate-500">
              Reach our team directly via WhatsApp for quick support.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2.5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#25d366] px-3.5 py-1.5 text-[0.82rem] font-semibold text-white shadow-[0_10px_18px_rgba(37,211,102,0.25)] transition hover:bg-[#20bd5a]"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_16px_36px_rgba(15,23,42,0.06)]">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8f5e9] text-[#25d366]">
          <MessageCircle className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[1.05rem] font-bold tracking-[-0.02em] text-slate-900">Customer Service</h3>
            <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-emerald-700">
              WhatsApp
            </span>
          </div>
          <p className="mt-1.5 text-sm leading-6 text-slate-500">
            Reach our customer service team directly via WhatsApp for quick assistance with any questions.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25d366] px-5 py-2.5 text-sm font-bold text-white shadow-[0_12px_24px_rgba(37,211,102,0.25)] transition hover:-translate-y-0.5 hover:bg-[#20bd5a]"
          >
            <MessageCircle className="h-4 w-4" />
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}
