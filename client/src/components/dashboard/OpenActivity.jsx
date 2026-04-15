/**
 * OpenActivity.jsx
 * Shows the "Open Activity" panel — a list of incoming RFQs / deals / bids
 * displayed as action cards. Falls back to an empty state with port imagery.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../lib/tradafyData';

function ActivityCard({ card, index }) {
  const navigate = useNavigate();

  return (
    <article className="rounded-[24px] border border-[#dbe6f2] bg-white p-5 shadow-sm transition hover:border-[#cfdef2] hover:shadow-md">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-sky-100 bg-[#f4f8fc] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#245c9d]">
              {card.code}
            </div>
            <h4 className="text-lg font-bold text-[#143a6a]">{card.title}</h4>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-slate-600 sm:grid-cols-4">
            {[
              { label: 'From', value: card.from },
              { label: 'To', value: card.to },
              { label: 'Volume', value: card.volume },
              { label: 'Timing', value: card.deadline },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                <p className="mt-1 truncate font-semibold text-slate-700">{value}</p>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => navigate(card.action)}
          className={`mt-3 inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold shadow-sm transition xl:mt-0 ${
            index === 0
              ? 'bg-[#0f2846] text-white hover:bg-[#153a66]'
              : 'bg-[#f4f8fc] text-[#143a6a] hover:bg-[#eaf3ff]'
          }`}
        >
          {card.actionLabel}
        </button>
      </div>
    </article>
  );
}

function EmptyActivity({ role }) {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-[#d8e2ef] bg-white shadow-sm">
      <div className="absolute inset-y-0 right-0 w-1/2 opacity-20">
        <img
          src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=1200"
          alt="Global Trade Port"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
      </div>
      <div className="relative z-10 p-6 lg:p-8">
        <p className="text-xl font-bold text-[#173b67]">No Open Activity</p>
        <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
          {role === 'shipping_agent'
            ? 'No transport tenders are open right now. Newly agreed deals will appear here automatically for freight bidding.'
            : 'There are no live requests yet. Create or convert an RFQ to populate this operations panel.'}
        </p>
      </div>
    </div>
  );
}

export default function OpenActivity({ requestCards }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.roles?.[0] || user?.role;

  const viewAllPath =
    role === 'shipping_agent' ? '/transport-bids' : role === 'supplier' ? '/incoming-rfqs' : '/deals';

  return (
    <section className="rounded-[28px] border border-[#d8e2ef] bg-white p-6 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Open Activity</p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-[#143a6a]">
            {role === 'shipping_agent' ? 'Open Transport Tenders' : 'Open Shipping Requests'}
          </h3>
        </div>
        <button
          onClick={() => navigate(viewAllPath)}
          className="rounded-full bg-[#f4f8fc] px-4 py-2 text-xs font-semibold text-[#245c9d] transition hover:bg-[#eaf3ff]"
        >
          View All
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {requestCards.length > 0 ? (
          requestCards.map((card, index) => (
            <ActivityCard key={card.id} card={card} index={index} />
          ))
        ) : (
          <EmptyActivity role={role} />
        )}
      </div>
    </section>
  );
}
