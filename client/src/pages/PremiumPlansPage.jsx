import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Building2,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  FileText,
  Globe,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Package,
  PanelLeftClose,
  Search,
  ShieldCheck,
  Ship,
  Sparkles,
  Star,
  TrendingUp,
} from 'lucide-react';
import tradafyLogo from '../assets/Tradafy_logo_comparison_on_navy_backdrops-3-removebg-preview.png';
import { useAuth } from '../hooks/useAuth';
import { getPrimaryRole } from '../lib/userRole';
import { createCheckoutSession } from '../lib/billingService';

const SIDE_NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { key: 'products', label: 'Products', icon: Package, path: '/products' },
  { key: 'deals', label: 'Deal Requests', icon: FileText, path: '/deal-request' },
  { key: 'transport', label: 'Transport Bids', icon: Ship, path: '/transport-bids' },
  { key: 'support', label: 'Deal Support', icon: ShieldCheck, path: '/deal-support' },
  { key: 'plans', label: 'Premium Plans', icon: Star, path: '/premium-plans' },
];

const PLAN_DATA = [
  {
    key: 'free',
    name: 'Starter',
    badge: 'Test the platform',
    price: '€0',
    period: '',
    color: 'emerald',
    summary: 'Start your first deal with full access. Upgrade when you are ready to continue.',
    bestFor: 'First-time users',
    cta: 'Start your first deal',
    features: [
      '1 full deal (fully unlocked)',
      'Up to 3 total deals',
      'Chat (limited after first deal)',
      'Basic document flow',
      'Shipping access (limited)',
    ],
  },
  {
    key: 'business',
    name: 'Active',
    badge: 'For active traders',
    price: '€49',
    period: '/ month',
    color: 'blue',
    summary: 'Manage multiple deals without workflow limitations.',
    bestFor: 'Traders managing ongoing deals',
    cta: 'Scale your deals',
    features: [
      'Up to 5 active deals',
      'Full chat access',
      'Extended document flow',
      'Standard shipping bids',
      'Deal timeline & tracking',
    ],
  },
  {
    key: 'premium',
    name: 'Professional',
    badge: 'Recommended',
    price: '€99',
    period: '/ month',
    color: 'amber',
    summary: 'Close deals faster with structured execution and reduced risk.',
    bestFor: 'Serious traders',
    cta: 'Upgrade to Professional',
    features: [
      'Unlimited deals',
      'Priority shipping bids',
      'Advanced document flow',
      'Light legal review included',
      'Credibility insights',
      'Verified badge (boosted trust)',
    ],
    includes: [
      'Legal support access',
      'Advanced deal workflow',
      'High-trust communication',
    ],
  },
];

const CORE_FEATURES = [
  'Company & partner verification',
  'Compliance & document checks',
  'Risk & reputation analysis',
  'Verified trade badge issued',
];

const SERVICES = [
  { label: 'Legal Review', value: 'Custom', icon: FileText },
  { label: 'Credibility Report', value: 'Custom', icon: BadgeCheck },
  { label: 'Legal Support', value: 'Custom', icon: ShieldCheck },
  { label: 'Private Labeling', value: 'Custom', icon: Package },
  { label: 'Business Expansion', value: 'Custom', icon: TrendingUp },
];

const ACCESS_STEPS = [
  {
    step: '1',
    title: 'Experience your first deal',
    copy: 'Full access to understand the platform.',
  },
  {
    step: '2',
    title: 'Soft limits appear',
    copy: 'Usage becomes restricted.',
  },
  {
    step: '3',
    title: 'Upgrade to continue',
    copy: 'Unlock full deal execution and remove restrictions.',
  },
];

const UPGRADE_TRIGGERS = [
  'Feature locked - upgrade to continue your deal',
  'Deal limit reached - scale your plan to proceed',
  'Unlock full deal flow with an upgrade',
];

const ASSURANCE = [
  'No long-term commitment. Upgrade or cancel anytime.',
  'Built for real trade execution - not just connections.',
];

function SidebarButton({ item, active, collapsed, onClick }) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex w-full items-center rounded-2xl px-3 py-3 text-left transition ${
        active
          ? 'cursor-pointer bg-white text-[#0A2540] shadow-[0_12px_30px_rgba(15,23,42,0.18)]'
          : 'text-white/80 hover:bg-white/8 hover:text-white'
      } ${collapsed ? 'justify-center gap-0' : 'gap-3'}`}
      aria-label={item.label}
    >
      <Icon className={`h-4.5 w-4.5 shrink-0 ${active ? 'text-[#0A2540]' : 'text-white/75'}`} />
      {!collapsed && (
        <span className="text-sm font-medium">{item.label}</span>
      )}
    </button>
  );
}

function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <div className="mx-auto max-w-4xl text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e4f3] bg-white px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-[#245c9d] shadow-sm">
        <BadgeCheck className="h-3.5 w-3.5" />
        {eyebrow}
      </div>
      {title ? (
        <h1 className="mt-3 text-[2.3rem] font-black tracking-[-0.03em] text-[#0A1D3A] sm:text-[2.8rem] lg:text-[3.2rem]">
          {title}
        </h1>
      ) : null}
      <p className="mt-1 text-[0.95rem] font-medium text-slate-600 sm:text-[1rem]">
        {subtitle}
      </p>
      <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#d9e5f4] bg-white px-3 py-1.5 text-[12px] text-[#245c9d] shadow-sm">
        <ShieldCheck className="h-3.5 w-3.5" />
        Used by traders to structure and close international deals with confidence
      </div>
    </div>
  );
}

function PlanCard({ plan, userPlan, onAction, loading }) {
  const Icon = plan.key === 'free' ? Sparkles : plan.key === 'business' ? Building2 : Star;
  const isCurrent = plan.key !== 'free' && userPlan === plan.key;
  const isFeatured = plan.key === 'premium';

  const cardTone =
    plan.key === 'free'
      ? 'border-slate-200 bg-white'
      : plan.key === 'business'
        ? 'border-slate-200 bg-white'
        : plan.key === 'premium'
          ? 'border-[#e4bf6a] bg-white shadow-[0_20px_50px_rgba(229,169,61,0.12)]'
          : 'border-slate-200 bg-[#07111f] text-white';

  if (plan.key === 'core') {
    return null;
  }

  return (
    <article
      className={`flex h-full min-h-[440px] flex-col overflow-hidden rounded-[28px] border p-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)] ${cardTone}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
              plan.key === 'free'
                ? 'bg-emerald-50 text-emerald-600'
                : plan.key === 'business'
                  ? 'bg-blue-50 text-blue-600'
                  : 'bg-amber-50 text-amber-600'
            }`}
          >
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className={`text-[9px] font-black uppercase tracking-[0.18em] ${
              plan.key === 'premium' ? 'text-amber-500' : 'text-emerald-600'
            }`}>
              {plan.name}
            </div>
            <p className={`mt-0.5 text-[9px] font-medium uppercase tracking-[0.18em] ${
              plan.key === 'premium' ? 'text-slate-500' : 'text-slate-400'
            }`}>
              {plan.badge}
            </p>
          </div>
        </div>

        {isFeatured && (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-amber-700">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            Recommended
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${
          plan.key === 'free'
            ? 'bg-slate-100 text-slate-600'
            : plan.key === 'business'
              ? 'bg-blue-50 text-blue-700'
              : 'bg-amber-50 text-amber-700'
        }`}>
          {plan.badge}
        </div>

        <div className="mt-3 flex items-end gap-2">
          <div className={`text-[2.5rem] font-black leading-none tracking-[-0.06em] ${
            plan.key === 'premium' ? 'text-[#0A1D3A]' : 'text-[#0A1D3A]'
          }`}>
            {plan.price}
          </div>
          {plan.period ? (
            <div className="pb-1.5 text-base font-semibold text-slate-600">{plan.period}</div>
          ) : null}
        </div>

        <p className="mt-2 text-[13px] leading-5 text-slate-600">
          {plan.summary}
        </p>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <div className="space-y-2.5">
          {plan.features.map((feature) => (
            <div key={feature} className="flex items-start gap-3">
              <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${
                plan.key === 'premium'
                  ? 'text-amber-500'
                  : plan.key === 'business'
                    ? 'text-blue-600'
                    : 'text-emerald-600'
              }`} />
              <p className="text-[12px] leading-5 text-slate-700">{feature}</p>
            </div>
          ))}
        </div>

        {plan.key === 'premium' && (
          <div className="mt-4 rounded-[20px] border border-amber-100 bg-[linear-gradient(180deg,#fff8e7_0%,#fff3d2_100%)] p-3">
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-700">
              Premium includes
            </div>
            <div className="mt-2.5 space-y-1.5">
              {plan.includes.map((item) => (
                <div key={item} className="flex items-center gap-2 text-[12px] font-medium text-slate-700">
                  <BadgeCheck className="h-3.5 w-3.5 text-amber-600" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto pt-4">
        <div className="text-[10px] font-medium text-slate-500">
          Best for: <span className="font-semibold text-slate-700">{plan.bestFor}</span>
        </div>

        {isCurrent ? (
          <div className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700">
            <BadgeCheck className="h-3.5 w-3.5" />
            Current Plan
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onAction(plan.key)}
            disabled={!!loading}
            className={`mt-3 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 ${
              plan.key === 'free'
                ? 'border border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50'
                : plan.key === 'business'
                  ? 'bg-[#0A4DC2] text-white shadow-[0_14px_30px_rgba(10,77,194,0.26)] hover:bg-[#0b55d3]'
                  : 'bg-[#F6B21A] text-[#0A1D3A] shadow-[0_14px_30px_rgba(246,178,26,0.28)] hover:bg-[#e8a80f]'
            }`}
          >
            {loading === plan.key ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Redirecting...
              </>
            ) : (
              <>
                {plan.cta}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        )}
      </div>
    </article>
  );
}

function CoreFeatureCard({ onOpen }) {
  return (
    <article className="flex h-full min-h-[440px] flex-col overflow-hidden rounded-[28px] border border-[#07111f] bg-[linear-gradient(180deg,#081227_0%,#0a1830_50%,#07101d_100%)] p-4 text-white shadow-[0_22px_60px_rgba(3,7,20,0.35)]">
      <div className="inline-flex items-center self-start rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-sky-100/80">
        Core feature
      </div>

      <h3 className="mt-3 text-[1.45rem] font-black tracking-[-0.03em] text-white">
        Secure your deals with
        <span className="block text-[#F6B21A]">Tradafication</span>
      </h3>
      <p className="mt-1.5 text-[13px] leading-5 text-sky-100/75">
        Offline verification, due diligence, and trust validation for high-value trade.
      </p>

      <div className="mt-4 flex items-center justify-center">
        <div className="flex h-44 w-44 items-center justify-center rounded-full border border-amber-400/45 bg-[radial-gradient(circle_at_top,rgba(246,178,26,0.12),transparent_50%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.12),transparent_45%)] shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
          <div className="flex h-32 w-32 items-center justify-center rounded-full border border-amber-400/65 bg-[#081122] shadow-[inset_0_0_0_8px_rgba(255,255,255,0.02)]">
            <img
              src={tradafyLogo}
              alt="Tradafy"
              className="h-20 w-20 object-contain drop-shadow-[0_0_18px_rgba(246,178,26,0.4)]"
              style={{
                filter:
                  'brightness(0) saturate(100%) invert(79%) sepia(84%) saturate(845%) hue-rotate(352deg) brightness(102%) contrast(98%)',
              }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {CORE_FEATURES.map((item) => (
          <div key={item} className="flex items-start gap-2.5 text-[12px] leading-5 text-slate-100/85">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <span>{item}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-[20px] border border-white/10 bg-white/5 px-4 py-2.5">
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-sky-100/70">
          From custom
        </div>
        <div className="mt-1 text-[1.2rem] font-black text-white">Need help?</div>
        <p className="mt-1 text-[12px] leading-5 text-sky-100/70">
          Explore verification, legal support, or premium trust services from the Deal Support workspace.
        </p>
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="mt-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F6B21A] px-5 py-2.5 text-sm font-black text-[#0A1D3A] shadow-[0_14px_30px_rgba(246,178,26,0.26)] transition hover:-translate-y-0.5 hover:bg-[#e8a80f]"
      >
        Get Tradafication
        <ArrowRight className="h-4 w-4" />
      </button>
    </article>
  );
}

export default function PremiumPlansPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState('');
  const [checkoutError, setCheckoutError] = useState('');

  const userRole = getPrimaryRole(user);
  const currentPlan = String(user?.plan || user?.subscriptionPlan || 'free').toLowerCase().trim();
  const displayName = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : 'Guest';
  const roleLabel =
    userRole === 'shipping_agent'
      ? 'Shipping Workspace'
      : userRole === 'buyer'
        ? 'Buyer Workspace'
        : userRole === 'admin'
          ? 'Admin Workspace'
          : 'Supplier Workspace';

  const handleCheckout = async (planKey) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (planKey === 'free') {
      navigate('/deal-request');
      return;
    }

    try {
      setCheckoutError('');
      setCheckoutLoading(planKey);
      const url = await createCheckoutSession(planKey);
      window.location.assign(url);
    } catch (err) {
      setCheckoutError(err?.response?.data?.message || 'Could not start checkout. Try again.');
      setCheckoutLoading('');
    }
  };

  return (
    <div
      className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(36,92,157,0.08),transparent_22%),linear-gradient(180deg,#f7f9fc_0%,#eef3fa_100%)] text-slate-900"
      style={{ fontFamily: '"Manrope", "Aptos", "Segoe UI", sans-serif' }}
    >
      <div className="relative min-h-screen">
        <aside
          className={`hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:h-screen lg:flex-col lg:overflow-hidden bg-[linear-gradient(180deg,#07132a_0%,#0a2348_56%,#0d3872_100%)] text-white transition-all duration-300 ${
            sidebarCollapsed ? 'w-[94px] px-3' : 'w-[280px] px-5'
          }`}
        >
          <div className={`flex items-center gap-3 pt-5 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/6">
              <Globe className="h-6 w-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <div className="text-lg font-black tracking-[0.22em] text-white">TRADAFY</div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-100/70">
                  {roleLabel}
                </div>
              </div>
            )}
          </div>

          <nav className="mt-10 space-y-2">
            {SIDE_NAV.map((item) => (
              <SidebarButton
                key={item.key}
                item={item}
                active={item.key === 'plans'}
                collapsed={sidebarCollapsed}
                onClick={() => {
                  if (item.key === 'plans') {
                    setSidebarCollapsed((value) => !value);
                    return;
                  }
                  navigate(item.path);
                }}
              />
            ))}
          </nav>

          <div className="mt-auto pb-5">
            <div className={`rounded-[24px] border border-white/10 bg-white/6 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.18)] ${
              sidebarCollapsed ? 'hidden' : 'block'
            }`}>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-100/70">
                Need help?
              </div>
              <p className="mt-2 text-sm leading-6 text-sky-100/75">
                Our team is here for you if you need guidance with premium plans.
              </p>
              <button
                type="button"
                onClick={() => navigate('/deal-support')}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#0A1D3A] transition hover:bg-slate-100"
              >
                Contact support
                <CircleHelp className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={logout}
              className={`mt-4 inline-flex w-full items-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm font-black text-rose-100 transition hover:bg-rose-500/20 ${
                sidebarCollapsed ? 'justify-center px-0' : 'justify-start'
              }`}
              title="Log Out"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed && 'Log Out'}
            </button>

            <button
              type="button"
              onClick={() => setSidebarCollapsed((value) => !value)}
              className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/10 ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
            >
              <PanelLeftClose className="h-4 w-4" />
              {!sidebarCollapsed && 'Collapse'}
            </button>
          </div>
        </aside>

        <div className={`min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-[94px]' : 'lg:pl-[280px]'}`}>
          <main className="min-w-0 px-4 pb-5 pt-1 sm:px-6 lg:px-8 lg:pb-6 lg:pt-2 xl:px-10">
            <div className="mx-auto max-w-[1600px]">
            <div className="flex items-center justify-between gap-3 rounded-[28px] border border-slate-200/80 bg-white px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-[#edf4ff] px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#245c9d]">
                Active Workspace
              </div>

              <div className="hidden flex-1 items-center justify-center lg:flex">
                <div className="flex w-full max-w-2xl items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-3">
                  <Search className="h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    readOnly
                    value=""
                    placeholder="Search anything..."
                    className="w-full bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-2 top-2 rounded-full bg-rose-500 px-1.5 py-0.5 text-[8px] font-black text-white">
                    12
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate(user ? '/dashboard' : '/login')}
                  className="flex items-center gap-3 rounded-[24px] border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:bg-slate-50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0A1D3A] text-sm font-black text-white">
                    {displayName
                      .split(' ')
                      .filter(Boolean)
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase() || 'TF'}
                  </div>
                  <div className="hidden text-left sm:block">
                    <div className="text-sm font-bold text-[#0A1D3A]">{displayName || 'Guest'}</div>
                    <div className="text-xs text-slate-500">{userRole ? roleLabel.replace(' Workspace', '') : 'Visitor'}</div>
                  </div>
                  <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
                </button>
              </div>
            </div>

            <div className="mt-3 lg:hidden">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {SIDE_NAV.map((item) => {
                  const Icon = item.icon;
                  const active = item.key === 'plans';
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        if (active) {
                          setSidebarCollapsed((value) => !value);
                          return;
                        }
                        navigate(item.path);
                      }}
                      className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${
                        active
                          ? 'cursor-pointer bg-[#0A1D3A] text-white'
                          : 'border border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-0">
              <SectionTitle
                eyebrow="Pricing and plans"
                title=""
                subtitle="Start your first deal. Scale your activity. Secure your execution."
              />
            </div>

            <div className="mt-0 grid gap-3 xl:grid-cols-[1fr_1fr_1fr_0.95fr]">
              {PLAN_DATA.map((plan) => (
                <PlanCard
                  key={plan.key}
                  plan={plan}
                  userPlan={currentPlan}
                  onAction={handleCheckout}
                  loading={checkoutLoading}
                />
              ))}

              <CoreFeatureCard onOpen={() => navigate(user ? '/deal-support/verification' : '/login')} />
            </div>

            {checkoutError && (
              <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700">
                {checkoutError}
              </div>
            )}

            <div className="mt-3 grid gap-3 xl:grid-cols-[1.25fr_0.95fr]">
              <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                <div className="text-[9px] font-black uppercase tracking-[0.24em] text-[#245c9d]">
                  Additional services
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                  {SERVICES.map((service) => {
                    const Icon = service.icon;
                    return (
                      <div
                        key={service.label}
                        className="rounded-[18px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-3 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#edf4ff] text-[#245c9d]">
                            <Icon className="h-4.5 w-4.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[13px] font-semibold text-slate-800">{service.label}</div>
                            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                              {service.value}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                <div className="text-[9px] font-black uppercase tracking-[0.24em] text-[#245c9d]">
                  How access works
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  {ACCESS_STEPS.map((item, index) => (
                    <div key={item.step} className="rounded-[18px] border border-slate-200 bg-slate-50 px-3 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#edf4ff] text-sm font-black text-[#245c9d]">
                          {item.step}
                        </div>
                        <div className="text-[13px] font-semibold text-slate-800">{item.title}</div>
                      </div>
                      <p className="mt-2 text-[12px] leading-5 text-slate-500">{item.copy}</p>
                      {index < ACCESS_STEPS.length - 1 && (
                        <div className="mt-3 hidden items-center justify-end md:flex">
                          <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="mt-3 grid gap-3 xl:grid-cols-[1.1fr_0.9fr]">
              <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                <div className="text-[9px] font-black uppercase tracking-[0.24em] text-rose-600">
                  Upgrade triggers (you may see these in your workspace)
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  {UPGRADE_TRIGGERS.map((item) => (
                    <div key={item} className="rounded-[18px] border border-rose-100 bg-rose-50 px-3 py-3 text-[12px] font-medium text-rose-900">
                      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-rose-500 shadow-sm">
                        <LockKeyhole className="h-4 w-4" />
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                <div className="grid gap-2 sm:grid-cols-2">
                  {ASSURANCE.map((item, index) => (
                    <div
                      key={item}
                      className={`rounded-[18px] px-3 py-3 ${
                        index === 0
                          ? 'border border-emerald-100 bg-emerald-50/70'
                          : 'border border-emerald-100 bg-[linear-gradient(180deg,#f7fff9_0%,#eefbf1_100%)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                        <p className="text-[12px] font-semibold leading-5 text-slate-700">{item}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
