import React, { useMemo, useState } from 'react';
import { ArrowRight, BadgeDollarSign, CalendarDays, CheckCircle2, Clock3, MapPin, ShipWheel, ShieldCheck } from 'lucide-react';
import { AppShell, MetricCard } from './ui';
import { acceptTransportBid, formatDate, getTransportBidOpportunities, submitTransportBid } from '../lib/tradafyData';
import { getProductVisual } from '../lib/productVisuals';

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
        <section className="relative overflow-hidden rounded-[30px] border border-slate-300/40 bg-[#0c1f38] p-7 text-white shadow-xl lg:p-8">
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&q=80&w=2400" 
              alt="Shipping Containers at Port" 
              className="h-full w-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a1b32] via-[#102a4e]/95 to-[#1c4f8d]/80 backdrop-blur-[2px]" />
          </div>

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-sky-200 backdrop-blur-md">
                Transport Procurement
              </div>
              <h2 className="mt-5 text-3xl font-bold tracking-tight lg:text-4xl">Freight bidding built into the deal workflow</h2>
              <p className="mt-3 text-sm leading-7 text-sky-100/90">
                {user.role === 'shipping_agent'
                  ? 'Review open lanes, quote professionally, and compete for awarded shipment execution without leaving the workspace.'
                  : 'Once buyer and supplier agree commercially, the platform opens a verified freight tender so you can compare transport offers before shipment starts.'}
              </p>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3 lg:mt-0">
              <MetricCard dark label="Open Tenders" value={stats.openDeals.length} />
              <MetricCard dark label={user.role === 'shipping_agent' ? 'My Bids' : 'With Bids'} value={user.role === 'shipping_agent' ? stats.submittedByUser : deals.length} />
              <MetricCard dark label={user.role === 'shipping_agent' ? 'My Awards' : 'Total Awards'} value={user.role === 'shipping_agent' ? stats.awardedToUser : deals.filter((deal) => deal.transport?.acceptedBidId).length} />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          {deals.length ? (
            deals.map((deal) => {
              const draft = drafts[deal.id] || { price: '', transitTime: '', mode: 'Sea Freight', validUntil: '', notes: '' };
              const bids = deal.transport?.bids || [];
              const acceptedBidId = deal.transport?.acceptedBidId;
              const lowestBid = bids.slice().sort((a, b) => parseFloat(a.price.replace(/[^\d.]/g, '')) - parseFloat(b.price.replace(/[^\d.]/g, '')))[0];
              const userBid = bids.find((bid) => bid.company === user.company);
              const visual = getProductVisual(deal.productId || deal.id);

              return (
                <article key={deal.id} className="overflow-hidden rounded-[34px] border border-slate-200/80 bg-white shadow-[0_32px_80px_rgba(15,23,42,0.08)]">
                  {/* Premium Manifest Header */}
                  <div className="border-b border-slate-100 bg-[linear-gradient(180deg,#ffffff,#f8fbff)] p-6 lg:p-7 block md:flex md:gap-8">
                     <div className="shrink-0 h-32 w-48 rounded-[24px] overflow-hidden mb-6 md:mb-0 shadow-inner">
                        <img src={visual.image} alt={visual.alt} className="w-full h-full object-cover" />
                     </div>
                     <div className="flex-1 flex flex-col justify-center">
                        <div className="flex items-start justify-between">
                           <div>
                             <div className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${deal.status === 'transport-bidding' ? 'bg-[#143a6a] text-white' : 'bg-emerald-500 text-white'}`}>
                                {deal.status === 'transport-bidding' ? 'Open Freight Tender' : 'Carrier Awarded'}
                             </div>
                             <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">{deal.productName}</h3>
                           </div>
                           <button onClick={() => navigate(`/deal/${deal.id}`)} className="hidden md:inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-[#143a6a] shadow-sm hover:bg-slate-50 transition-colors">
                             Open Workspace
                             <ArrowRight className="h-4 w-4" />
                           </button>
                        </div>
                        <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-6 text-sm border-t border-slate-100 pt-5">
                           <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Volume & Cargo</p>
                              <p className="mt-1 font-bold text-slate-800">{deal.quantity}</p>
                           </div>
                           <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Commercial Value</p>
                              <p className="mt-1 font-bold text-slate-800">{deal.price}</p>
                           </div>
                           <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Incoterm</p>
                              <p className="mt-1 font-bold text-slate-800">{deal.transport?.incoterm || 'CIF'}</p>
                           </div>
                           <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Bid Deadline</p>
                              <p className="mt-1 font-bold text-amber-600">{formatDate(deal.transport?.biddingClosesOn || deal.deliveryDate)}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="grid gap-8 p-6 lg:grid-cols-[0.8fr_1.2fr] lg:p-8">
                    {/* Left Column: Requirements & Form */}
                    <div className="space-y-6">
                      <div className="rounded-[28px] border border-blue-100 bg-[#f4f9ff] p-6 shadow-inner">
                        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#245c9d]">Logistics Requirements</p>
                        <div className="mt-5 space-y-4 text-sm font-medium text-slate-700">
                          <div className="flex items-start gap-4">
                            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#143a6a] text-white">
                              <MapPin className="h-3 w-3" />
                            </div>
                            <span className="leading-relaxed">{deal.transport?.lane}</span>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[#245c9d] shadow-sm">
                              <CalendarDays className="h-3.5 w-3.5" />
                            </div>
                            <span className="leading-relaxed">Cargo Ready: <span className="font-bold text-slate-900">{formatDate(deal.transport?.cargoReadyDate || deal.deliveryDate)}</span></span>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[#245c9d] shadow-sm">
                              <ShipWheel className="h-3.5 w-3.5" />
                            </div>
                            <span className="leading-relaxed">Preferred Mode: <span className="font-bold text-slate-900">{deal.transport?.preferredMode || 'Sea Freight'}</span></span>
                          </div>
                        </div>
                      </div>

                      {user.role === 'shipping_agent' && deal.status === 'transport-bidding' ? (
                        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
                          <div className="mb-6 border-b border-slate-100 pb-4">
                            <p className="text-lg font-bold text-slate-900">Submit Quotation</p>
                            <p className="mt-1 flex items-center gap-2 text-xs font-semibold text-slate-500">
                               <ShieldCheck className="h-4 w-4 text-[#245c9d]" /> Binding offer to execute lane
                            </p>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                              <label className="block">
                                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">Total Freight (USD)</span>
                                <div className="flex items-center gap-3 rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-[#245c9d] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#245c9d]/10 transition-all">
                                  <BadgeDollarSign className="h-4.5 w-4.5 text-slate-400" />
                                  <input value={draft.price} onChange={(event) => updateDraft(deal.id, 'price', event.target.value)} placeholder="e.g. $4,500" className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:font-normal" />
                                </div>
                              </label>
                              <label className="block">
                                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">Transit Time</span>
                                <div className="flex items-center gap-3 rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-[#245c9d] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#245c9d]/10 transition-all">
                                  <Clock3 className="h-4.5 w-4.5 text-slate-400" />
                                  <input value={draft.transitTime} onChange={(event) => updateDraft(deal.id, 'transitTime', event.target.value)} placeholder="e.g. 18 Days" className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:font-normal" />
                                </div>
                              </label>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <label className="block">
                                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">Mode / Vessel</span>
                                <div className="flex items-center gap-3 rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-[#245c9d] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#245c9d]/10 transition-all">
                                  <ShipWheel className="h-4.5 w-4.5 text-slate-400" />
                                  <input value={draft.mode} onChange={(event) => updateDraft(deal.id, 'mode', event.target.value)} className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none" />
                                </div>
                              </label>
                              <label className="block">
                                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">Validity Date</span>
                                <div className="flex items-center gap-3 rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-[#245c9d] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#245c9d]/10 transition-all">
                                  <CalendarDays className="h-4.5 w-4.5 text-slate-400" />
                                  <input type="date" value={draft.validUntil} onChange={(event) => updateDraft(deal.id, 'validUntil', event.target.value)} className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none" />
                                </div>
                              </label>
                            </div>
                            <label className="block">
                              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">Comments / Inclusions</span>
                              <div className="rounded-[16px] border border-slate-200 bg-slate-50 p-4 focus-within:border-[#245c9d] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#245c9d]/10 transition-all">
                                <textarea value={draft.notes} onChange={(event) => updateDraft(deal.id, 'notes', event.target.value)} rows={2} placeholder="Surcharges, laytime, explicit inclusions..." className="w-full bg-transparent text-sm text-slate-900 outline-none resize-none" />
                              </div>
                            </label>
                            
                            <button
                              onClick={() => {
                                if (!draft.price || !draft.transitTime || !draft.validUntil) return;
                                submitTransportBid(deal.id, draft, user);
                                setDrafts((current) => ({ ...current, [deal.id]: { price: '', transitTime: '', mode: 'Sea Freight', validUntil: '', notes: '' } }));
                                onMutate();
                              }}
                              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0c1f38] px-4 py-4 text-sm font-bold text-white transition hover:bg-[#153a66] shadow-[0_10px_20px_rgba(12,31,56,0.15)] hover:-translate-y-0.5"
                            >
                              <BadgeDollarSign className="h-5 w-5" />
                              {userBid ? 'Update Active Bid' : 'Confirm & Submit Quotation'}
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {/* Right Column: Bids */}
                    <div className="space-y-5">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Quotation Board</p>
                          <h4 className="mt-1 text-2xl font-bold text-[#143a6a]">Carrier Offers</h4>
                        </div>
                        {lowestBid && (
                           <div className="text-right">
                             <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Market Low</p>
                             <p className="text-lg font-black text-[#10b981]">{lowestBid.price}</p>
                           </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        {bids.length ? bids.map((bid) => {
                          const isAwarded = bid.id === acceptedBidId;
                          return (
                          <div key={bid.id} className={`rounded-[28px] border p-6 transition-all ${isAwarded ? 'border-emerald-300 bg-[linear-gradient(180deg,#f0fdf4,#ffffff)] shadow-[0_20px_40px_rgba(16,185,129,0.12)] ring-4 ring-emerald-50' : 'border-slate-200 bg-white hover:border-slate-300 shadow-[0_10px_30px_rgba(15,23,42,0.04)]'}`}>
                            <div className="flex items-start justify-between">
                              <div className="flex gap-4">
                                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] ${isAwarded ? 'bg-emerald-500 text-white' : 'bg-[#eaf3ff] text-[#245c9d]'}`}>
                                   <ShipWheel className="h-6 w-6" />
                                </div>
                                <div>
                                  <p className="text-lg font-bold text-slate-900">{bid.company}</p>
                                  <p className="text-xs font-semibold text-slate-500">{bid.contactName}</p>
                                </div>
                              </div>
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${isAwarded ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                {isAwarded ? <><CheckCircle2 className="h-3 w-3" /> Carrier Awarded</> : 'Bid Submitted'}
                              </span>
                            </div>

                            <div className="mt-6 mb-5 grid grid-cols-3 gap-3 rounded-[20px] bg-slate-50 p-4">
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Freight Cost</p>
                                <p className="mt-1 text-base font-black text-slate-900">{bid.price}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Transit</p>
                                <p className="mt-1 text-base font-bold text-slate-800">{bid.transitTime}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Service</p>
                                <p className="mt-1 text-sm font-bold text-slate-800 truncate">{bid.mode}</p>
                              </div>
                            </div>
                            
                            {bid.notes && (
                               <p className="mb-5 text-sm leading-6 text-slate-600 italic border-l-2 border-slate-200 pl-3">"{bid.notes}"</p>
                            )}

                            <div className="flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-400">
                                <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> Valid to {formatDate(bid.validUntil)}</span>
                              </div>
                              {deal.status === 'transport-bidding' && !isAwarded && user.role !== 'shipping_agent' ? (
                                <button
                                  onClick={() => {
                                    acceptTransportBid(deal.id, bid.id, user.name);
                                    onMutate();
                                  }}
                                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 hover:shadow-lg"
                                >
                                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                  Award Execution
                                </button>
                              ) : null}
                            </div>
                          </div>
                        );
                        }) : (
                          <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white">
                            <div className="absolute right-0 top-0 h-full w-2/3 opacity-[0.12]">
                              <img src="https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?auto=format&fit=crop&q=80&w=1200" alt="Port infrastructure" className="h-full w-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
                            </div>
                            <div className="relative z-10 p-8 lg:p-10">
                               <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                  <Clock3 className="h-6 w-6" />
                               </div>
                               <p className="text-xl font-bold tracking-tight text-[#173b67]">Awaiting Carrier Quotes</p>
                               <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
                                 The lane is open. When professional shipping agents submit their competitive freight offers, they will appear here side-by-side.
                               </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="relative overflow-hidden rounded-[34px] border border-slate-200/80 bg-white shadow-[0_32px_80px_rgba(15,23,42,0.08)]">
              <div className="absolute right-0 top-0 h-full w-1/2 opacity-20 lg:w-2/3">
                 <img src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=1200" alt="Global Trade Port" className="h-full w-full object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent" />
              </div>
              <div className="relative z-10 p-10 lg:p-16 max-w-2xl">
                 <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-[24px] bg-[linear-gradient(135deg,#eef5ff,#ffffff)] text-[#245c9d] shadow-lg border border-blue-50">
                   <ShipWheel className="h-10 w-10" />
                 </div>
                 <h3 className="text-4xl font-black tracking-tight text-slate-900 lg:text-5xl">No transport tenders open.</h3>
                 <p className="mt-5 text-lg leading-8 text-slate-600 font-medium">
                   When a commercial trade reaches binding agreement, the platform will automatically orchestrate a secure freight bidding lane here prior to shipment execution.
                 </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

export default TransportBidsPage;
