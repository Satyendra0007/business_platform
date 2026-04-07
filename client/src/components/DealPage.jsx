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
        <section className="rounded-[30px] border border-[#c8d9ec] bg-[linear-gradient(135deg,#143a6a_0%,#1c4f8d_55%,#255fa5_100%)] p-6 text-white shadow-[0_28px_70px_rgba(15,23,42,0.18)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-100">
                Shared Deal Workspace
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">{deal.productName}</h2>
              <p className="mt-2 text-sm text-sky-100/90">Buyer and supplier now work together here through chat, timeline updates, freight bidding, shipment details, and step progression.</p>
            </div>
            <button
              onClick={() => {
                if (!canAdvance) return;
                moveDealToNextStep(deal.id);
                onMutate();
              }}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold ${canAdvance ? 'bg-white text-[#173b67]' : 'bg-white/20 text-white/70'}`}
            >
              {canAdvance ? 'Next Step' : 'Accept Transport Bid First'}
            </button>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-4">
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

            <section className="rounded-[28px] border border-[#d8e2ef] bg-white p-5 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Workspace Rules</p>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="rounded-[18px] bg-[#f5f9fd] px-4 py-3">RFQ was request-only. Collaboration started only after conversion to this deal.</div>
                <div className="rounded-[18px] bg-[#f5f9fd] px-4 py-3">Chat belongs only inside the deal workspace.</div>
                <div className="rounded-[18px] bg-[#f5f9fd] px-4 py-3">Buyer and supplier both see the same deal page and progress state.</div>
                <div className="rounded-[18px] bg-[#f5f9fd] px-4 py-3">Approved deals can collect transport bids before a shipping agent is awarded and shipment execution begins.</div>
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
                      <div className="rounded-[22px] border border-dashed border-[#c7d7ea] bg-white p-5 text-sm text-slate-600">
                        No bids yet. Shipping agents can submit lane offers from the transport bids page.
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

                <div className="rounded-[24px] border border-[#dbe5f0] bg-[#f8fbff] p-5">
                  <p className="text-sm font-semibold text-[#173b67]">Shipment Update</p>
                  <p className="mt-1 text-sm text-slate-500">Suppliers and shipping agents can update shipment details here. Buyers see the same data instantly.</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-600">Container Number</span>
                      <input value={shipmentForm.containerNumber} onChange={(event) => setShipmentForm((current) => ({ ...current, containerNumber: event.target.value }))} className="w-full rounded-2xl border border-[#d8e2ef] px-4 py-3 outline-none" />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-600">Shipping Status</span>
                      <input value={shipmentForm.shippingStatus} onChange={(event) => setShipmentForm((current) => ({ ...current, shippingStatus: event.target.value }))} className="w-full rounded-2xl border border-[#d8e2ef] px-4 py-3 outline-none" />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-600">Mode</span>
                      <input value={shipmentForm.mode} onChange={(event) => setShipmentForm((current) => ({ ...current, mode: event.target.value }))} className="w-full rounded-2xl border border-[#d8e2ef] px-4 py-3 outline-none" />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-600">ETA</span>
                      <input type="date" value={shipmentForm.eta} onChange={(event) => setShipmentForm((current) => ({ ...current, eta: event.target.value }))} className="w-full rounded-2xl border border-[#d8e2ef] px-4 py-3 outline-none" />
                    </label>
                  </div>
                  <button
                    onClick={() => {
                      updateShipmentDetails(deal.id, shipmentForm);
                      onMutate();
                    }}
                    className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#173b67,#245c9d)] px-4 py-3 text-sm font-semibold text-white"
                  >
                    <PackageCheck className="h-4 w-4" />
                    Save Shipment Update
                  </button>
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
