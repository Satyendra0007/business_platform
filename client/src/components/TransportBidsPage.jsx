import React, { useMemo, useState } from 'react';
import { ArrowRight, BadgeDollarSign, CalendarDays, CheckCircle2, Clock3, FileText, MapPin, ShipWheel } from 'lucide-react';
import { AppShell, MetricCard } from './ui';
import { acceptTransportBid, formatDate, getTransportBidOpportunities, submitTransportBid } from '../lib/tradafyData';

function TransportBidsPage({ user, navigate, pathname, onLogout, onMutate }) {
  const deals = getTransportBidOpportunities(user);
  const [drafts, setDrafts] = useState({});

  const stats = useMemo(() => {
    const openDeals = deals.filter((deal) => deal.status === 'transport-bidding');
    const submittedByUser = deals.filter((deal) => (deal.transport?.bids || []).some((bid) => bid.company === user.company)).length;
    const awardedToUser = deals.filter((deal) => deal.transport?.acceptedBidId && deal.shippingCompany === user.company).length;
    return { openDeals, submittedByUser, awardedToUser };
  }, [deals, user.company]);

  const updateDraft = (dealId, field, value) => {
    setDrafts((current) => ({
      ...current,
      [dealId]: {
        price: current[dealId]?.price || '',
        transitTime: current[dealId]?.transitTime || '',
        mode: current[dealId]?.mode || 'Sea Freight',
        validUntil: current[dealId]?.validUntil || '',
        notes: current[dealId]?.notes || '',
        [field]: value,
      },
    }));
  };

  return (
    <AppShell
      user={user}
      pathname={pathname}
      navigate={navigate}
      onLogout={onLogout}
      title="Transport Bids"
      subtitle="Professional freight tendering for post-agreement deals. Compare shipping offers, award a carrier, and move straight into execution."
    >
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[30px] border border-[#c8d9ec] bg-[linear-gradient(135deg,#12335d_0%,#17457a_52%,#245c9d_100%)] p-6 text-white shadow-[0_28px_70px_rgba(15,23,42,0.18)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-100">
                Transport Procurement
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">Freight bidding built into the deal workflow</h2>
              <p className="mt-2 text-sm leading-6 text-sky-100/90">
                {user.role === 'shipping_agent'
                  ? 'Review open lanes, quote professionally, and compete for awarded shipment execution without leaving the workspace.'
                  : 'Once buyer and supplier agree commercially, the platform opens a verified freight tender so you can compare transport offers before shipment starts.'}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <MetricCard dark label="Open Tenders" value={stats.openDeals.length} />
              <MetricCard dark label={user.role === 'shipping_agent' ? 'My Submitted Bids' : 'Deals With Bids'} value={user.role === 'shipping_agent' ? stats.submittedByUser : deals.length} />
              <MetricCard dark label={user.role === 'shipping_agent' ? 'Awarded To Me' : 'Awarded Carriers'} value={user.role === 'shipping_agent' ? stats.awardedToUser : deals.filter((deal) => deal.transport?.acceptedBidId).length} />
            </div>
          </div>
        </section>

        <section className="space-y-5">
          {deals.length ? (
            deals.map((deal) => {
              const draft = drafts[deal.id] || { price: '', transitTime: '', mode: 'Sea Freight', validUntil: '', notes: '' };
              const bids = deal.transport?.bids || [];
              const acceptedBidId = deal.transport?.acceptedBidId;
              const lowestBid = bids.slice().sort((a, b) => parseFloat(a.price.replace(/[^\d.]/g, '')) - parseFloat(b.price.replace(/[^\d.]/g, '')))[0];
              const userBid = bids.find((bid) => bid.company === user.company);

              return (
                <article key={deal.id} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
                  <div className="border-b border-slate-100 bg-[linear-gradient(180deg,#ffffff_0%,#f6f9fd_100%)] px-6 py-5">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <div className="inline-flex rounded-full bg-[#eaf3ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#245c9d]">
                          {deal.status === 'transport-bidding' ? 'Open Tender' : 'Carrier Awarded'}
                        </div>
                        <h3 className="mt-3 text-2xl font-semibold text-slate-950">{deal.productName}</h3>
                        <p className="mt-2 text-sm text-slate-600">{deal.quantity} moving on {deal.transport?.lane}</p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <MetricCard label="Commercial Value" value={deal.price} />
                        <MetricCard label="Bid Deadline" value={formatDate(deal.transport?.biddingClosesOn || deal.deliveryDate)} />
                        <MetricCard label="Incoterm" value={deal.transport?.incoterm || 'CIF'} />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 p-6 xl:grid-cols-[0.82fr_1.18fr]">
                    <div className="space-y-4">
                      <div className="rounded-[24px] border border-[#dde6f1] bg-[#f8fbff] p-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Lane Details</p>
                        <div className="mt-4 space-y-3 text-sm text-slate-600">
                          <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-[#245c9d]" /> {deal.transport?.lane}</div>
                          <div className="flex items-center gap-3"><CalendarDays className="h-4 w-4 text-[#245c9d]" /> Cargo ready {formatDate(deal.transport?.cargoReadyDate || deal.deliveryDate)}</div>
                          <div className="flex items-center gap-3"><ShipWheel className="h-4 w-4 text-[#245c9d]" /> Preferred mode: {deal.transport?.preferredMode || 'Sea Freight'}</div>
                          <div className="flex items-center gap-3"><Clock3 className="h-4 w-4 text-[#245c9d]" /> Lowest current bid: {lowestBid ? lowestBid.price : 'No bids yet'}</div>
                        </div>
                      </div>

                      {user.role === 'shipping_agent' && deal.status === 'transport-bidding' ? (
                        <div className="rounded-[24px] border border-[#dbe5f0] bg-white p-5 shadow-sm">
                          <p className="text-sm font-semibold text-[#173b67]">Submit or refresh your freight offer</p>
                          <p className="mt-1 text-sm text-slate-500">Quote the lane with pricing, transit time, and validity. Your latest bid replaces your previous one.</p>
                          <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <label className="block">
                              <span className="mb-2 block text-sm font-medium text-slate-600">Price</span>
                              <input value={draft.price} onChange={(event) => updateDraft(deal.id, 'price', event.target.value)} placeholder="$120 / MT" className="w-full rounded-2xl border border-[#d8e2ef] px-4 py-3 outline-none" />
                            </label>
                            <label className="block">
                              <span className="mb-2 block text-sm font-medium text-slate-600">Transit Time</span>
                              <input value={draft.transitTime} onChange={(event) => updateDraft(deal.id, 'transitTime', event.target.value)} placeholder="18 days" className="w-full rounded-2xl border border-[#d8e2ef] px-4 py-3 outline-none" />
                            </label>
                            <label className="block">
                              <span className="mb-2 block text-sm font-medium text-slate-600">Mode</span>
                              <input value={draft.mode} onChange={(event) => updateDraft(deal.id, 'mode', event.target.value)} className="w-full rounded-2xl border border-[#d8e2ef] px-4 py-3 outline-none" />
                            </label>
                            <label className="block">
                              <span className="mb-2 block text-sm font-medium text-slate-600">Valid Until</span>
                              <input type="date" value={draft.validUntil} onChange={(event) => updateDraft(deal.id, 'validUntil', event.target.value)} className="w-full rounded-2xl border border-[#d8e2ef] px-4 py-3 outline-none" />
                            </label>
                            <label className="block md:col-span-2">
                              <span className="mb-2 block text-sm font-medium text-slate-600">Notes</span>
                              <textarea value={draft.notes} onChange={(event) => updateDraft(deal.id, 'notes', event.target.value)} rows={3} className="w-full rounded-2xl border border-[#d8e2ef] px-4 py-3 outline-none" />
                            </label>
                          </div>
                          <button
                            onClick={() => {
                              if (!draft.price || !draft.transitTime || !draft.validUntil) return;
                              submitTransportBid(deal.id, draft, user);
                              setDrafts((current) => ({ ...current, [deal.id]: { price: '', transitTime: '', mode: 'Sea Freight', validUntil: '', notes: '' } }));
                              onMutate();
                            }}
                            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#173b67,#245c9d)] px-4 py-3 text-sm font-semibold text-white"
                          >
                            <BadgeDollarSign className="h-4 w-4" />
                            {userBid ? 'Update My Bid' : 'Submit Bid'}
                          </button>
                        </div>
                      ) : null}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Bid Board</p>
                          <h4 className="mt-2 text-xl font-semibold text-[#143a6a]">Verified transport offers</h4>
                        </div>
                        <button onClick={() => navigate(`/deal/${deal.id}`)} className="inline-flex items-center gap-2 rounded-2xl border border-[#d8e2ef] bg-white px-4 py-2.5 text-sm font-semibold text-[#245c9d] shadow-sm">
                          Open Deal
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        {bids.length ? bids.map((bid) => (
                          <div key={bid.id} className={`rounded-[24px] border p-5 ${bid.id === acceptedBidId ? 'border-emerald-200 bg-emerald-50/60' : 'border-[#dde6f1] bg-[#fbfdff]'}`}>
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                              <div>
                                <div className="flex flex-wrap items-center gap-3">
                                  <p className="text-lg font-semibold text-[#143a6a]">{bid.company}</p>
                                  <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${bid.id === acceptedBidId ? 'bg-emerald-100 text-emerald-700' : 'bg-[#eaf3ff] text-[#245c9d]'}`}>
                                    {bid.id === acceptedBidId ? 'Accepted' : 'Submitted'}
                                  </span>
                                </div>
                                <p className="mt-1 text-sm text-slate-500">{bid.contactName}</p>
                                <p className="mt-3 text-sm leading-6 text-slate-600">{bid.notes}</p>
                              </div>
                              <div className="grid gap-3 sm:grid-cols-3">
                                <MetricCard label="Bid" value={bid.price} />
                                <MetricCard label="Transit" value={bid.transitTime} />
                                <MetricCard label="Mode" value={bid.mode} />
                              </div>
                            </div>
                            <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                              <div className="text-sm text-slate-500">
                                Valid until {formatDate(bid.validUntil)}. Submitted {formatDate(bid.createdAt)}.
                              </div>
                              {deal.status === 'transport-bidding' && bid.id !== acceptedBidId && user.role !== 'shipping_agent' ? (
                                <button
                                  onClick={() => {
                                    acceptTransportBid(deal.id, bid.id, user.name);
                                    onMutate();
                                  }}
                                  className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0f766e,#10b981)] px-4 py-2.5 text-sm font-semibold text-white"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  Award Carrier
                                </button>
                              ) : null}
                            </div>
                          </div>
                        )) : (
                          <div className="rounded-[24px] border border-dashed border-[#c7d7ea] bg-[#f7fbff] p-5 text-sm text-slate-600">
                            No freight offers yet. Once shipping agents start quoting, the bid board will populate here automatically.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-[28px] border border-dashed border-[#c7d7ea] bg-white p-8 text-center text-slate-600 shadow-sm">
              <FileText className="mx-auto h-8 w-8 text-[#245c9d]" />
              <p className="mt-4 text-lg font-semibold text-[#143a6a]">No transport tenders are open right now.</p>
              <p className="mt-2 text-sm">When a commercial deal is approved, it will appear here for freight bidding before shipment execution begins.</p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

export default TransportBidsPage;
