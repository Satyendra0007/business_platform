/**
 * RFQListPage.jsx — Buyer (My RFQs) and Supplier (Deal Requests) views.
 *
 * Prop: incoming {bool} — when true, shows supplier's incoming RFQs
 *
 * Data sources:
 *  Buyer    → GET /api/rfq                     (buyerCompanyId = user.companyId)
 *  Supplier → GET /api/rfq?incoming=true        (supplierCompanyId = user.companyId)
 *
 * Note: The backend getRFQs currently filters by buyerCompanyId only.
 * Incoming deal requests (supplier view) would need a dedicated backend query — for now
 * we show an appropriate empty-state message.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Loader2, AlertCircle, FileText, CheckCircle2,
  Clock, XCircle, RefreshCcw, ArrowRight, Package
} from 'lucide-react';
import { AppShell } from './ui';
import { getMyRFQs, getIncomingRFQs, convertRFQToDeal, closeRFQ } from '../lib/rfqService';
import Pagination from './common/Pagination';

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_MAP = {
  open:        { label: 'Open',        icon: Clock,         cls: 'bg-sky-50 text-sky-700 border-sky-100' },
  in_progress: { label: 'In Progress', icon: RefreshCcw,    cls: 'bg-amber-50 text-amber-700 border-amber-100' },
  converted:   { label: 'Converted',   icon: CheckCircle2,  cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  closed:      { label: 'Closed',      icon: XCircle,       cls: 'bg-slate-50 text-slate-500 border-slate-200' },
};

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.open;
  const Icon = s.icon;
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${s.cls}`}>
      <Icon className="h-3 w-3" />
      {s.label}
    </div>
  );
}

function RequestDetailPanel({ rfq, incoming, onClose, navigate }) {
  if (!rfq) return null;

  const isConverted = rfq.status === 'converted';
  const partyLabel = incoming ? 'Buyer' : 'Supplier';
  const partyName = incoming
    ? (rfq.buyerUserName || 'Buyer')
    : (rfq.supplierCompanyName || 'Supplier');
  const partyCompany = incoming
    ? (rfq.buyerCompanyName || 'Company pending')
    : (rfq.supplierCompanyName || 'Company pending');
  const partyEmail = incoming ? rfq.buyerUserEmail : rfq.supplierUserEmail;

  return (
    <section className="rounded-[28px] border border-[#d8e2ef] bg-white shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Request detail</p>
          <p className="mt-1 font-bold text-slate-800">{rfq.productName || 'Deal request'}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Close
        </button>
      </div>
      <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
        <div className="rounded-[20px] bg-[#f5f9fd] px-4 py-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{partyLabel}</p>
          <p className="mt-1 text-base font-bold text-slate-800">{partyName}</p>
          <p className="mt-1 text-sm text-slate-600">{partyCompany}</p>
          {partyEmail ? <p className="mt-1 text-xs text-slate-400">{partyEmail}</p> : null}
        </div>
        <div className="rounded-[20px] bg-[#f5f9fd] px-4 py-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Status</p>
          <p className="mt-1 text-base font-bold capitalize text-slate-800">{rfq.status?.replace('_', ' ') || 'open'}</p>
          <p className="mt-1 text-sm text-slate-600">
            {isConverted
              ? 'Deal chat is ready now.'
              : incoming
                ? 'This request is waiting for the buyer to convert it into a deal.'
                : 'This request is waiting for the supplier to open a live deal workspace.'}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 border-t border-slate-100 px-6 py-4">
        {rfq.dealId ? (
          <button
            type="button"
            onClick={() => navigate(`/deal/${rfq.dealId}`)}
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

// ─── RFQ card ─────────────────────────────────────────────────────────────────

function RFQCard({ rfq, incoming, onConvert, onClose, onEdit, onOpenRequest }) {
  const navigate = useNavigate();
  const [converting, setConverting] = useState(false);
  const [closing,    setClosing]    = useState(false);
  const [actionError, setActionError] = useState('');

  const canConvert = !incoming && (rfq.status === 'open' || rfq.status === 'in_progress') && !rfq.dealId;
  const canClose   = !incoming && rfq.status !== 'converted' && rfq.status !== 'closed';
  const canEdit    = !incoming && rfq.status !== 'converted' && rfq.status !== 'closed';
  const isConverted = rfq.status === 'converted';

  const handleConvert = async () => {
    if (!window.confirm('Convert this deal request into a live Deal workspace?')) return;
    setConverting(true);
    setActionError('');
    try {
      const result = await convertRFQToDeal(rfq._id);
      onConvert(rfq._id, result.deal._id);
      navigate(`/deal/${result.deal._id}`);
    } catch (err) {
      setActionError(err.response?.data?.message || err.message);
    } finally {
      setConverting(false);
    }
  };

  const handleClose = async () => {
    if (!window.confirm('Close this deal request? It cannot be reopened.')) return;
    setClosing(true);
    setActionError('');
    try {
      await closeRFQ(rfq._id);
      onClose(rfq._id);
    } catch (err) {
      setActionError(err.response?.data?.message || err.message);
    } finally {
      setClosing(false);
    }
  };

  const createdDate = rfq.createdAt
    ? new Date(rfq.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';
  const supplierName = rfq.supplierCompanyName || (typeof rfq.supplierCompanyId === 'object' ? rfq.supplierCompanyId?.name : null) || 'Not assigned yet';
  const buyerName = rfq.buyerUserName || rfq.buyerCompanyName || 'Buyer details pending';
  const buyerCompany = rfq.buyerCompanyName || '';
  const buyerEmail = rfq.buyerUserEmail || '';

  return (
    <article className="overflow-hidden rounded-[28px] border border-[#d8e2ef] bg-white shadow-[0_18px_48px_rgba(15,23,42,0.06)] transition hover:shadow-[0_24px_60px_rgba(15,23,42,0.09)]">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#edf5ff] text-[#245c9d]">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{incoming ? 'Deal Request' : 'RFQ'}</p>
            <p className="font-bold text-slate-800">{rfq.productName || '—'}</p>
          </div>
        </div>
        <StatusBadge status={rfq.status} />
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-4 px-6 py-5 sm:grid-cols-4">
        {[
          { label: 'Category',  value: rfq.category || '—' },
          { label: 'Quantity',  value: rfq.quantity ? String(rfq.quantity) : '—' },
          { label: 'Submitted', value: createdDate },
          { label: 'Status',    value: rfq.status?.replace('_', ' ') || '—' },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-700 capitalize">{value}</p>
          </div>
        ))}
      </div>

      {/* Supplier note */}
      <div className="mx-6 mb-5 rounded-[20px] bg-[#f5f9fd] px-4 py-3 text-xs leading-5 text-slate-500">
        {incoming ? (
          <div className="space-y-1">
            <p className="font-semibold text-slate-700">Buyer</p>
            <p className="text-slate-600">{buyerName}</p>
            {buyerCompany ? <p className="text-slate-400">Company: {buyerCompany}</p> : null}
            {buyerEmail ? <p className="text-slate-400">{buyerEmail}</p> : null}
            <p className="pt-1 text-slate-500">
              This buyer is requesting your product. Coordinate offline - the deal chat opens after the buyer converts this deal request.
            </p>
          </div>
        ) : isConverted ? (
          'This deal request has been converted into a live deal workspace.'
        ) : rfq.status === 'closed' ? (
          'This deal request was closed and cannot be converted.'
        ) : (
          `This deal request is still a request only. Supplier: ${supplierName}. Convert it when you're ready to negotiate.`
        )}
      </div>

      {/* Error */}
      {actionError && (
        <div className="mx-6 mb-4 flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> {actionError}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 px-6 py-4">
        {onOpenRequest && (
          <button
            onClick={() => onOpenRequest(rfq)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            View Details
          </button>
        )}

        {isConverted && rfq.dealId && (
          <button
            onClick={() => navigate(`/deal/${rfq.dealId}`)}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#0f2846] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#153a66]"
          >
            Open Deal Workspace <ArrowRight className="h-4 w-4" />
          </button>
        )}

        {canConvert && (
          <button
            onClick={handleConvert}
            disabled={converting}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#143a6a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1c4f8d] disabled:opacity-60"
          >
            {converting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {converting ? 'Converting…' : 'Convert to Deal'}
          </button>
        )}

        {canEdit && (
          <button
            onClick={() => onEdit(rfq)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Edit Request
          </button>
        )}

        {canClose && (
          <button
            onClick={handleClose}
            disabled={closing}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
          >
            {closing ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            {closing ? 'Closing…' : 'Close Request'}
          </button>
        )}
      </div>
    </article>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ incoming, navigate }) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-[28px] border border-dashed border-slate-200 py-24 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-slate-50">
        <Package className="h-10 w-10 text-slate-200" />
      </div>
      <div>
        <p className="text-xl font-bold text-slate-700">
          {incoming ? 'No incoming deal requests yet' : 'No deal requests submitted yet'}
        </p>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          {incoming
            ? 'Deal requests from buyers targeting your company will appear here once submitted.'
            : 'Browse the product catalog and submit your first deal request to a supplier.'}
        </p>
      </div>
      {!incoming && (
        <button
          onClick={() => navigate('/products')}
          className="flex items-center gap-2 rounded-2xl bg-[#0A2540] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#143a6a]"
        >
          Browse Products <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const LIMIT = 10;

export default function RFQListPage({ incoming = false }) {
  const navigate   = useNavigate();

  const [rfqs,       setRFQs]      = useState([]);
  const [total,      setTotal]     = useState(0);
  const [totalPages, setTotalPages]= useState(1);
  const [page,       setPage]      = useState(1);
  const [loading,    setLoading]   = useState(true);
  const [error,      setError]     = useState('');
  const [filter,     setFilter]    = useState('all');
  const [selectedRFQ, setSelectedRFQ] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const fetcher = incoming ? getIncomingRFQs : getMyRFQs;
      const result  = await fetcher({ page, limit: LIMIT });
      setRFQs(result.rfqs);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [page, incoming]);

  useEffect(() => { fetch(); }, [fetch]);

  // Optimistic update after convert
  const handleConverted = (rfqId, dealId) => {
    setRFQs((prev) =>
      prev.map((r) => r._id === rfqId ? { ...r, status: 'converted', dealId } : r)
    );
  };

  // Optimistic update after close
  const handleClosed = (rfqId) => {
    setRFQs((prev) =>
      prev.map((r) => r._id === rfqId ? { ...r, status: 'closed' } : r)
    );
  };

  return (
    <AppShell
      title={incoming ? 'Incoming Deal Requests' : 'My Deal Requests'}
      subtitle={
        incoming
          ? 'Deal requests from buyers targeting your company. Open a request to see buyer details and jump into chat when a deal is live.'
          : 'Track your own deal requests, see supplier details, and open the chat once a request becomes a live deal.'
      }
    >
      <div className="space-y-5">
        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
            {error}
            <button onClick={fetch} className="ml-auto text-xs underline hover:no-underline">Retry</button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-52 animate-pulse rounded-[28px] bg-slate-100" />
            ))}
          </div>
        ) : rfqs.length === 0 ? (
          <EmptyState incoming={incoming} navigate={navigate} />
        ) : (
          <div className="space-y-5">
            {/* Filter */}
            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
              {['all', 'open', 'in_progress', 'converted', 'closed'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition ${
                    filter === f
                      ? 'bg-[#143a6a] text-white shadow-md'
                      : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {rfqs.filter(r => filter === 'all' || r.status === filter).map((rfq) => (
                <RFQCard
                  key={rfq._id}
                  rfq={rfq}
                  incoming={incoming}
                  onConvert={handleConverted}
                  onClose={handleClosed}
                  onEdit={(r) => navigate(`/rfq/${r._id}/edit`)}
                  onOpenRequest={setSelectedRFQ}
                />
              ))}
              
              {/* Show empty message if filter matches nothing but rfqs exist */}
              {rfqs.filter(r => filter === 'all' || r.status === filter).length === 0 && (
                <div className="rounded-[28px] border border-dashed border-slate-200 py-16 text-center text-sm font-medium text-slate-500">
                  No deal requests match the selected filter.
                </div>
              )}
            </div>

            <RequestDetailPanel
              rfq={selectedRFQ}
              incoming={incoming}
              onClose={() => setSelectedRFQ(null)}
              navigate={navigate}
            />
          </div>
        )}

        {/* Pagination */}
        {!loading && (
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={LIMIT}
            onPage={setPage}
          />
        )}
      </div>
    </AppShell>
  );
}
