import React from 'react';
import { ArrowRight, BadgeDollarSign, Boxes, FileText, FolderKanban, MapPin, PackageCheck, ShipWheel, Timer } from 'lucide-react';
import dashboardReference from '../assets/dashboard-reference.jpeg';
import { formatDate, getAdminSnapshot, getDealsForUser, getProductsForUser, getRFQsForUser, getStatusSteps, getTransportBidOpportunities } from '../lib/tradafyData';
import { AppShell, MetricCard } from './ui';

function DashboardPage({ user, navigate, pathname, onLogout }) {
  const products = getProductsForUser(user);
  const rfqs = getRFQsForUser(user);
  const deals = getDealsForUser(user);
  const bidOpportunities = getTransportBidOpportunities(user);
  const featuredDeal = user.role === 'shipping_agent' ? bidOpportunities[0] || deals[0] : deals[0] || bidOpportunities[0];
  const steps = getStatusSteps();
  const activeStepIndex = featuredDeal ? steps.findIndex((step) => step.key === featuredDeal.status) : -1;
  const adminSnapshot = user.role === 'admin' ? getAdminSnapshot() : null;

  const tiles =
    user.role === 'buyer'
      ? [
          { label: 'Products', value: products.length, note: 'Verified supplier listings', action: '/products' },
          { label: 'My RFQs', value: rfqs.length, note: 'Buyer requests in progress', action: '/my-rfqs' },
          { label: 'Transport Tenders', value: bidOpportunities.length, note: 'Freight comparisons after agreement', action: '/transport-bids' },
        ]
      : user.role === 'supplier'
        ? [
            { label: 'My Products', value: products.length, note: 'Catalog currently visible', action: '/products' },
            { label: 'Incoming RFQs', value: rfqs.length, note: 'Requests waiting for action', action: '/incoming-rfqs' },
            { label: 'Transport Tenders', value: bidOpportunities.length, note: 'Open carrier bidding rounds', action: '/transport-bids' },
          ]
        : user.role === 'shipping_agent'
          ? [
              { label: 'Open Tenders', value: bidOpportunities.filter((deal) => deal.status === 'transport-bidding').length, note: 'Deals ready for freight quoting', action: '/transport-bids' },
              { label: 'Awarded Shipments', value: deals.length, note: 'Carriers already awarded to your team', action: '/deals' },
              { label: 'Product Views', value: products.length, note: 'Reference catalog available', action: '/products' },
            ]
          : [
              { label: 'Users', value: adminSnapshot.users.length, note: 'Account and role visibility', action: '/admin' },
              { label: 'Companies', value: adminSnapshot.companies.length, note: 'Verified business network', action: '/admin' },
              { label: 'Deals', value: adminSnapshot.deals.length, note: 'Platform-wide active collaborations', action: '/admin' },
            ];

  const tileIcons = [Boxes, FolderKanban, user.role === 'shipping_agent' ? ShipWheel : BadgeDollarSign];
  const tileThemes = [
    {
      shell: 'from-white via-[#f7fbff] to-[#eef5fd]',
      icon: 'bg-[linear-gradient(135deg,#1d4d86,#2c67ad)] text-white',
      glow: 'bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.18),transparent_42%)]',
    },
    {
      shell: 'from-[#143a6a] via-[#1d4f89] to-[#275f9f]',
      icon: 'bg-white/14 text-white',
      glow: 'bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_42%)]',
    },
    {
      shell: 'from-[#eff7ff] via-white to-[#eef5fb]',
      icon: 'bg-[linear-gradient(135deg,#245c9d,#3d7abd)] text-white',
      glow: 'bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_40%)]',
    },
  ];

  const requestSource =
    user.role === 'shipping_agent'
      ? bidOpportunities
      : rfqs.length
        ? rfqs
        : featuredDeal
          ? [featuredDeal]
          : [];

  const requestCards = requestSource.slice(0, 3).map((item, index) => {
    const isDeal = Boolean(item.deliveryDate);
    return {
      id: item.id,
      title: user.role === 'shipping_agent' ? `${item.productName} Freight Tender` : isDeal ? item.productName : `${item.productName} Request`,
      from: item.supplierCompany,
      to: item.deliveryLocation,
      volume: item.quantity,
      deadline: user.role === 'shipping_agent' ? item.transport?.biddingClosesOn : isDeal ? formatDate(item.deliveryDate) : item.createdAt,
      action: user.role === 'shipping_agent' ? '/transport-bids' : isDeal ? `/deal/${item.id}` : user.role === 'supplier' ? `/incoming-rfqs` : '/my-rfqs',
      actionLabel: user.role === 'shipping_agent' ? 'Submit Bid' : isDeal ? 'Open Deal' : user.role === 'supplier' ? 'Review RFQ' : 'View RFQ',
      accent: index === 0 ? 'bg-[#eaf3ff]' : 'bg-white',
      code: item.id.toUpperCase(),
    };
  });

  const dashboardTitle =
    user.role === 'shipping_agent'
      ? 'Transport Command Center'
      : user.role === 'supplier'
        ? 'Supplier Opportunities'
        : user.role === 'admin'
          ? 'Platform Operations'
          : 'Trade Opportunities';

  return (
    <AppShell user={user} pathname={pathname} navigate={navigate} onLogout={onLogout} title="Dashboard" subtitle="Browse products, manage RFQs, and keep every trade workflow aligned from inquiry to shipment.">
      <div className="space-y-2">
        <section className="-mt-6 overflow-hidden rounded-[30px] border border-slate-300/40 shadow-xl">
          <div className="relative bg-[#0c1f38]">
            <img src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=2400" alt="Trade operations dashboard banner" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a1b32] via-[#102a4e]/95 to-[#1c4f8d]/80 backdrop-blur-[2px]" />
            
            <div className="relative flex flex-col gap-8 px-6 py-8 lg:flex-row lg:items-center lg:justify-between lg:px-8">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-sky-200 backdrop-blur-sm">
                  Live Workspace
                </div>
                <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white xl:text-4xl">{dashboardTitle}</h2>
                <p className="mt-3 text-sm leading-6 text-sky-100/90">
                  {user.role === 'shipping_agent'
                    ? 'Place freight bids on newly approved deals, convert awarded tenders into shipments, and keep execution visible in one logistics workspace.'
                    : 'Monitor active opportunities, move RFQs into execution, and coordinate freight bidding before shipment starts.'}
                </p>
              </div>

              <div className="grid w-full gap-4 sm:grid-cols-3 lg:w-[620px] shrink-0">
                {tiles.map((tile, index) => {
                  const Icon = tileIcons[index] || Boxes;
                  return (
                  <button
                    key={tile.label}
                    onClick={() => navigate(tile.action)}
                    className="relative overflow-hidden rounded-[24px] border border-white/10 bg-white/5 p-5 text-left text-white shadow-lg backdrop-blur-md transition hover:-translate-y-1 hover:bg-white/10"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-sky-500/20 shadow-inner">
                        <Icon className="h-5 w-5 text-sky-300" />
                      </div>
                    </div>
                    <div className="mt-5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-100/70">{tile.label}</p>
                      <div className="mt-1 flex items-end justify-between gap-2">
                        <p className="text-3xl font-bold tracking-tight">{tile.value}</p>
                        <ArrowRight className="h-4 w-4 text-sky-400 opacity-60" />
                      </div>
                    </div>
                  </button>
                );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 pt-2 xl:grid-cols-[1.38fr_0.62fr]">
          <div className="space-y-6">
            <section className="rounded-[28px] border border-[#d8e2ef] bg-white p-6 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Open Activity</p>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight text-[#143a6a]">{user.role === 'shipping_agent' ? 'Open Transport Tenders' : 'Open Shipping Requests'}</h3>
                </div>
                <button
                  onClick={() => navigate(user.role === 'shipping_agent' ? '/transport-bids' : user.role === 'supplier' ? '/incoming-rfqs' : '/deals')}
                  className="rounded-full bg-[#f4f8fc] px-4 py-2 text-xs font-semibold text-[#245c9d] transition hover:bg-[#eaf3ff]"
                >
                  View All
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {requestCards.length ? (
                  requestCards.map((card, index) => (
                    <article key={card.id} className="rounded-[24px] border border-[#dbe6f2] bg-white p-5 shadow-sm transition hover:shadow-md hover:border-[#cfdef2]">
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <div className="rounded-xl border border-sky-100 bg-[#f4f8fc] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#245c9d]">{card.code}</div>
                            <h4 className="text-lg font-bold text-[#143a6a]">{card.title}</h4>
                          </div>
                          <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-slate-600 sm:grid-cols-4">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">From</p>
                              <p className="mt-1 truncate font-semibold text-slate-700">{card.from}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">To</p>
                              <p className="mt-1 truncate font-semibold text-slate-700">{card.to}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Volume</p>
                              <p className="mt-1 truncate font-semibold text-slate-700">{card.volume}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Timing</p>
                              <p className="mt-1 truncate font-semibold text-slate-700">{user.role === 'shipping_agent' ? `Closes ${formatDate(card.deadline)}` : isNaN(Date.parse(card.deadline)) ? card.deadline : formatDate(card.deadline)}</p>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => navigate(card.action)}
                          className={`mt-3 inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold transition xl:mt-0 shadow-sm ${index === 0 ? 'bg-[#0f2846] text-white hover:bg-[#153a66]' : 'bg-[#f4f8fc] text-[#143a6a] hover:bg-[#eaf3ff]'}`}
                        >
                          {card.actionLabel}
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="relative overflow-hidden rounded-[24px] border border-[#d8e2ef] bg-white shadow-sm">
                    <div className="absolute inset-y-0 right-0 w-1/2 opacity-20">
                       <img src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=1200" alt="Global Trade Port" className="h-full w-full object-cover" />
                       <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
                    </div>
                    <div className="relative z-10 p-6 lg:p-8">
                       <p className="text-xl font-bold text-[#173b67]">No Open Activity</p>
                       <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
                         {user.role === 'shipping_agent'
                           ? 'No transport tenders are open right now. Newly agreed deals will appear here automatically for freight bidding.'
                           : 'There are no live requests yet. Create or convert an RFQ to populate this operations panel.'}
                       </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

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
                {(deals.length ? deals : []).slice(0, 3).map((deal, index) => (
                  <button
                    key={deal.id}
                    onClick={() => navigate(`/deal/${deal.id}`)}
                    className={`grid w-full grid-cols-[1.2fr_1fr_0.8fr_0.7fr] items-center px-4 py-4 text-left text-sm ${index !== 0 ? 'border-t border-[#e7eef6]' : ''}`}
                  >
                    <span className="font-semibold text-[#143a6a]">{deal.productName}</span>
                    <span className="text-slate-600">{deal.price} - {deal.quantity}</span>
                    <span className={`font-medium capitalize ${deal.status === 'transport-bidding' ? 'text-amber-600' : 'text-emerald-600'}`}>{deal.status.replace('-', ' ')}</span>
                    <span className="font-semibold text-[#245c9d]">Open</span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-[28px] border border-[#d8e2ef] bg-white p-5 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
              <div className="border-b border-slate-100 pb-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Shipment Tracker</p>
                <h3 className="mt-2 text-[1.4rem] font-semibold tracking-[-0.02em] text-[#143a6a]">Current shipment</h3>
              </div>

              <div className="mt-5 overflow-hidden rounded-[22px] border border-[#dce7f2]">
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img src="https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?auto=format&fit=crop&q=80&w=1200" alt="Bulk carrier loading at port" className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e2746]/80 to-transparent" />
                  
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md">
                      <span className="relative flex h-2 w-2">
                         <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                         <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                      </span>
                      Live Shipment Tracker
                    </span>
                  </div>
                </div>
              </div>

              {featuredDeal ? (
                <div className="mt-4 rounded-[22px] bg-[#f5f9fd] p-4">
                  <p className="font-semibold text-[#143a6a]">{featuredDeal.id.toUpperCase()} - {featuredDeal.productName}</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    <p>Status: <span className="font-medium capitalize text-[#143a6a]">{featuredDeal.status.replace('-', ' ')}</span></p>
                    <p>Mode: <span className="font-medium text-[#143a6a]">{featuredDeal.transport?.preferredMode || featuredDeal.shipment?.mode || 'Sea Freight'}</span></p>
                    <p>{featuredDeal.status === 'transport-bidding' ? 'Bid Deadline' : 'ETA'}: <span className="font-medium text-[#143a6a]">{formatDate(featuredDeal.status === 'transport-bidding' ? featuredDeal.transport?.biddingClosesOn : featuredDeal.deliveryDate)}</span></p>
                  </div>
                </div>
              ) : null}
            </section>

            <section className="rounded-[28px] border border-[#d8e2ef] bg-white p-5 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
              <div className="border-b border-slate-100 pb-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Progress Path</p>
                <h3 className="mt-2 text-[1.4rem] font-semibold tracking-[-0.02em] text-[#143a6a]">Deal milestone tracker</h3>
              </div>

              <div className="mt-5 space-y-3">
                {steps.map((step, index) => {
                  const active = activeStepIndex >= index;
                  return (
                    <div key={step.key} className={`flex items-center gap-3 rounded-[20px] border px-4 py-3 ${active ? 'border-[#bcd1e8] bg-[#edf5ff]' : 'border-[#e3ebf4] bg-white'}`}>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${active ? 'bg-[linear-gradient(135deg,#1d4d86,#2b66ad)] text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className={`font-semibold ${active ? 'text-[#143a6a]' : 'text-slate-700'}`}>{step.label}</p>
                        <p className="text-sm text-slate-500">{active ? 'Active or completed in current workflow' : 'Upcoming stage in the trade flow'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[28px] border border-[#d8e2ef] bg-white p-5 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
              <div className="border-b border-slate-100 pb-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Workspace Tools</p>
                <h3 className="mt-2 text-[1.4rem] font-semibold tracking-[-0.02em] text-[#143a6a]">Quick access</h3>
              </div>
              <div className="mt-5 space-y-3">
                <button onClick={() => navigate('/products')} className="flex w-full items-center justify-between rounded-[18px] bg-[linear-gradient(135deg,#1d4d86,#2b66ad)] px-4 py-3 text-sm font-semibold text-white">
                  <span className="flex items-center gap-2"><FileText className="h-4 w-4" /> Product Reference</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button onClick={() => navigate('/deals')} className="flex w-full items-center justify-between rounded-[18px] bg-[linear-gradient(135deg,#173b67,#245c9d)] px-4 py-3 text-sm font-semibold text-white">
                  <span className="flex items-center gap-2"><ShipWheel className="h-4 w-4" /> Live Deals</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button onClick={() => navigate('/transport-bids')} className="flex w-full items-center justify-between rounded-[18px] bg-[linear-gradient(135deg,#295f99,#3f79b8)] px-4 py-3 text-sm font-semibold text-white">
                  <span className="flex items-center gap-2"><BadgeDollarSign className="h-4 w-4" /> {user.role === 'shipping_agent' ? 'Bid On Lanes' : 'Transport Bids'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button onClick={() => navigate(user.role === 'supplier' ? '/incoming-rfqs' : user.role === 'admin' ? '/admin' : '/my-rfqs')} className="flex w-full items-center justify-between rounded-[18px] bg-[linear-gradient(135deg,#346aa5,#4b84c2)] px-4 py-3 text-sm font-semibold text-white">
                  <span className="flex items-center gap-2"><PackageCheck className="h-4 w-4" /> {user.role === 'supplier' ? 'Review RFQs' : user.role === 'admin' ? 'Control Center' : 'My RFQs'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </section>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export default DashboardPage;
