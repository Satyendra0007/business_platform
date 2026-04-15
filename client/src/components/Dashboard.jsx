/**
 * Dashboard.jsx — Main dashboard orchestrator.
 *
 * Responsibilities:
 *  1. Compute role-specific data (tiles, request cards, featured deal)
 *  2. Compose sub-components — no inline JSX blocks
 *
 * Sub-components live in ./dashboard/:
 *  - CompanyBanner   — setup CTA / pending badge
 *  - DashboardHero   — dark hero banner with metric tiles
 *  - OpenActivity    — open requests / transport tenders list
 *  - DealBoard       — compact deal table         (DealSummary.jsx)
 *  - ShipmentTracker — port image + active deal   (DealSummary.jsx)
 *  - MilestoneTracker — step progress             (Sidebar.jsx)
 *  - QuickAccess      — navigation shortcuts      (Sidebar.jsx)
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from './ui';
import { useAuth } from '../hooks/useAuth';
import {
  formatDate,
  getAdminSnapshot,
  getDealsForUser,
  getProductsForUser,
  getRFQsForUser,
  getStatusSteps,
  getTransportBidOpportunities,
} from '../lib/tradafyData';

import CompanyBanner    from './dashboard/CompanyBanner';
import DashboardHero    from './dashboard/DashboardHero';
import OpenActivity     from './dashboard/OpenActivity';
import { DealBoard, ShipmentTracker } from './dashboard/DealSummary';
import { MilestoneTracker, QuickAccess } from './dashboard/Sidebar';

// ─── Tile builder ─────────────────────────────────────────────────────────────

function buildTiles(user, products, rfqs, deals, bidOpportunities, adminSnapshot) {
  const role = user?.roles?.[0] || user?.role;

  if (role === 'buyer') return [
    { label: 'Products',          value: products.length,        note: 'Verified supplier listings',          action: '/products' },
    { label: 'My RFQs',           value: rfqs.length,            note: 'Buyer requests in progress',          action: '/my-rfqs' },
    { label: 'Transport Tenders', value: bidOpportunities.length, note: 'Freight comparisons after agreement', action: '/transport-bids' },
  ];

  if (role === 'supplier') return [
    { label: 'My Products',       value: products.length,        note: 'Catalog currently visible',           action: '/products' },
    { label: 'Incoming RFQs',     value: rfqs.length,            note: 'Requests waiting for action',         action: '/incoming-rfqs' },
    { label: 'Transport Tenders', value: bidOpportunities.length, note: 'Open carrier bidding rounds',         action: '/transport-bids' },
  ];

  if (role === 'shipping_agent') return [
    { label: 'Open Tenders',      value: bidOpportunities.filter((d) => d.status === 'transport-bidding').length, note: 'Deals ready for freight quoting', action: '/transport-bids' },
    { label: 'Awarded Shipments', value: deals.length,           note: 'Carriers already awarded',            action: '/deals' },
    { label: 'Product Views',     value: products.length,        note: 'Reference catalog available',         action: '/products' },
  ];

  // admin
  return [
    { label: 'Users',     value: adminSnapshot?.users?.length     ?? 0, note: 'Account and role visibility',             action: '/admin' },
    { label: 'Companies', value: adminSnapshot?.companies?.length  ?? 0, note: 'Verified business network',              action: '/admin' },
    { label: 'Deals',     value: adminSnapshot?.deals?.length      ?? 0, note: 'Platform-wide active collaborations',    action: '/admin' },
  ];
}

// ─── Request card builder ─────────────────────────────────────────────────────

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

  return source.slice(0, 3).map((item, index) => {
    const isDeal = Boolean(item.deliveryDate);
    return {
      id:          item.id,
      code:        item.id.toUpperCase(),
      title:
        role === 'shipping_agent'
          ? `${item.productName} Freight Tender`
          : isDeal
          ? item.productName
          : `${item.productName} Request`,
      from:        item.supplierCompany,
      to:          item.deliveryLocation,
      volume:      item.quantity,
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

  // Data (still from mock — will be replaced per phase)
  const products        = getProductsForUser(user);
  const rfqs            = getRFQsForUser(user);
  const deals           = getDealsForUser(user);
  const bidOpportunities = getTransportBidOpportunities(user);
  const featuredDeal    = role === 'shipping_agent'
    ? bidOpportunities[0] || deals[0]
    : deals[0] || bidOpportunities[0];
  const steps           = getStatusSteps();
  const activeStepIndex = featuredDeal
    ? steps.findIndex((s) => s.key === featuredDeal.status)
    : -1;
  const adminSnapshot   = role === 'admin' ? getAdminSnapshot() : null;

  const tiles        = buildTiles(user, products, rfqs, deals, bidOpportunities, adminSnapshot);
  const requestCards = buildRequestCards(user, rfqs, deals, bidOpportunities, featuredDeal);

  return (
    <AppShell
      title="Dashboard"
      subtitle="Browse products, manage RFQs, and keep every trade workflow aligned from inquiry to shipment."
    >
      <div className="space-y-6">

        {/* 1. Company status banner — amber CTA or sky pending badge */}
        <CompanyBanner />

        {/* 2. Dark hero with role title + 3 metric tiles */}
        <DashboardHero tiles={tiles} />

        {/* 3. Main content grid — left: activity + deals  |  right: tracker + sidebar */}
        <section className="grid gap-6 xl:grid-cols-[1.38fr_0.62fr]">

          {/* Left column */}
          <div className="space-y-6">
            <OpenActivity requestCards={requestCards} />
            <DealBoard deals={deals} />
          </div>

          {/* Right column */}
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
