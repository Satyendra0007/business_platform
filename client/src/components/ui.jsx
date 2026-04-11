import React, { useEffect, useState } from 'react';
import { LogOut, User, Mail, Globe, ShieldCheck, Quote, Star, ArrowRight, Sparkles, Send, PhoneCall, Building2 } from 'lucide-react';
import { navByRole, pageCopy, getNavIcon } from '../lib/navConstants';
import { Ship } from 'lucide-react';
import tradafyLogo from '../assets/tradafy_logo_official.png';

function isActive(pathname, path) {
  return pathname === path || (path !== '/dashboard' && pathname.startsWith(path));
}

const brandSizes = {
  sm: {
    frame: 'h-12 w-12 rounded-2xl',
    image: 'h-9 w-9',
    text: 'text-lg tracking-[0.22em]',
    subtext: 'text-[10px] tracking-[0.16em]'
  },
  md: {
    frame: 'h-14 w-14 rounded-[20px]',
    image: 'h-11 w-11',
    text: 'text-xl tracking-[0.24em]',
    subtext: 'text-[11px] tracking-[0.18em]'
  },
  lg: {
    frame: 'h-16 w-16 rounded-[22px]',
    image: 'h-12 w-12',
    text: 'text-xl tracking-[0.26em]',
    subtext: 'text-xs tracking-[0.2em]'
  }
};

function BrandMark({ size = 'md', tone = 'light', showSubtext = false, subtext }) {
  const selectedSize = brandSizes[size] || brandSizes.md;
  const frameTone = tone === 'dark'
    ? 'border-white/12 bg-white shadow-[0_16px_38px_rgba(15,23,42,0.22)]'
    : 'border-[#d7e3f0] bg-white shadow-[0_16px_34px_rgba(20,58,106,0.12)]';
  const titleTone = tone === 'dark' ? 'text-white' : 'text-[#0A2540]';
  const subtextTone = tone === 'dark' ? 'text-sky-100/75' : 'text-slate-500';

  return (
    <div className="flex items-center gap-3">
      <div className={`flex items-center justify-center border ${selectedSize.frame} ${frameTone}`}>
        <img src={tradafyLogo} alt="Tradafy" className={`${selectedSize.image} object-contain`} />
      </div>
      <div className="min-w-0">
        <div className={`font-black uppercase leading-none ${selectedSize.text} ${titleTone}`}>TRADAFY</div>
        {showSubtext ? (
          <div className={`mt-1 truncate font-semibold uppercase leading-none ${selectedSize.subtext} ${subtextTone}`}>
            {subtext}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function PublicHeader({ navigate, currentUser }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/50 bg-transparent px-0 pb-3 pt-1">
      <button onClick={() => navigate('/')} className="text-left transition-transform hover:-translate-y-0.5">
        <BrandMark size="md" tone="light" showSubtext subtext="Global Trade Workspace" />
      </button>

      <div className="hidden lg:flex items-center gap-8 font-bold text-slate-600 xl:gap-12">
        <button onClick={() => navigate('/dashboard')} className="hover:text-[#0A2540] transition-colors">Browse Workspace</button>
        <button onClick={() => navigate('/products')} className="hover:text-[#0A2540] transition-colors">View Products</button>
      </div>

      <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
        {!currentUser && (
          <button
            onClick={() => navigate('/login')}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-[#0A2540] transition hover:border-slate-300 hover:bg-slate-50"
          >
            Log In
          </button>
        )}
        <button
          onClick={() => navigate(currentUser ? '/dashboard' : '/login')}
          className="rounded-xl bg-[#E5A93D] px-5 py-2.5 text-sm font-black text-[#0A2540] transition hover:bg-[#FF8A00] shadow-[0_10px_20px_rgba(229,169,61,0.2)]"
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
    <footer className="bg-[#050E1C] text-slate-400 pt-10 pb-6 border-t border-white/5 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[40%] h-full bg-[radial-gradient(circle_at_top_right,rgba(30,64,175,0.08),transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[30%] h-[50%] bg-[radial-gradient(circle_at_bottom_left,rgba(229,169,61,0.05),transparent_70%)] pointer-events-none" />

      <div className="mx-auto max-w-[1500px] px-6">
        <div className="relative mb-10 overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,rgba(20,58,106,0.95),rgba(5,14,28,0.96))] px-6 py-5 shadow-[0_20px_50px_rgba(3,7,18,0.35)] lg:px-8">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(229,169,61,0.18),transparent_52%)] pointer-events-none" />
          <div className="absolute -left-16 top-10 h-40 w-40 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl space-y-1.5">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] text-sky-100">
                <Sparkles className="h-3 w-3 text-[#E5A93D]" />
                Trade Faster With Clarity
              </div>
              <h3 className="text-xl font-black tracking-tight text-white lg:text-3xl leading-tight">
                Launch your next global deal from one premium workspace.
              </h3>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row shrink-0">
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E5A93D] px-6 py-3 text-[12px] font-black text-[#0A2540] transition hover:-translate-y-1 hover:bg-[#FF8A00]"
              >
                Start Trading
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => navigate('/products')}
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-[12px] font-black text-white transition hover:bg-white/10"
              >
                Explore Marketplace
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-10">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <button onClick={() => navigate('/')} className="text-left transition-transform hover:-translate-y-0.5">
              <BrandMark size="md" tone="dark" showSubtext subtext="Bulk Trade Command Surface" />
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

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-medium text-slate-500">
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
    <div className="w-[280px] shrink-0 rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.2)] backdrop-blur-md transition-all hover:-translate-y-2 hover:border-white/20 hover:bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] group md:w-[320px]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={avatar}
            alt={name}
            className="h-12 w-12 rounded-[18px] object-cover shadow-sm ring-1 ring-white/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-white">{name}</p>
              {flag ? (
                <span
                  className="inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 text-xs shadow-sm"
                  title={country || 'Country'}
                >
                  {flag}
                </span>
              ) : null}
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">{role}</p>
          </div>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-1">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <div className="relative min-h-[80px]">
        <Quote className="absolute -left-1 -top-2 h-6 w-6 text-white/10 transition-colors group-hover:text-white/20" />
        <p className="relative z-10 text-[14px] font-medium leading-relaxed text-slate-300 italic">
          "{content}"
        </p>
      </div>
      <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
        {productImage ? (
          <img
            src={productImage}
            alt={product}
            className="h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-white/10"
          />
        ) : null}
        <div>
          <p className="text-[11px] font-bold text-slate-200">{company}</p>
          <p className="mt-1 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-sky-400">
            Traded: <span className="text-sky-200">{product}</span>
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
      <div className="mx-auto w-full max-w-[1500px] px-4 pb-4 pt-1 sm:px-5 sm:pb-6 sm:pt-2 lg:px-6 lg:pb-8 lg:pt-3">
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
          } else {
            setSidebarOpen(false);
            navigate('/dashboard');
          }
        }}
        className={`flex items-center rounded-2xl border border-white/10 bg-white/6 py-3 text-left transition-all ${
          sidebarOpen ? 'gap-3 px-3' : 'justify-center px-0'
        }`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-[0_10px_24px_rgba(15,23,42,0.18)]">
          <img src={tradafyLogo} alt="Tradafy" className="h-9 w-9 object-contain" />
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
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
        />
      ) : null}
      <aside
        onClick={() => {
          if (!sidebarOpen) {
            setSidebarOpen(true);
          }
        }}
        className={`fixed inset-y-0 left-0 z-50 flex flex-col overflow-hidden bg-[linear-gradient(180deg,#0d2340_0%,#12335d_55%,#1f548d_100%)] p-4 text-white shadow-[0_28px_70px_rgba(7,19,39,0.35)] transition-all duration-300 ${
          sidebarOpen
            ? 'w-[286px] translate-x-0'
            : '-translate-x-full w-[286px] lg:w-[92px] lg:translate-x-0'
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

      <div className="mx-auto min-h-screen max-w-[1680px] px-2 py-2 sm:px-3 sm:py-3 lg:px-4">
        <div
          className={`min-h-screen transition-[padding-left] duration-300 ${sidebarOpen ? 'lg:pl-[298px]' : 'lg:pl-[104px]'}`}
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
                    <BrandMark size="sm" tone="light" />
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
