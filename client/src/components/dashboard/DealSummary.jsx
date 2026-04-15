/**
 * DealSummary.jsx
 * Renders the deal board table (compact deal rows) and the shipment tracker
 * in the right sidebar column.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../lib/tradafyData';

// ─── Deal Board ───────────────────────────────────────────────────────────────

export function DealBoard({ deals }) {
  const navigate = useNavigate();

  return (
    <section className="rounded-[28px] border border-[#d8e2ef] bg-white p-5 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Deal Board</p>
          <h3 className="mt-2 text-[1.55rem] font-semibold tracking-[-0.02em] text-[#143a6a]">Deal and bidding summary</h3>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-[22px] border border-[#dde6f1]">
        <div className="grid grid-cols-[1.2fr_1fr_0.8fr_0.7fr] bg-[#eef5fb] px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          <span>Deal</span>
          <span>Offer</span>
          <span>Status</span>
          <span>Action</span>
        </div>

        {deals.length > 0 ? (
          deals.slice(0, 3).map((deal, index) => (
            <button
              key={deal.id}
              onClick={() => navigate(`/deal/${deal.id}`)}
              className={`grid w-full grid-cols-[1.2fr_1fr_0.8fr_0.7fr] items-center px-4 py-4 text-left text-sm transition hover:bg-slate-50 ${
                index !== 0 ? 'border-t border-[#e7eef6]' : ''
              }`}
            >
              <span className="font-semibold text-[#143a6a] truncate">{deal.productName}</span>
              <span className="text-slate-600 truncate">{deal.price} · {deal.quantity}</span>
              <span className={`font-medium capitalize ${deal.status === 'transport-bidding' ? 'text-amber-600' : 'text-emerald-600'}`}>
                {deal.status.replace('-', ' ')}
              </span>
              <span className="font-semibold text-[#245c9d]">Open →</span>
            </button>
          ))
        ) : (
          <div className="px-4 py-8 text-center text-sm text-slate-400">No active deals yet.</div>
        )}
      </div>
    </section>
  );
}

// ─── Shipment Tracker ─────────────────────────────────────────────────────────

export function ShipmentTracker({ featuredDeal }) {
  return (
    <section className="rounded-[28px] border border-[#d8e2ef] bg-white p-5 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-100 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Shipment Tracker</p>
        <h3 className="mt-2 text-[1.4rem] font-semibold tracking-[-0.02em] text-[#143a6a]">Current shipment</h3>
      </div>

      <div className="mt-5 overflow-hidden rounded-[22px] border border-[#dce7f2]">
        <div className="relative h-48 overflow-hidden bg-slate-100">
          <img
            src="https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?auto=format&fit=crop&q=80&w=1200"
            alt="Bulk carrier loading at port"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e2746]/80 to-transparent" />
          <div className="absolute bottom-4 left-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              </span>
              Live Shipment Tracker
            </span>
          </div>
        </div>
      </div>

      {featuredDeal ? (
        <div className="mt-4 rounded-[22px] bg-[#f5f9fd] p-4">
          <p className="font-semibold text-[#143a6a]">
            {featuredDeal.id.toUpperCase()} · {featuredDeal.productName}
          </p>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <p>
              Status:{' '}
              <span className="font-medium capitalize text-[#143a6a]">
                {featuredDeal.status.replace('-', ' ')}
              </span>
            </p>
            <p>
              Mode:{' '}
              <span className="font-medium text-[#143a6a]">
                {featuredDeal.transport?.preferredMode || featuredDeal.shipment?.mode || 'Sea Freight'}
              </span>
            </p>
            <p>
              {featuredDeal.status === 'transport-bidding' ? 'Bid Deadline' : 'ETA'}:{' '}
              <span className="font-medium text-[#143a6a]">
                {formatDate(
                  featuredDeal.status === 'transport-bidding'
                    ? featuredDeal.transport?.biddingClosesOn
                    : featuredDeal.deliveryDate
                )}
              </span>
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-center text-sm text-slate-400">No active shipment found.</p>
      )}
    </section>
  );
}
