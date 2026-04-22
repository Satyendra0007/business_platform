/**
 * Dashboard.jsx — Main dashboard orchestrator.
 *
 * Tile counts now come from GET /api/dashboard/stats (real DB counts).
 * Mock data (tradafyData) is still used for the activity cards and deal board
 * until those modules are wired to live endpoints.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from './ui';
import { useAuth } from '../hooks/useAuth';
import { getDashboardStats } from '../lib/dashboardService';
import {
  formatDate,
  getDealsForUser,
  getProductsForUser,
  getRFQsForUser,
  getStatusSteps,
  getTransportBidOpportunities,
  getAdminSnapshot,
} from '../lib/tradafyData';

import CompanyBanner     from './dashboard/CompanyBanner';
import PhoneVerificationBanner from './dashboard/PhoneVerificationBanner';
import PlanStatusBanner  from './plan/PlanStatusBanner';
import DashboardHero     from './dashboard/DashboardHero';
import OpenActivity      from './dashboard/OpenActivity';
import { DealBoard, ShipmentTracker } from './dashboard/DealSummary';
import { MilestoneTracker, QuickAccess } from './dashboard/Sidebar';
import PremiumMembershipSection from './membership/PremiumMembershipSection';

// ─── Tile builder — uses REAL stats from API ──────────────────────────────────

function buildTiles(role, stats) {
  // Called only after stats have loaded — never pass null here
  if (role === 'buyer') return [
    { label: 'Products',          value: stats.totalProducts   ?? 0, note: 'Verified supplier listings',          action: '/products' },
    { label: 'My RFQs',           value: stats.myRFQs          ?? 0, note: 'Buyer requests in progress',          action: '/my-rfqs' },
    { label: 'Transport Tenders', value: stats.transportTenders ?? 0, note: 'Freight comparisons after agreement', action: '/transport-bids' },
  ];

  if (role === 'supplier') return [
    { label: 'My Products',       value: stats.myProducts       ?? 0, note: 'Your active product listings',       action: '/supplier/products' },
    { label: 'Incoming RFQs',     value: stats.incomingRFQs     ?? 0, note: 'Requests waiting for action',        action: '/incoming-rfqs' },
    { label: 'Transport Tenders', value: stats.transportTenders ?? 0, note: 'Open carrier bidding rounds',        action: '/transport-bids' },
  ];

  if (role === 'shipping_agent') return [
    { label: 'Open Tenders',      value: stats.openTenders      ?? 0, note: 'Deals ready for freight quoting',   action: '/transport-bids' },
    { label: 'Awarded Shipments', value: stats.awardedShipments ?? 0, note: 'Carriers already awarded',          action: '/deals' },
    { label: 'Product Views',     value: stats.totalProducts    ?? 0, note: 'Reference catalog available',        action: '/products' },
  ];

  // admin
  return [
    { label: 'Users',     value: stats.totalUsers     ?? 0, note: 'Account and role visibility',               action: '/admin' },
    { label: 'Companies', value: stats.totalCompanies ?? 0, note: `${stats.pendingCompanies ?? 0} pending approval`, action: '/admin' },
    { label: 'Deals',     value: stats.totalDeals     ?? 0, note: 'Platform-wide active collaborations',        action: '/admin' },
  ];
}


// ─── Request card builder (still uses mock — replace per phase) ───────────────

function buildRequestCards(user, rfqs, deals, bidOpportunities, featuredDeal) {
  const role = user?.roles?.[0] || user?.role;

  const source =
    role === 'shipping_agent'
      ? bidOpportunities
      : rfqs.length
        ? rfqs
        : featuredDeal
          ? [featuredDeal]
          : [];

  return source.slice(0, 3).map((item) => {
    const isDeal = Boolean(item.deliveryDate);
    return {
      id: item.id,
      code: item.id.toUpperCase(),
      title:
        role === 'shipping_agent'
          ? `${item.productName} Freight Tender`
          : isDeal
            ? item.productName
            : `${item.productName} Request`,
      from: item.supplierCompany,
      to: item.deliveryLocation,
      volume: item.quantity,
      deadline:
        role === 'shipping_agent'
          ? `Closes ${formatDate(item.transport?.biddingClosesOn)}`
          : isDeal
            ? formatDate(item.deliveryDate)
            : item.createdAt,
      action:
        role === 'shipping_agent'
          ? '/transport-bids'
          : isDeal
            ? `/deal/${item.id}`
            : role === 'supplier'
              ? '/incoming-rfqs'
              : '/my-rfqs',
      actionLabel:
        role === 'shipping_agent'
          ? 'Submit Bid'
          : isDeal
            ? 'Open Deal'
            : role === 'supplier'
              ? 'Review RFQ'
              : 'View RFQ',
    };
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const role = user?.roles?.[0] || user?.role;

  // ── Real stats from API ────────────────────────────────────────────────────
  const [stats,      setStats]      = useState(null);
  const [statsError, setStatsError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getDashboardStats()
      .then((data) => { if (!cancelled) setStats(data); })
      .catch((err)  => { if (!cancelled) setStatsError(err.response?.data?.message || err.message); });
    return () => { cancelled = true; };
  }, []);

  // ── Activity data (still from mock — replaced per phase) ──────────────────
  const products       = getProductsForUser(user);
  const rfqs           = getRFQsForUser(user);
  const deals          = getDealsForUser(user);
  const bidOpportunities = getTransportBidOpportunities(user);
  const featuredDeal   = role === 'shipping_agent'
    ? bidOpportunities[0] || deals[0]
    : deals[0] || bidOpportunities[0];
  const steps          = getStatusSteps();
  const activeStepIndex = featuredDeal
    ? steps.findIndex((s) => s.key === featuredDeal.status)
    : -1;

  const tiles = stats ? buildTiles(role, stats) : [];

  const requestCards = buildRequestCards(user, rfqs, deals, bidOpportunities, featuredDeal);

  return (
    <AppShell
      title="Dashboard"
      subtitle="Browse products, manage RFQs, and keep every trade workflow aligned from inquiry to shipment."
    >
      <div className="space-y-4">

        {/* Stats loading bar (only while first fetch is in flight) */}
        {!stats && !statsError && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-2/5 animate-pulse rounded-full bg-[#245c9d]/50" />
          </div>
        )}

        {/* Stats error banner (non-fatal) */}
        {statsError && (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
            Could not load live stats: {statsError}
          </div>
        )}

        {/* 1. Company status banner */}
        <CompanyBanner />

        {/* 1b. Phone verification banner — shown when phone not yet verified */}
        <PhoneVerificationBanner />

        {/* 1c. Plan status & usage meter */}
        <PlanStatusBanner />

        {/* 2. Top workspace stack */}
        <section className="grid gap-4">
          <DashboardHero tiles={tiles} compact />
          <PremiumMembershipSection compact />
        </section>

        {/* 3. Main content grid */}
        <section className="grid gap-6 xl:grid-cols-[1.38fr_0.62fr]">
          <div className="space-y-6">
            <OpenActivity requestCards={requestCards} />
            <DealBoard deals={deals} />
          </div>
          <div className="space-y-6">
            <ShipmentTracker featuredDeal={featuredDeal} />
            <MilestoneTracker steps={steps} activeStepIndex={activeStepIndex} />
            <QuickAccess />
          </div>
        </section>
      </div>
    </AppShell>
  );
}
