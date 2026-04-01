import React from 'react';
import { convertRFQToDeal, getIncomingRFQsForUser, getRFQsForUser } from '../lib/tradafyData';
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
        {rfqs.map((rfq) => (
          <article key={rfq.id} className="rounded-[28px] border border-[#d8e2ef] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="inline-flex rounded-full bg-[#edf5ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#245c9d]">{rfq.status}</div>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">{rfq.productName}</h2>
                <p className="mt-2 text-sm text-slate-500">{rfq.buyerCompany} to {rfq.supplierCompany}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <MetricCard label="Quantity" value={rfq.quantity} />
                <MetricCard label="Target Price" value={rfq.targetPrice || 'Optional'} />
                <MetricCard label="Destination" value={rfq.deliveryLocation} />
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">{rfq.notes}</p>

            <div className="mt-5 rounded-[22px] bg-[#f5f9fd] p-4 text-sm text-slate-600">
              {incoming
                ? 'Waiting for buyer to proceed. Supplier can review the request, but deal chat and live updates begin only after conversion.'
                : rfq.dealId
                  ? 'This RFQ has already been converted into a deal workspace.'
                  : 'This RFQ is still a request only. No chat is available here until you convert it into a deal.'}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {rfq.dealId ? (
                <button onClick={() => navigate(`/deal/${rfq.dealId}`)} className="rounded-2xl bg-[linear-gradient(135deg,#173b67,#245c9d)] px-4 py-2.5 text-sm font-semibold text-white">
                  Open Deal
                </button>
              ) : !incoming ? (
                <button
                  onClick={() => {
                    const deal = convertRFQToDeal(rfq.id);
                    onMutate();
                    navigate(`/deal/${deal.id}`);
                  }}
                  className="rounded-2xl bg-[linear-gradient(135deg,#173b67,#245c9d)] px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Convert to Deal
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
}

export default RFQListPage;
