/**
 * Dashboard.jsx
 * A dashboard-specific layout that mirrors the provided reference UI
 * without changing any shared components used by other pages.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  FileText,
  Headphones,
  LayoutDashboard,
  MessageSquare,
  Package,
  ReceiptText,
  Search,
  Send,
  ShieldCheck,
  ShipWheel,
  Sparkles,
  Users,
  AlertTriangle,
} from 'lucide-react';

import tradafyLogo from '../assets/Tradafy_logo_comparison_on_navy_backdrops-3-removebg-preview.png';
import { useAuth } from '../hooks/useAuth';
import { getDashboardStats } from '../lib/dashboardService';
import { getPlan, isUnlimited, formatLimit } from '../lib/plans.config';
import { getCompanyById } from '../lib/companyService';
import { getProducts } from '../lib/productService';
import { formatDate, getDealsForUser, getRFQsForUser, getStatusSteps, getTransportBidOpportunities } from '../lib/tradafyData';
import { getProductVisual } from '../lib/productVisuals';
import { navByRole } from '../lib/navConstants';
import CompanyBanner from './dashboard/CompanyBanner';
import PhoneVerificationBanner from './dashboard/PhoneVerificationBanner';

const SIDEBAR_ICON_BY_PATH = {
  '/dashboard': LayoutDashboard,
  '/products': Package,
  '/supplier/products': Package,
  '/my-rfqs': ReceiptText,
  '/incoming-rfqs': ReceiptText,
  '/transport-bids': ShipWheel,
  '/deals': BriefcaseBusiness,
  '/deal': BriefcaseBusiness,
  '/deal-support': ShieldCheck,
  '/admin': ShieldCheck,
};

function classNames(...parts) {
  return parts.filter(Boolean).join(' ');
}

function isActive(pathname, path) {
  return pathname === path || (path !== '/dashboard' && pathname.startsWith(path));
}

function roleLabel(role) {
  if (role === 'supplier') return 'Supplier Workspace';
  if (role === 'shipping_agent') return 'Shipping Workspace';
  if (role === 'admin') return 'Admin Control';
  return 'Buyer Workspace';
}

function dealStageLabel(status) {
  if (status === 'negotiation') return 'Negotiation';
  if (status === 'transport-bidding') return 'Documents';
  if (status === 'shipping') return 'Shipping';
  if (status === 'completed') return 'Completed';
  return 'Inquiry';
}

function dealStageTone(status) {
  if (status === 'negotiation') return 'bg-amber-100 text-amber-700';
  if (status === 'transport-bidding') return 'bg-sky-100 text-sky-700';
  if (status === 'shipping') return 'bg-emerald-100 text-emerald-700';
  if (status === 'completed') return 'bg-slate-100 text-slate-600';
  return 'bg-blue-100 text-blue-700';
}

function formatCount(value) {
  return Number.isFinite(value) ? String(value) : '0';
}

function buildOverviewMetrics(role, stats, summary) {
  if (role === 'admin') {
    return [
      {
        label: 'Users',
        value: stats?.totalUsers ?? summary.users,
        icon: Users,
        tone: 'bg-sky-100 text-sky-600',
        action: '/admin',
      },
      {
        label: 'Companies',
        value: stats?.totalCompanies ?? summary.companies,
        icon: BriefcaseBusiness,
        tone: 'bg-emerald-100 text-emerald-600',
        action: '/admin',
      },
      {
        label: 'Deals',
        value: stats?.totalDeals ?? summary.activeDeals,
        icon: ShieldCheck,
        tone: 'bg-amber-100 text-amber-600',
        action: '/deals',
      },
    ];
  }

  return [
    {
      label: 'Active Deals',
      value: summary.activeDeals,
      icon: BriefcaseBusiness,
      tone: 'bg-sky-100 text-sky-600',
      action: '/deals',
    },
    {
      label: role === 'shipping_agent' ? 'Transport Tenders' : 'RFQs Sent',
      value:
        role === 'shipping_agent'
          ? stats?.transportTenders ?? summary.transportTenders
          : stats?.myRFQs ?? summary.rfqs,
      icon: role === 'shipping_agent' ? ShipWheel : ReceiptText,
      tone: 'bg-emerald-100 text-emerald-600',
      action: role === 'shipping_agent' ? '/transport-bids' : '/my-rfqs',
    },
    {
      label: 'Unread Messages',
      value: summary.unreadMessages,
      icon: MessageSquare,
      tone: 'bg-violet-100 text-violet-600',
      action: '/deals',
    },
  ];
}

function getDealProgressDeal(role, deals, bidOpportunities) {
  if (role === 'shipping_agent') return bidOpportunities[0] || deals[0] || null;
  return deals[0] || bidOpportunities[0] || null;
}

function formatProductPrice(price, unit) {
  if (price == null) return 'Price on request';
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(price);
  return unit ? `${formatted} / ${unit}` : formatted;
}

function SidebarLink({ item, active, onNavigate, collapsed }) {
  const Icon = SIDEBAR_ICON_BY_PATH[item.path] || LayoutDashboard;
  return (
      <button
        onClick={() => onNavigate(item.path)}
        className={classNames(
        'flex w-full items-center rounded-2xl text-left transition',
        active
          ? 'bg-white text-[#173c68] shadow-[0_10px_24px_rgba(255,255,255,0.16)]'
          : 'text-slate-200 hover:bg-white/10 hover:text-white',
        collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-3'
        )}
        title={item.label}
      >
      <div className={classNames('flex h-9 w-9 items-center justify-center rounded-xl transition', active ? 'bg-[#173c68] text-white' : 'bg-white/10 text-white')}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <span className={classNames('font-medium', collapsed ? 'hidden' : 'block')}>{item.label}</span>
    </button>
  );
}

function DashboardProductCard({ product, navigate }) {
  const visual = product.images?.[0] || getProductVisual().image;
  return (
    <article className="flex items-center gap-3 rounded-[20px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-3 shadow-[0_10px_26px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)]">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[16px] bg-slate-100">
        <img src={visual} alt={product.title} className="h-full w-full object-cover" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#edf5ff] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-[#245c9d]">
            {product.category || 'Product'}
          </span>
          <span className="text-[10px] font-semibold text-slate-400">
            {product.countryOfOrigin ? `Origin: ${product.countryOfOrigin}` : 'Verified listing'}
          </span>
        </div>

        <h4 className="mt-1 line-clamp-1 text-sm font-bold text-[#143a6a]">
          {product.title}
        </h4>
        <p className="mt-0.5 text-[11px] text-slate-500">
          {formatProductPrice(product.price, product.unit)}
          {product.leadTime ? ` · ${product.leadTime}` : ''}
        </p>
      </div>

      <button
        onClick={() => navigate(`/product/${product._id}`)}
        className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#173b67,#245c9d)] px-3 py-2 text-[11px] font-bold text-white transition hover:-translate-y-0.5"
      >
        Start Deal
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </article>
  );
}

function DashboardProductSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-[20px] border border-slate-200 bg-white p-3 shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
      <div className="h-16 w-16 shrink-0 animate-pulse rounded-[16px] bg-slate-100" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-3 w-20 animate-pulse rounded-full bg-slate-100" />
        <div className="h-4 w-3/4 animate-pulse rounded-full bg-slate-100" />
        <div className="h-3 w-1/2 animate-pulse rounded-full bg-slate-100" />
      </div>
      <div className="h-9 w-24 animate-pulse rounded-2xl bg-slate-100" />
    </div>
  );
}

function MetricCard({ metric, onClick }) {
  const Icon = metric.icon;
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-3 rounded-[22px] border border-slate-200/70 bg-white px-4 py-4 text-left shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)]"
    >
      <div className={classNames('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl', metric.tone)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{metric.label}</p>
          <span className="text-[10px] font-medium text-slate-400">View all</span>
        </div>
        <div className="mt-1 flex items-end justify-between gap-2">
          <p className="text-3xl font-black tracking-tight text-[#0A2540]">{formatCount(metric.value)}</p>
          <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </button>
  );
}

function StepItem({ step, index, activeStepIndex }) {
  const completed = activeStepIndex > index;
  const active = activeStepIndex === index;
  return (
    <div className="flex items-start gap-3">
      <div
        className={classNames(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-black',
          completed
            ? 'border-emerald-300 bg-emerald-500 text-white'
            : active
              ? 'border-amber-300 bg-amber-500 text-white'
              : 'border-slate-200 bg-white text-slate-400'
        )}
      >
        {index + 1}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">{step.label}</p>
        <p className="mt-0.5 text-xs text-slate-500">
          {completed ? 'Completed' : active ? 'In progress' : 'Pending'}
        </p>
      </div>
      <div
        className={classNames(
          'mt-1 h-2.5 w-2.5 rounded-full',
          completed ? 'bg-emerald-400' : active ? 'bg-amber-400' : 'bg-slate-300'
        )}
      />
    </div>
  );
}

function DealCard({ deal, navigate, activeStepIndex }) {
  const visual = getProductVisual(deal.productId);
  const statusLabel = dealStageLabel(deal.status);
  const statusTone = dealStageTone(deal.status);
  const lastUpdate = deal.timeline?.[deal.timeline.length - 1]?.date || deal.deliveryDate;

  return (
    <article className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(15,23,42,0.10)]">
      <div className="relative h-24 overflow-hidden bg-slate-100 sm:h-28">
        <img
          src={visual.image}
          alt={deal.productName}
          className="h-full w-full object-cover transition duration-700 hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,37,64,0.10),rgba(10,37,64,0.55))]" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <div className={classNames('inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] backdrop-blur', statusTone)}>
            {statusLabel}
          </div>
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#143a6a] shadow-sm backdrop-blur">
          Verified
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[1.02rem] font-bold text-[#143a6a]">{deal.productName}</h3>
            <p className="mt-1 text-xs text-slate-500">
              {deal.quantity || '—'} {deal.price || '—'}
            </p>
          </div>
          <button
            onClick={() => navigate(`/deal/${deal.id}`)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-2xl bg-[linear-gradient(135deg,#173b67,#245c9d)] px-3 py-2 text-[11px] font-bold text-white transition hover:-translate-y-0.5"
          >
            Open
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 px-3 py-2">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Supplier</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">{deal.supplierCompany}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-3 py-2">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Destination</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">{deal.deliveryLocation}</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">
            Last update: {lastUpdate ? formatDate(lastUpdate) : 'Today'}
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">
            Next: {deal.status === 'shipping'
              ? 'Track shipment'
              : deal.status === 'transport-bidding'
                ? 'Review documents'
                : 'Reply to supplier'}
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            <span>Progress</span>
            <span>{Math.max(1, activeStepIndex + 1)} / {getStatusSteps().length}</span>
          </div>
          <div className="mt-2 flex gap-1.5">
            {getStatusSteps().map((step, index) => {
              const completed = activeStepIndex > index;
              const active = activeStepIndex === index;
              return (
                <div
                  key={step.key}
                  className={classNames(
                    'h-2 flex-1 rounded-full',
                    completed ? 'bg-emerald-400' : active ? 'bg-[#245c9d]' : 'bg-slate-200'
                  )}
                />
              );
            })}
          </div>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {getStatusSteps().map((step, index) => {
              const completed = activeStepIndex > index;
              const active = activeStepIndex === index;
              return (
                <div
                  key={step.key}
                  className={classNames(
                    'rounded-xl border px-2 py-1 text-center text-[9px] font-bold uppercase tracking-[0.14em]',
                    completed
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : active
                        ? 'border-[#c8d8ea] bg-[#eef5ff] text-[#173b67]'
                        : 'border-slate-200 bg-slate-50 text-slate-400'
                  )}
                >
                  {step.label}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </article>
  );
}

function QuickActionCard({ label, icon, path, navigate }) {
  const ActionIcon = icon;
  return (
    <button
      onClick={() => navigate(path)}
      className="flex w-full items-center justify-between rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
    >
      <span className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf5ff] text-[#245c9d]">
          <ActionIcon className="h-4 w-4" />
        </span>
        {label}
      </span>
      <ArrowRight className="h-4 w-4 text-slate-400" />
    </button>
  );
}

function MessageRow({ item }) {
  return (
    <div className="flex items-start gap-3 rounded-[18px] border border-slate-200 bg-white px-3 py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0f2846] text-[10px] font-black text-white">
        {item.initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-bold text-slate-900">{item.sender}</p>
          <span className="text-[10px] font-medium text-slate-400">{item.time}</span>
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{item.body}</p>
      </div>
      {item.count ? (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#245c9d] text-[10px] font-black text-white">
          {item.count}
        </span>
      ) : null}
    </div>
  );
}

function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const role = user?.roles?.[0] || user?.role || 'buyer';
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || 'Buyer User';

  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState('');
  const [company, setCompany] = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredProductsLoading, setFeaturedProductsLoading] = useState(true);
  const [featuredProductsError, setFeaturedProductsError] = useState('');
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getDashboardStats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((error) => {
        if (!cancelled) setStatsError(error.response?.data?.message || error.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!user?.companyId) return;
    let cancelled = false;
    getCompanyById(user.companyId)
      .then((data) => {
        if (!cancelled) setCompany(data);
      })
      .catch(() => {
        if (!cancelled) setCompany(null);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.companyId]);

  useEffect(() => {
    let cancelled = false;
    getProducts({ limit: 3 })
      .then((res) => {
        if (!cancelled) setFeaturedProducts((res.products || []).slice(0, 3));
      })
      .catch((error) => {
        if (!cancelled) setFeaturedProductsError(error.message || 'Failed to load featured products.');
      })
      .finally(() => {
        if (!cancelled) setFeaturedProductsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const rfqs = getRFQsForUser(user);
  const deals = getDealsForUser(user);
  const bidOpportunities = getTransportBidOpportunities(user);
  const steps = getStatusSteps();
  const featuredDeal = getDealProgressDeal(role, deals, bidOpportunities);
  const activeStepIndex = featuredDeal ? Math.max(0, steps.findIndex((step) => step.key === featuredDeal.status)) : 0;

  const counts = useMemo(() => {
    const activeDeals = deals.filter((deal) => deal.status !== 'completed');
    const dealMessages = deals.flatMap((deal) =>
      (deal.messages || []).map((message) => ({
        ...message,
        dealId: deal.id,
        productName: deal.productName,
        sender: message.sender || deal.supplierCompany || 'System',
      }))
    );
    return {
      activeDeals: activeDeals.length,
      rfqs: rfqs.length,
      transportTenders: bidOpportunities.length,
      messages: dealMessages.length,
      companies: stats?.totalCompanies ?? 0,
      users: stats?.totalUsers ?? 0,
      unreadMessages: Math.max(1, dealMessages.length || 0),
    };
  }, [deals, rfqs, bidOpportunities, stats]);

  const metrics = buildOverviewMetrics(role, stats, counts);

  const activeDeals = useMemo(() => {
    const source = deals.filter((deal) => deal.status !== 'completed');
    const filtered = search.trim()
      ? source.filter((deal) => {
          const haystack = [
            deal.productName,
            deal.supplierCompany,
            deal.buyerCompany,
            deal.deliveryLocation,
            deal.status,
          ]
            .join(' ')
            .toLowerCase();
          return haystack.includes(search.trim().toLowerCase());
        })
      : source;
    return filtered.slice(0, 3);
  }, [deals, search]);

  const quickActions = [
    { label: 'Create new Deal Request', icon: ReceiptText, path: '/deal-request' },
    { label: 'Browse products', icon: Package, path: '/products' },
    { label: 'Request shipping', icon: ShipWheel, path: '/transport-bids' },
    { label: 'Invite a supplier', icon: Users, path: '/company/setup' },
  ];

  if (role === 'supplier') {
    quickActions.unshift(
      { label: 'Add product', icon: Package, path: '/supplier/products/create' }
    );
  }

  const dealMessages = useMemo(() => {
    const feed = deals.flatMap((deal) =>
      (deal.messages || []).map((message) => ({
        id: `${deal.id}-${message.id}`,
        sender: message.sender || deal.supplierCompany || 'System',
        body: message.body,
        time: formatDate(message.date),
        initials: (message.sender || deal.supplierCompany || 'S')
          .split(' ')
          .map((part) => part[0])
          .slice(0, 2)
          .join('')
          .toUpperCase(),
        count: 0,
      }))
    );

    const filtered = search.trim()
      ? feed.filter((message) =>
          [message.sender, message.body].join(' ').toLowerCase().includes(search.trim().toLowerCase())
        )
      : feed;

    return filtered.slice(0, 3);
  }, [deals, search]);

  const overviewCards = [
    { label: 'Draft', value: Math.max(1, Math.min(9, rfqs.filter((rfq) => rfq.status === 'pending').length || 3)), icon: FileText, tone: 'bg-sky-100 text-sky-600' },
    { label: 'Sent', value: Math.max(1, rfqs.length || 5), icon: Send, tone: 'bg-emerald-100 text-emerald-600' },
    { label: 'Responses', value: Math.max(1, activeDeals.length + 2), icon: MessageSquare, tone: 'bg-cyan-100 text-cyan-600' },
    { label: 'Converted to Deal', value: Math.max(1, activeDeals.length), icon: BriefcaseBusiness, tone: 'bg-violet-100 text-violet-600' },
  ];

  const planKey = String(user?.subscriptionPlan || user?.plan || 'free').toLowerCase().trim();
  const planConfig = getPlan(planKey);
  const activeDealCount = counts.activeDeals;
  const dealLimit = planConfig.maxActiveDeals;
  const dealLimitText = isUnlimited(dealLimit) ? 'Unlimited' : `${activeDealCount} / ${formatLimit(dealLimit)} deals`;
  const dealLimitPct = isUnlimited(dealLimit) ? 100 : Math.min((activeDealCount / dealLimit) * 100, 100);

  const verificationStatus = company?.verificationStatus || (user?.companyId ? 'pending' : 'none');
  const verificationTone =
    verificationStatus === 'verified'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : verificationStatus === 'rejected'
        ? 'bg-rose-50 text-rose-700 border-rose-200'
        : 'bg-sky-50 text-sky-700 border-sky-200';

  const supportAvatars = ['AR', 'MS', 'LR'];
  const handleSidebarNavigate = (path) => {
    if (path === '/dashboard') {
      setSidebarCollapsed((current) => !current);
      return;
    }
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.10),_transparent_28%),linear-gradient(180deg,#eef3fa_0%,#f6f9fd_48%,#edf2f8_100%)] text-slate-900">
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
        />
      ) : null}

      <aside
        className={classNames(
          'fixed inset-y-0 left-0 z-50 flex flex-col overflow-hidden bg-[linear-gradient(180deg,#0d2340_0%,#12335d_55%,#1f548d_100%)] text-white shadow-[0_28px_70px_rgba(7,19,39,0.35)] transition-all duration-300',
          sidebarCollapsed ? 'w-[92px] p-3 lg:w-[92px]' : 'w-[280px] p-4 lg:w-[280px]',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className={classNames('text-xs font-semibold uppercase tracking-[0.22em] text-slate-300', sidebarCollapsed ? 'hidden lg:block' : 'block')}>
            Navigation
          </div>
          <button
            onClick={() => setSidebarCollapsed((current) => !current)}
            className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/20"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? 'Open' : 'Close'}
          </button>
        </div>

        <button
          onClick={() => handleSidebarNavigate('/dashboard')}
          className={classNames(
            'flex items-center rounded-2xl border border-white/10 bg-white/6 text-left transition hover:bg-white/10',
            sidebarCollapsed ? 'justify-center gap-0 px-2 py-3' : 'gap-3 px-3 py-3'
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-[0_10px_24px_rgba(15,23,42,0.18)]">
            <img src={tradafyLogo} alt="Tradafy" className="h-9 w-9 object-contain" />
          </div>
          <div className={classNames(sidebarCollapsed ? 'hidden' : 'block')}>
            <div className="text-lg font-semibold tracking-[0.2em]">TRADAFY</div>
            <div className="text-xs text-slate-300">{roleLabel(role)}</div>
          </div>
        </button>

        <div className="mt-6 space-y-2">
          {(navByRole[role] || navByRole.buyer).map((item) => (
            <SidebarLink
              key={item.path}
              item={item}
              active={isActive(pathname, item.path)}
              onNavigate={handleSidebarNavigate}
              collapsed={sidebarCollapsed}
            />
          ))}

        </div>

        <div className="mt-auto space-y-3">
          <div className={classNames('rounded-[24px] border border-white/10 bg-white/6 p-4', sidebarCollapsed ? 'hidden lg:block' : 'block')}>
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <Headphones className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-white">Need help?</p>
                <p className="mt-0.5 text-sm text-slate-300">We are here for you</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/deal-support')}
              className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-white px-4 py-2.5 text-sm font-black text-[#0A2540] transition hover:bg-slate-100"
            >
              Contact support
            </button>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => setSidebarCollapsed((current) => !current)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition hover:bg-white/20"
            >
              <ChevronDown className={classNames('h-4 w-4 transition-transform', sidebarCollapsed ? 'rotate-90' : 'rotate-180')} />
            </button>
          </div>
        </div>
      </aside>

      <div className={classNames('min-h-screen transition-all duration-300', sidebarCollapsed ? 'lg:pl-[92px]' : 'lg:pl-[280px]')}>
        <div className="mx-auto min-h-screen max-w-[1680px] px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:py-5">
          <div className="min-h-screen overflow-hidden rounded-[28px] border border-white/70 bg-white/88 shadow-[0_28px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl">
            <header className="border-b border-[#d4e0ee] bg-[linear-gradient(180deg,#ffffff_0%,#f2f7fc_100%)] px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setSidebarOpen((current) => !current)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-[#d4e0ee] bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 lg:hidden"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Menu
                  </button>
                  <button
                    onClick={() => handleSidebarNavigate('/dashboard')}
                    className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#143a6a,#245c9d)] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.24em] text-white"
                  >
                    SUPER WORKSPACE
                  </button>
                </div>

                <div className="flex flex-1 items-center justify-center xl:max-w-xl">
                  <div className="flex w-full items-center gap-3 rounded-2xl border border-[#d4e0ee] bg-white px-4 py-3 shadow-sm">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search anything..."
                      className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 xl:justify-end">
                  <button className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d4e0ee] bg-white text-slate-600 shadow-sm transition hover:bg-slate-50">
                    <Bell className="h-4.5 w-4.5" />
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white">
                      {Math.min(99, counts.unreadMessages + 8)}
                    </span>
                  </button>

                  <button
                    onClick={() => navigate(user?.companyId ? `/company/${user.companyId}` : '/company/setup')}
                    className="flex items-center gap-3 rounded-[22px] border border-[#d4e0ee] bg-white px-3 py-2.5 shadow-sm transition hover:bg-slate-50"
                  >
                    <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#173b67,#245c9d)] text-sm font-black text-white">
                      {user?.profileImage ? (
                        <img src={user.profileImage} alt={displayName} className="h-full w-full object-cover" />
                      ) : (
                        displayName
                          .split(' ')
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()
                      )}
                    </div>
                    <div className="hidden text-left sm:block">
                      <p className="text-sm font-semibold text-[#153763]">{displayName}</p>
                      <p className="text-xs text-slate-500 capitalize">{role.replace(/_/g, ' ')}</p>
                    </div>
                    <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
                  </button>
                </div>
              </div>
            </header>

            <main className="space-y-5 p-4 sm:p-6 lg:p-7">
              {!stats && !statsError && (
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-2/5 animate-pulse rounded-full bg-[#245c9d]/50" />
                </div>
              )}

              {statsError ? (
                <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
                  Could not load live stats: {statsError}
                </div>
              ) : null}

              <div className="space-y-4">
                <CompanyBanner />
                <PhoneVerificationBanner />
              </div>

              <section className="grid gap-4 xl:grid-cols-[1fr_760px]">
                <div>
                  <h1 className="text-[2.1rem] font-black tracking-tight text-[#0f2846] sm:text-[2.6rem]">
                    Welcome back, {displayName} <span className="inline-block">👋</span>
                  </h1>
                  <p className="mt-1.5 text-sm text-slate-500 sm:text-[15px]">
                    Here&apos;s what&apos;s happening with your deals today.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {metrics.map((metric) => (
                    <MetricCard key={metric.label} metric={metric} onClick={() => navigate(metric.action)} />
                  ))}
                </div>
              </section>

              <section className="grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
                <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-[linear-gradient(135deg,#0c1f38_0%,#11305a_58%,#1a4a87_100%)] px-5 py-5 text-white shadow-[0_16px_50px_rgba(15,23,42,0.12)] sm:px-6 sm:py-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-xl">
                      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-200">
                        Next Step
                      </div>
                      <h2 className="mt-3 text-3xl font-black tracking-tight">
                        Continue your deal progress
                      </h2>
                      <p className="mt-2 max-w-lg text-sm text-sky-100/85">
                        You have {Math.max(1, counts.activeDeals)} deals that need your attention to move forward.
                      </p>
                      <button
                        onClick={() => navigate('/deals')}
                        className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-black text-[#0f2846] transition hover:-translate-y-0.5"
                      >
                        View my deals
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid flex-1 grid-cols-2 gap-4 lg:grid-cols-4">
                      {[
                        {
                          label: 'Negotiate',
                          sub: `${Math.max(1, counts.activeDeals)} deals awaiting reply`,
                          icon: MessageSquare,
                          tone: 'border-emerald-400 bg-emerald-500/10 text-emerald-300',
                        },
                        {
                          label: 'Documents',
                          sub: '1 deal needs review',
                          icon: FileText,
                          tone: 'border-amber-400 bg-amber-500/10 text-amber-300',
                        },
                        {
                          label: 'Shipping',
                          sub: 'Start shipping request',
                          icon: ShipWheel,
                          tone: 'border-blue-400 bg-blue-500/10 text-blue-300',
                        },
                        {
                          label: 'Completed',
                          sub: 'Close and rate your partner',
                          icon: CheckCircle2,
                          tone: 'border-slate-300 bg-white/10 text-slate-200',
                        },
                      ].map((step, index) => {
                        const Icon = step.icon;
                        return (
                          <div key={step.label} className="flex flex-col items-center text-center">
                            <div
                              className={classNames(
                                'flex h-12 w-12 items-center justify-center rounded-full border text-white',
                                step.tone
                              )}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className={index < 3 ? 'mt-3 hidden h-px w-full border-t border-dashed border-white/30 lg:block' : 'mt-3 hidden h-px w-full lg:block'} />
                            <div className="mt-2">
                              <p className="text-sm font-bold">{step.label}</p>
                              <p className="mt-1 text-xs text-sky-100/80">{step.sub}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_16px_44px_rgba(15,23,42,0.06)]">
                  <div className="border-b border-slate-100 pb-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Progress Path</p>
                    <h3 className="mt-2 text-[1.4rem] font-semibold tracking-[-0.02em] text-[#143a6a]">
                      Deal milestone tracker
                    </h3>
                  </div>
                  <div className="mt-5 space-y-3">
                    {steps.map((step, index) => (
                      <StepItem key={step.key} step={step} index={index} activeStepIndex={activeStepIndex} />
                    ))}
                  </div>
                </section>
              </section>

              <div className="flex flex-col gap-3 rounded-[24px] border border-rose-200 bg-[linear-gradient(135deg,#fff7f7,#fffdfc)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">
                      Action required on {Math.max(1, counts.activeDeals)} deals
                    </p>
                    <p className="mt-0.5 text-sm text-slate-600">
                      These deals need your attention to avoid delays.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/deals')}
                  className="inline-flex items-center gap-2 self-start rounded-2xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-bold text-[#143a6a] transition hover:bg-rose-50 sm:self-center"
                >
                  View now
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <section className="grid gap-4 xl:grid-cols-[1.34fr_0.66fr]">
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-[#143a6a] sm:text-xl">Featured Products</h2>
                      <p className="mt-0.5 text-sm text-slate-500">Top listings ready to start a deal.</p>
                    </div>
                    <button
                      onClick={() => navigate('/products')}
                      className="text-sm font-medium text-[#245c9d] transition hover:text-[#173b67]"
                    >
                      View all products
                    </button>
                  </div>
                  <div className="space-y-3">
                    {featuredProductsLoading ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <DashboardProductSkeleton key={index} />
                      ))
                    ) : featuredProductsError ? (
                      <div className="rounded-[20px] border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                        {featuredProductsError}
                      </div>
                    ) : featuredProducts.length > 0 ? (
                      featuredProducts.map((product) => (
                        <DashboardProductCard key={product._id} product={product} navigate={navigate} />
                      ))
                    ) : (
                      <div className="rounded-[20px] border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
                        No featured products are available right now.
                      </div>
                    )}
                  </div>
                </div>

                <section className="space-y-4">
                  <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_16px_44px_rgba(15,23,42,0.06)]">
                    <div className="border-b border-slate-100 pb-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Workspace Tools</p>
                      <h3 className="mt-2 text-[1.4rem] font-semibold tracking-[-0.02em] text-[#143a6a]">
                        Quick actions
                      </h3>
                    </div>
                    <div className="mt-5 space-y-3">
                      {quickActions.map((item) => (
                        <QuickActionCard
                          key={item.label}
                          label={item.label}
                          icon={item.icon}
                          path={item.path}
                          navigate={navigate}
                        />
                      ))}
                    </div>
                  </div>
                </section>
              </section>

              <section className="grid gap-4 xl:grid-cols-[1.05fr_1.1fr_0.95fr]">
                <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_16px_44px_rgba(15,23,42,0.06)]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <h3 className="text-[1.1rem] font-bold text-[#143a6a]">RFQ Overview</h3>
                    <button className="text-sm font-medium text-[#245c9d]">View all RFQs</button>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {overviewCards.map((card) => {
                      const Icon = card.icon;
                      return (
                        <div
                          key={card.label}
                          className="rounded-[22px] border border-slate-100 bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fc_100%)] p-4 shadow-sm"
                        >
                          <p className="text-sm text-slate-700">{card.label}</p>
                          <div className="mt-4 flex items-center justify-between gap-3">
                            <div>
                              <p className="text-3xl font-black text-[#0A2540]">{card.value}</p>
                              <p className="mt-1 text-xs text-slate-500">RFQs</p>
                            </div>
                            <div className={classNames('flex h-12 w-12 items-center justify-center rounded-2xl', card.tone)}>
                              <Icon className="h-5 w-5" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_16px_44px_rgba(15,23,42,0.06)]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <h3 className="text-[1.1rem] font-bold text-[#143a6a]">Unread Messages</h3>
                    <button onClick={() => navigate('/deals')} className="text-sm font-medium text-[#245c9d]">
                      View all
                    </button>
                  </div>
                  <div className="mt-4 space-y-3">
                    {dealMessages.length > 0 ? (
                      dealMessages.map((message, index) => (
                        <MessageRow
                          key={message.id}
                          item={{
                            ...message,
                            count: index === 0 ? 2 : index === 1 ? 1 : 1,
                          }}
                        />
                      ))
                    ) : (
                      <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                        No unread messages right now.
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => navigate('/deals')}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#245c9d]"
                  >
                    Go to messages
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <section className="space-y-4">
                  <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_16px_44px_rgba(15,23,42,0.06)]">
                    <div className="border-b border-slate-100 pb-4">
                      <h3 className="text-[1.1rem] font-bold text-[#143a6a]">Account status</h3>
                    </div>

                    <div className={classNames('mt-4 rounded-[18px] border px-4 py-3', verificationTone)}>
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/75">
                          <ShieldCheck className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {verificationStatus === 'verified'
                              ? 'Verified Buyer'
                              : verificationStatus === 'rejected'
                                ? 'Verification rejected'
                                : user?.companyId
                                  ? 'Review in progress'
                                  : 'Company profile missing'}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-600">
                            {verificationStatus === 'verified'
                              ? 'Your account is verified.'
                              : user?.companyId
                                ? 'Your company status is being reviewed.'
                                : 'Set up a company profile to unlock full access.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-3 py-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Plan</p>
                        <p className="mt-1 font-bold text-slate-900">{planConfig.name}</p>
                      </div>
                      <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-3 py-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Deal limit</p>
                        <p className="mt-1 font-bold text-slate-900">{dealLimitText}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
                        <span>Usage</span>
                        <span>{isUnlimited(dealLimit) ? 'Unlimited' : `${Math.round(dealLimitPct)}%`}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(135deg,#173b67,#245c9d)]"
                          style={{ width: `${dealLimitPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 rounded-[22px] bg-[linear-gradient(135deg,#08192f_0%,#143A6A_100%)] px-4 py-4 text-white shadow-[0_14px_32px_rgba(8,25,47,0.18)]">
                      <p className="text-sm font-bold">Need expert support for this deal?</p>
                      <p className="mt-1 text-xs text-slate-200/80">
                        Our experts can help you reduce risk and close with confidence.
                      </p>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <button
                          onClick={() => navigate('/deal-support')}
                          className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-black text-[#0A2540]"
                        >
                          Get support now
                        </button>
                        <div className="flex -space-x-2">
                          {supportAvatars.map((initials) => (
                            <div
                              key={initials}
                              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0a2540] bg-white text-[10px] font-black text-[#143a6a]"
                            >
                              {initials}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </section>

              <section className="rounded-[24px] border border-amber-200 bg-[linear-gradient(135deg,#fff8e7,#fffdf4)] px-4 py-4 shadow-[0_12px_28px_rgba(226,171,53,0.12)]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-500">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Increase success rate</p>
                      <p className="text-sm text-slate-600">
                        Deals with Tradafication close 3x faster and with 70% less risk.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/deal-support')}
                    className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-white px-4 py-2.5 text-sm font-bold text-[#143a6a] transition hover:bg-amber-50"
                  >
                    Get Tradafication now
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </section>
            </main>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate('/deal-support')}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f2846,#245c9d)] text-white shadow-[0_16px_40px_rgba(15,40,70,0.35)] transition hover:-translate-y-0.5"
        aria-label="Open support"
      >
        <MessageSquare className="h-5 w-5" />
      </button>
    </div>
  );
}

export default DashboardPage;
