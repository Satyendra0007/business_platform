import React from 'react';
import { formatDate, getDealsForUser } from '../lib/tradafyData';
import { getProductVisual } from '../lib/productVisuals';
import { AppShell, MetricCard } from './ui';

function DealsPage({ user, navigate, pathname, onLogout }) {
  const deals = getDealsForUser(user);

  return (
    <AppShell user={user} pathname={pathname} navigate={navigate} onLogout={onLogout} title="Deals" subtitle="Shared workspaces for active trade execution, freight bidding outcomes, and shipment visibility.">
      <div className="space-y-4">
        {deals.map((deal) => {
          const visual = getProductVisual(deal.productId || deal.productName.toLowerCase().replace(/\s+/g, '-'));
          return (
            <article key={deal.id} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
              <div className="flex flex-col md:flex-row">
                <div className="relative h-48 shrink-0 md:h-auto md:w-[280px]">
                  <img src={visual.image} alt={visual.alt} className="absolute inset-0 h-full w-full object-cover" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${visual.accent} opacity-60 mix-blend-multiply`} />
                  <div className={`absolute left-5 top-5 inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] shadow-sm backdrop-blur ${deal.status === 'transport-bidding' ? 'bg-blue-100/90 text-blue-800' : 'bg-emerald-100/90 text-emerald-800'}`}>
                    {deal.status.replace('-', ' ')}
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between p-6 lg:p-7">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-slate-950 lg:text-3xl">{deal.productName}</h2>
                      <p className="mt-2 text-sm font-medium text-slate-500">
                        {deal.transport?.lane || deal.deliveryLocation}
                        {deal.shippingCompany ? ` | Awarded carrier: ${deal.shippingCompany}` : ' | Carrier not selected yet'}
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-4 lg:w-[70%] shrink-0">
                      <MetricCard label="Quantity" value={deal.quantity} />
                      <MetricCard label="Price" value={deal.price} />
                      <MetricCard label="Delivery" value={formatDate(deal.deliveryDate)} />
                      <MetricCard label="Bids" value={(deal.transport?.bids || []).length} />
                    </div>
                  </div>
                  
                  <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                    <button onClick={() => navigate(`/deal/${deal.id}`)} className="rounded-2xl bg-[#0f2846] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#153a66]">
                      Open Deal Workspace
                    </button>
                    {deal.status === 'transport-bidding' ? (
                      <button onClick={() => navigate('/transport-bids')} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#245c9d] shadow-sm transition hover:bg-slate-50">
                        Review Transport Bids
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </AppShell>
  );
}

export default DealsPage;
