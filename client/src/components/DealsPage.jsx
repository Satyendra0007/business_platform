/**
 * DealsPage.jsx — Lists all deals the current user participates in.
 *
 * Data: GET /api/deals → returns deals where user's company is buyer or supplier.
 * Features: loading skeletons, empty state, error retry, status badges, pagination.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Loader2, AlertCircle, Briefcase,
  ArrowRight, Clock, CheckCircle2, Package, Truck, DollarSign
} from 'lucide-react';
import { AppShell } from './ui';
import { useAuth } from '../hooks/useAuth';
import { getDeals } from '../lib/dealService';
import Pagination from './common/Pagination';

// ─── Stage metadata ───────────────────────────────────────────────────────────

const STAGE_META = {
  inquiry:          { label: 'Inquiry',          color: 'bg-slate-100 text-slate-600 border-slate-200' },
  negotiation:      { label: 'Negotiation',       color: 'bg-sky-50 text-sky-700 border-sky-100' },
  agreement:        { label: 'Agreement',         color: 'bg-violet-50 text-violet-700 border-violet-100' },
  payment:          { label: 'Payment',           color: 'bg-amber-50 text-amber-700 border-amber-100' },
  production:       { label: 'Production',        color: 'bg-orange-50 text-orange-700 border-orange-100' },
  shipping_request: { label: 'Shipping Request',  color: 'bg-blue-50 text-blue-700 border-blue-100' },
  shipping:         { label: 'Shipping',          color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
  delivery:         { label: 'Delivery',          color: 'bg-teal-50 text-teal-700 border-teal-100' },
  closed:           { label: 'Closed',            color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
};

function StatusBadge({ status }) {
  const meta = STAGE_META[status] || { label: status, color: 'bg-slate-100 text-slate-600 border-slate-200' };
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${meta.color}`}>
      {meta.label}
    </span>
  );
}

// ─── Deal card ────────────────────────────────────────────────────────────────

function DealCard({ deal, navigate }) {
  const fmtPrice = (p) => p != null
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(p)
    : '—';

  const date = deal.createdAt
    ? new Date(deal.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  return (
    <article className="overflow-hidden rounded-[28px] border border-[#d8e2ef] bg-white shadow-[0_18px_48px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,#173b67,#245c9d)] text-white">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Deal Workspace</p>
            <p className="font-bold text-slate-900">{deal.productName || 'Unnamed Deal'}</p>
          </div>
        </div>
        <StatusBadge status={deal.status} />
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-2 gap-4 px-6 py-5 sm:grid-cols-4">
        {[
          { label: 'Quantity',  value: deal.quantity ? String(deal.quantity) : '—', icon: Package },
          { label: 'Price',     value: fmtPrice(deal.price),                         icon: DollarSign },
          { label: 'Stage',     value: STAGE_META[deal.status]?.label || deal.status, icon: Clock },
          { label: 'Opened',    value: date,                                          icon: Truck },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label}>
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <Icon className="h-3 w-3" />
              {label}
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-700">{value}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
        <p className="text-xs text-slate-400">
          {deal.status === 'shipping_request'
            ? '🚢 Shipping bids are open — review carrier offers in the workspace'
            : deal.status === 'closed'
            ? '✅ This deal has been completed'
            : '💬 Negotiate and track progress in the deal workspace'}
        </p>
        <button
          onClick={() => navigate(`/deal/${deal._id}`)}
          className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-[#0f2846] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#153a66]"
        >
          Open <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ navigate }) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-[28px] border border-dashed border-slate-200 py-24 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-slate-50">
        <Briefcase className="h-10 w-10 text-slate-200" />
      </div>
      <div>
        <p className="text-xl font-bold text-slate-700">No deals yet</p>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Convert an RFQ into a deal workspace to start negotiating with suppliers.
        </p>
      </div>
      <button
        onClick={() => navigate('/my-rfqs')}
        className="flex items-center gap-2 rounded-2xl bg-[#0A2540] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#143a6a]"
      >
        View My RFQs <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const LIMIT = 10;

export default function DealsPage() {
  const navigate = useNavigate();
  useAuth(); // ensure user is present (RequireAuth handles redirect)

  const [deals,      setDeals]     = useState([]);
  const [total,      setTotal]     = useState(0);
  const [totalPages, setTotalPages]= useState(1);
  const [page,       setPage]      = useState(1);
  const [loading,    setLoading]   = useState(true);
  const [error,      setError]     = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getDeals({ page, limit: LIMIT });
      setDeals(result.deals);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <AppShell
      title="Deals"
      subtitle="Shared workspaces where buyer, supplier, and logistics teams coordinate from inquiry through shipment delivery."
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

        {/* Loading skeletons */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-[28px] bg-slate-100" />
            ))}
          </div>
        ) : deals.length === 0 ? (
          <EmptyState navigate={navigate} />
        ) : (
          <div className="space-y-4">
            {deals.map((deal) => (
              <DealCard key={deal._id} deal={deal} navigate={navigate} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && (
          <Pagination page={page} totalPages={totalPages} total={total} limit={LIMIT} onPage={setPage} />
        )}
      </div>
    </AppShell>
  );
}
