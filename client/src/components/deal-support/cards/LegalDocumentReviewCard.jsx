import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  FileText,
  ShieldCheck,
  Sparkles,
  Upload,
} from 'lucide-react';

function Field({ label, icon: Icon, children, hint }) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
        {label}
      </div>
      {children}
      {hint ? <p className="mt-1.5 text-[11px] leading-5 text-slate-400">{hint}</p> : null}
    </label>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#245c9d] focus:bg-white focus:ring-4 focus:ring-[#245c9d]/10"
    />
  );
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#245c9d] focus:bg-white focus:ring-4 focus:ring-[#245c9d]/10"
    />
  );
}

function Select(props) {
  return (
    <select
      {...props}
      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#245c9d] focus:bg-white focus:ring-4 focus:ring-[#245c9d]/10"
    />
  );
}

export default function LegalDocumentReviewCard({ compact = false, action, onOpenForm }) {
  const [form, setForm] = useState({
    dealReference: '',
    documentType: '',
    jurisdiction: '',
    priority: 'Standard',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.dealReference.trim() || !form.documentType || !form.jurisdiction.trim() || !form.notes.trim()) {
      setError('Please complete the review details before submitting.');
      return;
    }
    setSubmitted(true);
  };

  if (compact) {
    return (
      <article className="rounded-[22px] border border-slate-200/80 bg-white p-3.5 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#edf5ff] text-[#245c9d]">
            <FileText className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[0.96rem] font-semibold tracking-[-0.02em] text-slate-800">Legal Document Review</h3>
              <span className="rounded-full border border-sky-100 bg-sky-50 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.16em] text-sky-700">
                Document Control
              </span>
            </div>
            <p className="mt-1 text-[0.78rem] leading-5 text-slate-500">
              Submit contracts, LOIs, or SPA drafts in a clean structured format for legal review.
            </p>
            <button
              type="button"
              onClick={onOpenForm || (() => window.location.assign(action?.to || '/deal-support/legal-review'))}
              className="mt-2.5 inline-flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#3d6fae,#467bb6)] px-3.5 py-1.5 text-[0.82rem] font-semibold text-white shadow-[0_10px_18px_rgba(61,111,174,0.2)] transition hover:opacity-95"
            >
              Request review
              <FileText className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </article>
    );
  }

  if (submitted) {
    return (
      <article className="rounded-[28px] border border-emerald-100 bg-[linear-gradient(180deg,#f7fffb,#eefbf5)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">Submitted</p>
            <h3 className="mt-1 text-[1.02rem] font-bold tracking-[-0.02em] text-slate-900">Legal review request sent</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Your document review request is ready for a compliance team review.
            </p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={compact ? 'rounded-[22px] border border-slate-200/80 bg-white p-3.5 shadow-[0_10px_24px_rgba(15,23,42,0.06)]' : 'rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_16px_36px_rgba(15,23,42,0.06)]'}>
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#edf5ff] text-[#245c9d]">
          <FileText className={compact ? 'h-5 w-5' : 'h-6 w-6'} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={compact ? 'text-[0.96rem] font-semibold tracking-[-0.02em] text-slate-800' : 'text-[1.05rem] font-bold tracking-[-0.02em] text-slate-900'}>Legal Document Review</h3>
            <span className="rounded-full border border-sky-100 bg-sky-50 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-sky-700">
              Document Control
            </span>
          </div>
          <p className={compact ? 'mt-1 text-[0.78rem] leading-5 text-slate-500' : 'mt-1.5 text-sm leading-6 text-slate-500'}>
            Submit contracts, LOIs, or SPA drafts in a clean structured format for legal review.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={compact ? 'mt-3 space-y-3' : 'mt-5 space-y-4'}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Deal reference" icon={Sparkles}>
            <Input
              value={form.dealReference}
              onChange={(e) => update('dealReference', e.target.value)}
              placeholder="e.g. DEAL-2026-014"
            />
          </Field>
          <Field label="Document type" icon={FileText}>
            <Select
              value={form.documentType}
              onChange={(e) => update('documentType', e.target.value)}
            >
              <option value="">Select document</option>
              <option>LOI</option>
              <option>SPA</option>
              <option>NDA</option>
              <option>Contract Draft</option>
              <option>Invoice / Packing List</option>
            </Select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Jurisdiction" icon={ShieldCheck} hint="Specify governing law or review jurisdiction.">
            <Input
              value={form.jurisdiction}
              onChange={(e) => update('jurisdiction', e.target.value)}
              placeholder="e.g. Dubai, UAE"
            />
          </Field>
          <Field label="Priority" icon={Clock3}>
            <Select value={form.priority} onChange={(e) => update('priority', e.target.value)}>
              <option>Standard</option>
              <option>Priority</option>
              <option>Urgent</option>
            </Select>
          </Field>
        </div>

        <Field label="Review notes" icon={Upload} hint="Mention clauses, redlines, or compliance concerns.">
          <TextArea
            rows="4"
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            placeholder="Summarize the exact legal review support needed"
          />
        </Field>

        {error && (
          <div className="rounded-[22px] border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <p className="text-xs leading-5 text-slate-500">
            Legal requests are handled as structured intake and reviewed by the support team.
          </p>
          <button
            type="submit"
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#173b67,#245c9d)] px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5"
          >
            Request Review
          </button>
        </div>
      </form>
    </article>
  );
}
