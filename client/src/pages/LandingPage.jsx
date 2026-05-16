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

// Mobile card grid shown instead of the 3D orbit on small screens
function FeatureCardGrid() {
  return (
    <div className="w-full">
      {/* Central hub banner */}
      <div className="mb-4 flex items-center justify-center">
        <div className="flex items-center gap-3 rounded-[20px] border border-slate-200 bg-[#081224] px-5 py-3 shadow-[0_8px_32px_rgba(8,18,36,0.5),0_0_0_1px_rgba(255,255,255,0.08),0_0_24px_rgba(132,93,255,0.3)]">
          <div className="overflow-hidden rounded-full shadow-[0_0_14px_rgba(180,140,255,0.7),0_0_0_2px_rgba(180,140,255,0.2)]" style={{ width: 36, height: 36 }}>
            <img src={tradafyLogo} alt="Tradafy" className="h-full w-full object-cover" draggable="false" />
          </div>
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-purple-300">Tradafy OS</div>
            <div className="text-[13px] font-black tracking-[0.12em] text-white leading-tight">LIVE DEAL WORKSPACE</div>
          </div>
        </div>
      </div>
      {/* 2-column card grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {orbitCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="relative overflow-hidden rounded-[18px] border border-slate-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(247,250,255,0.96)_100%)] p-3 shadow-[0_8px_24px_rgba(10,37,64,0.10)] ring-1 ring-white/70">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-sky-300 to-transparent opacity-80" />
              <div className={`mb-2.5 flex h-10 w-10 items-center justify-center rounded-[14px] bg-gradient-to-br ${card.tint} ring-1 ring-slate-100 shadow-[0_4px_12px_rgba(10,37,64,0.10)]`}>
                <Icon className={`h-5 w-5 ${card.accent}`} />
              </div>
              <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[#0A2540] leading-tight">{card.title}</p>
              <p className="mt-1 text-[8.5px] font-medium leading-[1.4] text-slate-500">{card.copy}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WorkspaceOrbitPreview() {
  const [phase, setPhase] = useState(0);
  const [containerWidth, setContainerWidth] = useState(500);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = React.useRef(null);

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

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // On mobile, show the card grid instead of the animated canvas
  if (isMobile) {
    return <FeatureCardGrid />;
  }

  // Compact orbit — 550px reference container
  const baseOrbitRadius    = 230;
  const baseContainerSize  = 550;
  const baseCenterSize     = 150;
  const baseCardWidth      = 140;
  const baseCardHeight     = 105;
  const baseIconSize       = 40;

  const scale = Math.min(1.15, Math.max(0.55, containerWidth / baseContainerSize));

  const orbitRadius = baseOrbitRadius * scale;
  const centerSize  = baseCenterSize * scale;
  const cardWidth   = baseCardWidth * scale;
  const cardHeight  = baseCardHeight * scale;
  const iconSize    = baseIconSize * scale;

  const cards = orbitCards.map((card, index) => {
    const baseAngle = (index * (Math.PI * 2)) / orbitCards.length;
    const currentAngle = baseAngle + phase * 0.065;
    const depthAmp = 40 * scale;
    const depth = Math.sin(currentAngle) * depthAmp;
    // depth-based opacity/shadow only — cards stay the SAME size so
    // every card is at an equal visual distance from the hub
    const depthT = (depth + depthAmp) / (depthAmp * 2); // 0..1
    return {
      ...card,
      x: Math.cos(currentAngle) * orbitRadius,
      y: Math.sin(currentAngle) * orbitRadius * 0.72,
      z: depth,
      depthT,           // used for opacity/shadow only
      angle: currentAngle
    };
  });

  // Canvas = diameter of orbit circle + one card-half on each edge + a little breathing room
  const canvasSize = (orbitRadius + cardWidth * 0.6 + 20) * 2;

  return (
    <div
      ref={containerRef}
      className="w-full"
      style={{ isolation: 'isolate' }}
    >
      {/* Fixed-height canvas centred in parent */}
      <div
        className="relative mx-auto flex items-center justify-center"
        style={{ width: canvasSize, height: canvasSize, maxWidth: '100%' }}
      >
        {/* Connector bars */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0" style={{ zIndex: 0 }}>
          {cards.map((card, index) => {
            const rotation = (card.angle * 180) / Math.PI;
            // hubRadius: from center to hub edge (inset 4px so bar starts inside hub border)
            const hubInset = Math.max(4, 5 * scale);
            const hubRadius = centerSize / 2 - hubInset;
            // len: from hub edge to card center — always exactly orbitRadius - hubRadius
            const len = orbitRadius - hubRadius;
            // Depth T drives opacity for 3D feel without changing geometry
            const lineOpacity = 0.35 + card.depthT * 0.3;
            return (
              <div
                key={`bar-${index}`}
                className="absolute left-0 top-0 origin-left"
                style={{
                  height: `${Math.max(2, 2.5 * scale)}px`,
                  width: `${len}px`,
                  transform: `rotate(${rotation}deg) translateX(${hubRadius}px) translateY(-50%)`,
                  background: 'linear-gradient(90deg, rgba(99,168,255,0.9) 0%, rgba(59,130,246,0.55) 50%, rgba(59,130,246,0.05) 100%)',
                  boxShadow: `0 0 ${6 * scale}px rgba(99,168,255,0.35)`,
                  borderRadius: '999px',
                  opacity: lineOpacity,
                  zIndex: 0,
                }}
              />
            );
          })}
        </div>

        {/* Hub + cards layer */}
        <div
          className="absolute left-1/2 top-1/2 h-0 w-0"
          style={{ perspective: '1600px', transformStyle: 'preserve-3d', zIndex: 10 }}
        >
          {/* Central hub */}
          <div
            className="absolute left-0 top-0 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center bg-[#081224] shadow-[0_24px_60px_rgba(8,18,36,0.6),0_0_0_1px_rgba(255,255,255,0.08),0_0_48px_rgba(132,93,255,0.38)] pointer-events-auto"
            style={{
              width: centerSize,
              height: centerSize,
              zIndex: 20,
              borderRadius: `${36 * scale}px`,
              border: `1px solid #161f38`,
            }}
          >
            <div
              className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(119,79,255,0.38),transparent_48%),radial-gradient(circle_at_bottom,rgba(88,28,135,0.4),transparent_50%)]"
              style={{ borderRadius: `${36 * scale}px` }}
            />
            <div className="relative z-10 flex flex-col items-center text-center px-2">
              {/* Circular logo — clipped to circle, no background shape visible */}
              <div
                className="overflow-hidden rounded-full shadow-[0_0_22px_rgba(180,140,255,0.8),0_0_0_2px_rgba(180,140,255,0.25)]"
                style={{ width: iconSize * 1.3, height: iconSize * 1.3 }}
              >
                <img
                  src={tradafyLogo}
                  alt="Tradafy logo"
                  className="h-full w-full object-cover"
                  draggable="false"
                />
              </div>
              <div
                className="mt-2 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-black uppercase tracking-[0.16em] text-slate-300"
                style={{ fontSize: Math.max(6, 7.5 * scale) }}
              >
                Tradafy OS
              </div>
              <div className="mt-1 font-black tracking-[0.12em] text-white leading-tight" style={{ fontSize: Math.max(9, 12 * scale) }}>
                LIVE DEAL
              </div>
              <div className="font-black tracking-[0.12em] text-white/90" style={{ fontSize: Math.max(9, 12 * scale) }}>
                WORKSPACE
              </div>
            </div>
          </div>

          {/* Orbiting cards — fixed pixel size so every card is the same
               distance from the hub regardless of depth position */}
          {cards.map((card) => {
            const Icon = card.icon;
            // All cards are identical in size — depth only affects shadow/zIndex
            const shadowOpacity = 0.08 + card.depthT * 0.18;
            const glowOpacity   = 0.3  + card.depthT * 0.15;
            return (
              <div
                key={card.title}
                className="absolute left-0 top-0 pointer-events-auto"
                style={{
                  // No scale() transform — keeps all cards the same visual size
                  transform: `translate3d(${card.x}px, ${card.y}px, ${card.z}px)`,
                  transformStyle: 'preserve-3d',
                  width: `${cardWidth}px`,
                  zIndex: Math.round(200 + card.z * 2),
                }}
              >
                <div className="group relative cursor-default -translate-x-1/2 -translate-y-1/2">
                  {/* Drop shadow blob */}
                  <div
                    className="absolute inset-x-2 -bottom-1 rounded-[18px] bg-slate-900/20 blur-xl"
                    style={{ height: cardHeight * 0.3, opacity: shadowOpacity }}
                  />
                  <div
                    className="relative flex flex-col items-center justify-center overflow-hidden rounded-[20px] border border-slate-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.99)_0%,rgba(245,250,255,0.97)_100%)] ring-1 ring-white/80 backdrop-blur-md transition-all duration-500 group-hover:-translate-y-1.5 group-hover:shadow-[0_20px_50px_rgba(10,37,64,0.18)]"
                    style={{
                      height: cardHeight,
                      width: cardWidth,
                      boxShadow: `0 ${8 + card.depthT * 12}px ${20 + card.depthT * 24}px rgba(10,37,64,${shadowOpacity})`,
                    }}
                  >
                    <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-sky-300 to-transparent opacity-90" />
                    <div className="flex flex-col items-center text-center gap-2 px-2.5">
                      <div
                        className={`flex items-center justify-center rounded-[15px] bg-gradient-to-br ${card.tint} ring-1 ring-slate-100`}
                        style={{
                          width:  Math.round(40 * scale),
                          height: Math.round(40 * scale),
                          boxShadow: `0 4px 14px rgba(10,37,64,${glowOpacity})`,
                        }}
                      >
                        <Icon
                          style={{ width: Math.round(20 * scale), height: Math.round(20 * scale) }}
                          className={card.accent}
                        />
                      </div>
                      <div className="px-0.5">
                        <p
                          style={{ fontSize: Math.round(Math.max(8, 10 * scale)) }}
                          className="font-black uppercase tracking-[0.1em] text-[#0A2540] leading-tight"
                        >
                          {card.title}
                        </p>
                        <p
                          style={{ fontSize: Math.round(Math.max(7, 8.5 * scale)) }}
                          className="mt-0.5 font-medium leading-[1.35] text-slate-500"
                        >
                          {card.copy}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
      <div className="space-y-4 pb-4 sm:space-y-5 sm:pb-5 lg:space-y-6 lg:pb-6">

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
                  <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent drop-shadow-sm">Deal Execution Platform</span>
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

        <section className="relative z-20 overflow-hidden rounded-[32px] border border-white/80 bg-[linear-gradient(180deg,#ffffff_0%,#f0f7ff_100%)] px-4 py-5 shadow-[0_20px_60px_rgba(10,37,64,0.08)] sm:px-8 lg:px-12 lg:py-6 lg:pb-7">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.1),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(229,169,61,0.08),transparent_30%)]" />

          <div className="relative flex h-full flex-col gap-3 lg:gap-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Reveal effect="up">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#cfe0f2] bg-white px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-[#245c9d]">
                    <Ship className="h-3 w-3 text-[#E5A93D]" />
                    Trade OS
                  </div>
                  <h2 className="text-[1.35rem] font-black leading-tight tracking-tight text-[#071A31] lg:text-[1.85rem]">
                    Live Deal Workspace.
                  </h2>
                </div>
              </Reveal>

              <button
                onClick={() => navigate('/login')}
                className="group inline-flex h-fit items-center gap-2 rounded-xl bg-[#0A2540] px-4 py-2 text-[12px] font-black text-white shadow-lg transition hover:-translate-y-1"
              >
                Start now
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            <div className="rounded-[18px] border border-slate-200/80 bg-white/72 px-3 py-2 shadow-sm backdrop-blur">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {timelineSteps.map((step, idx) => (
                  <div key={step.label} className={`flex items-center gap-2 ${idx === timelineSteps.length - 1 && 'col-span-2 sm:col-span-1'}`}>
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-black ${
                        step.status === 'completed'
                          ? 'bg-[#245c9d] text-white'
                          : step.status === 'current'
                            ? 'bg-white text-[#245c9d] ring-2 ring-indigo-100'
                            : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {step.status === 'completed' ? <CheckCircle2 className="h-3 w-3" /> : idx + 1}
                    </div>
                    <div className="min-w-0">
                      <span className={`block text-[8px] font-black uppercase tracking-[0.18em] ${
                        step.status === 'completed' || step.status === 'current' ? 'text-[#0A2540]' : 'text-slate-400'
                      }`}>{step.label}</span>
                      <span className="block text-[7px] text-slate-400">
                        {step.status === 'completed' ? 'Done' : step.status === 'current' ? 'Live' : 'Next'}
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
                    className="rounded-[16px] border border-slate-200/80 bg-white/92 px-3 py-2 shadow-[0_6px_18px_rgba(10,37,64,0.05)] transition-colors hover:bg-white"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${feature.tint} ring-1 ring-slate-100`}>
                        <Icon className={`h-3.5 w-3.5 ${feature.accent}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#0A2540]">{feature.title}</p>
                        <p className="text-[8px] leading-relaxed text-slate-500">{feature.copy}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[5fr_7fr] lg:items-center lg:gap-6">
              {/* Orbit/Card Grid — shows first on mobile */}
              <Reveal delay={150} effect="zoom" className="w-full order-first lg:order-last">
                <div className="flex w-full justify-center lg:justify-end">
                  <WorkspaceOrbitPreview />
                </div>
              </Reveal>

              {/* Stats + Why it works — shows second on mobile */}
              <Reveal effect="up" className="order-last lg:order-first">
                <div className="space-y-2.5 lg:pr-3">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: '120+', label: 'Ports connected' },
                      { value: '99.9%', label: 'Workspace uptime' },
                      { value: '30+', label: 'Trade corridors' }
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-[18px] border border-slate-200/80 bg-white px-3 py-3 shadow-[0_6px_18px_rgba(10,37,64,0.05)] text-center">
                        <p className="text-xl font-black leading-none text-[#071A31] sm:text-2xl">{stat.value}</p>
                        <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.14em] text-slate-400">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-[20px] border border-[#dbe7f5] bg-white/90 px-4 py-3 shadow-[0_8px_24px_rgba(10,37,64,0.05)]">
                    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#245c9d]">
                      <Globe2 className="h-4 w-4 text-[#E5A93D]" />
                      Why it works
                    </div>
                    <div className="mt-2.5 space-y-1.5">
                      {[
                        'Centralized communication',
                        'Full deal visibility',
                        'Integrated shipping and documents'
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#245c9d]" />
                          <p className="text-[12px] font-bold text-slate-700">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() => navigate('/products')}
                      className="group inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#E5A93D,#FF8A00)] px-5 py-2.5 text-[13px] font-black text-[#0A2540] shadow-[0_8px_24px_rgba(229,169,61,0.3)] transition hover:-translate-y-1"
                    >
                      Start trading
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>
                    <div className="text-[10px] font-medium text-slate-500">One screen. Every deal detail.</div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* --- SECTION 3: LIVE PRODUCT SHOWCASE --- */}
        <div className="relative z-0">
          <Reveal effect="up">
          <ProductShowcaseCarousel />
          </Reveal>
        </div>

        {/* --- SECTION 4: TRUST SIGNALS --- */}
        <section className="relative overflow-hidden rounded-[30px] border border-white/5 bg-[#050e1c] py-8 shadow-[0_24px_72px_rgba(3,7,20,0.5)] sm:rounded-[40px] sm:py-12 animate-float-slow">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(30,64,175,0.15),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(229,169,61,0.08),transparent_40%)] pointer-events-none" />
          <div className="absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent animate-shimmer" />

          <Reveal effect="up">
            <div className="relative mx-auto mb-10 max-w-4xl px-4 text-center sm:px-6 lg:px-16">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.2)] backdrop-blur transition-all duration-700 hover:shadow-[0_0_25px_rgba(56,189,248,0.4)]">
                Trusted by Trade Leaders
              </div>
              <h2 className="mt-5 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Proven across real deals, not just presentation screens
              </h2>
              <p className="mt-5 text-sm font-medium leading-relaxed text-slate-400 sm:text-lg">
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
