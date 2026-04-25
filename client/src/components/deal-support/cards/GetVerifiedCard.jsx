import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Upload,
  Building2,
  Globe,
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

export default function GetVerifiedCard({ compact = false, onOpenVerification }) {
  const [form, setForm] = useState({
    companyName: '',
    registrationNumber: '',
    country: '',
    city: '',
    website: '',
    contactName: '',
    contactEmail: '',
    summary: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.companyName.trim() || !form.country.trim() || !form.contactName.trim() || !form.contactEmail.trim()) {
      setError('Please complete the company verification form.');
      return;
    }
    setSubmitted(true);
  };

  if (compact) {
    return (
      <article className="rounded-[22px] border border-slate-200/80 bg-white p-3.5 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#edf5ff] text-[#245c9d]">
            <ShieldCheck className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[0.96rem] font-semibold tracking-[-0.02em] text-slate-800">Get Verified</h3>
              <span className="rounded-full border border-sky-100 bg-sky-50 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.16em] text-sky-700">
                Company Form
              </span>
            </div>
            <p className="mt-1 text-[0.78rem] leading-5 text-slate-500">
              Open the full verification form on a dedicated page.
            </p>
            <button
              type="button"
              onClick={onOpenVerification}
              className="mt-2.5 inline-flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#3d6fae,#467bb6)] px-3.5 py-1.5 text-[0.82rem] font-semibold text-white shadow-[0_10px_18px_rgba(61,111,174,0.2)] transition hover:opacity-95"
            >
              Get verification
              <ArrowRight className="h-3.5 w-3.5" />
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
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">Submitted</p>
            <h3 className="mt-1 text-[1.02rem] font-bold tracking-[-0.02em] text-slate-900">Verification request received</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Your company verification details have been captured and are ready for review.
            </p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_16px_36px_rgba(15,23,42,0.06)]">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#edf5ff] text-[#245c9d]">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[1.05rem] font-bold tracking-[-0.02em] text-slate-900">Get Verified</h3>
            <span className="rounded-full border border-sky-100 bg-sky-50 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-sky-700">
              Company Form
            </span>
          </div>
          <p className="mt-1.5 text-sm leading-6 text-slate-500">
            Complete this verification form to move your company profile into a review-ready state.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company name" icon={Building2}>
            <Input
              value={form.companyName}
              onChange={(e) => update('companyName', e.target.value)}
              placeholder="Your registered business name"
            />
          </Field>
          <Field label="Registration number" icon={FileText}>
            <Input
              value={form.registrationNumber}
              onChange={(e) => update('registrationNumber', e.target.value)}
              placeholder="Company registration or tax ID"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Country" icon={Globe}>
            <Input
              value={form.country}
              onChange={(e) => update('country', e.target.value)}
              placeholder="Registered country"
            />
          </Field>
          <Field label="City" icon={Building2}>
            <Input
              value={form.city}
              onChange={(e) => update('city', e.target.value)}
              placeholder="Office city"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Website" icon={Globe}>
            <Input
              value={form.website}
              onChange={(e) => update('website', e.target.value)}
              placeholder="https://yourcompany.com"
            />
          </Field>
          <Field label="Contact person" icon={ShieldCheck}>
            <Input
              value={form.contactName}
              onChange={(e) => update('contactName', e.target.value)}
              placeholder="Who should we contact?"
            />
          </Field>
        </div>

        <Field label="Contact email" icon={ArrowRight} hint="Use a monitored email address for verification follow-up.">
          <Input
            type="email"
            value={form.contactEmail}
            onChange={(e) => update('contactEmail', e.target.value)}
            placeholder="name@company.com"
          />
        </Field>

        <Field label="Verification summary" icon={Upload} hint="Tell us briefly what you need verified and why.">
          <TextArea
            rows="4"
            value={form.summary}
            onChange={(e) => update('summary', e.target.value)}
            placeholder="Company overview, business scope, and documents available for review"
          />
        </Field>

        {error && (
          <div className="rounded-[22px] border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <p className="text-xs leading-5 text-slate-500">
            This looks and feels like a formal company verification form, ready for review.
          </p>
          <button
            type="submit"
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#173b67,#245c9d)] px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5"
          >
            Submit Verification
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </article>
  );
}
