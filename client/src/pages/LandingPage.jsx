import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Globe,
  Ship,
  MapPin,
  Bell,
  Settings,
  MessageSquare,
  FileCheck,
  Star
} from 'lucide-react';
import heroShip from '../assets/hero-ship.png';
import bgNegotiation from '../assets/bg-negotiation.jpg';
import productPipesBulk from '../assets/product-pipes-bulk.jpg';
import productOilBulk from '../assets/product-oil-bulk.jpg';
import productSugarGemini from '../assets/product-sugar-gemini.png';
import productOliveGemini from '../assets/product-olive-gemini.png';
import productHealthBeautyA from '../assets/product-health-beauty-a.png';
import productHealthBeautyB from '../assets/product-health-beauty-b.png';
import productElectronicsBulk from '../assets/product-electronics-bulk.png';
import productApparelBulk from '../assets/product-apparel-bulk.png';
import productMetalsBulk from '../assets/product-metals-bulk.png';
import productHeavyMachineryBulk from '../assets/product-heavy-machinery-bulk.png';
import productHomewareBulk from '../assets/product-homeware-bulk.png';
import productAgriBulk from '../assets/product-agri-bulk.png';
import { PublicLayout, Reveal, Marquee } from '../components/ui';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const featuredProducts = [
  { id: 'sunflower-oil', name: 'Sunflower Oil', category: 'Food & Agriculture', img: productOilBulk, price: '$850 / MT', origin: 'Ukraine', moq: '500 MT' },
  { id: 'sugar-icumsa-45', name: 'Refined Sugar ICUMSA 45', category: 'Food & Agriculture', img: productSugarGemini, price: '$500 / MT', origin: 'Brazil', moq: '12,500 MT' },
  { id: 'agri-commodities', name: 'Agri Commodities Pack', category: 'Food & Agriculture', img: productAgriBulk, price: '$620 / MT', origin: 'India', moq: '800 MT' },
  { id: 'steel-pipes', name: 'Industrial Steel Pipes', category: 'Metals & Construction', img: productPipesBulk, price: '$1,200 / MT', origin: 'Germany', moq: '1,000 MT' },
  { id: 'metals-alloys', name: 'Metals & Alloy Inventory', category: 'Metals & Construction', img: productMetalsBulk, price: '$1,480 / MT', origin: 'Turkey', moq: '2,000 MT' },
  { id: 'heavy-machinery', name: 'Heavy Machinery Systems', category: 'Industrial Equipment', img: productHeavyMachineryBulk, price: '$18,000 / unit', origin: 'Japan', moq: '10 Units' },
  { id: 'consumer-electronics', name: 'Consumer Electronics Lots', category: 'Electronics', img: productElectronicsBulk, price: '$95 / unit', origin: 'Shenzhen', moq: '2,500 Units' },
  { id: 'bulk-apparel', name: 'Bulk Apparel & Fabrics', category: 'Textiles & Apparel', img: productApparelBulk, price: '$14 / piece', origin: 'Bangladesh', moq: '20,000 Pieces' },
  { id: 'homeware-export', name: 'Homeware Export Collection', category: 'Home & Kitchen', img: productHomewareBulk, price: '$22 / set', origin: 'Vietnam', moq: '3,000 Sets' },
  { id: 'personal-care-bulk', name: 'Personal Care Bulk Essentials', category: 'Health & Beauty', img: productHealthBeautyB, price: '$4.80 / unit', origin: 'UAE', moq: '10,000 Units' },
  { id: 'olive-oil', name: 'Extra Virgin Olive Oil', category: 'Food & Agriculture', img: productOliveGemini, price: '$3,200 / MT', origin: 'Spain', moq: '100 MT' },
];

// --- SUB-COMPONENTS FOR PIXEL-PERFECT SECTIONS ---

const DashboardMock = () => (
  <div className="relative overflow-hidden rounded-[28px] border border-white/20 bg-[linear-gradient(180deg,#fdfefe_0%,#f4f8fd_100%)] shadow-[0_0_80px_rgba(10,37,64,0.3)] animate-in-up hover-lift transition-all duration-[800ms] ease-out hover:-translate-y-4 hover:shadow-[0_30px_100px_rgba(59,130,246,0.25)]">
    <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/50 to-transparent opacity-0 transition-opacity duration-1000 group-hover:opacity-100" />
    <div className="bg-[linear-gradient(135deg,#0A2540_0%,#143A6A_68%,#245c9d_100%)] px-4 py-3 text-white">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 shadow-lg">
            <Ship className="h-4 w-4 text-blue-100" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[7px] font-black uppercase tracking-[0.2em] text-sky-100">
              Live Deal Workspace
            </div>
            <h4 className="mt-1.5 text-[15px] font-black tracking-tight">Sunflower Oil to Dubai</h4>
            <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.18em] text-sky-100/70">DEAL-0921-X • 2,500 MT • Bidding Open</p>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-right">
          <div className="text-[8px] font-black uppercase tracking-[0.16em] text-sky-100/70">Next milestone</div>
          <div className="mt-0.5 text-[11px] font-black text-white">Selection in 6h</div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 text-[8px] font-black uppercase tracking-[0.16em] text-sky-100/75">
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-white">Chat</span>
        <span className="rounded-full bg-white/6 px-2.5 py-1">Docs</span>
        <span className="rounded-full bg-white/6 px-2.5 py-1">Shipping</span>
        <span className="rounded-full bg-white/6 px-2.5 py-1">Finance</span>
      </div>
    </div>

    <div className="grid gap-0 xl:grid-cols-[0.38fr_0.62fr]">
      <div className="border-r border-slate-100 bg-[linear-gradient(180deg,#f8fbff_0%,#f3f7fc_100%)] p-3.5">
        <div className="mb-2.5 flex items-center justify-between">
          <h5 className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Carrier Market</h5>
          <span className="rounded-full bg-[#eaf3ff] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-[#245c9d]">8 bids</span>
        </div>
        <div className="space-y-2">
          {[
            { name: 'Maersk Logistics', price: '$118 / MT', status: 'Best value' },
            { name: 'MSC Shipping', price: '$124 / MT', status: 'Fastest lane' },
            { name: 'Evergreen Line', price: '$129 / MT', status: 'Docs included' }
          ].map((bid, i) => (
            <div key={bid.name} className={`rounded-[18px] border p-2.5 shadow-sm ${i === 0 ? 'border-[#b8d0eb] bg-white' : 'border-slate-100 bg-white/90'}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[#0A2540]">{bid.name}</p>
                  <p className="mt-0.5 text-[8px] font-bold text-slate-400">{bid.status}</p>
                </div>
                <div className="rounded-full bg-slate-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-[#143A6A]">
                  {bid.price}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-2.5 rounded-[20px] border border-[#dbe6f2] bg-white p-3">
          <div className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400">Lane Summary</div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-[8px] font-bold text-slate-500">
            <div className="rounded-2xl bg-slate-50 px-2.5 py-2">Origin: Odesa</div>
            <div className="rounded-2xl bg-slate-50 px-2.5 py-2">To: Jebel Ali</div>
            <div className="rounded-2xl bg-slate-50 px-2.5 py-2">Mode: Sea</div>
            <div className="rounded-2xl bg-slate-50 px-2.5 py-2">ETA: 19 Days</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F0F7FF] ring-1 ring-blue-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#143A6A] text-[10px] font-black text-white shadow-lg">JD</div>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
            </div>
            <div>
              <p className="text-[12px] font-black text-[#0A2540]">John Doe • Freight Desk</p>
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">Live negotiation</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <MessageSquare className="h-4 w-4" />
            <Bell className="h-4 w-4" />
            <Settings className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-3 rounded-[22px] border border-slate-100 bg-[linear-gradient(180deg,#fbfdff_0%,#f5f9fd_100%)] p-3.5 shadow-inner">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400">Chat Feed</p>
              <p className="mt-1 text-[12px] font-black text-[#0A2540]">High-context coordination</p>
            </div>
            <div className="rounded-full bg-[#eaf3ff] px-3 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-[#245c9d]">
              Synced live
            </div>
          </div>

          <div className="mt-2.5 space-y-2">
            {[
              { sender: 'Buyer', body: 'Please confirm the best vessel option with a 19-day transit window.', tone: 'bg-white border-slate-100 text-slate-700' },
              { sender: 'Supplier', body: 'Cargo is ready on April 12. Export docs and packing list are already uploaded.', tone: 'bg-[#eef6ff] border-blue-100 text-[#143A6A]' },
              { sender: 'Shipping Agent', body: 'Maersk and MSC are both live. Best value bid is now visible for approval.', tone: 'bg-[#0A2540] border-[#0A2540] text-white' }
            ].map((message) => (
              <div key={message.body} className={`rounded-[18px] border px-3 py-2.5 ${message.tone}`}>
                <div className="text-[8px] font-black uppercase tracking-[0.16em] opacity-70">{message.sender}</div>
                <p className="mt-1 text-[12px] font-semibold leading-4.5">{message.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {[
            { label: 'Documents', value: '12 verified files' },
            { label: 'Transport bids', value: '3 shortlisted' },
            { label: 'Shipment status', value: 'Ready for award' }
          ].map((item) => (
            <div key={item.label} className="rounded-[18px] border border-slate-100 bg-[linear-gradient(180deg,#ffffff_0%,#f6f9fd_100%)] px-3 py-2.5">
              <div className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400">{item.label}</div>
              <div className="mt-1 text-[12px] font-black text-[#0A2540]">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

function LandingPage() {
  const { user } = useAuth();
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

  return (
    <PublicLayout>
      <div className="space-y-10 pb-20 sm:space-y-14 sm:pb-24 lg:space-y-16 lg:pb-32">

        {/* --- SECTION 1: PIXEL-PERFECT HERO --- */}
        <section className="relative flex min-h-[55vh] lg:min-h-[60vh] flex-col justify-start overflow-hidden rounded-[28px] px-4 pt-8 pb-24 text-white shadow-2xl sm:px-6 sm:pt-10 sm:pb-28 lg:rounded-[40px] lg:px-20 lg:pt-10 lg:pb-28"
          style={{
            background: `linear-gradient(rgba(10, 31, 56, 0.9), rgba(10, 31, 56, 0.4)), url(${heroShip})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(229,169,61,0.22),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.2),transparent_26%)] pointer-events-none" />
          <Reveal effect="up">
            <div className="relative max-w-4xl space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.24em] text-white shadow-[0_0_30px_rgba(255,255,255,0.1)] backdrop-blur transition-all hover:bg-white/20 sm:px-5 sm:text-[10px] sm:tracking-[0.3em]">
                <Ship className="h-4 w-4 text-[#E5A93D] drop-shadow-[0_0_10px_rgba(229,169,61,0.8)] animate-pulse" />
                <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent drop-shadow-sm">Global Trade OS</span>
              </div>
              <h1 className="text-4xl font-black leading-[0.95] tracking-tight drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] sm:text-5xl lg:text-[4.5rem]">
                Stop losing deals to <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-[#E5A93D] via-[#fcd34d] to-[#E5A93D] bg-[length:200%_auto] bg-clip-text text-transparent inline-block animate-float-slow transition-transform duration-700 hover:scale-[1.03] hover:drop-shadow-[0_0_35px_rgba(229,169,61,0.5)]">miscommunication.</span>
              </h1>
              <p className="max-w-2xl text-lg font-medium leading-relaxed text-slate-100 sm:text-xl lg:text-2xl">
                "Trade smarter. Close faster."
              </p>
              <div className="flex flex-col gap-2.5 text-sm font-bold sm:gap-4 sm:text-base lg:text-lg">
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
              <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:flex-wrap sm:gap-4 sm:pt-5">
                <button onClick={() => navigate('/login')} className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 px-6 py-3 font-black text-white backdrop-blur transition-all hover:-translate-y-1 hover:bg-white/20 hover:shadow-[0_15px_30px_rgba(255,255,255,0.1)] sm:px-8 sm:py-4">
                  <div className="absolute inset-0 translate-y-full bg-white/10 transition-transform duration-300 group-hover:translate-y-0" />
                  <span className="relative z-10 flex items-center justify-center gap-2">Log In</span>
                </button>
                <button onClick={() => navigate('/login')} className="group relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#E5A93D,#FF8A00)] px-6 py-3 font-black text-[#0A2540] shadow-[0_10px_35px_rgba(229,169,61,0.4)] transition-all hover:-translate-y-1 sm:px-10 sm:py-4">
                  <div className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 group-hover:translate-y-0" />
                  <span className="relative z-10 flex items-center justify-center gap-2">Start Trading <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" /></span>
                </button>
              </div>
              <div className="flex flex-col gap-2 border-t border-white/10 pt-4 text-[13px] font-bold text-slate-200/90 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6 sm:pt-5">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-[#E5A93D] text-[#E5A93D]" />
                  4.9/5 team satisfaction
                </div>
                <div>92% faster document alignment</div>
                <div>Used across 30+ trade corridors</div>
              </div>
            </div>
          </Reveal>

          {/* Stats Bar */}
          <div className="absolute bottom-3 left-4 right-4 sm:bottom-4 sm:left-8 sm:right-8 lg:bottom-5 lg:left-16 lg:right-16">
            <Reveal delay={400} effect="zoom">
              <div className="relative mx-auto grid max-w-4xl grid-cols-1 overflow-hidden rounded-[24px] border border-white/40 bg-white/80 p-1.5 shadow-[0_30px_70px_rgba(0,0,0,0.3)] backdrop-blur-3xl transition-colors duration-500 hover:border-white/60 md:grid-cols-3">
                <div className="absolute left-1/4 top-0 h-px w-1/2 animate-shimmer bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
                {[
                  { label: 'Active Deals', value: '24' },
                  { label: 'Bids Won', value: '8' },
                  { label: 'Shipments in Transit', value: '12' },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col justify-center items-start rounded-[20px] border-b border-slate-100/50 px-5 py-2.5 last:border-b-0 md:border-b-0 md:border-r md:px-8 md:py-3.5 md:last:border-r-0 transition-colors cursor-default hover:bg-slate-50/50">
                    <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#245c9d] mb-0.5">{s.label}</span>
                    <span className="text-3xl font-black text-[#0A2540] tracking-tight leading-none">{s.value}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* --- SECTION 2: DISCOVER OPPORTUNITIES (MOVED & BACKGROUND APPLIED) --- */}
        <section className="relative overflow-hidden rounded-[30px] px-4 py-7 text-white shadow-2xl sm:px-6 sm:py-8 lg:rounded-[36px] lg:px-14 lg:py-9"
          style={{
            background: `linear-gradient(rgba(10, 31, 56, 0.85), rgba(20, 58, 106, 0.7)), url(${bgNegotiation})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(229,169,61,0.25),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.15),transparent_30%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
          <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 animate-float-slow rounded-full bg-[#E5A93D]/20 blur-[100px]" />
          <div className="relative grid gap-5 xl:grid-cols-[0.9fr_1.1fr] items-center">
            <div className="space-y-4.5">
              <Reveal effect="right">
                <div className="space-y-2.5">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.22em] text-sky-100">
                    Market Clarity
                  </div>
                  <h2 className="text-[30px] font-black text-white tracking-tight leading-[0.95] lg:text-[2.2rem]">Discover real trade opportunities</h2>
                  <p className="max-w-2xl text-[13px] font-semibold leading-5 text-sky-100/85 lg:text-[15px]">Live products from <span className="text-white border-b-2 border-[#E5A93D]">verified suppliers</span>, organized into one buyer-friendly trade command surface.</p>
                </div>
              </Reveal>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {[
                  { title: 'Without structure', tone: 'text-rose-200', icon: XCircle, items: ['Scattered emails', 'Lost documents', 'Slow approvals'] },
                  { title: 'With TRADAFY', tone: 'text-emerald-300', icon: CheckCircle2, items: ['One shared workspace', 'Transport bidding built in', 'Real-time shipment context'] }
                ].map((group, index) => (
                  <Reveal key={group.title} delay={200 + index * 160} effect="up">
                    <div className="rounded-[22px] border border-white/10 bg-white/10 p-3.5 backdrop-blur-md shadow-xl">
                      <h3 className={`text-[11px] font-black uppercase tracking-[0.16em] ${group.tone}`}>{group.title}</h3>
                      <div className="mt-2.5 space-y-2">
                        {group.items.map((item) => (
                          <div key={item} className="flex items-center gap-2.5 rounded-2xl bg-white/6 px-3 py-2 text-[12px] font-bold text-white/90">
                            <group.icon className={`h-3.5 w-3.5 ${index === 0 ? 'text-rose-300' : 'text-emerald-400'}`} />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-2">
                {[
                  { value: '150+', label: 'Verified suppliers' },
                  { value: '32', label: 'Trade corridors' },
                  { value: '24/7', label: 'Workspace visibility' }
                ].map((item) => (
                  <div key={item.label} className="rounded-[20px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent)] px-5 py-4 backdrop-blur shadow-xl">
                    <div className="text-3xl font-black text-white">{item.value}</div>
                    <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-amber-300/90">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <Reveal delay={600} effect="zoom">
              <div className="space-y-2.5">
                <DashboardMock />
                <div className="grid gap-2 sm:grid-cols-3">
                  {[
                    { label: 'Product match', value: 'Sunflower Oil / 2,500 MT' },
                    { label: 'Carrier market', value: '8 live shipping bids' },
                    { label: 'Execution status', value: 'Docs and shipment aligned' }
                  ].map((card) => (
                    <div key={card.label} className="rounded-[18px] border border-white/10 bg-white/10 px-3 py-2.5 text-left backdrop-blur">
                      <div className="text-[8px] font-black uppercase tracking-[0.16em] text-sky-100/70">{card.label}</div>
                      <div className="mt-1 text-[12px] font-black text-white">{card.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* --- SECTION 3: MARKETPLACE CTA --- */}
        <section className="px-0 pt-1 pb-10 sm:px-1 lg:px-16">
          <Reveal effect="up">
            <div className="relative overflow-hidden rounded-[36px] border border-blue-100 bg-[linear-gradient(135deg,#f0f7ff,#e8f2ff)] px-8 py-12 text-center shadow-[0_24px_60px_rgba(20,58,106,0.10)] lg:px-16 lg:py-16">
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#245c9d]/10 blur-[80px]" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-[#E5A93D]/10 blur-[60px]" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#143A6A] shadow-sm">
                  <Globe className="h-3.5 w-3.5" /> Direct Bulk Sourcing
                </div>
                <h2 className="mt-5 text-3xl font-black tracking-tight text-[#0A2540] md:text-4xl lg:text-[2.6rem]">
                  Bulk Shipping
                  <span className="block text-[#143A6A]/40">Live Marketplace</span>
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                  Real products from verified suppliers — search, filter by sector, and open a deal workspace instantly.
                </p>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <button
                    onClick={() => navigate('/products')}
                    className="group relative flex items-center gap-2 overflow-hidden rounded-2xl border border-blue-900 bg-[linear-gradient(135deg,#0A2540,#143A6A)] px-8 py-3.5 text-sm font-black text-white shadow-[0_10px_30px_rgba(20,58,106,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(20,58,106,0.5)]"
                  >
                    <div className="absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] group-hover:animate-[shimmer_1.5s_infinite]" />
                    <span className="relative z-10 flex items-center gap-2">VIEW LIVE MARKETPLACE <ArrowRight className="h-4 w-4 text-sky-400 transition-transform group-hover:translate-x-1" /></span>
                  </button>
                  <button
                    onClick={() => navigate(user ? '/dashboard' : '/register')}
                    className="rounded-2xl border border-blue-200 bg-white px-8 py-3.5 text-sm font-bold text-[#143A6A] shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50"
                  >
                    {user ? 'Go to Dashboard' : 'Start Free'}
                  </button>
                </div>

                {/* Stat pills */}
                <div className="mx-auto mt-8 flex flex-wrap justify-center gap-3">
                  {[
                    { value: '12+', label: 'High-trust sectors' },
                    { value: '40K+', label: 'Units listed' },
                    { value: '28', label: 'Export destinations' },
                    { value: '1', label: 'Shared workspace' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-2xl border border-blue-100 bg-white px-4 py-2.5 shadow-sm">
                      <div className="text-base font-black text-[#0A2540]">{s.value}</div>
                      <div className="mt-0.5 text-[8px] font-black uppercase tracking-[0.14em] text-slate-400">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* --- SECTION 6: MOVING REVIEWS --- */}
        <section className="relative overflow-hidden rounded-[30px] border border-white/5 bg-[#050e1c] py-10 shadow-[0_24px_72px_rgba(3,7,20,0.5)] sm:rounded-[40px] sm:py-14 animate-float-slow">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(30,64,175,0.15),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(229,169,61,0.08),transparent_40%)] pointer-events-none" />
          <div className="absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent animate-shimmer" />

          <Reveal effect="up">
            <div className="relative mx-auto mb-10 max-w-4xl px-4 text-center sm:px-6 lg:px-16">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.2)] backdrop-blur transition-all duration-700 hover:shadow-[0_0_25px_rgba(56,189,248,0.4)]">
                Trusted by Trade Leaders
              </div>
              <h2 className="mt-4 text-3xl font-black leading-[0.95] tracking-tight text-white lg:text-4xl">
                Proven across $2B+ in executed trade deals
              </h2>
              <p className="mt-4 text-sm font-medium leading-relaxed text-slate-400 sm:text-base cursor-default hover:text-slate-300 transition-colors">
                Supply chain directors, shipping agents, and procurement heads across 30+ countries use TRADAFY to move physical commodities with complete clarity.
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
