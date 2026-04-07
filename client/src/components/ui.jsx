import React, { useEffect, useState } from 'react';
import { LogOut, User, Mail, Globe, ShieldCheck, Quote, Star, ArrowRight, Sparkles, Send, PhoneCall, Building2 } from 'lucide-react';
import { navByRole, pageCopy, getNavIcon } from '../lib/navConstants';

function isActive(pathname, path) {
  return pathname === path || (path !== '/dashboard' && pathname.startsWith(path));
}

export function PublicHeader({ navigate, currentUser }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-transparent border-b border-slate-200/50">
      <button onClick={() => navigate('/')} className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A2540] font-black text-white text-xl">
          T
        </div>
        <div className="text-xl font-black tracking-widest text-[#0A2540] uppercase">TRADAFY</div>
      </button>

      <div className="hidden md:flex items-center gap-12 font-bold text-slate-600">
        <button onClick={() => navigate('/dashboard')} className="hover:text-[#0A2540] transition-colors">Browse Workspace</button>
        <button onClick={() => navigate('/products')} className="hover:text-[#0A2540] transition-colors">View Products</button>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(currentUser ? '/dashboard' : '/login')}
          className="rounded-xl bg-[#E5A93D] px-6 py-2.5 text-sm font-black text-[#0A2540] transition hover:bg-[#FF8A00] shadow-[0_10px_20px_rgba(229,169,61,0.2)]"
        >
          {currentUser ? 'Open Workspace' : 'Start Trading'}
        </button>
      </div>
    </header>
  );
}

export function Footer({ navigate }) {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-[#050E1C] text-slate-400 pt-20 pb-10 border-t border-white/5 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[40%] h-full bg-[radial-gradient(circle_at_top_right,rgba(30,64,175,0.08),transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[30%] h-[50%] bg-[radial-gradient(circle_at_bottom_left,rgba(229,169,61,0.05),transparent_70%)] pointer-events-none" />

      <div className="mx-auto max-w-[1500px] px-6">
        <div className="relative mb-16 overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(135deg,rgba(20,58,106,0.95),rgba(5,14,28,0.96))] px-8 py-10 shadow-[0_30px_80px_rgba(3,7,18,0.35)] lg:px-12">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(229,169,61,0.18),transparent_52%)] pointer-events-none" />
          <div className="absolute -left-16 top-10 h-40 w-40 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-[10px] font-black uppercase tracking-[0.26em] text-sky-100">
                <Sparkles className="h-3.5 w-3.5 text-[#E5A93D]" />
                Trade Faster With Clarity
              </div>
              <h3 className="text-3xl font-black tracking-tight text-white lg:text-5xl">
                Launch your next global deal from one premium workspace.
              </h3>
              <p className="max-w-xl text-sm leading-7 text-slate-300 lg:text-base">
                Source verified products, align suppliers and buyers, and move shipments without the email chaos that slows teams down.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E5A93D] px-7 py-4 text-sm font-black text-[#0A2540] transition hover:-translate-y-1 hover:bg-[#FF8A00]"
              >
                Start Trading
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate('/products')}
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-7 py-4 text-sm font-black text-white transition hover:bg-white/10"
              >
                Explore Marketplace
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <button onClick={() => navigate('/')} className="flex items-center gap-3 text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-orange-400 font-black text-[#0A2540] text-xl shadow-lg">
                T
              </div>
              <div className="text-xl font-black tracking-widest text-white uppercase">TRADAFY</div>
            </button>
            <p className="max-w-xs text-sm leading-relaxed">
              The world's most trusted workspace for bulk international trade. Discover products, execute deals, and manage global logistics in one unified platform.
            </p>
            <div className="flex items-center gap-4 pt-2">
              {[Send, Globe, PhoneCall, Building2].map((Icon, i) => (
                <button key={i} className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center transition hover:bg-white/5 hover:text-white hover:border-white/30">
                  <Icon className="h-4.5 w-4.5" />
                </button>
              ))}
            </div>
          </div>

          {/* Solutions Column */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-white font-bold text-sm uppercase tracking-widest">Solutions</h4>
            <ul className="space-y-4 text-sm">
              <li><button onClick={() => navigate('/products')} className="hover:text-white transition-colors">Bulk Marketplace</button></li>
              <li><button className="hover:text-white transition-colors cursor-not-allowed">Logistics Hub</button></li>
              <li><button className="hover:text-white transition-colors cursor-not-allowed">Deal Management</button></li>
              <li><button className="hover:text-white transition-colors cursor-not-allowed">Verified Suppliers</button></li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-white font-bold text-sm uppercase tracking-widest">Company</h4>
            <ul className="space-y-4 text-sm">
              <li><button className="hover:text-white transition-colors cursor-not-allowed">About TRADAFY</button></li>
              <li><button className="hover:text-white transition-colors cursor-not-allowed">Contact Sales</button></li>
              <li><button className="hover:text-white transition-colors cursor-not-allowed">Trade Resources</button></li>
              <li><button className="hover:text-white transition-colors cursor-not-allowed">Careers</button></li>
            </ul>
          </div>

          {/* Contact/Newsletter Column */}
          <div className="lg:col-span-4 space-y-6">
            <h4 className="text-white font-bold text-sm uppercase tracking-widest">Ready to trade?</h4>
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Contact our support</p>
              <div className="flex items-center gap-3 group">
                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center transition group-hover:bg-amber-300/20 group-hover:text-amber-300">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold">Email</p>
                  <p className="text-sm text-white font-semibold">global@tradafy.app</p>
                </div>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center transition group-hover:bg-blue-400/20 group-hover:text-blue-400">
                  <Globe className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold">Headquarters</p>
                  <p className="text-sm text-white font-semibold">Dubai International Financial Centre</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-6">
            <span>© {currentYear} TRADAFY Global. All rights reserved.</span>
            <div className="hidden md:flex items-center gap-4">
               <button className="hover:text-slate-300 transition-colors">Privacy Policy</button>
               <button className="hover:text-slate-300 transition-colors">Terms of Service</button>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <ShieldCheck className="h-4 w-4 text-emerald-500/50" />
             <span>ISO 27001 Certified Trade Workspace</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Reveal({ children, delay = 0, effect = 'up' }) {
  const effects = {
    up: 'animate-fade-in-blur',
    right: 'animate-reveal-right',
    zoom: 'animate-zoom-in-soft'
  };
  
  return (
    <div className={`${effects[effect]} ${delay ? `delay-${delay}` : ''}`}>
      {children}
    </div>
  );
}

export function ReviewCard({ name, role, company, content, rating = 5, avatar, product, productImage, country, flag }) {
  return (
    <div className="w-[240px] shrink-0 rounded-[26px] border border-blue-100/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(243,248,255,0.96))] p-4 shadow-[0_14px_34px_rgba(30,64,175,0.10)] backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-blue-200 group md:w-[272px]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={avatar}
            alt={name}
            className="h-10 w-10 rounded-2xl object-cover shadow-sm ring-1 ring-blue-100"
          />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-slate-900">{name}</p>
              {flag ? (
                <span
                  className="inline-flex items-center rounded-full border border-blue-100 bg-[#eef6ff] px-2 py-0.5 text-xs shadow-sm"
                  title={country || 'Country'}
                >
                  {flag}
                </span>
              ) : null}
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">{role}</p>
          </div>
        </div>
        {productImage ? (
          <img
            src={productImage}
            alt={product}
            className="h-10 w-10 rounded-2xl object-cover ring-1 ring-blue-100"
          />
        ) : null}
      </div>

      <div className="mb-3 flex items-center gap-1">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="h-3 w-3 fill-amber-300 text-amber-300" />
        ))}
      </div>
      <div className="relative">
        <Quote className="absolute -top-2 -left-1 h-5 w-5 text-blue-100 transition-colors group-hover:text-blue-200" />
        <p className="relative z-10 text-[13px] font-medium leading-5 text-slate-700 italic">
          "{content}"
        </p>
      </div>
      <div className="mt-4 flex items-center gap-3 border-t border-blue-50 pt-3">
        <div>
          <p className="text-[10px] font-semibold text-slate-500">{company}</p>
          <div className="mt-1 flex items-center gap-2">
            {flag && country ? (
              <span className="rounded-full bg-[#eef6ff] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-[#245c9d]">
                {flag} {country}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-[9px] font-black uppercase tracking-[0.16em] text-[#143A6A]">
            Product: {product}
          </p>
        </div>
      </div>
    </div>
  );
}

export function Marquee({ items, direction = 'left', speed = 'normal', className = '' }) {
  const directionClass = direction === 'right' ? 'marquee-right' : 'marquee-left';
  const speedClass = speed === 'fast' ? 'marquee-fast' : speed === 'slow' ? 'marquee-slow' : '';

  return (
    <div className={`marquee-container py-2 ${className}`}>
      <div className={`marquee-content ${directionClass} ${speedClass}`}>
        {items.map((item, i) => (
          <ReviewCard key={`orig-${i}`} {...item} />
        ))}
        {items.map((item, i) => (
          <ReviewCard key={`dup-${i}`} {...item} />
        ))}
      </div>
    </div>
  );
}

export function PublicLayout({ currentUser, navigate, children }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col">
      <div className="mx-auto max-w-[1500px] px-6 py-8 w-full">
        <PublicHeader navigate={navigate} currentUser={currentUser} />
        <main className="flex-1">
          {children}
        </main>
      </div>
      <Footer navigate={navigate} />
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
                  if (!sidebarOpen) {
                    setSidebarOpen(true);
                    return;
                  }
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
        onClick={() => {
          if (!sidebarOpen) {
            setSidebarOpen(true);
          }
        }}
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
