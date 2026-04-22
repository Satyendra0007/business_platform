/**
 * RequestQuotePage.jsx — Create an RFQ from a product listing.
 *
 * Routes to this page: /request-quote/:productId
 * The productId comes from the product detail page or grid.
 *
 * Flow:
 *  1. Fetch the real product from /api/products/:id
 *  2. Validate user has a company (otherwise block with CTA)
 *  3. Submit form → POST /api/rfq
 *  4. On success → navigate to /my-rfqs
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Loader2, AlertCircle, Package, CheckCircle2,
  ArrowLeft, Building2, ArrowRight,
  MapPin, DollarSign, Weight, FileText, Calendar, StickyNote
} from 'lucide-react';
import { AppShell } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { getProductById } from '../lib/productService';
import { createRFQ } from '../lib/rfqService';
import { DocumentUploader } from '../components/company/CompanyUploaders';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPrice(price, unit) {
  if (price == null) return null;
  const f = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(price);
  return unit ? `${f} / ${unit}` : f;
}

// ─── Field component ──────────────────────────────────────────────────────────

function Field({ label, icon: Icon, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
        {label}
      </span>
      {children}
      {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
    </label>
  );
}

const inputCls = "w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#245c9d] focus:ring-2 focus:ring-[#245c9d]/10";

// ─── Main ─────────────────────────────────────────────────────────────────────

const INITIAL_FORM = {
  quantity:          '',
  targetPrice:       '',
  destinationCountry: '',
  deliveryTimeline:  '',
  incoterm:          '',
  specifications:    '',
  remarks:           '',
  attachments:       [],
};

const INCOTERMS = ['EXW', 'FOB', 'CIF', 'CFR', 'DAP', 'DDP', 'FCA', 'CPT', 'CIP'];

export default function RequestQuotePage() {
  const { user }      = useAuth();
  const navigate      = useNavigate();
  const { productId } = useParams();

  const [product,    setProduct]  = useState(null);
  const [loadingProd, setLoadingProd] = useState(true);
  const [prodError,  setProdError] = useState('');

  const [form,       setForm]     = useState(INITIAL_FORM);
  const [errors,     setErrors]   = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success,    setSuccess]  = useState(false);

  // ── Fetch product ──────────────────────────────────────────────────────────
  useEffect(() => {
    setLoadingProd(true);
    getProductById(productId)
      .then(setProduct)
      .catch((err) => setProdError(err.response?.data?.message || err.message))
      .finally(() => setLoadingProd(false));
  }, [productId]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  function validate() {
    const e = {};
    if (!form.quantity || isNaN(Number(form.quantity)) || Number(form.quantity) <= 0)
      e.quantity = 'Please enter a valid quantity greater than 0.';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }

    setSubmitting(true);
    setSubmitError('');
    try {
      await createRFQ({
        productId: product._id,
        quantity:  Number(form.quantity),
        ...(form.targetPrice        && { targetPrice:        Number(form.targetPrice) }),
        ...(form.destinationCountry && { destinationCountry: form.destinationCountry.trim() }),
        ...(form.deliveryTimeline   && { deliveryTimeline:   form.deliveryTimeline.trim() }),
        ...(form.incoterm           && { incoterm:           form.incoterm }),
        ...(form.specifications     && { specifications:     form.specifications.trim() }),
        ...(form.remarks            && { remarks:            form.remarks.trim() }),
        ...(form.attachments.length > 0 && { attachments:    form.attachments.map(a => a.url) }),
      });
      setSuccess(true);
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Guards ─────────────────────────────────────────────────────────────────

  // Loading product
  if (loadingProd) {
    return (
      <AppShell title="Request Quote" subtitle="">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
        </div>
      </AppShell>
    );
  }

  // Product not found
  if (prodError || !product) {
    return (
      <AppShell title="Request Quote" subtitle="">
        <div className="flex flex-col items-center gap-4 rounded-[28px] border border-rose-100 bg-rose-50 py-20 text-center">
          <Package className="h-12 w-12 text-rose-200" />
          <p className="text-lg font-bold text-slate-800">{prodError || 'Product not found'}</p>
          <button onClick={() => navigate('/products')} className="flex items-center gap-2 rounded-2xl bg-[#0A2540] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#143a6a]">
            <ArrowLeft className="h-4 w-4" /> Back to Products
          </button>
        </div>
      </AppShell>
    );
  }

  // No company linked
  if (!user?.companyId) {
    return (
      <AppShell title="Request Quote" subtitle="A company profile is required before submitting RFQs.">
        <div className="flex flex-col items-center gap-5 rounded-[28px] border border-amber-200 bg-[linear-gradient(135deg,#fffbf0,#fff8e6)] py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <Building2 className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">Company profile required</p>
            <p className="mt-2 max-w-md text-sm text-slate-600">
              You need a verified company profile to send RFQs. Set up your company first — it only takes a minute.
            </p>
          </div>
          <button onClick={() => navigate('/company/setup')} className="flex items-center gap-2 rounded-2xl bg-[#0A2540] px-6 py-3 text-sm font-bold text-white hover:bg-[#143a6a]">
            Set Up Company <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </AppShell>
    );
  }

  // Success state
  if (success) {
    return (
      <AppShell title="RFQ Submitted" subtitle="">
        <div className="flex flex-col items-center gap-6 rounded-[28px] border border-emerald-100 bg-[linear-gradient(135deg,#f0fdf8,#ecfdf5)] py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">RFQ Submitted!</p>
            <p className="mt-2 text-sm text-slate-600">
              Your request for <span className="font-semibold text-slate-800">{product.title}</span> has been sent to the supplier.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/my-rfqs')}
              className="rounded-2xl bg-[#0A2540] px-6 py-3 text-sm font-bold text-white hover:bg-[#143a6a]"
            >
              View My RFQs
            </button>
            <button
              onClick={() => navigate('/products')}
              className="rounded-2xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Browse More
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  // ── Main form ──────────────────────────────────────────────────────────────
  return (
    <AppShell
      title="Request Quote"
      subtitle={`Submit an RFQ for "${product.title}". The supplier will receive your requirements instantly.`}
    >
      <div className="mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-[32px] border border-[#d8e2ef] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <div className="grid lg:grid-cols-[0.85fr_1.15fr]">

            {/* Left — product summary */}
            <div className="bg-[linear-gradient(135deg,#dbeafe,#f0f7ff)] p-6 xl:p-8">
              {/* Product image */}
              <div className="mb-5 overflow-hidden rounded-[24px] bg-white/50">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.title} className="h-44 w-full object-cover" />
                ) : (
                  <div className="flex h-44 items-center justify-center">
                    <Package className="h-16 w-16 text-slate-200" />
                  </div>
                )}
              </div>

              <span className="inline-flex rounded-full bg-white/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#245c9d]">
                {product.category || 'Product'}
              </span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">{product.title}</h2>

              {product.description && (
                <p className="mt-2 text-sm leading-6 text-slate-600 line-clamp-3">{product.description}</p>
              )}

              {/* Trade snapshot */}
              <div className="mt-5 space-y-2">
                {[
                  { label: 'Listed Price', value: fmtPrice(product.price, product.unit) },
                  { label: 'Min Order', value: product.MOQ ? `${product.MOQ} ${product.unit || 'units'}` : null },
                  { label: 'Origin', value: product.countryOfOrigin },
                  { label: 'Lead Time', value: product.leadTime },
                ].filter((r) => r.value).map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between rounded-[16px] bg-white/60 px-4 py-2.5 text-sm">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-semibold text-slate-800">{value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[18px] border border-blue-100 bg-white/50 px-4 py-3 text-xs leading-5 text-slate-500">
                💬 Supplier is auto-resolved from this product. Deal chat begins after you convert the RFQ.
              </div>
            </div>

            {/* Right — form */}
            <form onSubmit={handleSubmit} className="p-6 xl:p-8">
              <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">RFQ Details</p>

              {submitError && (
                <div className="mb-4 flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {submitError}
                </div>
              )}

              <div className="space-y-4">
                {/* Quantity — required */}
                <Field label="Quantity *" icon={Weight} error={errors.quantity}>
                  <input
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(e) => { set('quantity', e.target.value); setErrors((err) => ({ ...err, quantity: '' })); }}
                    placeholder={product.unit ? `e.g. 500 ${product.unit}` : 'e.g. 500'}
                    className={inputCls}
                    required
                  />
                </Field>

                {/* Target price — optional */}
                <Field label="Target Price (optional)" icon={DollarSign}>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.targetPrice}
                    onChange={(e) => set('targetPrice', e.target.value)}
                    placeholder={product.price ? `Listed at ${fmtPrice(product.price, product.unit)}` : 'e.g. 820'}
                    className={inputCls}
                  />
                </Field>

                {/* 2-col row */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Destination Country" icon={MapPin}>
                    <input
                      value={form.destinationCountry}
                      onChange={(e) => set('destinationCountry', e.target.value)}
                      placeholder="e.g. United Arab Emirates"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Delivery Timeline" icon={Calendar}>
                    <input
                      value={form.deliveryTimeline}
                      onChange={(e) => set('deliveryTimeline', e.target.value)}
                      placeholder="e.g. 30–45 days"
                      className={inputCls}
                    />
                  </Field>
                </div>

                {/* Incoterm */}
                <Field label="Incoterm (optional)" icon={FileText}>
                  <select
                    value={form.incoterm}
                    onChange={(e) => set('incoterm', e.target.value)}
                    className={`${inputCls} cursor-pointer`}
                  >
                    <option value="">Select incoterm…</option>
                    {INCOTERMS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>

                {/* Specifications */}
                <Field label="Specifications (optional)" icon={FileText}>
                  <textarea
                    value={form.specifications}
                    onChange={(e) => set('specifications', e.target.value)}
                    rows={3}
                    placeholder="Grade, purity, packaging requirements, certifications needed…"
                    className={inputCls}
                  />
                </Field>

                {/* Remarks */}
                <Field label="Remarks (optional)" icon={StickyNote}>
                  <textarea
                    value={form.remarks}
                    onChange={(e) => set('remarks', e.target.value)}
                    rows={2}
                    placeholder="Any other notes for the supplier…"
                    className={inputCls}
                  />
                </Field>

                {/* Attachments */}
                <div className="pt-2">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Attachments (optional)</span>
                  <DocumentUploader
                    documents={form.attachments}
                    onChange={(docs) => set('attachments', docs)}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0A2540] py-3.5 text-sm font-bold text-white transition hover:bg-[#143a6a] disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {submitting ? 'Submitting…' : 'Submit RFQ'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
