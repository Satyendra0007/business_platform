import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  Globe2,
  MessageSquare,
  ShieldCheck,
  Ship,
  Star,
  Truck
} from 'lucide-react';
import heroShip from '../assets/hero-ship.png';
import productPipesBulk from '../assets/product-pipes-bulk.jpg';
import productOilBulk from '../assets/product-oil-bulk.jpg';
import productSugarGemini from '../assets/product-sugar-gemini.png';
import productHealthBeautyA from '../assets/product-health-beauty-a.png';
import productHealthBeautyB from '../assets/product-health-beauty-b.png';
import productHeavyMachineryBulk from '../assets/product-heavy-machinery-bulk.png';
import productHomewareBulk from '../assets/product-homeware-bulk.png';
import tradafyLogo from '../assets/tradafy-logo.png';
import { PublicLayout, Reveal, Marquee } from '../components/ui';
import ProductShowcaseCarousel from '../components/landing/ProductShowcaseCarousel';
import { useNavigate } from 'react-router-dom';

const orbitCards = [
  { title: 'DOCUMENTS', copy: 'Generate NDA, LOI, and SPA in seconds.', icon: FileText, accent: 'text-violet-600', tint: 'from-violet-100 to-white' },
  { title: 'TRADAFICATION', copy: 'Offline verification, compliance & trust validation.', icon: ShieldCheck, accent: 'text-amber-600', tint: 'from-amber-100 to-white' },
  { title: 'REAL-TIME CHAT', copy: 'Negotiate in one live thread.', icon: MessageSquare, accent: 'text-blue-600', tint: 'from-blue-100 to-white' },
  { title: 'TIMELINE TRACKING', copy: 'Track milestones, tasks, and deadlines.', icon: Clock3, accent: 'text-cyan-600', tint: 'from-cyan-100 to-white' },
  { title: 'SHIPPING BIDS', copy: 'Compare live freight offers from top carriers.', icon: Truck, accent: 'text-emerald-600', tint: 'from-emerald-100 to-white' },
  { title: 'DOCUMENT REVIEW', copy: 'Request legal review and get expert feedback.', icon: FileText, accent: 'text-pink-600', tint: 'from-pink-100 to-white' }
];

function WorkspaceOrbitPreview() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let rafId = 0;
    const start = performance.now();
    const tick = (now) => {
      setPhase((now - start) / 1000);
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  const orbitRadius = 270;
  const containerSize = 640;
  const centerSize = 180;
  const cardWidth = 160;
  const cardHeight = 120;
  const iconSize = 48;

  const cards = orbitCards.map((card, index) => {
    const baseAngle = (index * (Math.PI * 2)) / orbitCards.length;
    const currentAngle = baseAngle + phase * 0.065;
    const depth = Math.sin(currentAngle) * 42;
    const scale = 0.9 + ((depth + 42) / 84) * 0.12;
    return {
      ...card,
      x: Math.cos(currentAngle) * orbitRadius,
      y: Math.sin(currentAngle) * orbitRadius * 0.7,
      z: depth,
      scale,
      angle: currentAngle
    };
  });

  return (
    <div className="relative mx-auto flex items-center justify-center overflow-visible" style={{ width: containerSize, height: containerSize, isolation: 'isolate' }}>
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0" style={{ zIndex: 0 }}>
        {cards.map((card, index) => {
          const rotation = (card.angle * 180) / Math.PI;
          const hubRadius = centerSize / 2 - 4;
          const len = orbitRadius - hubRadius;
          const lineOpacity = 0.5 + ((card.z + 42) / 84) * 0.14;
          return (
            <div
              key={`bar-${index}`}
                className="absolute left-0 top-0 h-[3px] origin-left -translate-y-1/2"
                style={{
                  width: `${len}px`,
                  transform: `rotate(${rotation}deg) translateX(${hubRadius}px)`,
                  background: 'linear-gradient(90deg, rgba(96,165,250,0.98), rgba(59,130,246,0.14))',
                  boxShadow: '0 0 10px rgba(59,130,246,0.32)',
                  borderRadius: '999px',
                  opacity: lineOpacity,
                  zIndex: 0
              }}
            />
          );
        })}
      </div>

      <div className="absolute left-1/2 top-1/2 h-0 w-0" style={{ perspective: '1800px', transformStyle: 'preserve-3d', zIndex: 10 }}>
        <div className="absolute left-0 top-0 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-[42px] border border-[#161f38] bg-[#081224] shadow-[0_30px_78px_rgba(8,18,36,0.64),0_0_0_1px_rgba(255,255,255,0.08),0_0_64px_rgba(132,93,255,0.42)] pointer-events-auto" style={{ width: centerSize, height: centerSize, zIndex: 20 }}>
          <div className="absolute inset-0 rounded-[42px] bg-[radial-gradient(circle_at_top,rgba(119,79,255,0.38),transparent_48%),radial-gradient(circle_at_bottom,rgba(88,28,135,0.4),transparent_50%)]" />
          <div className="relative z-10 flex flex-col items-center text-center px-3">
            <div className="flex items-center justify-center rounded-full border border-white/10 bg-[radial-gradient(circle_at_top,rgba(140,117,255,0.28),rgba(44,52,94,0.1))] shadow-[0_0_36px_rgba(132,93,255,0.4)] backdrop-blur-xl" style={{ width: iconSize, height: iconSize, transform: 'translateZ(20px)' }}>
              <img src={tradafyLogo} alt="Tradafy logo" className="h-[54px] w-[54px] object-contain drop-shadow-[0_0_14px_rgba(168,139,255,0.85)]" draggable="false" />
            </div>
            <div className="mt-2.5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-[0.18em] text-slate-300 shadow-[0_0_24px_rgba(255,255,255,0.06)]">Tradafy OS</div>
            <h3 className="mt-1.5 text-[14px] font-black tracking-[0.12em] text-white">LIVE DEAL</h3>
            <div className="text-[14px] font-black tracking-[0.12em] text-white/90">WORKSPACE</div>
          </div>
        </div>

        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="absolute left-0 top-0 pointer-events-auto" style={{ transform: `translate3d(${card.x}px, ${card.y}px, ${card.z}px) scale(${card.scale})`, transformStyle: 'preserve-3d', width: `${cardWidth}px`, zIndex: Math.round(220 + card.z) }}>
              <div className="group relative cursor-default -translate-x-1/2 -translate-y-1/2">
                <div className="absolute inset-x-2 inset-y-2 rounded-[22px] bg-black/10 blur-xl" style={{ opacity: 0.44 + ((card.z + 42) / 84) * 0.14 }} />
                <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-[22px] border border-slate-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(247,250,255,0.96)_100%)] px-2 shadow-[0_18px_38px_rgba(10,37,64,0.14)] ring-1 ring-white/70 backdrop-blur-md transition-all duration-500 group-hover:-translate-y-1" style={{ height: cardHeight }}>
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-sky-300 to-transparent opacity-80" />
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className={`flex items-center justify-center rounded-[18px] bg-gradient-to-br ${card.tint} ring-1 ring-slate-100 shadow-[0_8px_18px_rgba(10,37,64,0.12)]`} style={{ width: 48, height: 48, transform: 'translateZ(10px)' }}>
                      <Icon className={`h-[24px] w-[24px] ${card.accent}`} />
                    </div>
                    <div className="px-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#0A2540]">{card.title}</p>
                      <p className="mt-0.5 text-[9px] font-medium leading-[1.3] text-slate-600">{card.copy}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LandingPage() {
  const navigate = useNavigate();

  const reviews = [
    {
      name: 'Ahmed Al-Fayed',
      role: 'Procurement Director',
      company: 'Gulf Logistics',
      country: 'UAE',
      flag: '🇦🇪',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
      product: 'Sunflower Oil',
      productImage: productOilBulk,
      content: "TRADAFY transformed our bulk sourcing. The real-time vessel tracking is a game-changer for our Dubai operations."
    },
    {
      name: 'Elena Rodriguez',
      role: 'Supply Chain Manager',
      company: 'EuroFood Group',
      country: 'Spain',
      flag: '🇪🇸',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop',
      product: 'Refined Sugar',
      productImage: productSugarGemini,
      content: 'Finally, a platform that understands commodities. The digital deal workspace saves us weeks of paperwork.'
    },
    {
      name: 'Chen Wei',
      role: 'Operations Head',
      company: 'Pacific Steel',
      country: 'China',
      flag: '🇨🇳',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop',
      product: 'Industrial Steel Pipes',
      productImage: productPipesBulk,
      content: "Seamless communication. We closed our largest steel deal this year using TRADAFY's centralized RFQ system."
    },
    {
      name: 'Sarah Jenkins',
      role: 'Brokerage Specialist',
      company: 'Atlantic Trade',
      country: 'United States',
      flag: '🇺🇸',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop',
      product: 'Private Label Cosmetics',
      productImage: productHealthBeautyA,
      content: 'The verified supplier network gives us the confidence to execute high-volume orders without friction.'
    },
    {
      name: 'Marco Silva',
      role: 'Logistics Lead',
      company: 'Brazil Export Co',
      country: 'Brazil',
      flag: '🇧🇷',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?q=80&w=400&auto=format&fit=crop',
      product: 'Refined Sugar',
      productImage: productSugarGemini,
      content: 'Managing 15,000 MT shipments has never been this transparent. The shipping bids are extremely competitive.'
    },
    {
      name: 'Fatima Noor',
      role: 'Imports Manager',
      company: 'Noor Commodities',
      country: 'Saudi Arabia',
      flag: '🇸🇦',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=400&auto=format&fit=crop',
      product: 'Personal Care Bulk Essentials',
      productImage: productHealthBeautyB,
      content: 'Our buyers, brokers, and shipping partners finally work from one shared timeline instead of ten conflicting message threads.'
    },
    {
      name: 'Viktor Petrov',
      role: 'Export Lead',
      company: 'Baltic Agro Trade',
      country: 'Poland',
      flag: '🇵🇱',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?q=80&w=400&auto=format&fit=crop',
      product: 'Heavy Machinery Systems',
      productImage: productHeavyMachineryBulk,
      content: 'We shortened deal turnaround dramatically because every quote, approval, and document now lives in one place.'
    },
    {
      name: 'Isabella Costa',
      role: 'Commercial Director',
      company: 'Lusitania Foods',
      country: 'Portugal',
      flag: '🇵🇹',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=400&auto=format&fit=crop',
      product: 'Homeware Export Collection',
      productImage: productHomewareBulk,
      content: 'The product presentation feels premium and the workflow is clear enough for both our sales team and our logistics team.'
    }
  ];

  const timelineSteps = [
    { label: 'Draft', status: 'completed' },
    { label: 'Negotiation', status: 'completed' },
    { label: 'Compliance', status: 'current' },
    { label: 'Execution', status: 'pending' },
    { label: 'Shipment', status: 'pending' }
  ];

  const platformFeatures = [
    { title: 'Live chat', copy: 'Keep every stakeholder in one thread.', icon: MessageSquare, accent: 'text-blue-600', tint: 'bg-blue-50' },
    { title: 'Doc builder', copy: 'Draft and review trade docs quickly.', icon: FileText, accent: 'text-violet-600', tint: 'bg-violet-50' },
    { title: 'Carrier bids', copy: 'Compare shipping offers in real time.', icon: Truck, accent: 'text-emerald-600', tint: 'bg-emerald-50' },
    { title: 'Verification', copy: 'Validate partners before deals move.', icon: ShieldCheck, accent: 'text-amber-600', tint: 'bg-amber-50' }
  ];

  return (
    <PublicLayout
      topSlot={(
        <section className="w-full border-b border-white/10 bg-[linear-gradient(90deg,#071425_0%,#0A2540_50%,#11345e_100%)] text-white">
          <div className="mx-auto flex max-w-[1500px] flex-col gap-2 px-4 py-2 sm:px-5 sm:py-2.5 lg:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-sky-100">
                <Ship className="h-3.5 w-3.5 text-[#E5A93D]" />
                Live workspace preview
              </div>
              <div className="flex flex-wrap gap-2 text-[10px] font-bold text-sky-100/80">
                <span className="rounded-full bg-white/8 px-3 py-1">Chat</span>
                <span className="rounded-full bg-white/8 px-3 py-1">Docs</span>
                <span className="rounded-full bg-white/8 px-3 py-1">Shipping</span>
                <span className="rounded-full bg-white/8 px-3 py-1">Timeline</span>
              </div>
            </div>
            <div className="text-[11px] font-medium text-sky-100/72 sm:text-[12px]">
              One shared workspace for negotiation, documents, logistics, and deal visibility.
            </div>
          </div>
        </section>
      )}
    >
      <div className="space-y-8 pb-12 sm:space-y-10 sm:pb-14 lg:space-y-12 lg:pb-16">

        {/* --- SECTION 1: PIXEL-PERFECT HERO --- */}
        <section className="relative overflow-hidden rounded-[28px] px-4 pt-3 pb-6 text-white shadow-2xl sm:px-6 sm:pt-4 sm:pb-8 lg:min-h-[38vh] lg:rounded-[40px] lg:px-16 lg:pt-5 lg:pb-14"
          style={{
            background: `linear-gradient(rgba(10, 31, 56, 0.9), rgba(10, 31, 56, 0.4)), url(${heroShip})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(229,169,61,0.22),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.2),transparent_26%)] pointer-events-none" />
          <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <Reveal effect="up">
              <div className="relative max-w-4xl space-y-2.5 sm:space-y-4 lg:pr-6">
                <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.24em] text-white shadow-[0_0_30px_rgba(255,255,255,0.1)] backdrop-blur transition-all hover:bg-white/20 sm:px-5 sm:text-[10px] sm:tracking-[0.3em]">
                  <Ship className="h-4 w-4 text-[#E5A93D] drop-shadow-[0_0_10px_rgba(229,169,61,0.8)] animate-pulse" />
                  <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent drop-shadow-sm">Global Trade OS</span>
                </div>
                <h1 className="max-w-3xl text-[1.95rem] font-black leading-[0.95] tracking-tight drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] sm:text-5xl lg:text-[3.35rem]">
                  Stop losing deals to <br className="hidden sm:block" />
                  <span className="bg-gradient-to-r from-[#E5A93D] via-[#fcd34d] to-[#E5A93D] bg-[length:200%_auto] bg-clip-text text-transparent inline-block animate-float-slow transition-transform duration-700 hover:scale-[1.03] hover:drop-shadow-[0_0_35px_rgba(229,169,61,0.5)]">miscommunication.</span>
                </h1>
                <p className="max-w-2xl text-[14px] font-medium leading-relaxed text-slate-100 sm:text-xl lg:text-[1.1rem]">
                  Trade smarter. Close faster.
                </p>
                <div className="flex flex-col gap-1.5 text-sm font-bold sm:gap-2.5 sm:text-base lg:text-[14px]">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#E5A93D]" />
                    <span>Centralized communication</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#E5A93D]" />
                    <span>Full deal visibility</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#E5A93D]" />
                    <span>Integrated shipping & documents</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2.5 pt-1 sm:flex-row sm:flex-wrap sm:gap-4 sm:pt-3">
                  <button onClick={() => navigate('/login')} className="group relative w-full overflow-hidden rounded-2xl border border-white/20 bg-white/10 px-6 py-3 font-black text-white backdrop-blur transition-all hover:-translate-y-1 hover:bg-white/20 hover:shadow-[0_15px_30px_rgba(255,255,255,0.1)] sm:w-auto sm:px-8 sm:py-4">
                    <div className="absolute inset-0 translate-y-full bg-white/10 transition-transform duration-300 group-hover:translate-y-0" />
                    <span className="relative z-10 flex items-center justify-center gap-2">Log In</span>
                  </button>
                  <button onClick={() => navigate('/login')} className="group relative w-full overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#E5A93D,#FF8A00)] px-6 py-3 font-black text-[#0A2540] shadow-[0_10px_35px_rgba(229,169,61,0.4)] transition-all hover:-translate-y-1 sm:w-auto sm:px-10 sm:py-4">
                    <div className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 group-hover:translate-y-0" />
                    <span className="relative z-10 flex items-center justify-center gap-2">Start Trading <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" /></span>
                  </button>
                </div>
                <div className="flex flex-col gap-2 border-t border-white/10 pt-2 text-[11px] font-bold text-slate-200/90 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 sm:pt-3">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-[#E5A93D] text-[#E5A93D]" />
                    4.9/5 team satisfaction
                  </div>
                  <div>92% faster document alignment</div>
                  <div>Used across 30+ trade corridors</div>
                </div>
              </div>
            </Reveal>

          </div>

          {/* Stats Bar */}
          <div className="relative mt-5 left-0 right-0 sm:mt-6 lg:mt-8">
            <Reveal delay={400} effect="zoom">
              <div className="relative mx-auto grid max-w-6xl grid-cols-1 overflow-hidden rounded-[24px] border border-white/40 bg-white/80 p-1.5 shadow-[0_30px_70px_rgba(0,0,0,0.3)] backdrop-blur-3xl transition-colors duration-500 hover:border-white/60 md:grid-cols-3">
                <div className="absolute left-1/4 top-0 h-px w-1/2 animate-shimmer bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
                {[
                  { label: 'Active Deals', value: '24' },
                  { label: 'Bids Won', value: '8' },
                  { label: 'Shipments in Transit', value: '12' },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col items-start justify-center rounded-[20px] border-b border-slate-100/50 px-4 py-2.5 last:border-b-0 md:border-b-0 md:border-r md:px-8 md:py-3.5 md:last:border-r-0 transition-colors cursor-default hover:bg-slate-50/50">
                    <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#245c9d] mb-0.5">{s.label}</span>
                    <span className="text-2xl font-black text-[#0A2540] tracking-tight leading-none sm:text-3xl">{s.value}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="relative z-20 overflow-hidden rounded-[40px] border border-white/80 bg-[linear-gradient(180deg,#ffffff_0%,#f0f7ff_100%)] px-6 py-8 shadow-[0_30px_90px_rgba(10,37,64,0.1)] sm:px-10 lg:px-16 lg:py-10 lg:pb-12 lg:overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.1),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(229,169,61,0.08),transparent_30%)]" />

          <div className="relative flex h-full flex-col gap-1 lg:gap-1.5">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
              <Reveal effect="up">
                <div className="max-w-3xl space-y-1.5">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#cfe0f2] bg-white px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-[#245c9d]">
                    <Ship className="h-3 w-3 text-[#E5A93D]" />
                    Trade OS
                  </div>
                  <h1 className="text-[1.45rem] font-black leading-[0.92] tracking-tight text-[#071A31] lg:text-[2.15rem]">
                    Live Deal Workspace.
                    <br />
                    {/* <span className="bg-gradient-to-r from-[#143A6A] via-[#245c9d] to-[#3B82F6] bg-clip-text text-transparent">
                      Bigger. Clearer. More 3D.
                    </span> */}
                  </h1>
                  {/* <p className="max-w-[56ch] text-[11px] font-medium leading-4.5 text-slate-600 lg:text-[12px]">
                    Consolidate global trade into one professional hub. Keep conversations, documents, shipping, and deal progress visible in one place.
                  </p> */}
                </div>
              </Reveal>

              <button
                onClick={() => navigate('/login')}
                className="group inline-flex h-fit items-center gap-2 rounded-xl bg-[#0A2540] px-4 py-2 text-[13px] font-black text-white shadow-lg transition hover:-translate-y-1"
              >
                Start now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            <div className="rounded-[22px] border border-slate-200/80 bg-white/72 px-3 py-1.5 shadow-sm backdrop-blur">
              <div className="grid gap-1.5 sm:grid-cols-5 sm:gap-2">
                {timelineSteps.map((step, idx) => (
                  <div key={step.label} className="flex items-center gap-3">
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-black ${
                        step.status === 'completed'
                          ? 'bg-[#245c9d] text-white'
                          : step.status === 'current'
                            ? 'bg-white text-[#245c9d] ring-2 ring-indigo-100'
                            : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {step.status === 'completed' ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
                    </div>
                    <div className="min-w-0">
                      <span
                        className={`block text-[9px] font-black uppercase tracking-[0.22em] ${
                          step.status === 'completed' || step.status === 'current' ? 'text-[#0A2540]' : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </span>
                      <span className="mt-0.5 block text-[9px] text-slate-500">
                        {step.status === 'completed' ? 'Done' : step.status === 'current' ? 'Live now' : 'Next up'}
                      </span>
                    </div>
                    {idx < timelineSteps.length - 1 ? <div className="hidden h-px flex-1 bg-slate-200 sm:block" /> : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {platformFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="rounded-[18px] border border-slate-200/80 bg-white/92 p-2 shadow-[0_12px_30px_rgba(10,37,64,0.06)] transition-colors hover:bg-white"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${feature.tint} ring-1 ring-slate-100`}>
                        <Icon className={`h-3.5 w-3.5 ${feature.accent}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#0A2540]">{feature.title}</p>
                        <p className="mt-0.5 text-[8px] leading-3.5 text-slate-500">{feature.copy}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid flex-1 items-center gap-4 lg:grid-cols-[1fr_1fr] lg:gap-8">
              <Reveal effect="up">
                <div className="space-y-2.5 lg:pr-2">
                  <div className="grid gap-2 sm:grid-cols-3">
                    {[
                      { value: '120+', label: 'Ports connected' },
                      { value: '99.9%', label: 'Workspace uptime' },
                      { value: '30+', label: 'Trade corridors' }
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-[22px] border border-slate-200/80 bg-white px-6 py-5 shadow-[0_12px_30px_rgba(10,37,64,0.06)]">
                        <p className="text-[28px] font-black leading-none text-[#071A31]">{stat.value}</p>
                        <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-[24px] border border-[#dbe7f5] bg-white/90 p-6 shadow-[0_18px_50px_rgba(10,37,64,0.06)]">
                    <div className="flex items-center gap-3 text-[13px] font-black uppercase tracking-[0.2em] text-[#245c9d]">
                      <Globe2 className="h-4 w-4 text-[#E5A93D]" />
                      Why it works
                    </div>
                    <div className="mt-4 space-y-2.5">
                      {[
                        'Centralized communication',
                        'Full deal visibility',
                        'Integrated shipping and documents'
                      ].map((item) => (
                        <div key={item} className="flex items-start gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#245c9d]" />
                          <p className="text-[14px] font-bold text-slate-700">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-0.5">
                    <button
                      onClick={() => navigate('/products')}
                      className="group inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#E5A93D,#FF8A00)] px-4 py-2 text-[13px] font-black text-[#0A2540] shadow-[0_10px_35px_rgba(229,169,61,0.35)] transition hover:-translate-y-1"
                    >
                      Start trading
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>
                    <div className="text-[10px] font-medium text-slate-500">Built to keep the whole deal on one screen.</div>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={150} effect="zoom">
                <div className="flex justify-center lg:justify-end lg:pl-1">
                  <WorkspaceOrbitPreview />
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* --- SECTION 3: LIVE PRODUCT SHOWCASE --- */}
        <div className="relative z-0 mt-8 sm:mt-10 lg:mt-12">
          <Reveal effect="up">
          <ProductShowcaseCarousel />
          </Reveal>
        </div>

        {/* --- SECTION 4: TRUST SIGNALS --- */}
        <section className="relative overflow-hidden rounded-[30px] border border-white/5 bg-[#050e1c] py-8 shadow-[0_24px_72px_rgba(3,7,20,0.5)] sm:rounded-[40px] sm:py-10 animate-float-slow">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(30,64,175,0.15),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(229,169,61,0.08),transparent_40%)] pointer-events-none" />
          <div className="absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent animate-shimmer" />

          <Reveal effect="up">
            <div className="relative mx-auto mb-8 max-w-4xl px-4 text-center sm:px-6 lg:px-16">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.2)] backdrop-blur transition-all duration-700 hover:shadow-[0_0_25px_rgba(56,189,248,0.4)]">
                Trusted by Trade Leaders
              </div>
              <h2 className="mt-4 text-3xl font-black leading-[0.95] tracking-tight text-white lg:text-4xl">
                Proven across real deals, not just presentation screens
              </h2>
              <p className="mt-4 text-sm font-medium leading-relaxed text-slate-400 sm:text-base">
                Supply chain directors, shipping teams, and sourcing leads use TRADAFY to keep the entire deal thread visible.
              </p>
            </div>
          </Reveal>

          <div className="relative flex flex-col px-2 sm:px-4 lg:px-8">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#050e1c] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#050e1c] to-transparent" />

            <Marquee items={reviews} direction="left" speed="normal" className="py-2" />
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}

export default LandingPage;
