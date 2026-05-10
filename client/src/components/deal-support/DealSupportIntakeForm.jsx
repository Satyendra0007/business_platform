import React, { useMemo, useState } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { submitDealSupportRequest } from '../../lib/dealSupportService';

function Field({ field, value, onChange }) {
  const Icon = field.icon;
  const commonLabel = (
    <div className="mb-1.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
      {Icon ? <Icon className="h-4 w-4 text-slate-400" /> : null}
      {field.label}
    </div>
  );

  const commonProps = {
    value: value ?? '',
    onChange: (event) => onChange(field.name, event.target.value),
    placeholder: field.placeholder,
  };

  return (
    <label className="block">
      {commonLabel}
      {field.as === 'textarea' ? (
        <textarea
          {...commonProps}
          rows={field.rows || 4}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#245c9d] focus:bg-white focus:ring-4 focus:ring-[#245c9d]/10"
        />
      ) : field.as === 'select' ? (
        <select
          {...commonProps}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#245c9d] focus:bg-white focus:ring-4 focus:ring-[#245c9d]/10"
        >
          {(field.options || []).map((option) => (
            <option key={String(option.value ?? option)} value={option.value ?? option}>
              {option.label ?? option}
            </option>
          ))}
        </select>
      ) : (
        <input
          {...commonProps}
          type={field.type || 'text'}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#245c9d] focus:bg-white focus:ring-4 focus:ring-[#245c9d]/10"
        />
      )}
      {field.hint ? <p className="mt-1.5 text-[11px] leading-5 text-slate-400">{field.hint}</p> : null}
    </label>
  );
}

export default function DealSupportIntakeForm({
  sectionKey,
  compact = false,
  icon,
  title,
  description,
  badge,
  ctaLabel,
  successTitle,
  successMessage,
  fields,
  initialValues = {},
  validationMessage,
}) {
  const defaultValues = useMemo(() => {
    return fields.reduce((acc, field) => {
      acc[field.name] = initialValues[field.name] ?? field.defaultValue ?? (field.as === 'select' ? (field.options?.[0]?.value ?? field.options?.[0] ?? '') : '');
      return acc;
    }, {});
  }, [fields, initialValues]);

  const [form, setForm] = useState(defaultValues);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const missingField = fields.find((field) => field.required !== false && !String(form[field.name] || '').trim());
    if (missingField) {
      setError(validationMessage || `Please complete the ${title.toLowerCase()} form.`);
      return;
    }

    try {
      setLoading(true);
      await submitDealSupportRequest({
        sectionKey,
        fields: form,
      });
      setSubmitted(true);
    } catch (submitError) {
      setError(submitError.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <article className={compact ? 'rounded-[22px] border border-emerald-100 bg-[linear-gradient(180deg,#f7fffb,#eefbf5)] p-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)]' : 'rounded-[28px] border border-emerald-100 bg-[linear-gradient(180deg,#f7fffb,#eefbf5)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]'}>
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">Submitted</p>
            <h3 className="mt-1 text-[1.02rem] font-bold tracking-[-0.02em] text-slate-900">{successTitle}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">{successMessage}</p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={compact ? 'rounded-[22px] border border-slate-200/80 bg-white p-3.5 shadow-[0_10px_24px_rgba(15,23,42,0.06)]' : 'rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_16px_36px_rgba(15,23,42,0.06)]'}>
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#edf5ff] text-[#245c9d]">
          {icon ? React.createElement(icon, { className: compact ? 'h-5 w-5' : 'h-6 w-6' }) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={compact ? 'text-[0.96rem] font-semibold tracking-[-0.02em] text-slate-800' : 'text-[1.05rem] font-bold tracking-[-0.02em] text-slate-900'}>
              {title}
            </h3>
            {badge ? (
              <span className="rounded-full border border-sky-100 bg-sky-50 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-sky-700">
                {badge}
              </span>
            ) : null}
          </div>
          <p className={compact ? 'mt-1 text-[0.78rem] leading-5 text-slate-500' : 'mt-1.5 text-sm leading-6 text-slate-500'}>
            {description}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={compact ? 'mt-3 space-y-3' : 'mt-5 space-y-4'}>
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.name} className={field.fullWidth ? 'sm:col-span-2' : ''}>
              <Field
                field={field}
                value={form[field.name]}
                onChange={update}
              />
            </div>
          ))}
        </div>

        {error && (
          <div className="rounded-[22px] border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-500">
            {compact
              ? 'This request is ready to be sent to the right team.'
              : 'Your request is sent straight to the relevant support inbox with all submitted details.'}
          </p>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#173b67,#245c9d)] px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Sending...' : ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </article>
  );
}
