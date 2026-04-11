import React, { useMemo, useState } from 'react';
import { BadgeDollarSign, CheckCircle2, MessageSquareText, PackageCheck, Send, ShipWheel, Timer } from 'lucide-react';
import { acceptTransportBid, getDealById, getStatusSteps, moveDealToNextStep, sendDealMessage, updateShipmentDetails } from '../lib/tradafyData';
import { AppShell, MetricCard } from './ui';

function DealPage({ user, navigate, pathname, onLogout, dealId, onMutate }) {
  const [draft, setDraft] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const deal = getDealById(dealId);
  const steps = getStatusSteps();
  const [shipmentForm, setShipmentForm] = useState(() => ({
    containerNumber: deal?.shipment?.containerNumber || '',
    shippingStatus: deal?.shipment?.shippingStatus || '',
    mode: deal?.shipment?.mode || 'Sea Freight',
    eta: deal?.shipment?.eta || '',
  }));

  const tabs = useMemo(
    () => [
      { key: 'chat', label: 'Chat', icon: MessageSquareText },
      { key: 'timeline', label: 'Timeline', icon: Timer },
      { key: 'transport', label: 'Transport Bids', icon: BadgeDollarSign },
      { key: 'shipment', label: 'Shipment', icon: ShipWheel },
    ],
    []
  );

  if (!deal) return null;
  const activeStepIndex = steps.findIndex((step) => step.key === deal.status);
  const currentStep = steps[Math.max(activeStepIndex, 0)];
  const acceptedBid = deal.transport?.bids?.find((bid) => bid.id === deal.transport?.acceptedBidId);
  const canAdvance = deal.status !== 'transport-bidding' || Boolean(acceptedBid);

  return (
    <AppShell user={user} pathname={pathname} navigate={navigate} onLogout={onLogout} title={deal.productName} subtitle="This is the shared workspace where buyer, supplier, and shipping teams coordinate from commercial agreement through transport bidding and shipment execution.">
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[30px] border border-slate-300/40 bg-[#0c1f38] p-7 text-white shadow-xl lg:p-8">
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=2400" 
              alt="Cargo Ship Container Port" 
              className="h-full w-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a1b32] via-[#102a4e]/95 to-[#1c4f8d]/80 backdrop-blur-[2px]" />
          </div>

          <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-sky-200 backdrop-blur-md">
                Shared Deal Workspace
              </div>
              <h2 className="mt-5 text-3xl font-bold tracking-tight lg:text-4xl">{deal.productName}</h2>
              <p className="mt-3 text-sm leading-7 text-sky-100/90">Buyer and supplier now work together here through chat, timeline updates, freight bidding, shipment details, and step progression.</p>
            </div>
            <button
              onClick={() => {
                if (!canAdvance) return;
                moveDealToNextStep(deal.id);
                onMutate();
              }}
              className={`mt-2 xl:mt-0 inline-flex items-center justify-center rounded-2xl px-6 py-3.5 text-sm font-semibold transition ${canAdvance ? 'bg-sky-500 text-white hover:bg-sky-400 shadow-[0_10px_20px_rgba(14,165,233,0.3)]' : 'bg-white/10 text-white/50 backdrop-blur cursor-not-allowed'}`}
            >
              {canAdvance ? 'Advance Next Step' : 'Accept Transport Bid First'}
            </button>
          </div>

          <div className="relative z-10 mt-8 grid gap-4 lg:grid-cols-4">
            <MetricCard dark label="Product" value={deal.productName} />
            <MetricCard dark label="Quantity" value={deal.quantity} />
            <MetricCard dark label="Current Status" value={currentStep?.label || deal.status} />
            <MetricCard dark label="Destination" value={deal.deliveryLocation} />
          </div>
        </section>

        <section className="rounded-[28px] border border-[#d8e2ef] bg-white p-5 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
          <div className="grid gap-4 lg:grid-cols-4">
            {steps.map((step, index) => {
              const active = activeStepIndex >= index;
              return (
                <div key={step.key} className={`rounded-[22px] border p-4 ${active ? 'border-[#b8cfe8] bg-[#edf5ff]' : 'border-[#e2ebf4] bg-white'}`}>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${active ? 'bg-[linear-gradient(135deg,#173b67,#245c9d)] text-white' : 'bg-slate-100 text-slate-500'}`}>{index + 1}</div>
                  <p className={`mt-4 text-sm font-semibold ${active ? 'text-[#173b67]' : 'text-slate-600'}`}>{step.label}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
          <div className="space-y-6">
            <section className="rounded-[28px] border border-[#d8e2ef] bg-white p-5 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Deal Summary</p>
              <div className="mt-4 grid gap-3">
                <MetricCard label="Buyer" value={deal.buyerCompany} />
                <MetricCard label="Supplier" value={deal.supplierCompany} />
                <MetricCard label="Price" value={deal.price} />
                <MetricCard label="Delivery Date" value={deal.deliveryDate} />
              </div>
            </section>

            <section className="relative overflow-hidden rounded-[28px] border border-[#d8e2ef] bg-white shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
              <div className="h-32 w-full lg:h-36">
                <img src="https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&q=80&w=1200" alt="Shipping Containers" className="h-full w-full object-cover" />
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-t from-white to-transparent" />
              </div>
              <div className="relative z-10 px-5 pb-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Workspace Rules</p>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="rounded-[18px] border border-[#e2ebf4] bg-[#f8fbff] px-4 py-3 shadow-sm">RFQ was request-only. Collaboration started only after conversion.</div>
                  <div className="rounded-[18px] border border-[#e2ebf4] bg-[#f8fbff] px-4 py-3 shadow-sm">Chat belongs only inside the deal workspace.</div>
                  <div className="rounded-[18px] border border-[#e2ebf4] bg-[#f8fbff] px-4 py-3 shadow-sm">Buyer and supplier view identical progression state.</div>
                  <div className="rounded-[18px] border border-[#e2ebf4] bg-[#f8fbff] px-4 py-3 shadow-sm">Bids accepted before shipping agent is awarded.</div>
                </div>
              </div>
            </section>
          </div>

          <section className="rounded-[28px] border border-[#d8e2ef] bg-white p-5 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
            <div className="flex flex-wrap gap-3 border-b border-slate-100 pb-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
                      active ? 'bg-[linear-gradient(135deg,#173b67,#245c9d)] text-white' : 'bg-[#f4f8fc] text-slate-600'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {activeTab === 'chat' ? (
              <div className="mt-5">
                <div className="space-y-3">
                  {deal.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`rounded-[22px] p-4 ${
                        message.sender === user.name
                          ? 'ml-auto max-w-[85%] bg-[#eaf3ff]'
                          : 'max-w-[85%] bg-[#f5f9fd]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-[#173b67]">{message.sender}</p>
                        <p className="text-xs text-slate-500">{message.date}</p>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-700">{message.body}</p>
                    </div>
                  ))}
                </div>
                <form
                  className="mt-5 flex gap-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!draft.trim()) return;
                    sendDealMessage(deal.id, user.name, draft.trim());
                    setDraft('');
                    onMutate();
                  }}
                >
                  <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a message inside the deal workspace..." className="w-full rounded-2xl border border-[#d8e2ef] px-4 py-3 outline-none" />
                  <button className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#173b67,#245c9d)] px-4 py-3 text-sm font-semibold text-white">
                    <Send className="h-4 w-4" />
                    Send
                  </button>
                </form>
              </div>
            ) : null}

            {activeTab === 'timeline' ? (
              <div className="mt-5 space-y-4">
                {deal.timeline.map((item) => (
                  <div key={item.id} className="rounded-[22px] border border-[#e2ebf4] bg-[#f8fbff] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eaf3ff] text-[#245c9d]">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#173b67]">{item.title}</p>
                        <p className="text-xs text-slate-500">{item.date}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                  </div>
                ))}
              </div>
            ) : null}

            {activeTab === 'transport' ? (
              <div className="mt-5 space-y-5">
                <div className="grid gap-3 sm:grid-cols-4">
                  <MetricCard label="Lane" value={deal.transport?.lane || 'Pending'} />
                  <MetricCard label="Bid Deadline" value={deal.transport?.biddingClosesOn || 'Pending'} />
                  <MetricCard label="Preferred Mode" value={deal.transport?.preferredMode || 'Sea Freight'} />
                  <MetricCard label="Awarded Carrier" value={acceptedBid?.company || 'Pending'} />
                </div>

                <div className="rounded-[24px] border border-[#dbe5f0] bg-[#f8fbff] p-5">
                  <p className="text-sm font-semibold text-[#173b67]">Transport bidding board</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {deal.status === 'transport-bidding'
                      ? 'Shipping agents are currently quoting this lane. Review offers and award the selected carrier when ready.'
                      : 'This deal already has an awarded carrier. The accepted freight offer is shown below for reference.'}
                  </p>
                  <div className="mt-4 space-y-3">
                    {(deal.transport?.bids || []).length ? deal.transport.bids.map((bid) => (
                      <div key={bid.id} className={`rounded-[22px] border p-4 ${bid.id === deal.transport?.acceptedBidId ? 'border-emerald-200 bg-emerald-50' : 'border-[#d8e2ef] bg-white'}`}>
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <p className="text-lg font-semibold text-[#173b67]">{bid.company}</p>
                              <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${bid.id === deal.transport?.acceptedBidId ? 'bg-emerald-100 text-emerald-700' : 'bg-[#eaf3ff] text-[#245c9d]'}`}>
                                {bid.id === deal.transport?.acceptedBidId ? 'Accepted' : 'Submitted'}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-slate-500">{bid.contactName}</p>
                            <p className="mt-3 text-sm leading-6 text-slate-600">{bid.notes}</p>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-3">
                            <MetricCard label="Price" value={bid.price} />
                            <MetricCard label="Transit" value={bid.transitTime} />
                            <MetricCard label="Mode" value={bid.mode} />
                          </div>
                        </div>
                        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="text-sm text-slate-500">Valid until {bid.validUntil}. Submitted {bid.createdAt}.</div>
                          {deal.status === 'transport-bidding' && user.role !== 'shipping_agent' && bid.id !== deal.transport?.acceptedBidId ? (
                            <button
                              onClick={() => {
                                acceptTransportBid(deal.id, bid.id, user.name);
                                onMutate();
                              }}
                              className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0f766e,#10b981)] px-4 py-2.5 text-sm font-semibold text-white"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Accept Bid
                            </button>
                          ) : null}
                        </div>
                      </div>
                    )) : (
                      <div className="relative overflow-hidden rounded-[24px] border border-[#d8e2ef] bg-white shadow-sm">
                        <div className="absolute inset-y-0 right-0 w-1/2 opacity-20 lg:w-2/3">
                          <img src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=1200" alt="Global Trade Port" className="h-full w-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
                        </div>
                        <div className="relative z-10 p-6 lg:p-8">
                          <p className="text-xl font-bold text-[#173b67]">Awaiting Transport Bids</p>
                          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
                            Our verified network of shipping agents is currently preparing quotes for this lane. Check back soon.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {activeTab === 'shipment' ? (
              <div className="mt-5 space-y-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  <MetricCard label="Container" value={deal.shipment?.containerNumber || 'Pending'} />
                  <MetricCard label="Mode" value={deal.shipment?.mode || acceptedBid?.mode || 'Pending'} />
                  <MetricCard label="Status" value={deal.shipment?.shippingStatus || 'Pending'} />
                </div>

                <div className="relative overflow-hidden rounded-[28px] border border-[#dbe5f0] bg-white shadow-sm">
                  <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="p-6 lg:p-8">
                      <p className="text-sm font-bold uppercase tracking-widest text-[#173b67]">Shipment Update</p>
                      <p className="mt-1 text-sm text-slate-500">Securely finalize shipment execution details here.</p>
                      <div className="mt-6 grid gap-5 md:grid-cols-2">
                        <label className="block">
                          <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600">Container Number</span>
                          <input value={shipmentForm.containerNumber} onChange={(event) => setShipmentForm((current) => ({ ...current, containerNumber: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10" placeholder="MSCU 1234567" />
                        </label>
                        <label className="block">
                          <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600">Shipping Status</span>
                          <input value={shipmentForm.shippingStatus} onChange={(event) => setShipmentForm((current) => ({ ...current, shippingStatus: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10" placeholder="At Origin Port" />
                        </label>
                        <label className="block">
                          <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600">Mode</span>
                          <input value={shipmentForm.mode} onChange={(event) => setShipmentForm((current) => ({ ...current, mode: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10" placeholder="Sea Freight" />
                        </label>
                        <label className="block">
                          <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600">ETA</span>
                          <input type="date" value={shipmentForm.eta} onChange={(event) => setShipmentForm((current) => ({ ...current, eta: event.target.value }))} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10" />
                        </label>
                      </div>
                      <button
                        onClick={() => {
                          updateShipmentDetails(deal.id, shipmentForm);
                          onMutate();
                        }}
                        className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f2846] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#153a66]"
                      >
                        <PackageCheck className="h-5 w-5" />
                        Save Shipment Update
                      </button>
                    </div>
                    <div className="hidden bg-slate-100 lg:block relative min-h-[300px]">
                      <img src="https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?auto=format&fit=crop&q=80&w=1200" alt="Bulk carrier loading at port" className="absolute inset-0 h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </section>
        </section>
      </div>
    </AppShell>
  );
}

export default DealPage;
