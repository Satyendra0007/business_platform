import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  BadgeDollarSign,
  Building2,
  CheckCircle2,
  FileText,
  Globe,
  Loader2,
  MapPin,
  Package,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Timer,
} from 'lucide-react';
import { AppShell } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { createRFQ, getIncomingRFQs } from '../lib/rfqService';
import { getMyRFQs } from '../lib/rfqService';

const CATEGORY_OPTIONS = [
  'Food & Agriculture',
  'Metals & Construction',
  'Industrial Equipment',
  'Electronics',
  'Textiles & Apparel',
  'Chemicals',
  'Packaging',
  'Home & Kitchen',
];

const INCOTERMS = ['EXW', 'FCA', 'FOB', 'CFR', 'CIF', 'DAP', 'DDP', 'CPT', 'CIP'];

const initialForm = {
  productName: '',
  category: '',
  quantity: '',
  targetPrice: '',
  destinationCountry: '',
  deliveryTimeline: '',
  incoterm: '',
  supplierHint: '',
  specifications: '',
  remarks: '',
};

function Field({ label, icon: Icon, children, hint }) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
        {label}
      </div>
      {children}
      {hint ? <p className="mt-1.5 text-[11px] leading-5 text-slate-400">{hint}</p> : null}
    </label>
  );
}

function TextInput(props) {
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

function DealRequestCard({ rfq, navigate, onOpenRequest, view = 'supplier' }) {
  const createdDate = rfq.createdAt
    ? new Date(rfq.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  const canOpenDeal = Boolean(rfq.dealId);
  const buyerName = rfq.buyerUserName || 'Buyer';
  const buyerCompany = rfq.buyerCompanyName || 'Company pending';
  const supplierName = rfq.supplierCompanyName || 'Supplier pending';
  const supplierCompany = rfq.supplierCompanyName || 'Company pending';
  const partyLabel = view === 'supplier' ? 'Buyer' : 'Supplier';
  const partyName = view === 'supplier' ? buyerName : supplierName;
  const partyCompany = view === 'supplier' ? buyerCompany : supplierCompany;
  const partyEmail = view === 'supplier' ? rfq.buyerUserEmail : rfq.supplierUserEmail;

  return (
    <article className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-[1rem] font-bold text-[#143a6a]">{rfq.productName || 'Deal Request'}</h3>
            <span className="rounded-full border border-sky-100 bg-sky-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-sky-700">
              Deal Request
            </span>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {rfq.category || 'Category pending'} · {rfq.quantity ? String(rfq.quantity) : 'Quantity pending'} · {createdDate}
          </p>
        </div>
        <button
          type="button"
          onClick={() => (canOpenDeal ? navigate(`/deal/${rfq.dealId}`) : onOpenRequest?.(rfq))}
          className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#173b67,#245c9d)] px-3.5 py-2 text-[11px] font-bold text-white transition hover:-translate-y-0.5"
        >
          {canOpenDeal ? 'Open Deal' : 'View Request'}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mt-3 rounded-[18px] bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{partyLabel}</p>
        <p className="font-semibold text-slate-700">{partyName}</p>
        <p>{partyCompany}</p>
        {partyEmail ? <p className="text-slate-400">{partyEmail}</p> : null}
      </div>
    </article>
  );
}

function DealRequestDetailPanel({ request, isSupplier, onClose, navigate }) {
  if (!request) return null;

  const partyLabel = isSupplier ? 'Buyer' : 'Supplier';
  const partyName = isSupplier
    ? (request.buyerUserName || 'Buyer')
    : (request.supplierCompanyName || 'Supplier');
  const partyCompany = isSupplier
    ? (request.buyerCompanyName || 'Company pending')
    : (request.supplierCompanyName || 'Company pending');
  const partyEmail = isSupplier ? request.buyerUserEmail : request.supplierUserEmail;

  return (
    <section className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Request detail</p>
          <h2 className="mt-1 text-[1.35rem] font-black tracking-tight text-[#143a6a]">
            {request.productName || 'Deal request'}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          Close
        </button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[22px] bg-slate-50 px-4 py-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{partyLabel}</p>
          <p className="mt-1 text-base font-bold text-slate-800">{partyName}</p>
          <p className="mt-1 text-sm text-slate-600">{partyCompany}</p>
          {partyEmail ? <p className="mt-1 text-xs text-slate-400">{partyEmail}</p> : null}
        </div>
        <div className="rounded-[22px] bg-slate-50 px-4 py-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</p>
          <p className="mt-1 text-base font-bold text-slate-800 capitalize">
            {request.status?.replace('_', ' ') || 'open'}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {request.dealId
              ? 'Deal chat is available now.'
              : isSupplier
                ? 'This request is waiting for the buyer to convert it into a live deal.'
                : 'This request is waiting for the supplier to open a live deal workspace.'}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {request.dealId ? (
          <button
            type="button"
            onClick={() => navigate(`/deal/${request.dealId}`)}
            className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0f2846,#245c9d)] px-5 py-3 text-sm font-bold text-white"
          >
            Open Chat
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : null}
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
        >
          Dismiss
        </button>
      </div>
    </section>
  );
}

function BuyerRequestWorkspace({ buyerRequests, buyerLoading, buyerError, navigate, onOpenRequest, emptyMessage }) {
  return (
    <section className="mt-6 rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Buyer workspace</p>
          <h2 className="mt-1 text-[1.35rem] font-black tracking-tight text-[#143a6a]">My deal requests</h2>
        </div>
        <button
          type="button"
          onClick={() => navigate('/my-rfqs')}
          className="text-sm font-medium text-[#245c9d]"
        >
          Open full list
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {buyerLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-[22px] bg-slate-100" />
            ))}
          </div>
        ) : buyerError ? (
          <div className="rounded-[22px] border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {buyerError}
          </div>
        ) : buyerRequests.length > 0 ? (
          buyerRequests.slice(0, 3).map((request) => (
            <DealRequestCard
              key={request._id}
              rfq={request}
              navigate={navigate}
              onOpenRequest={onOpenRequest}
              view="buyer"
            />
          ))
        ) : (
          <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            {emptyMessage || 'No requests are showing yet. Your next request will appear here once submitted.'}
          </div>
        )}
      </div>
    </section>
  );
}

export default function DealRequestPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [incomingLoading, setIncomingLoading] = useState(true);
  const [incomingError, setIncomingError] = useState('');
  const [buyerRequests, setBuyerRequests] = useState([]);
  const [buyerLoading, setBuyerLoading] = useState(true);
  const [buyerError, setBuyerError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);

  const canCreate = user?.roles?.includes('buyer');
  const isSupplier = user?.roles?.includes('supplier');

  const requestSummary = useMemo(() => {
    return [
      { label: 'Deal Type', value: form.productName || 'Structured trade request' },
      { label: 'Category', value: form.category || 'Category pending' },
      { label: 'Quantity', value: form.quantity ? `${form.quantity} units` : 'Not set' },
      { label: 'Target Price', value: form.targetPrice ? `$${form.targetPrice}` : 'Flexible' },
    ];
  }, [form]);

  const loadIncomingRequests = useCallback(() => {
    if (!isSupplier) return;
    let cancelled = false;
    setIncomingLoading(true);
    setIncomingError('');
    getIncomingRFQs({ page: 1, limit: 6 })
      .then((result) => {
        if (!cancelled) setIncomingRequests(result.rfqs || []);
      })
      .catch((err) => {
        if (!cancelled) setIncomingError(err.response?.data?.message || err.message || 'Failed to load deal requests.');
      })
      .finally(() => {
        if (!cancelled) setIncomingLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isSupplier]);

  const loadBuyerRequests = useCallback(() => {
    if (isSupplier) return;
    let cancelled = false;
    setBuyerLoading(true);
    setBuyerError('');
    getMyRFQs({ page: 1, limit: 10 })
      .then((result) => {
        if (!cancelled) setBuyerRequests(result.rfqs || []);
      })
      .catch((err) => {
        if (!cancelled) setBuyerError(err.response?.data?.message || err.message || 'Failed to load deal requests.');
      })
      .finally(() => {
        if (!cancelled) setBuyerLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isSupplier]);

  useEffect(() => {
    if (isSupplier) return loadIncomingRequests();
    return loadBuyerRequests();
  }, [isSupplier, loadIncomingRequests, loadBuyerRequests]);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError('');
  };

  if (isSupplier) {
    const openCount = incomingRequests.filter((request) => !request.dealId).length;
    const convertedCount = incomingRequests.filter((request) => request.dealId).length;

    return (
      <AppShell
        title="Deal Request"
        subtitle="Incoming deal requests from buyers targeting your company."
      >
        <div className="space-y-5">
          <section className="grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Total Requests', value: incomingRequests.length },
              { label: 'Open Requests', value: openCount },
              { label: 'Converted', value: convertedCount },
            ].map((item) => (
              <div key={item.label} className="rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                <p className="mt-2 text-3xl font-black text-[#0A2540]">{item.value}</p>
              </div>
            ))}
          </section>

          {incomingError && (
            <div className="flex items-center gap-3 rounded-[24px] border border-rose-100 bg-rose-50 px-4 py-4 text-sm text-rose-700">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {incomingError}
              <button onClick={loadIncomingRequests} className="ml-auto text-xs font-semibold underline hover:no-underline">
                Retry
              </button>
            </div>
          )}

          {incomingLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-24 animate-pulse rounded-[22px] bg-slate-100" />
              ))}
            </div>
          ) : incomingRequests.length > 0 ? (
            <div className="space-y-3">
              {incomingRequests.map((request) => (
                <DealRequestCard
                  key={request._id}
                  rfq={request}
                  navigate={navigate}
                  onOpenRequest={setSelectedRequest}
                  view="supplier"
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-[30px] border border-dashed border-slate-200 bg-white py-20 text-center">
              <Package className="h-12 w-12 text-slate-200" />
              <div>
                <p className="text-xl font-bold text-slate-700">No incoming deal requests yet</p>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Buyers have not sent any deal requests to your company yet.
                </p>
              </div>
            </div>
          )}

          <DealRequestDetailPanel
            request={selectedRequest}
            isSupplier
            onClose={() => setSelectedRequest(null)}
            navigate={navigate}
          />
        </div>
      </AppShell>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canCreate) {
      setError('Only buyer accounts can create new deal requests.');
      return;
    }

    if (!form.productName.trim()) {
      setError('Please enter a deal name or product name.');
      return;
    }

    if (!form.quantity || Number(form.quantity) <= 0) {
      setError('Please enter a valid quantity.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await createRFQ({
        productName: form.productName.trim(),
        category: form.category.trim(),
        quantity: Number(form.quantity),
        ...(form.targetPrice && { targetPrice: Number(form.targetPrice) }),
        ...(form.destinationCountry && { destinationCountry: form.destinationCountry.trim() }),
        ...(form.deliveryTimeline && { deliveryTimeline: form.deliveryTimeline.trim() }),
        ...(form.incoterm && { incoterm: form.incoterm }),
        ...(form.supplierHint && { specifications: `Preferred supplier: ${form.supplierHint.trim()}` }),
        ...(form.specifications && { specifications: form.specifications.trim() }),
        ...(form.remarks && { remarks: form.remarks.trim() }),
      });
      if (!isSupplier) {
        await loadBuyerRequests();
      }
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create deal request.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AppShell title="Deal Request Submitted" subtitle="">
        <div className="space-y-6">
          <div className="mx-auto max-w-3xl rounded-[32px] border border-emerald-100 bg-[linear-gradient(135deg,#f0fdf8,#ecfdf5)] p-8 text-center shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950">Your deal request is ready</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              The request has been created and is now available for follow-up in the workspace.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => navigate('/my-rfqs')}
                className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0f2846,#245c9d)] px-5 py-3 text-sm font-bold text-white"
              >
                View My Requests
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate('/deals')}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
              >
                Open Deals
              </button>
            </div>
          </div>

          {!isSupplier && (
            <BuyerRequestWorkspace
              buyerRequests={buyerRequests}
              buyerLoading={buyerLoading}
              buyerError={buyerError}
              navigate={navigate}
              onOpenRequest={setSelectedRequest}
              emptyMessage="No requests are showing yet. Your next request will appear here once submitted."
            />
          )}
          {!isSupplier && (
            <DealRequestDetailPanel
              request={selectedRequest}
              isSupplier={false}
              onClose={() => setSelectedRequest(null)}
              navigate={navigate}
            />
          )}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Deal Request"
      subtitle="Create a structured trade request with the same clarity you would expect from a company verification form."
    >
      {!isSupplier && (
        <BuyerRequestWorkspace
          buyerRequests={buyerRequests}
          buyerLoading={buyerLoading}
          buyerError={buyerError}
          navigate={navigate}
          onOpenRequest={setSelectedRequest}
          emptyMessage="No deal requests are showing yet. Your submitted requests will appear here."
        />
      )}

      <div className={`${!isSupplier ? 'mt-6' : ''} grid gap-6 xl:grid-cols-[0.86fr_1.14fr]`}>
        <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-[linear-gradient(180deg,#0c1f38_0%,#143a6a_100%)] p-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-sky-100">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            Buyer workflow
          </div>
          <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight">
            Create a clean, structured request.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-sky-100/85">
            Enter the trade details once and route them into your workspace with clear commercial context, logistics expectations, and pricing guidance.
          </p>

          <div className="mt-6 space-y-3 rounded-[24px] border border-white/10 bg-white/8 p-4 backdrop-blur">
            {[
              { icon: FileText, label: 'Commercial scope', copy: 'Add product name, category, and quantity.' },
              { icon: Globe, label: 'Logistics context', copy: 'Set destination, incoterm, and timing.' },
              { icon: ShieldCheck, label: 'Professional routing', copy: 'The request can be reviewed in your Deal Requests workspace.' },
            ].map(({ icon, label, copy }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                  {React.createElement(icon, { className: 'h-4.5 w-4.5 text-white' })}
                </div>
                <div>
                  <p className="font-bold text-white">{label}</p>
                  <p className="mt-0.5 text-sm leading-6 text-sky-100/75">{copy}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {requestSummary.map((item) => (
              <div key={item.label} className="rounded-[20px] border border-white/10 bg-white/8 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-100/70">{item.label}</p>
                <p className="mt-1 text-sm font-bold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <div className="border-b border-slate-100 px-6 py-5">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Request form</p>
            <h2 className="mt-1 text-[1.5rem] font-black tracking-tight text-[#143a6a]">Deal request details</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            {!canCreate && (
              <div className="flex items-start gap-3 rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-4 text-amber-900">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <p className="font-bold">Buyer account required</p>
                  <p className="mt-1 text-sm leading-6 text-amber-900/80">
                    Deal requests are created by buyer accounts. You can still review the form, but submission is disabled for this role.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 rounded-[24px] border border-rose-100 bg-rose-50 px-4 py-4 text-rose-700">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Deal name / product" icon={Package}>
                <TextInput
                  value={form.productName}
                  onChange={(e) => update('productName', e.target.value)}
                  placeholder="e.g. Sunflower Oil to Dubai"
                  disabled={!canCreate}
                />
              </Field>
              <Field label="Category" icon={Building2}>
                <Select
                  value={form.category}
                  onChange={(e) => update('category', e.target.value)}
                  disabled={!canCreate}
                >
                  <option value="">Select category</option>
                  {CATEGORY_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
                </Select>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Quantity" icon={BadgeDollarSign} hint="Use a unit count or tonnage equivalent.">
                <TextInput
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(e) => update('quantity', e.target.value)}
                  placeholder="e.g. 2500"
                  disabled={!canCreate}
                />
              </Field>
              <Field label="Target price" icon={ShieldCheck} hint="Optional benchmark price for the deal.">
                <TextInput
                  type="number"
                  min="0"
                  value={form.targetPrice}
                  onChange={(e) => update('targetPrice', e.target.value)}
                  placeholder="e.g. 850"
                  disabled={!canCreate}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Destination country" icon={MapPin}>
                <TextInput
                  value={form.destinationCountry}
                  onChange={(e) => update('destinationCountry', e.target.value)}
                  placeholder="e.g. United Arab Emirates"
                  disabled={!canCreate}
                />
              </Field>
              <Field label="Delivery timeline" icon={Timer}>
                <TextInput
                  value={form.deliveryTimeline}
                  onChange={(e) => update('deliveryTimeline', e.target.value)}
                  placeholder="e.g. 14-21 days"
                  disabled={!canCreate}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Incoterm" icon={Globe}>
                <Select
                  value={form.incoterm}
                  onChange={(e) => update('incoterm', e.target.value)}
                  disabled={!canCreate}
                >
                  <option value="">Select incoterm</option>
                  {INCOTERMS.map((term) => <option key={term} value={term}>{term}</option>)}
                </Select>
              </Field>
              <Field label="Preferred supplier" icon={Building2} hint="Optional. Leave blank if you want supplier matching.">
                <TextInput
                  value={form.supplierHint}
                  onChange={(e) => update('supplierHint', e.target.value)}
                  placeholder="Company or supplier name"
                  disabled={!canCreate}
                />
              </Field>
            </div>

            <Field label="Deal specifications" icon={FileText} hint="Describe quality, packaging, certifications, and any commercial expectations.">
              <TextArea
                rows="4"
                value={form.specifications}
                onChange={(e) => update('specifications', e.target.value)}
                placeholder="e.g. Food-grade, 50kg bags, export documentation required"
                disabled={!canCreate}
              />
            </Field>

            <Field label="Additional notes" icon={ArrowRight} hint="Anything the team should know before routing the request.">
              <TextArea
                rows="4"
                value={form.remarks}
                onChange={(e) => update('remarks', e.target.value)}
                placeholder="Payment preferences, urgency, compliance or shipping notes"
                disabled={!canCreate}
              />
            </Field>

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6 text-slate-500">
                This request is created as a structured trade record and can be reviewed inside the workspace.
              </p>
              <button
                type="submit"
                disabled={!canCreate || loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0f2846,#245c9d)] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Submit Deal Request
              </button>
            </div>
          </form>
        </section>
      </div>

      {!isSupplier && (
        <div className="mt-6">
          <DealRequestDetailPanel
            request={selectedRequest}
            isSupplier={false}
            onClose={() => setSelectedRequest(null)}
            navigate={navigate}
          />
        </div>
      )}
    </AppShell>
  );
}
