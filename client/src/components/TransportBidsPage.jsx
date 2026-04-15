/**
 * TransportBidsPage.jsx — Freight tendering workspace.
 *
 * TWO ROLES:
 *  1. Buyer / Supplier — sees their deals in shipping_request stage,
 *     can create a freight request and accept bids.
 *  2. Shipping Agent  — sees all open freight requests (cargo only, no pricing),
 *     can submit bids.
 *
 * Real API via shippingService.js, no mock data.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  ShipWheel, Loader2, AlertCircle, CheckCircle2,
  ArrowRight, MapPin, CalendarDays, Package,
  BadgeDollarSign, Clock3, ShieldCheck, Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppShell, MetricCard } from './ui';
import { useAuth } from '../hooks/useAuth';
import { getDeals } from '../lib/dealService';
import {
  createShippingRequest, getShippingRequest,
  getShippingBids, acceptBid,
  listOpenRequests, submitBid
} from '../lib/shippingService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtPrice = (p) => p != null
  ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(p)
  : '—';

const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  : '—';

const TRANSPORT_TYPES = ['sea', 'air', 'land'];

// ─── Bid status badge ─────────────────────────────────────────────────────────

function BidBadge({ status }) {
  const map = {
    pending:  { cls: 'bg-sky-50 text-sky-700 border-sky-100',     label: 'Pending' },
    accepted: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Awarded ✓' },
    rejected: { cls: 'bg-slate-50 text-slate-400 border-slate-200',  label: 'Rejected' },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${s.cls}`}>
      {s.label}
    </span>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// BUYER / SUPPLIER VIEW
// ══════════════════════════════════════════════════════════════════════════════

/**
 * DealFreightCard — one card per deal in shipping_request stage.
 * Loads its own shipping request + bids.
 */
function DealFreightCard({ deal, navigate }) {
  const [request,   setRequest]   = useState(null);
  const [bids,      setBids]      = useState([]);
  const [loadingR,  setLoadingR]  = useState(true);
  const [creating,  setCreating]  = useState(false);
  const [accepting, setAccepting] = useState(null); // bidId being accepted
  const [error,     setError]     = useState('');

  // Request form state
  const [form, setForm] = useState({ origin: '', destination: '', cargoDetails: '', quantity: '', incoterm: '' });
  const [showForm, setShowForm] = useState(false);

  // Load existing request for this deal
  const loadRequest = useCallback(async () => {
    setLoadingR(true);
    try {
      const req = await getShippingRequest(deal._id);
      setRequest(req);
      if (req) {
        const { bids: b } = await getShippingBids(req._id);
        setBids(b);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingR(false);
    }
  }, [deal._id]);

  useEffect(() => { loadRequest(); }, [loadRequest]);

  // Create shipping request
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.origin.trim() || !form.destination.trim()) return;
    setCreating(true);
    setError('');
    try {
      await createShippingRequest({
        dealId:       deal._id,
        origin:       form.origin.trim(),
        destination:  form.destination.trim(),
        cargoDetails: form.cargoDetails.trim() || undefined,
        quantity:     form.quantity ? Number(form.quantity) : undefined,
        incoterm:     form.incoterm || undefined,
      });
      setShowForm(false);
      await loadRequest();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  // Accept a bid
  const handleAccept = async (bidId) => {
    if (!window.confirm('Award this carrier? Deal will move to Shipping stage.')) return;
    setAccepting(bidId);
    setError('');
    try {
      await acceptBid(bidId);
      await loadRequest();
    } catch (err) {
      setError(err.message);
    } finally {
      setAccepting(null);
    }
  };

  return (
    <article className="overflow-hidden rounded-[32px] border border-[#d8e2ef] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.07)]">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-[linear-gradient(180deg,#fff,#f8fbff)] px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,#173b67,#245c9d)] text-white">
            <ShipWheel className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Freight Tender</p>
            <p className="font-bold text-slate-900">{deal.productName || 'Deal'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700 border border-blue-100">
            {deal.status?.replace(/_/g, ' ')}
          </span>
          <button
            onClick={() => navigate(`/deal/${deal._id}`)}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Workspace <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Error */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {loadingR ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
          </div>
        ) : !request ? (
          /* No shipping request yet — let participant create one */
          <div className="space-y-4">
            {!showForm ? (
              <div className="flex flex-col items-center gap-4 rounded-[24px] border border-dashed border-slate-200 py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50">
                  <Plus className="h-6 w-6 text-slate-300" />
                </div>
                <div>
                  <p className="font-semibold text-slate-700">No freight request yet</p>
                  <p className="mt-1 text-sm text-slate-400">Create a shipping request so agents can start bidding.</p>
                </div>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#0A2540] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#143a6a] transition"
                >
                  <Plus className="h-4 w-4" /> Create Freight Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-bold text-slate-800">New Freight Request</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { key: 'origin',      label: 'Origin *',      placeholder: 'e.g. Shanghai, CN' },
                    { key: 'destination', label: 'Destination *',  placeholder: 'e.g. Jebel Ali, UAE' },
                    { key: 'cargoDetails',label: 'Cargo Details',  placeholder: 'Description of goods' },
                    { key: 'quantity',    label: 'Quantity',       placeholder: 'e.g. 500 MT', type: 'number' },
                  ].map(({ key, label, placeholder, type }) => (
                    <label key={key} className="block">
                      <span className="mb-1 block text-xs font-semibold text-slate-600">{label}</span>
                      <input
                        type={type || 'text'}
                        value={form[key]}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#245c9d] focus:ring-2 focus:ring-[#245c9d]/10"
                      />
                    </label>
                  ))}
                </div>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-600">Incoterm</span>
                  <select
                    value={form.incoterm}
                    onChange={(e) => setForm((f) => ({ ...f, incoterm: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#245c9d]"
                  >
                    <option value="">Select…</option>
                    {['FOB','CIF','EXW','DAP','DDP','CFR','FCA'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </label>
                <div className="flex gap-3">
                  <button type="submit" disabled={creating} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0A2540] py-2.5 text-sm font-bold text-white hover:bg-[#143a6a] disabled:opacity-60">
                    {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {creating ? 'Creating…' : 'Create Request'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* Shipping request exists — show details + bids */
          <div className="space-y-6">
            {/* Request summary */}
            <div className="grid gap-4 sm:grid-cols-4">
              {[
                { label: 'Origin',      value: request.origin,      icon: MapPin },
                { label: 'Destination', value: request.destination,  icon: MapPin },
                { label: 'Quantity',    value: request.quantity ? String(request.quantity) : '—', icon: Package },
                { label: 'Incoterm',    value: request.incoterm || '—', icon: ShieldCheck },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-[18px] border border-[#e2ebf4] bg-[#f8fbff] p-3">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <Icon className="h-3 w-3" /> {label}
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-700">{value}</p>
                </div>
              ))}
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${request.status === 'open' ? 'bg-sky-50 text-sky-700 border-sky-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                {request.status === 'open' ? '🟢 Open for bids' : '🔒 Closed'}
              </span>
              <span className="text-xs text-slate-400">{bids.length} bid{bids.length !== 1 ? 's' : ''} received</span>
            </div>

            {/* Bids */}
            {bids.length === 0 ? (
              <div className="flex items-center gap-4 rounded-[24px] border border-dashed border-slate-200 p-6 text-center">
                <Clock3 className="h-8 w-8 shrink-0 text-slate-200" />
                <div className="text-left">
                  <p className="font-semibold text-slate-600">Awaiting carrier quotes</p>
                  <p className="text-sm text-slate-400">Shipping agents can see this request and will submit bids shortly.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Carrier Offers</p>
                {bids.map((bid) => {
                  const isAccepted = bid.status === 'accepted';
                  return (
                    <div
                      key={bid._id}
                      className={`rounded-[24px] border p-5 transition ${isAccepted ? 'border-emerald-200 bg-emerald-50 ring-4 ring-emerald-50' : 'border-[#d8e2ef] bg-white hover:border-slate-300'}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] ${isAccepted ? 'bg-emerald-500 text-white' : 'bg-[#eaf3ff] text-[#245c9d]'}`}>
                              <ShipWheel className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">Shipping Agent</p>
                              <p className="text-[10px] text-slate-400">Submitted {fmtDate(bid.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                        <BidBadge status={bid.status} />
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-3 rounded-[18px] bg-slate-50 p-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Price</p>
                          <p className="mt-1 text-base font-black text-slate-900">{fmtPrice(bid.price)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Transit</p>
                          <p className="mt-1 text-sm font-bold text-slate-700">{bid.transitTime || '—'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Type</p>
                          <p className="mt-1 text-sm font-bold capitalize text-slate-700">{bid.transportType || '—'}</p>
                        </div>
                      </div>

                      {bid.notes && (
                        <p className="mt-3 border-l-2 border-slate-200 pl-3 text-sm italic leading-6 text-slate-500">"{bid.notes}"</p>
                      )}

                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-xs text-slate-400">
                          Valid until: <span className="font-semibold">{fmtDate(bid.validity)}</span>
                        </p>
                        {request.status === 'open' && bid.status === 'pending' && (
                          <button
                            onClick={() => handleAccept(bid._id)}
                            disabled={!!accepting}
                            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:opacity-60"
                          >
                            {accepting === bid._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                            {accepting === bid._id ? 'Awarding…' : 'Award Carrier'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SHIPPING AGENT VIEW
// ══════════════════════════════════════════════════════════════════════════════

function AgentView() {
  const [requests,  setRequests]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [drafts,    setDrafts]    = useState({});   // requestId → form data
  const [submitting,setSubmitting]= useState(null);
  const [submitted, setSubmitted] = useState({});   // requestId → bid
  const [actionError, setActionError] = useState({});

  useEffect(() => {
    setLoading(true);
    listOpenRequests()
      .then((r) => setRequests(r.requests))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const updateDraft = (reqId, field, val) =>
    setDrafts((d) => ({ ...d, [reqId]: { ...d[reqId], [field]: val } }));

  const handleSubmitBid = async (reqId) => {
    const draft = drafts[reqId] || {};
    if (!draft.price) { setActionError((e) => ({ ...e, [reqId]: 'Price is required.' })); return; }
    setSubmitting(reqId);
    setActionError((e) => ({ ...e, [reqId]: '' }));
    try {
      const bid = await submitBid({
        shippingRequestId: reqId,
        price:             Number(draft.price),
        transportType:     draft.transportType || undefined,
        transitTime:       draft.transitTime   || undefined,
        validity:          draft.validity      || undefined,
        notes:             draft.notes         || undefined,
      });
      setSubmitted((s) => ({ ...s, [reqId]: bid }));
      setDrafts((d) => ({ ...d, [reqId]: {} }));
    } catch (err) {
      setActionError((e) => ({ ...e, [reqId]: err.message }));
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) return (
    <div className="space-y-4">
      {[1, 2].map((i) => <div key={i} className="h-52 animate-pulse rounded-[28px] bg-slate-100" />)}
    </div>
  );

  if (error) return (
    <div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm text-rose-700">
      <AlertCircle className="h-5 w-5 shrink-0" /> {error}
    </div>
  );

  if (requests.length === 0) return (
    <div className="flex flex-col items-center gap-5 rounded-[28px] border border-dashed border-slate-200 py-24 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-slate-50">
        <ShipWheel className="h-10 w-10 text-slate-200" />
      </div>
      <div>
        <p className="text-xl font-bold text-slate-700">No open freight tenders</p>
        <p className="mt-2 max-w-sm text-sm text-slate-400">
          When buyers and suppliers raise freight requests, they'll appear here for you to bid on.
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {requests.map((req) => {
        const draft = drafts[req._id] || {};
        const alreadySubmitted = submitted[req._id];
        return (
          <article key={req._id} className="overflow-hidden rounded-[32px] border border-[#d8e2ef] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.07)]">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-slate-100 bg-[linear-gradient(180deg,#fff,#f8fbff)] px-6 py-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,#173b67,#245c9d)] text-white">
                <ShipWheel className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Open Freight Tender</p>
                <p className="font-bold text-slate-900">{req.origin} → {req.destination}</p>
              </div>
              <span className="ml-auto rounded-full bg-sky-50 border border-sky-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-sky-700">
                Open
              </span>
            </div>

            <div className="grid gap-6 p-6 lg:grid-cols-[0.85fr_1.15fr]">
              {/* Left — cargo details */}
              <div className="space-y-4">
                <div className="rounded-[24px] border border-blue-100 bg-[#f4f9ff] p-5">
                  <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[#245c9d]">Cargo Requirements</p>
                  <div className="space-y-3 text-sm">
                    {[
                      { label: 'Route',    value: `${req.origin} → ${req.destination}`, icon: MapPin },
                      { label: 'Cargo',    value: req.cargoDetails || '—',              icon: Package },
                      { label: 'Quantity', value: req.quantity ? String(req.quantity) : '—', icon: Package },
                      { label: 'Incoterm', value: req.incoterm || '—',                 icon: ShieldCheck },
                      { label: 'Posted',   value: fmtDate(req.createdAt),              icon: CalendarDays },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} className="flex items-start gap-3">
                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#245c9d]" />
                        <span className="text-slate-600"><span className="font-semibold text-slate-800">{label}:</span> {value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right — bid form or success */}
              <div>
                {alreadySubmitted ? (
                  <div className="flex flex-col items-center gap-3 rounded-[24px] border border-emerald-200 bg-emerald-50 py-10 text-center">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                    <p className="font-bold text-emerald-800">Bid Submitted!</p>
                    <p className="text-sm text-emerald-700">Price: {fmtPrice(alreadySubmitted.price)}</p>
                    <p className="text-xs text-emerald-600">Awaiting buyer/supplier decision.</p>
                  </div>
                ) : (
                  <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-5 flex items-center gap-2">
                      <BadgeDollarSign className="h-5 w-5 text-[#245c9d]" />
                      <p className="font-bold text-slate-900">Submit Quotation</p>
                    </div>
                    {actionError[req._id] && (
                      <div className="mb-3 flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {actionError[req._id]}
                      </div>
                    )}
                    <div className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block">
                          <span className="mb-1 block text-xs font-bold text-slate-600">Price (USD) *</span>
                          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-[#245c9d] focus-within:bg-white transition">
                            <BadgeDollarSign className="h-4 w-4 shrink-0 text-slate-400" />
                            <input type="number" min="0" value={draft.price || ''} onChange={(e) => updateDraft(req._id, 'price', e.target.value)} placeholder="e.g. 4500" className="w-full bg-transparent text-sm outline-none" />
                          </div>
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-xs font-bold text-slate-600">Transit Time</span>
                          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-[#245c9d] focus-within:bg-white transition">
                            <Clock3 className="h-4 w-4 shrink-0 text-slate-400" />
                            <input value={draft.transitTime || ''} onChange={(e) => updateDraft(req._id, 'transitTime', e.target.value)} placeholder="e.g. 18-22 days" className="w-full bg-transparent text-sm outline-none" />
                          </div>
                        </label>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block">
                          <span className="mb-1 block text-xs font-bold text-slate-600">Transport Type</span>
                          <select value={draft.transportType || ''} onChange={(e) => updateDraft(req._id, 'transportType', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#245c9d]">
                            <option value="">Select…</option>
                            {TRANSPORT_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)} Freight</option>)}
                          </select>
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-xs font-bold text-slate-600">Validity Date</span>
                          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-[#245c9d] focus-within:bg-white transition">
                            <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
                            <input type="date" value={draft.validity || ''} onChange={(e) => updateDraft(req._id, 'validity', e.target.value)} className="w-full bg-transparent text-sm outline-none" />
                          </div>
                        </label>
                      </div>
                      <label className="block">
                        <span className="mb-1 block text-xs font-bold text-slate-600">Notes / Inclusions</span>
                        <textarea value={draft.notes || ''} onChange={(e) => updateDraft(req._id, 'notes', e.target.value)} rows={2} placeholder="Surcharges, door-to-door, customs handling…" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#245c9d] resize-none" />
                      </label>
                      <button
                        onClick={() => handleSubmitBid(req._id)}
                        disabled={submitting === req._id}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0c1f38] py-3.5 text-sm font-bold text-white shadow hover:bg-[#153a66] disabled:opacity-60 transition"
                      >
                        {submitting === req._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeDollarSign className="h-4 w-4" />}
                        {submitting === req._id ? 'Submitting…' : 'Submit Quotation'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════════════════════════════════

export default function TransportBidsPage() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const isAgent   = user?.roles?.includes('shipping_agent');

  const [deals,   setDeals]   = useState([]);
  const [loading, setLoading] = useState(!isAgent);
  const [error,   setError]   = useState('');

  // Buyer/supplier: load deals in shipping_request stage
  useEffect(() => {
    if (isAgent) return;
    setLoading(true);
    getDeals({ limit: 50 })
      .then((r) => setDeals(r.deals.filter((d) => d.status === 'shipping_request')))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [isAgent]);

  return (
    <AppShell
      title="Transport Bids"
      subtitle={
        isAgent
          ? 'Browse open freight tenders and submit competitive quotations. Cargo details only — commercial terms are kept confidential.'
          : 'Manage freight requests for your deals in the shipping stage. Create a request and award the best carrier quote.'
      }
    >
      <div className="space-y-6">
        {/* Hero banner */}
        <section className="relative overflow-hidden rounded-[30px] border border-slate-300/40 bg-[#0c1f38] p-7 text-white shadow-xl lg:p-8">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&q=80&w=2400"
              alt="Shipping Containers at Port"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a1b32] via-[#102a4e]/95 to-[#1c4f8d]/80 backdrop-blur-[2px]" />
          </div>
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-sky-200">
                {isAgent ? 'Agent Dashboard' : 'Transport Procurement'}
              </div>
              <h2 className="mt-5 text-3xl font-bold tracking-tight lg:text-4xl">
                {isAgent ? 'Open Freight Tenders' : 'Freight bidding built into the deal workflow'}
              </h2>
              <p className="mt-3 text-sm leading-7 text-sky-100/90">
                {isAgent
                  ? 'Review open lanes, quote professionally, and compete for awarded carrier contracts without leaving the workspace.'
                  : 'When deals reach the Shipping Request stage, open a freight tender so verified carriers compete for your lane.'}
              </p>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:mt-0">
              <MetricCard dark label={isAgent ? 'Open Tenders' : 'Active Tenders'} value={isAgent ? '—' : deals.length} />
              <MetricCard dark label="Role" value={isAgent ? 'Shipping Agent' : 'Trade Participant'} />
            </div>
          </div>
        </section>

        {/* Content */}
        {isAgent ? (
          <AgentView />
        ) : loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => <div key={i} className="h-52 animate-pulse rounded-[28px] bg-slate-100" />)}
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            <AlertCircle className="h-5 w-5 shrink-0" /> {error}
          </div>
        ) : deals.length === 0 ? (
          <div className="flex flex-col items-center gap-5 rounded-[28px] border border-dashed border-slate-200 py-24 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-slate-50">
              <ShipWheel className="h-10 w-10 text-slate-200" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-700">No active freight tenders</p>
              <p className="mt-2 max-w-sm text-sm text-slate-400">
                Deals must reach the "Shipping Request" stage before freight tendering begins. Advance a deal from your workspace.
              </p>
            </div>
            <button onClick={() => navigate('/deals')} className="flex items-center gap-2 rounded-2xl bg-[#0A2540] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#143a6a]">
              View Deals <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {deals.map((deal) => (
              <DealFreightCard key={deal._id} deal={deal} navigate={navigate} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
