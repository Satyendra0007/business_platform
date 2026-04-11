import React from 'react';
import { convertRFQToDeal, getIncomingRFQsForUser, getRFQsForUser } from '../lib/tradafyData';
import { getProductVisual } from '../lib/productVisuals';
import { AppShell, MetricCard } from './ui';

function RFQListPage({ user, navigate, pathname, onLogout, incoming = false, onMutate }) {
  const rfqs = incoming ? getIncomingRFQsForUser(user) : getRFQsForUser(user);

  return (
    <AppShell
      user={user}
      pathname={pathname}
      navigate={navigate}
      onLogout={onLogout}
      title={incoming ? 'Incoming RFQs' : 'My RFQs'}
      subtitle={
        incoming
          ? 'Supplier view is for tracking only. The buyer must convert an RFQ into a deal before collaboration starts.'
          : 'RFQs are request-only records. Track them here, then convert the right one into a deal when you are ready.'
      }
    >
      <div className="space-y-4">
        {rfqs.map((rfq) => {
          const visual = getProductVisual(rfq.productId || rfq.productName.toLowerCase().replace(/\s+/g, '-'));
          return (
          <article key={rfq.id} className="overflow-hidden rounded-[28px] border border-[#d8e2ef] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col md:flex-row">
              <div className="relative h-48 shrink-0 md:h-auto md:w-[280px]">
                <img src={visual.image} alt={visual.alt} className="absolute inset-0 h-full w-full object-cover" />
                <div className={`absolute inset-0 bg-gradient-to-br ${visual.accent} opacity-40 mix-blend-multiply`} />
                <div className="absolute left-5 top-5 inline-flex rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#245c9d] shadow-sm backdrop-blur">
                  {rfq.status}
                </div>
              </div>
              
              <div className="flex flex-1 flex-col justify-between p-6 lg:p-7">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-950 lg:text-3xl">{rfq.productName}</h2>
                    <p className="mt-2 text-sm font-medium text-slate-500">
                      <span className="text-[#143a6a]">{rfq.buyerCompany}</span> requesting from <span className="text-[#143a6a]">{rfq.supplierCompany}</span>
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3 lg:w-[60%] shrink-0">
                    <MetricCard label="Quantity" value={rfq.quantity} />
                    <MetricCard label="Target Price" value={rfq.targetPrice || 'Optional'} />
                    <MetricCard label="Destination" value={rfq.deliveryLocation} />
                  </div>
                </div>
                <p className="mt-5 max-w-3xl text-sm leading-6 text-slate-600 border-l-2 border-[#e2ebf4] pl-4 italic">
                  "{rfq.notes}"
                </p>

            <div className="mt-6 rounded-[22px] bg-[#f5f9fd] p-4 text-sm text-slate-600">
              {incoming
                ? 'Waiting for buyer to proceed. Supplier can review the request, but deal chat and live updates begin only after conversion.'
                : rfq.dealId
                  ? 'This RFQ has already been converted into a deal workspace.'
                  : 'This RFQ is still a request only. No chat is available here until you convert it into a deal.'}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {rfq.dealId ? (
                <button onClick={() => navigate(`/deal/${rfq.dealId}`)} className="rounded-2xl bg-[#0f2846] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#153a66]">
                  Open Deal Workspace
                </button>
              ) : !incoming ? (
                <button
                  onClick={() => {
                    const deal = convertRFQToDeal(rfq.id);
                    onMutate();
                    navigate(`/deal/${deal.id}`);
                  }}
                  className="rounded-2xl bg-[#143a6a] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#1c4f8d]"
                >
                  Convert to Live Deal
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

export default RFQListPage;
