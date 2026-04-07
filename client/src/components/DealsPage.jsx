import React from 'react';
import { formatDate, getDealsForUser } from '../lib/tradafyData';
import { AppShell, MetricCard } from './ui';

function DealsPage({ user, navigate, pathname, onLogout }) {
  const deals = getDealsForUser(user);

  return (
    <AppShell user={user} pathname={pathname} navigate={navigate} onLogout={onLogout} title="Deals" subtitle="Shared workspaces for active trade execution, freight bidding outcomes, and shipment visibility.">
      <div className="space-y-4">
        {deals.map((deal) => (
          <article key={deal.id} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${deal.status === 'transport-bidding' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>{deal.status.replace('-', ' ')}</div>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">{deal.productName}</h2>
                <p className="mt-2 text-sm text-slate-500">
                  {deal.transport?.lane || deal.deliveryLocation}
                  {deal.shippingCompany ? ` | Awarded carrier: ${deal.shippingCompany}` : ' | Carrier not selected yet'}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-4">
                <MetricCard label="Quantity" value={deal.quantity} />
                <MetricCard label="Price" value={deal.price} />
                <MetricCard label="Delivery" value={formatDate(deal.deliveryDate)} />
                <MetricCard label="Bids" value={(deal.transport?.bids || []).length} />
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={() => navigate(`/deal/${deal.id}`)} className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">
                Open Deal
              </button>
              {deal.status === 'transport-bidding' ? (
                <button onClick={() => navigate('/transport-bids')} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#245c9d]">
                  Review Transport Bids
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
}

export default DealsPage;
