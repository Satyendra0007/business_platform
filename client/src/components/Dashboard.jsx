import React from 'react';
import { ArrowRight, Boxes, FileText, FolderKanban, MapPin, PackageCheck, ShipWheel, Timer } from 'lucide-react';
import dashboardReference from '../assets/dashboard-reference.jpeg';
import { formatDate, getAdminSnapshot, getDealsForUser, getProductsForUser, getRFQsForUser, getStatusSteps } from '../lib/tradafyData';
import { AppShell, MetricCard } from './ui';

function DashboardPage({ user, navigate, pathname, onLogout }) {
  const products = getProductsForUser(user);
  const rfqs = getRFQsForUser(user);
  const deals = getDealsForUser(user);
  const featuredDeal = deals[0];
  const steps = getStatusSteps();
  const activeStepIndex = featuredDeal ? steps.findIndex((step) => step.key === featuredDeal.status) : -1;
  const adminSnapshot = user.role === 'admin' ? getAdminSnapshot() : null;

  const tiles =
    user.role === 'buyer'
      ? [
          { label: 'Products', value: products.length, note: 'Verified supplier listings', action: '/products' },
          { label: 'My RFQs', value: rfqs.length, note: 'Buyer requests in progress', action: '/my-rfqs' },
          { label: 'My Deals', value: deals.length, note: 'Active commercial workspaces', action: '/deals' },
        ]
      : user.role === 'supplier'
        ? [
            { label: 'My Products', value: products.length, note: 'Catalog currently visible', action: '/products' },
            { label: 'Incoming RFQs', value: rfqs.length, note: 'Requests waiting for action', action: '/incoming-rfqs' },
            { label: 'My Deals', value: deals.length, note: 'Deals in execution', action: '/deals' },
          ]
        : user.role === 'shipping_agent'
          ? [
              { label: 'Active Deals', value: deals.length, note: 'Logistics workspaces live', action: '/deals' },
              { label: 'Shipments In Transit', value: deals.filter((deal) => deal.status === 'in-transit' || deal.status === 'shipment-booked').length, note: 'Tracked through shipment stages', action: '/deals' },
              { label: 'Product Views', value: products.length, note: 'Reference catalog available', action: '/products' },
            ]
          : [
              { label: 'Users', value: adminSnapshot.users.length, note: 'Account and role visibility', action: '/admin' },
              { label: 'Companies', value: adminSnapshot.companies.length, note: 'Verified business network', action: '/admin' },
              { label: 'Deals', value: adminSnapshot.deals.length, note: 'Platform-wide active collaborations', action: '/admin' },
            ];

  const tileIcons = [Boxes, FolderKanban, ShipWheel];
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

  const requestCards = (rfqs.length ? rfqs : featuredDeal ? [featuredDeal] : []).slice(0, 3).map((item, index) => {
    const isDeal = Boolean(item.deliveryDate);
    return {
      id: item.id,
      title: isDeal ? item.productName : `${item.productName} Request`,
      from: isDeal ? item.supplierCompany : item.supplierCompany,
      to: item.deliveryLocation,
      volume: item.quantity,
      deadline: isDeal ? formatDate(item.deliveryDate) : item.createdAt,
      action: isDeal ? `/deal/${item.id}` : user.role === 'supplier' ? `/incoming-rfqs` : '/my-rfqs',
      actionLabel: isDeal ? 'Open Deal' : user.role === 'supplier' ? 'Review RFQ' : 'View RFQ',
      accent: index === 0 ? 'bg-[#eaf3ff]' : 'bg-white',
      code: isDeal ? item.id.toUpperCase() : item.id.toUpperCase(),
    };
  });

  const dashboardTitle =
    user.role === 'shipping_agent'
      ? 'Shipping Opportunities'
      : user.role === 'supplier'
        ? 'Supplier Opportunities'
        : user.role === 'admin'
          ? 'Platform Operations'
          : 'Trade Opportunities';

  return (
    <AppShell user={user} pathname={pathname} navigate={navigate} onLogout={onLogout} title="Dashboard" subtitle="Browse products, manage RFQs, and keep every trade workflow aligned from inquiry to shipment.">
      <div className="space-y-2">
        <section className="-mt-6 overflow-hidden rounded-[30px] border border-[#c8d9ec] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <div className="relative min-h-[120px] overflow-hidden">
            <img src={dashboardReference} alt="Trade operations dashboard banner" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,45,83,0.92)_0%,rgba(24,64,111,0.86)_36%,rgba(28,77,134,0.38)_100%)]" />
            <div className="relative flex h-full flex-col justify-between px-5 py-4 lg:px-6 lg:py-4">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-100">
                  Live Workspace
                </div>
                <h2 className="mt-1 font-display text-[1.9rem] font-semibold tracking-[-0.03em] text-white sm:text-[2.05rem]">{dashboardTitle}</h2>
                <p className="mt-1.5 max-w-xl text-sm leading-5 text-sky-100/90">
                  {user.role === 'shipping_agent'
                    ? 'Place bids, monitor shipment milestones, and keep logistics execution visible across every active trade deal.'
                    : 'Monitor active opportunities, move RFQs into execution, and operate from a visually clear trade command center.'}
                </p>
              </div>

              <div className="-mb-2 mt-2 grid max-w-[780px] gap-5 md:grid-cols-3">
                {tiles.map((tile, index) => {
                  const Icon = tileIcons[index] || Boxes;
                  const theme = tileThemes[index] || tileThemes[0];
                  const dark = index === 1;
                  return (
                  <button
                    key={tile.label}
                    onClick={() => navigate(tile.action)}
                    className={`relative overflow-hidden rounded-[20px] border ${dark ? 'border-white/10 text-white' : 'border-[#d7e3f0] text-[#143a6a]'} bg-gradient-to-br ${theme.shell} px-3 py-3 text-left shadow-[0_14px_24px_rgba(15,23,42,0.10)] transition hover:-translate-y-1 hover:shadow-[0_18px_28px_rgba(15,23,42,0.14)]`}
                  >
                    <div className={`absolute inset-0 ${theme.glow}`} />
                    <div className="relative">
                      <div className="flex items-start justify-between gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-xl shadow-sm ${theme.icon}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${dark ? 'bg-white/10 text-sky-100' : 'bg-white text-[#245c9d]'}`}>
                          Overview
                        </div>
                      </div>
                      <p className={`mt-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] ${dark ? 'text-sky-100/80' : 'text-slate-500'}`}>{tile.label}</p>
                      <div className="mt-1 flex items-end justify-between gap-2">
                        <p className="text-[1.7rem] font-semibold tracking-[-0.05em]">{tile.value}</p>
                        <ArrowRight className={`h-4 w-4 ${dark ? 'text-white' : 'text-[#245c9d]'}`} />
                      </div>
                      <p className={`mt-1 max-w-[10rem] text-[10px] leading-4 ${dark ? 'text-sky-100/88' : 'text-slate-600'}`}>{tile.note}</p>
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
            <section className="rounded-[28px] border border-[#d8e2ef] bg-white p-5 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Open Activity</p>
                  <h3 className="mt-2 text-[1.7rem] font-semibold tracking-[-0.02em] text-[#143a6a]">Open Shipping Requests</h3>
                </div>
                <button
                  onClick={() => navigate(user.role === 'supplier' ? '/incoming-rfqs' : '/deals')}
                  className="text-sm font-semibold text-[#245c9d]"
                >
                  All
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {requestCards.length ? (
                  requestCards.map((card) => (
                    <article key={card.id} className={`rounded-[22px] border border-[#dbe6f2] ${card.accent} p-4 shadow-sm`}>
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-[#1f5aa0] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white">{card.code}</div>
                            <h4 className="text-xl font-semibold text-[#143a6a]">{card.title}</h4>
                          </div>
                          <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-[#245c9d]" />
                              <span>From: {card.from}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <PackageCheck className="h-4 w-4 text-[#245c9d]" />
                              <span>Volume: {card.volume}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-[#f59e0b]" />
                              <span>To: {card.to}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Timer className="h-4 w-4 text-[#245c9d]" />
                              <span>{isNaN(Date.parse(card.deadline)) ? `Deadline: ${card.deadline}` : `ETA: ${card.deadline}`}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => navigate(card.action)}
                          className="rounded-2xl bg-[linear-gradient(135deg,#1d4d86,#2563aa)] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(29,77,134,0.22)]"
                        >
                          {card.actionLabel}
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-[22px] border border-dashed border-[#c7d7ea] bg-[#f7fbff] p-5 text-sm text-slate-600">
                    There are no live requests yet. Create or convert an RFQ to populate this operations panel.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[28px] border border-[#d8e2ef] bg-white p-5 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Deal Board</p>
                  <h3 className="mt-2 text-[1.55rem] font-semibold tracking-[-0.02em] text-[#143a6a]">Offer and execution summary</h3>
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
                    <span className="font-medium capitalize text-emerald-600">{deal.status.replace('-', ' ')}</span>
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
                <div className="relative h-48 bg-[radial-gradient(circle_at_18%_28%,#8dd7ff_0%,#6cc4f3_18%,#53b7e4_30%,#73d2ef_31%,#7fd7f3_36%,#a8e5f7_48%,#79d5eb_49%,#8fdff1_55%,#d5f0f8_100%)]">
                  <div className="absolute inset-y-0 left-[12%] w-[22%] rounded-full bg-[rgba(82,170,116,0.75)] blur-[2px]" />
                  <div className="absolute left-[18%] top-[24%] h-[30%] w-[20%] rounded-[45%] bg-[rgba(88,173,122,0.85)]" />
                  <div className="absolute right-[10%] top-[18%] h-[36%] w-[24%] rounded-[48%] bg-[rgba(98,183,128,0.78)]" />
                  <div className="absolute bottom-[12%] left-[38%] h-[18%] w-[30%] rounded-[45%] bg-[rgba(98,183,128,0.8)]" />
                  <div className="absolute left-[43%] top-[52%] h-4 w-28 rounded-full bg-[#0b5e9a]" />
                  <div className="absolute left-[46%] top-[48%] h-3 w-14 rounded-sm bg-[#1f78c5]" />
                  <div className="absolute left-[55%] top-[47%] h-6 w-2 rounded-full bg-[#f8fafc]" />
                </div>
              </div>

              {featuredDeal ? (
                <div className="mt-4 rounded-[22px] bg-[#f5f9fd] p-4">
                  <p className="font-semibold text-[#143a6a]">{featuredDeal.id.toUpperCase()} - {featuredDeal.productName}</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    <p>Status: <span className="font-medium capitalize text-[#143a6a]">{featuredDeal.status.replace('-', ' ')}</span></p>
                    <p>Mode: <span className="font-medium text-[#143a6a]">Sea Freight</span></p>
                    <p>ETA: <span className="font-medium text-[#143a6a]">{formatDate(featuredDeal.deliveryDate)}</span></p>
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
                <button onClick={() => navigate(user.role === 'supplier' ? '/incoming-rfqs' : user.role === 'admin' ? '/admin' : '/my-rfqs')} className="flex w-full items-center justify-between rounded-[18px] bg-[linear-gradient(135deg,#295f99,#3f79b8)] px-4 py-3 text-sm font-semibold text-white">
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
