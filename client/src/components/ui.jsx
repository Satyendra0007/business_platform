import React, { useEffect, useState } from 'react';
import { BriefcaseBusiness, LayoutDashboard, LogOut, Package, ReceiptText, ShieldCheck, User } from 'lucide-react';

export const privatePaths = ['/dashboard', '/request-quote', '/my-rfqs', '/incoming-rfqs', '/deals', '/deal', '/admin'];

const navByRole = {
  buyer: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Products', path: '/products' },
    { label: 'My RFQs', path: '/my-rfqs' },
    { label: 'My Deals', path: '/deals' },
  ],
  supplier: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'My Products', path: '/products' },
    { label: 'Incoming RFQs', path: '/incoming-rfqs' },
    { label: 'My Deals', path: '/deals' },
  ],
  shipping_agent: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Shipment Deals', path: '/deals' },
    { label: 'Products', path: '/products' },
  ],
  admin: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Admin Workspace', path: '/admin' },
    { label: 'Products', path: '/products' },
  ],
};

const pageCopy = {
  buyer: 'Buyer Workspace',
  supplier: 'Supplier Workspace',
  shipping_agent: 'Shipping Workspace',
  admin: 'Admin Control',
};

export const productGradients = [
  'from-amber-200 via-orange-100 to-white',
  'from-sky-200 via-cyan-100 to-white',
  'from-slate-200 via-zinc-100 to-white',
  'from-emerald-200 via-lime-100 to-white',
];

function isActive(pathname, target) {
  return target === '/dashboard' ? pathname === target : pathname.startsWith(target);
}

function getNavIcon(path) {
  if (path === '/dashboard') return LayoutDashboard;
  if (path === '/products') return Package;
  if (path === '/my-rfqs' || path === '/incoming-rfqs') return ReceiptText;
  if (path === '/deals' || path === '/deal') return BriefcaseBusiness;
  if (path === '/admin') return ShieldCheck;
  return LayoutDashboard;
}

export function PublicHeader({ navigate, currentUser }) {
  return (
    <header className="flex items-center justify-between rounded-[24px] border border-[#234f86] bg-[linear-gradient(135deg,#143a6a_0%,#1c4f8d_52%,#255fa5_100%)] px-4 py-3 text-white shadow-[0_20px_48px_rgba(16,44,84,0.24)] md:px-6">
      <button onClick={() => navigate('/')} className="flex items-center gap-3 text-left">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#cde6ff,#ffffff)] font-bold text-[#153763]">
          T
        </div>
        <div>
          <div className="text-base font-semibold tracking-[0.22em] text-white">TRADAFY</div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-sky-100/80">Global trade workspace</div>
        </div>
      </button>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/products')}
          className="rounded-2xl border border-white/18 bg-white/8 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/16"
        >
          Browse Products
        </button>
        <button
          onClick={() => navigate(currentUser ? '/dashboard' : '/login')}
          className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-[#173e6d] transition hover:bg-sky-50"
        >
          {currentUser ? 'Open Workspace' : 'Login'}
        </button>
      </div>
    </header>
  );
}

export function PublicLayout({ currentUser, navigate, children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.10),transparent_18%),linear-gradient(180deg,#eef4fb_0%,#f8fbff_48%,#edf3fa_100%)] text-slate-900">
      <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">
        <PublicHeader navigate={navigate} currentUser={currentUser} />
        {children}
      </div>
    </div>
  );
}

export function AppShell({ user, pathname, navigate, onLogout, title, subtitle, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigation = navByRole[user.role] || navByRole.buyer;

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const sidebar = () => (
    <>
      <button
        onClick={(event) => {
          event.stopPropagation();
          if (!sidebarOpen) {
            setSidebarOpen(true);
            return;
          }
          navigate('/dashboard');
          setSidebarOpen(false);
        }}
        className={`flex items-center rounded-2xl border border-white/10 bg-white/6 py-3 text-left transition-all ${
          sidebarOpen ? 'gap-3 px-3' : 'justify-center px-0'
        }`}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#d1e8ff,#ffffff)] text-sm font-bold text-[#153763]">
          T
        </div>
        <div className={sidebarOpen ? 'block' : 'hidden'}>
          <div className="text-lg font-semibold tracking-[0.2em]">TRADAFY</div>
          <div className="text-xs text-slate-300">{pageCopy[user.role]}</div>
        </div>
      </button>

      <div className="mt-6 space-y-2">
        {navigation.map((item) => (
          (() => {
            const Icon = getNavIcon(item.path);
            return (
              <button
                key={item.path}
                onClick={(event) => {
                  event.stopPropagation();
                  navigate(item.path);
                }}
                className={`flex w-full items-center rounded-2xl py-3 text-left transition ${
                  isActive(pathname, item.path)
                    ? 'bg-white text-[#173c68] shadow-[0_10px_24px_rgba(255,255,255,0.16)]'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                } ${sidebarOpen ? 'gap-3 px-3' : 'justify-center px-0'}`}
                title={item.label}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <span className={`font-medium ${sidebarOpen ? 'block' : 'hidden'}`}>{item.label}</span>
              </button>
            );
          })()
        ))}
      </div>

      <div className={`mt-auto rounded-[24px] border border-white/10 bg-white/6 ${sidebarOpen ? 'p-4' : 'p-3'}`}>
        <div className={`flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'}`}>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold">
            {sidebarOpen ? user.avatar : <User className="h-5 w-5" />}
          </div>
          <div className={`min-w-0 ${sidebarOpen ? 'block' : 'hidden'}`}>
            <p className="truncate font-semibold">{user.name}</p>
            <p className="truncate text-xs text-slate-300">{user.company}</p>
          </div>
        </div>
        <button
          onClick={(event) => {
            event.stopPropagation();
            onLogout();
          }}
          className={`mt-4 flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/10 py-3 text-sm font-medium text-white transition hover:bg-white/20 ${
            sidebarOpen ? 'px-4' : 'px-0'
          }`}
          title="Log Out"
        >
          <span className={sidebarOpen ? 'block' : 'hidden'}>Log Out</span>
          <span className={sidebarOpen ? 'hidden' : 'block'}><LogOut className="h-4.5 w-4.5" /></span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.10),_transparent_32%),linear-gradient(180deg,#edf3fb_0%,#f6f9fd_42%,#edf2f8_100%)] text-slate-900">
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col overflow-hidden bg-[linear-gradient(180deg,#0d2340_0%,#12335d_55%,#1f548d_100%)] p-4 text-white shadow-[0_28px_70px_rgba(7,19,39,0.35)] transition-[width] duration-300 ${
          sidebarOpen ? 'w-[286px]' : 'w-[92px]'
        }`}
      >
        <div className={`mb-4 flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
          <div className={`text-xs font-semibold uppercase tracking-[0.22em] text-slate-300 ${sidebarOpen ? 'block' : 'hidden'}`}>Navigation</div>
          <button
            onClick={(event) => {
              event.stopPropagation();
              setSidebarOpen((current) => !current);
            }}
            className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/20"
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? 'Close' : 'Open'}
          </button>
        </div>
        {sidebar()}
      </aside>

      <div className="mx-auto min-h-screen max-w-[1680px] px-3 py-3 lg:px-4">
        <div
          className="min-h-screen transition-[padding-left] duration-300"
          style={{ paddingLeft: sidebarOpen ? '298px' : '104px' }}
        >
          <div className="flex min-h-screen flex-1 flex-col overflow-hidden rounded-[28px] border border-white/65 bg-white/84 shadow-[0_28px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <header className="border-b border-[#d4e0ee] bg-[linear-gradient(180deg,#ffffff_0%,#f2f7fc_100%)] px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setSidebarOpen((current) => !current)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-[#d4e0ee] bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#143a6a,#245c9d)] text-sm font-bold text-white">
                      T
                    </div>
                    <span className="font-semibold tracking-[0.18em] text-[#143a6a]">TRADAFY</span>
                  </button>
                  <div className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#143a6a,#245c9d)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white">
                    {pageCopy[user.role]}
                  </div>
                </div>
                <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[#13355e] sm:text-3xl">{title}</h1>
                {subtitle ? <p className="mt-1 max-w-3xl text-sm text-slate-600">{subtitle}</p> : null}
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-[#d4e0ee] bg-white px-3 py-2 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#143a6a,#245c9d)] text-sm font-semibold text-white">
                  {user.avatar}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold text-[#153763]">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.title}</p>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MetricCard({ label, value, dark = false }) {
  return (
    <div className={`rounded-[24px] p-4 ${dark ? 'border border-white/12 bg-white/10' : 'border border-[#dde6f1] bg-[linear-gradient(180deg,#ffffff_0%,#f5f8fc_100%)]'}`}>
      <p className={`text-xs uppercase tracking-[0.2em] ${dark ? 'text-slate-300' : 'text-slate-500'}`}>{label}</p>
      <p className={`mt-2 text-xl font-semibold capitalize ${dark ? 'text-white' : 'text-[#143a6a]'}`}>{value}</p>
    </div>
  );
}
