import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, ArrowLeft, Package, AlertCircle } from 'lucide-react';
import { AppShell } from '../components/ui';
import { getRFQById, updateRFQ } from '../lib/rfqService';
import { DocumentUploader } from '../components/company/CompanyUploaders';
import { useAuth } from '../hooks/useAuth';

const INCOTERMS = ['EXW', 'FOB', 'CIF', 'CFR', 'DAP', 'DDP', 'FCA', 'CPT', 'CIP'];
const inputCls = "w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#245c9d] focus:ring-2 focus:ring-[#245c9d]/10";

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

export default function EditRFQPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { rfqId } = useParams();

  const [rfq, setRfq] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [configError, setConfigError] = useState('');

  const [form, setForm] = useState({
    quantity: '',
    targetPrice: '',
    deliveryTimeline: '',
    incoterm: '',
    specifications: '',
    remarks: '',
    attachments: []
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // 1. Fetch the RFQ on mount
  useEffect(() => {
    setLoadingConfig(true);
    getRFQById(rfqId)
      .then((data) => {
        // Guard check — Only the buyer who owns it can edit it
        if (data.buyerCompanyId !== user?.companyId) {
          throw new Error('You do not have permission to edit this RFQ.');
        }
        if (['closed', 'converted'].includes(data.status)) {
          throw new Error(`Cannot edit RFQ because it is already ${data.status}.`);
        }
        setRfq(data);
        
        // Seed initial form values
        setForm({
          quantity: data.quantity || '',
          targetPrice: data.targetPrice || '',
          deliveryTimeline: data.deliveryTimeline || '',
          incoterm: data.incoterm || '',
          specifications: data.specifications || '',
          remarks: data.remarks || '',
          attachments: data.attachments ? data.attachments.map((url, i) => ({ url, name: `Attachment ${i + 1}`, type: url.split('.').pop() })) : []
        });
      })
      .catch((err) => setConfigError(err.response?.data?.message || err.message))
      .finally(() => setLoadingConfig(false));
  }, [rfqId, user?.companyId]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.quantity || isNaN(Number(form.quantity)) || Number(form.quantity) <= 0) {
      e.quantity = 'Please enter a valid quantity greater than 0.';
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
      const payload = {
        quantity: Number(form.quantity),
      };
      if (form.targetPrice) payload.targetPrice = Number(form.targetPrice);
      if (form.deliveryTimeline) payload.deliveryTimeline = form.deliveryTimeline.trim();
      if (form.incoterm) payload.incoterm = form.incoterm;
      if (form.specifications) payload.specifications = form.specifications.trim();
      if (form.remarks) payload.remarks = form.remarks.trim();
      if (form.attachments && form.attachments.length > 0) {
        payload.attachments = form.attachments.map(a => a.url);
      }

      await updateRFQ(rfqId, payload);
      navigate('/my-rfqs'); // Navigate back on success
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Guards ─────────────────────────────────────────────────────────────────

  if (loadingConfig) {
    return (
      <AppShell title="Edit RFQ" subtitle="">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
        </div>
      </AppShell>
    );
  }

  if (configError || !rfq) {
    return (
      <AppShell title="Edit RFQ" subtitle="">
        <div className="flex flex-col items-center gap-4 rounded-[28px] border border-rose-100 bg-rose-50 py-20 text-center">
          <Package className="h-12 w-12 text-rose-200" />
          <p className="max-w-md text-lg font-bold text-slate-800">{configError || 'RFQ not found'}</p>
          <button onClick={() => navigate('/my-rfqs')} className="flex items-center gap-2 rounded-2xl bg-[#0A2540] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#143a6a]">
            <ArrowLeft className="h-4 w-4" /> Back to My RFQs
          </button>
        </div>
      </AppShell>
    );
  }

  // ── Main Page ──────────────────────────────────────────────────────────────

  return (
    <AppShell
      title="Edit RFQ"
      subtitle={`Update your requirements for "${rfq.productName}".`}
    >
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-[32px] border border-[#d8e2ef] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <form onSubmit={handleSubmit} className="p-6 xl:p-10">
            <h2 className="mb-6 text-2xl font-bold tracking-tight text-slate-950">Update Request</h2>

            {submitError && (
              <div className="mb-6 flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {submitError}
              </div>
            )}

            <div className="space-y-5">
              <Field label="Quantity *" error={errors.quantity}>
                <input
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(e) => { set('quantity', e.target.value); setErrors((err) => ({ ...err, quantity: '' })); }}
                  className={inputCls}
                  required
                />
              </Field>

              <Field label="Target Price (optional)">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.targetPrice}
                  onChange={(e) => set('targetPrice', e.target.value)}
                  className={inputCls}
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Delivery Timeline">
                  <input
                    value={form.deliveryTimeline}
                    onChange={(e) => set('deliveryTimeline', e.target.value)}
                    placeholder="e.g. 30–45 days"
                    className={inputCls}
                  />
                </Field>

                <Field label="Incoterm (optional)">
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

              <Field label="Specifications (optional)">
                <textarea
                  value={form.specifications}
                  onChange={(e) => set('specifications', e.target.value)}
                  rows={3}
                  className={inputCls}
                />
              </Field>

              <Field label="Remarks (optional)">
                <textarea
                  value={form.remarks}
                  onChange={(e) => set('remarks', e.target.value)}
                  rows={2}
                  className={inputCls}
                />
              </Field>

              <div className="pt-2">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Attachments</span>
                <DocumentUploader
                  documents={form.attachments}
                  onChange={(docs) => set('attachments', docs)}
                />
              </div>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate('/my-rfqs')}
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
                {submitting ? 'Saving changes…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
