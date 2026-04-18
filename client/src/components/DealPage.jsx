/**
 * DealPage.jsx — The shared deal workspace.
 *
 * Tabs:
 *  Chat      → real messages via GET/POST /api/messages?dealId=
 *  Timeline  → deal.timeline array from GET /api/deals/:id
 *  Shipment  → deal.shipment block + stage info
 *
 * Status progression:
 *  PATCH /api/deals/:id/status → allowed next stage only
 *
 * All mock data (tradafyData) removed.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  MessageSquareText, Timer, ShipWheel, Send, Loader2,
  AlertCircle, CheckCircle2, Package, ArrowLeft
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell, MetricCard } from './ui';
import { useAuth } from '../hooks/useAuth';
import { getDealById, advanceDealStatus, getMessages, sendMessage, updateDealShipment } from '../lib/dealService';

// ─── Stage lifecycle ──────────────────────────────────────────────────────────

const STAGES = [
  { key: 'inquiry',          label: 'Inquiry' },
  { key: 'negotiation',      label: 'Negotiation' },
  { key: 'agreement',        label: 'Agreement' },
  { key: 'payment',          label: 'Payment' },
  { key: 'production',       label: 'Production' },
  { key: 'shipping_request', label: 'Shipping' },
  { key: 'shipping',         label: 'In Transit' },
  { key: 'delivery',         label: 'Delivery' },
  { key: 'closed',           label: 'Closed' },
];

// What stage comes next for each current stage
const NEXT_STAGE = {
  inquiry:          'negotiation',
  negotiation:      'agreement',
  agreement:        'payment',
  payment:          'production',
  production:       'shipping_request',
  shipping_request: 'shipping',
  shipping:         'delivery',
  delivery:         'closed',
};

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS = [
  { key: 'chat',     label: 'Chat',     icon: MessageSquareText },
  { key: 'timeline', label: 'Timeline', icon: Timer },
  { key: 'shipment', label: 'Shipment', icon: ShipWheel },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '—';

const fmtPrice = (p) => p != null
  ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(p)
  : '—';

// ─── Chat tab ─────────────────────────────────────────────────────────────────

const sameId = (a, b) => String(a || '') === String(b || '');

function ChatTab({ dealId, user }) {
  const [messages, setMessages]   = useState([]);
  const [draft,    setDraft]      = useState('');
  const [loading,  setLoading]    = useState(true);
  const [sending,  setSending]    = useState(false);
  const [error,    setError]      = useState('');
  const bottomRef = useRef(null);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getMessages(dealId, { limit: 50 });
      // API returns newest-first; reverse for chronological display
      setMessages([...result.messages].reverse());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setSending(true);
    try {
      const msg = await sendMessage(dealId, draft.trim());
      setDraft('');
      setMessages((prev) => [...prev, msg]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return (
    <div className="flex h-48 items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700 shrink-0">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 space-y-[6px] pr-2 scroll-smooth">
        {messages.length === 0 ? (
          <div className="rounded-[20px] bg-slate-50 py-10 text-center text-sm text-slate-400">
            No messages yet. Start the conversation below.
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === user._id || msg.senderId?._id === user._id;
            return (
              <div
                key={msg._id}
                className={`rounded-2xl px-3.5 py-2 shadow-sm ${
                  isMine ? 'ml-auto max-w-[55%] bg-[#eaf3ff] text-right' : 'max-w-[55%] bg-[#f5f9fd] text-left'
                }`}
              >
                <div className={`mb-1 flex items-center gap-3 ${isMine ? 'justify-end' : 'justify-between'}`}>
                  {!isMine && (
                    <span className="text-[11px] font-bold text-[#173b67]/60">
                      {msg.senderId?.firstName ? msg.senderId.firstName : 'Participant'}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400/80">{fmtDate(msg.createdAt)}</span>
                </div>
                <p className="text-[13px] leading-snug text-slate-700">{msg.text}</p>
              </div>
            );
          })
        )}
        <div ref={bottomRef} className="h-1" />
      </div>

      {/* Send form */}
      <form onSubmit={handleSend} className="flex gap-2 shrink-0 border-t border-slate-100 pt-3 mt-1">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a message in the deal workspace…"
          disabled={sending}
          className="w-full rounded-xl border border-[#d8e2ef] px-3 py-2 text-[13px] outline-none transition focus:border-[#245c9d] focus:ring-2 focus:ring-[#245c9d]/10 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[linear-gradient(135deg,#173b67,#245c9d)] px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-50"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Send
        </button>
      </form>
    </div>
  );
}

// ─── Timeline tab ─────────────────────────────────────────────────────────────

function TimelineTab({ timeline = [] }) {
  if (timeline.length === 0) {
    return (
      <div className="rounded-[20px] bg-slate-50 py-10 text-center text-sm text-slate-400">
        No timeline events yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {[...timeline].reverse().map((item, i) => (
        <div key={i} className="rounded-[22px] border border-[#e2ebf4] bg-[#f8fbff] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eaf3ff] text-[#245c9d]">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold capitalize text-[#173b67]">
                {item.stage?.replace(/_/g, ' ') || 'Stage updated'}
              </p>
              <p className="text-xs text-slate-400">{fmtDate(item.updatedAt)}</p>
            </div>
          </div>
          {item.notes && (
            <p className="mt-3 border-l-2 border-[#d0e4f7] pl-3 text-sm leading-6 text-slate-600 italic">
              {item.notes}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Shipment tab ─────────────────────────────────────────────────────────────

function ShipmentTab({ deal, canUpdateShipment, onShipmentUpdate, updatingShipment }) {
  const { shipment } = deal;
  const [notes, setNotes] = useState(shipment?.notes || '');

  useEffect(() => {
    setNotes(shipment?.notes || '');
  }, [shipment?.notes]);

  const details = [
    { label: 'Selected Bid', value: deal.selectedBidId || 'Not assigned' },
    { label: 'Shipment Status', value: shipment?.status?.replace(/_/g, ' ') || 'Not yet in shipping' },
    { label: 'Shipment Notes',  value: shipment?.notes || '—' },
    { label: 'Last Updated',    value: fmtDate(shipment?.updatedAt) },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {details.map(({ label, value }) => (
          <div key={label} className="rounded-[22px] border border-[#e2ebf4] bg-[#f8fbff] p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
            <p className="mt-1.5 text-sm font-semibold capitalize text-slate-700">{value}</p>
          </div>
        ))}
      </div>
      {canUpdateShipment && (
        <div className="rounded-[24px] border border-[#d8e2ef] bg-[#f8fbff] p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-[#173b67]">Shipment Progress Controls</p>
              <p className="mt-1 text-sm text-slate-500">
                Only the assigned shipping agent can update freight milestones for this deal.
              </p>
            </div>
            {updatingShipment && <Loader2 className="h-5 w-5 animate-spin text-slate-400" />}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {['booking', 'loaded', 'in_transit', 'delivered'].map((step) => {
              const active = shipment?.status === step;
              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => onShipmentUpdate({ status: step, notes })}
                  disabled={updatingShipment || active}
                  className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
                    active
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[#173b67] text-white hover:bg-[#245c9d] disabled:opacity-60'
                  }`}
                >
                  {step.replace(/_/g, ' ')}
                </button>
              );
            })}
          </div>
          <div className="mt-4">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add shipment notes for buyer and supplier visibility..."
              disabled={updatingShipment}
              rows={3}
              className="w-full rounded-2xl border border-[#d8e2ef] bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#245c9d] focus:ring-2 focus:ring-[#245c9d]/10 disabled:opacity-60"
            />
          </div>
        </div>
      )}
      <div className="relative overflow-hidden rounded-[28px] border border-[#dbe5f0] bg-white shadow-sm">
        <div className="grid lg:grid-cols-[1fr_1fr]">
          <div className="p-6">
            <p className="text-sm font-bold uppercase tracking-widest text-[#173b67]">Shipment Tracking</p>
            <p className="mt-1 text-sm text-slate-500">
              Shipment details are updated by the assigned shipping agent after a bid is accepted.
            </p>
            <div className="mt-5 space-y-3">
              {['booking', 'loaded', 'in_transit', 'delivered'].map((step, i) => {
                const done = shipment?.status === step ||
                  ['booking','loaded','in_transit','delivered']
                    .slice(0, ['booking','loaded','in_transit','delivered'].indexOf(shipment?.status) + 1)
                    .includes(step);
                return (
                  <div key={step} className={`flex items-center gap-3 rounded-[18px] border px-4 py-3 ${done ? 'border-emerald-200 bg-emerald-50' : 'border-[#e2ebf4] bg-white'}`}>
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{i + 1}</div>
                    <p className={`text-sm font-semibold capitalize ${done ? 'text-emerald-700' : 'text-slate-500'}`}>{step.replace(/_/g, ' ')}</p>
                    {done && <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-500" />}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="hidden overflow-hidden lg:block">
            <img
              src="https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?auto=format&fit=crop&q=80&w=1200"
              alt="Port loading"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DealPage() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const { dealId }= useParams();
  const isShippingAgentRole = Boolean(user?.roles?.includes('shipping_agent') && !user?.roles?.includes('admin'));

  const [deal,       setDeal]      = useState(null);
  const [loading,    setLoading]   = useState(true);
  const [error,      setError]     = useState('');
  const [activeTab,  setActiveTab] = useState('chat');
  const [advancing,  setAdvancing] = useState(false);
  const [advError,   setAdvError]  = useState('');
  const [shipmentError, setShipmentError] = useState('');
  const [updatingShipment, setUpdatingShipment] = useState(false);

  // ── Fetch deal ─────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const d = await getDealById(dealId);
      setDeal(d);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (isShippingAgentRole && activeTab !== 'shipment') {
      setActiveTab('shipment');
    }
  }, [activeTab, isShippingAgentRole]);

  // ── Advance status ─────────────────────────────────────────────────────────
  const handleAdvance = async () => {
    const next = NEXT_STAGE[deal.status];
    if (!next) return;
    if (!window.confirm(`Advance this deal to "${next.replace(/_/g, ' ')}"?`)) return;
    setAdvancing(true);
    setAdvError('');
    try {
      const updated = await advanceDealStatus(dealId, next);
      setDeal(updated);
    } catch (err) {
      setAdvError(err.message);
    } finally {
      setAdvancing(false);
    }
  };

  const handleShipmentUpdate = async (payload) => {
    setUpdatingShipment(true);
    setShipmentError('');
    try {
      const updated = await updateDealShipment(dealId, payload);
      setDeal((prev) => ({ ...prev, shipment: updated.shipment }));
    } catch (err) {
      setShipmentError(err.message);
    } finally {
      setUpdatingShipment(false);
    }
  };

  // ── Loading / Error states ─────────────────────────────────────────────────
  if (loading) return (
    <AppShell title="Deal Workspace" subtitle="">
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
      </div>
    </AppShell>
  );

  if (error || !deal) return (
    <AppShell title="Deal Workspace" subtitle="">
      <div className="flex flex-col items-center gap-4 rounded-[28px] border border-rose-100 bg-rose-50 py-20 text-center">
        <Package className="h-12 w-12 text-rose-200" />
        <p className="text-lg font-bold text-slate-800">{error || 'Deal not found'}</p>
        <button onClick={() => navigate('/deals')} className="flex items-center gap-2 rounded-2xl bg-[#0A2540] px-5 py-2.5 text-sm font-bold text-white">
          <ArrowLeft className="h-4 w-4" /> Back to Deals
        </button>
      </div>
    </AppShell>
  );

  const activeStepIndex = STAGES.findIndex((s) => s.key === deal.status);
  const nextStage = NEXT_STAGE[deal.status];
  const isBuyer = Boolean(user?.companyId && sameId(user.companyId, deal?.buyerCompanyId));
  const isSupplier = Boolean(user?.companyId && sameId(user.companyId, deal?.supplierCompanyId));
  const isAssignedAgent = Boolean(user?._id && sameId(user._id, deal?.shippingAgentId));
  const isAdmin = Boolean(user?.roles?.includes('admin'));
  const isShippingAgent = isShippingAgentRole;
  const isCompanyUser = Boolean(isBuyer || isSupplier || isAdmin);
  const canEditDeal = isCompanyUser && ['inquiry', 'negotiation'].includes(deal.status);
  const canAdvanceStatus = Boolean(isBuyer && nextStage);
  const canUpdateShipment = Boolean((isShippingAgent || isAssignedAgent || isAdmin) && ['shipping', 'delivery'].includes(deal.status));
  const visibleTabs = isShippingAgent ? TABS.filter((tab) => tab.key === 'shipment') : TABS;

  return (
    <AppShell
      title={deal.productName || 'Deal Workspace'}
      subtitle={isShippingAgent ? 'Logistics-only workspace for the assigned freight agent.' : 'Shared workspace where buyer, supplier, and the assigned freight agent coordinate from inquiry through delivery.'}
    >
      <div className="space-y-6">

        {/* ── Hero Banner ─────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-[30px] border border-slate-300/40 bg-[#0c1f38] p-7 text-white shadow-xl lg:p-8">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=2400"
              alt="Cargo Port"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a1b32] via-[#102a4e]/95 to-[#1c4f8d]/80 backdrop-blur-[2px]" />
          </div>

          <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-sky-200">
                Shared Deal Workspace
              </div>
              <h2 className="mt-5 text-3xl font-bold tracking-tight lg:text-4xl">
                {deal.productName || 'Deal Workspace'}
              </h2>
              <p className="mt-3 text-sm leading-7 text-sky-100/90">
                {isShippingAgent
                  ? 'Cargo lane details and shipment progress are available here for the assigned freight agent only.'
                  : 'Buyer, supplier, and the assigned freight agent coordinate here through chat, timeline updates, and shipment tracking.'}
              </p>
            </div>

            <div className="flex flex-col gap-3 xl:mt-2 xl:items-end">
              <div className="flex items-center gap-3">
                {canEditDeal && (
                  <button
                    onClick={() => navigate(`/deal/${dealId}/edit`)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-sky-400/30 bg-sky-500/10 px-6 py-3.5 text-sm font-semibold text-sky-200 transition hover:bg-sky-500/20"
                  >
                    Edit Terms
                  </button>
                )}

                {canAdvanceStatus && (
                  <button
                    onClick={handleAdvance}
                    disabled={advancing}
                    className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(14,165,233,0.3)] transition hover:bg-sky-400 disabled:opacity-60"
                  >
                    {advancing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {advancing ? 'Advancing…' : `Advance to ${nextStage.replace(/_/g, ' ')}`}
                  </button>
                )}
              </div>
              
              {advError && (
                <p className="max-w-xs rounded-2xl bg-rose-500/20 px-4 py-2 text-xs font-medium text-rose-300">
                  {advError}
                </p>
              )}
              {shipmentError && (
                <p className="max-w-xs rounded-2xl bg-rose-500/20 px-4 py-2 text-xs font-medium text-rose-300">
                  {shipmentError}
                </p>
              )}
              {!nextStage && (
                <span className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500/20 px-6 py-3.5 text-sm font-semibold text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" /> Deal Closed
                </span>
              )}
            </div>
          </div>

          {/* Metric tiles */}
          <div className="relative z-10 mt-8 grid gap-4 lg:grid-cols-4">
            <MetricCard dark label="Product"    value={deal.productName || '—'} />
            <MetricCard dark label="Quantity"   value={deal.quantity ? String(deal.quantity) : '—'} />
            <MetricCard dark label="Stage"      value={STAGES[Math.max(activeStepIndex, 0)]?.label || deal.status} />
            <MetricCard dark label={isShippingAgent ? 'Route' : 'Deal Price'} value={isShippingAgent ? `${deal.origin || '—'} → ${deal.destination || '—'}` : fmtPrice(deal.price)} />
          </div>
        </section>

        {/* ── Stage progress bar ───────────────────────────────────────────── */}
        <section className="rounded-[28px] border border-[#d8e2ef] bg-white p-5 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Deal Lifecycle</p>
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9">
            {STAGES.map((step, index) => {
              const active = activeStepIndex >= index;
              const current = activeStepIndex === index;
              return (
                <div
                  key={step.key}
                  className={`rounded-[18px] border p-3 text-center ${
                    current ? 'border-sky-300 bg-sky-50' :
                    active  ? 'border-[#b8cfe8] bg-[#edf5ff]' :
                              'border-[#e2ebf4] bg-white'
                  }`}
                >
                  <div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    current ? 'bg-sky-500 text-white' :
                    active  ? 'bg-[linear-gradient(135deg,#173b67,#245c9d)] text-white' :
                              'bg-slate-100 text-slate-400'
                  }`}>
                    {index + 1}
                  </div>
                  <p className={`mt-2 text-[10px] font-semibold leading-tight ${active ? 'text-[#173b67]' : 'text-slate-400'}`}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Main content grid ────────────────────────────────────────────── */}
        <section className="grid gap-6 xl:grid-cols-[0.68fr_1.32fr]">

          {/* Left — deal summary */}
          <div className="space-y-5">
            <div className="rounded-[28px] border border-[#d8e2ef] bg-white p-5 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{isShippingAgent ? 'Cargo Summary' : 'Deal Summary'}</p>
              <div className="space-y-3">
                <MetricCard label="Status"      value={STAGES[Math.max(activeStepIndex, 0)]?.label || deal.status} />
                {isShippingAgent ? (
                  <MetricCard label="Route" value={`${deal.origin || '—'} → ${deal.destination || '—'}`} />
                ) : (
                  <MetricCard label="Price" value={fmtPrice(deal.price)} />
                )}
                <MetricCard label="Incoterm"    value={deal.incoterm || '—'} />
                {isShippingAgent ? (
                  <MetricCard label="Selected Bid" value={deal.selectedBidId || '—'} />
                ) : (
                  <MetricCard label="Payment" value={deal.paymentTerms || 'Not set'} />
                )}
                <MetricCard label={isShippingAgent ? 'Shipment Status' : 'Opened'} value={isShippingAgent ? (deal.shipment?.status?.replace(/_/g, ' ') || 'not started') : fmtDate(deal.createdAt)} />
              </div>
            </div>

            {/* Workspace rules */}
            <div className="rounded-[28px] border border-[#d8e2ef] bg-white p-5 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Workspace Rules</p>
              <div className="space-y-2 text-sm text-slate-600">
                {[
                  isShippingAgent ? 'Only assigned shipment data is visible in this workspace.' : 'Chat belongs only to participants in this deal.',
                  isShippingAgent ? 'Commercial pricing and negotiation details are hidden from shipping agents.' : 'Stage progression is sequential — no skipping.',
                  isShippingAgent ? 'Only the assigned shipping agent can update shipment milestones.' : 'A shipping bid must be accepted before entering Shipping.',
                  'Only the assigned shipping agent can update shipment progress.',
                ].map((rule) => (
                  <div key={rule} className="rounded-[18px] border border-[#e2ebf4] bg-[#f8fbff] px-4 py-3 text-xs shadow-sm">
                    {rule}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — tab panel */}
          <div className="flex flex-col h-full max-h-[90vh] xl:max-h-none xl:h-[calc(100vh-120px)] min-h-[620px] rounded-[28px] border border-[#d8e2ef] bg-white p-5 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
            {/* Tabs */}
            <div className="mb-4 flex shrink-0 flex-wrap gap-2 border-b border-slate-100 pb-3">
              {visibleTabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
                      active
                        ? 'bg-[linear-gradient(135deg,#173b67,#245c9d)] text-white'
                        : 'bg-[#f4f8fc] text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <div className={`flex-1 min-h-0 ${activeTab === 'chat' ? 'overflow-hidden' : 'overflow-y-auto pr-1'}`}>
              {activeTab === 'chat'     && <ChatTab     dealId={dealId} user={user} />}
              {activeTab === 'timeline' && <TimelineTab timeline={deal.timeline} />}
              {activeTab === 'shipment' && (
                <ShipmentTab
                  deal={deal}
                  canUpdateShipment={canUpdateShipment}
                  onShipmentUpdate={handleShipmentUpdate}
                  updatingShipment={updatingShipment}
                />
              )}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
