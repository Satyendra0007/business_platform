import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, ArrowLeft, Package, AlertCircle } from 'lucide-react';
import { AppShell } from '../components/ui';
import { getDealById, updateDeal } from '../lib/dealService';
import { useAuth } from '../hooks/useAuth';

const INCOTERMS = ['EXW', 'FOB', 'CIF', 'CFR', 'DAP', 'DDP', 'FCA', 'CPT', 'CIP'];
const inputCls = "w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#245c9d] focus:ring-2 focus:ring-[#245c9d]/10";
const sameId = (a, b) => String(a || '') === String(b || '');

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
        {label}
      </span>
      {children}
      {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
    </label>
  );
}

export default function EditDealPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { dealId } = useParams();

  const [deal, setDeal] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [configError, setConfigError] = useState('');

  const [form, setForm] = useState({
    quantity: '',
    price: '',
    incoterm: '',
    paymentTerms: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // 1. Fetch the Deal on mount
  useEffect(() => {
    setLoadingConfig(true);
    getDealById(dealId)
      .then((data) => {
        const c = user?.companyId;
        const isCompanyParticipant =
          sameId(data.buyerCompanyId, c) ||
          sameId(data.supplierCompanyId, c) ||
          user?.roles?.includes('admin');

        if (!isCompanyParticipant) {
          throw new Error('You do not have permission to edit this Deal.');
        }

        // Deal is editable only during inquiry or negotiation
        if (data.status !== 'inquiry' && data.status !== 'negotiation') {
          throw new Error(`Deal cannot be edited because it is in '${data.status}' stage. Only open negotiations can be edited.`);
        }

        setDeal(data);
        
        // Seed initial form values
        setForm({
          quantity: data.quantity || '',
          price: data.price || '',
          incoterm: data.incoterm || '',
          paymentTerms: data.paymentTerms || '',
        });
      })
      .catch((err) => setConfigError(err.message))
      .finally(() => setLoadingConfig(false));
  }, [dealId, user]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (form.quantity && isNaN(Number(form.quantity))) {
      e.quantity = 'Must be a valid number.';
    }
    if (form.price && isNaN(Number(form.price))) {
      e.price = 'Must be a valid price.';
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) {
      setErrors(e2);
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const payload = {};
      if (form.quantity) payload.quantity = Number(form.quantity);
      if (form.price) payload.price = Number(form.price);
      if (form.incoterm) payload.incoterm = form.incoterm;
      if (form.paymentTerms) payload.paymentTerms = form.paymentTerms.trim();

      await updateDeal(dealId, payload);
      navigate(`/deal/${dealId}`); // Navigate back to deal workspace on success
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Guards ─────────────────────────────────────────────────────────────────

  if (loadingConfig) {
    return (
      <AppShell title="Edit Deal" subtitle="">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
        </div>
      </AppShell>
    );
  }

  if (configError || !deal) {
    return (
      <AppShell title="Edit Deal" subtitle="">
        <div className="flex flex-col items-center gap-4 rounded-[28px] border border-rose-100 bg-rose-50 py-20 text-center">
          <Package className="h-12 w-12 text-rose-200" />
          <p className="max-w-md text-lg font-bold text-slate-800">{configError || 'Deal not found'}</p>
          <button onClick={() => navigate(`/deal/${dealId}`)} className="flex items-center gap-2 rounded-2xl bg-[#0A2540] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#143a6a]">
            <ArrowLeft className="h-4 w-4" /> Back to Deal Workspace
          </button>
        </div>
      </AppShell>
    );
  }

  // ── Main Page ──────────────────────────────────────────────────────────────

  return (
    <AppShell
      title="Edit Deal"
      subtitle={`Update core trade details for "${deal.productName}".`}
    >
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-[32px] border border-[#d8e2ef] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <form onSubmit={handleSubmit} className="p-6 xl:p-10">
            <h2 className="mb-6 text-2xl font-bold tracking-tight text-slate-950">Active Negotiation</h2>

            {submitError && (
              <div className="mb-6 flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {submitError}
              </div>
            )}

            <div className="mb-6 rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-800">
              Editing deal for <span className="font-semibold">{deal.productName}</span>. 
              Only core trade details can be negotiated. Status and company details are locked.
            </div>

            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Quantity" error={errors.quantity}>
                  <input
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(e) => { set('quantity', e.target.value); setErrors((err) => ({ ...err, quantity: '' })); }}
                    className={inputCls}
                  />
                </Field>

                <Field label="Deal Price" error={errors.price}>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => { set('price', e.target.value); setErrors((err) => ({ ...err, price: '' })); }}
                    className={inputCls}
                  />
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Payment Terms">
                  <input
                    value={form.paymentTerms}
                    onChange={(e) => set('paymentTerms', e.target.value)}
                    placeholder="e.g. 30% advance, 70% LC"
                    className={inputCls}
                  />
                </Field>

                <Field label="Incoterm">
                  <select
                    value={form.incoterm}
                    onChange={(e) => set('incoterm', e.target.value)}
                    className={`${inputCls} cursor-pointer`}
                  >
                    <option value="">Select incoterm…</option>
                    {INCOTERMS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
              </div>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate(`/deal/${dealId}`)}
                className="rounded-2xl border border-slate-200 px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0A2540] py-3.5 text-sm font-bold text-white transition hover:bg-[#143a6a] disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {submitting ? 'Updating deal…' : 'Save Negotiated Terms'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
