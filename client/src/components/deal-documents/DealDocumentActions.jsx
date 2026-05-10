import React from 'react';
import { FileText, Loader2, MessageSquare, ShieldCheck } from 'lucide-react';

const DOCUMENT_ACTIONS = [
  { key: 'loi', label: 'Generate LOI', tone: 'from-[#173b67] to-[#245c9d]' },
  { key: 'spa', label: 'Generate SPA', tone: 'from-slate-900 to-slate-700' },
  { key: 'nda', label: 'Generate NDA', tone: 'from-emerald-700 to-emerald-600' },
];

export default function DealDocumentActions({
  request,
  loadingKey,
  onGenerate,
  statusMessage = '',
  errorMessage = '',
}) {
  const hasLiveChat = Boolean(request?.dealId);

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Document actions</p>
          <h3 className="mt-1 text-[1.05rem] font-black tracking-tight text-[#143a6a]">Generate trade documents</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Create a downloadable PDF for LOI, SPA, or NDA. When a live deal exists, the PDF is also attached in chat.
          </p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#edf5ff] text-[#245c9d]">
          <FileText className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {DOCUMENT_ACTIONS.map((action) => (
          <button
            key={action.key}
            type="button"
            onClick={() => onGenerate?.(action.key)}
            disabled={Boolean(loadingKey)}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${action.tone} px-4 py-3 text-sm font-bold text-white shadow-[0_12px_24px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {loadingKey === action.key ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            {action.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[20px] bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            <MessageSquare className="h-4 w-4 text-slate-400" />
            Chat delivery
          </div>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {hasLiveChat
              ? 'Generated PDFs are automatically attached to the active deal chat.'
              : 'Once this request becomes a live deal, documents can be attached to chat automatically.'}
          </p>
        </div>
        <div className="rounded-[20px] bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            <ShieldCheck className="h-4 w-4 text-slate-400" />
            Structured output
          </div>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            The template uses the selected request, logged-in user, and company profile to populate the document.
          </p>
        </div>
      </div>

      {statusMessage ? (
        <div className="mt-4 rounded-[20px] border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {statusMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mt-4 rounded-[20px] border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}
    </section>
  );
}
