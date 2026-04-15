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
import { getDealById, advanceDealStatus, getMessages, sendMessage } from '../lib/dealService';

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
    <div className="flex flex-col gap-4">
      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* Messages */}
      <div className="max-h-[380px] space-y-3 overflow-y-auto pr-1">
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
                className={`rounded-[22px] p-4 ${isMine ? 'ml-auto max-w-[85%] bg-[#eaf3ff]' : 'max-w-[85%] bg-[#f5f9fd]'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#173b67]">
                    {isMine ? 'You' : (msg.senderId?.firstName ? `${msg.senderId.firstName}` : 'Participant')}
                  </p>
                  <p className="text-xs text-slate-400">{fmtDate(msg.createdAt)}</p>
                </div>
                <p className="mt-1.5 text-sm leading-6 text-slate-700">{msg.text}</p>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Send form */}
      <form onSubmit={handleSend} className="flex gap-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a message in the deal workspace…"
          disabled={sending}
          className="w-full rounded-2xl border border-[#d8e2ef] px-4 py-3 text-sm outline-none transition focus:border-[#245c9d] focus:ring-2 focus:ring-[#245c9d]/10 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#173b67,#245c9d)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
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

function ShipmentTab({ deal }) {
  const { shipment } = deal;

  const details = [
    { label: 'Shipment Status', value: shipment?.status?.replace(/_/g, ' ') || 'Not yet in shipping' },
    { label: 'Shipment Notes',  value: shipment?.notes || '—' },
    { label: 'Last Updated',    value: fmtDate(shipment?.updatedAt) },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {details.map(({ label, value }) => (
          <div key={label} className="rounded-[22px] border border-[#e2ebf4] bg-[#f8fbff] p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
            <p className="mt-1.5 text-sm font-semibold capitalize text-slate-700">{value}</p>
          </div>
        ))}
      </div>
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

  const [deal,       setDeal]      = useState(null);
  const [loading,    setLoading]   = useState(true);
  const [error,      setError]     = useState('');
  const [activeTab,  setActiveTab] = useState('chat');
  const [advancing,  setAdvancing] = useState(false);
  const [advError,   setAdvError]  = useState('');

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

  return (
    <AppShell
      title={deal.productName || 'Deal Workspace'}
      subtitle="Shared workspace where buyer, supplier, and logistics teams coordinate from inquiry through delivery."
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
                Buyer and supplier work together here through chat, timeline updates, freight bidding, and shipment tracking.
              </p>
            </div>

            <div className="flex flex-col gap-3 xl:mt-2 xl:items-end">
              {nextStage && (
                <button
                  onClick={handleAdvance}
                  disabled={advancing}
                  className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(14,165,233,0.3)] transition hover:bg-sky-400 disabled:opacity-60"
                >
                  {advancing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {advancing ? 'Advancing…' : `Advance to ${nextStage.replace(/_/g, ' ')}`}
                </button>
              )}
              {advError && (
                <p className="max-w-xs rounded-2xl bg-rose-500/20 px-4 py-2 text-xs font-medium text-rose-300">
                  {advError}
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
            <MetricCard dark label="Deal Price" value={fmtPrice(deal.price)} />
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
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Deal Summary</p>
              <div className="space-y-3">
                <MetricCard label="Status"      value={STAGES[Math.max(activeStepIndex, 0)]?.label || deal.status} />
                <MetricCard label="Price"       value={fmtPrice(deal.price)} />
                <MetricCard label="Incoterm"    value={deal.incoterm || '—'} />
                <MetricCard label="Payment"     value={deal.paymentTerms || 'Not set'} />
                <MetricCard label="Opened"      value={fmtDate(deal.createdAt)} />
              </div>
            </div>

            {/* Workspace rules */}
            <div className="rounded-[28px] border border-[#d8e2ef] bg-white p-5 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Workspace Rules</p>
              <div className="space-y-2 text-sm text-slate-600">
                {[
                  'Chat belongs only to participants in this deal.',
                  'Stage progression is sequential — no skipping.',
                  'A shipping bid must be accepted before entering Shipping.',
                  'Buyer and supplier see identical deal state in real time.',
                ].map((rule) => (
                  <div key={rule} className="rounded-[18px] border border-[#e2ebf4] bg-[#f8fbff] px-4 py-3 text-xs shadow-sm">
                    {rule}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — tab panel */}
          <div className="rounded-[28px] border border-[#d8e2ef] bg-white p-5 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
            {/* Tabs */}
            <div className="mb-5 flex flex-wrap gap-2 border-b border-slate-100 pb-4">
              {TABS.map((tab) => {
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
            {activeTab === 'chat'     && <ChatTab     dealId={dealId} user={user} />}
            {activeTab === 'timeline' && <TimelineTab timeline={deal.timeline} />}
            {activeTab === 'shipment' && <ShipmentTab deal={deal} />}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
