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
import { createDealFromProduct } from '../lib/tradafyData';
import { PublicLayout, Reveal, Marquee } from './ui';

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
  <div className="overflow-hidden rounded-[28px] border border-white/12 bg-[linear-gradient(180deg,#fdfefe_0%,#f4f8fd_100%)] shadow-[0_28px_64px_rgba(10,37,64,0.2)] animate-in-up">
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

function LandingPage({ currentUser, navigate }) {
  const openDealFromProduct = (productId) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    const deal = createDealFromProduct(productId, currentUser);
    if (deal) navigate(`/deal/${deal.id}`);
  };

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
    <PublicLayout currentUser={currentUser} navigate={navigate}>
      <div className="space-y-16 pb-32">
        
        {/* --- SECTION 1: PIXEL-PERFECT HERO --- */}
        <section className="relative overflow-hidden rounded-[32px] px-8 pt-12 pb-24 text-white shadow-2xl lg:px-16"
            style={{
              background: `linear-gradient(rgba(10, 31, 56, 0.9), rgba(10, 31, 56, 0.5)), url(${heroShip})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(229,169,61,0.22),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.2),transparent_26%)] pointer-events-none" />
          <Reveal effect="up">
            <div className="relative max-w-4xl space-y-8">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-5 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-100 backdrop-blur">
                <Ship className="h-3.5 w-3.5 text-[#E5A93D]" />
                Global Trade OS
              </div>
              <h1 className="text-5xl font-black leading-[0.95] tracking-tight lg:text-7xl">
                Stop losing trade deals to <span className="text-[#E5A93D]">miscommunication.</span>
              </h1>
              <p className="text-2xl text-slate-100 font-medium leading-relaxed max-w-2xl">
                Discover products. Execute deals. Deliver globally.
              </p>
              <div className="flex flex-col gap-4 text-xl font-bold">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-[#E5A93D]" />
                  <span>Centralized communication</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-[#E5A93D]" />
                  <span>Full deal visibility</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-[#E5A93D]" />
                  <span>Integrated shipping & documents</span>
                </div>
              </div>
              <div className="pt-8 flex flex-wrap gap-4">
                <button onClick={() => navigate('/login')} className="rounded-2xl bg-[#E5A93D] px-10 py-5 font-black text-[#0A2540] hover:bg-[#FF8A00] transition-all hover:-translate-y-1 shadow-lg">
                  Start Trading
                </button>
                <button onClick={() => navigate('/products')} className="rounded-2xl bg-[#143A6A] border border-white/20 px-10 py-5 font-black text-white hover:bg-[#1d4d86] transition-all">
                  Browse Opportunities
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-6 border-t border-white/10 pt-8 text-sm font-bold text-slate-200/90">
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
          <div className="absolute bottom-0 left-0 right-0 px-8 py-6 lg:px-16">
            <Reveal delay={400} effect="zoom">
              <div className="grid grid-cols-1 md:grid-cols-3 bg-white/95 backdrop-blur-xl rounded-[28px] p-2 shadow-2xl">
                {[
                  { label: 'Active Deals', value: '24' },
                  { label: 'Bids Won', value: '8' },
                  { label: 'Shipments in Transit', value: '12' },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col items-start rounded-[22px] px-10 py-6 border-r border-slate-100 last:border-0 hover:bg-slate-50 transition-colors cursor-default">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{s.label}</span>
                    <span className="text-3xl font-black text-[#0A2540]">{s.value}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* --- SECTION 2: DISCOVER OPPORTUNITIES (MOVED & BACKGROUND APPLIED) --- */}
        <section className="relative overflow-hidden rounded-[36px] px-7 py-9 lg:px-14 text-white shadow-2xl"
            style={{
              background: `linear-gradient(rgba(10, 31, 56, 0.85), rgba(20, 58, 106, 0.7)), url(${bgNegotiation})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(229,169,61,0.16),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_24%)] pointer-events-none" />
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
                 <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: '150+', label: 'Verified suppliers' },
                    { value: '32', label: 'Trade corridors' },
                    { value: '24/7', label: 'Workspace visibility' }
                  ].map((item) => (
                    <div key={item.label} className="rounded-[18px] border border-white/10 bg-white/8 px-3 py-2.5 backdrop-blur">
                      <div className="text-lg font-black text-white">{item.value}</div>
                      <div className="mt-0.5 text-[8px] font-black uppercase tracking-[0.16em] text-sky-100/70">{item.label}</div>
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

        {/* --- SECTION 3: FEATURED PRODUCTS --- */}
        <section className="px-8 lg:px-16 pt-1 pb-10">
          <Reveal effect="up">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50/50 px-3.5 py-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-[#143A6A] border border-blue-100">
                  <Globe className="h-3.5 w-3.5" /> Direct Bulk Sourcing
                </div>
                <h2 className="text-3xl font-black text-[#0A2540] tracking-tight leading-[0.94] md:text-4xl lg:text-[2.8rem]">Bulk Shipping <br /><span className="text-[#143A6A]/30">Live Inventory</span></h2>
                <p className="max-w-xl text-xs font-semibold leading-5 text-slate-500 md:text-sm">
                  Curated export-ready categories with polished photography so buyers can evaluate opportunities faster and trust what they are opening.
                </p>
              </div>
              <button onClick={() => navigate('/products')} className="group flex items-center gap-2 bg-white border border-slate-100 px-4 py-2.5 rounded-xl text-[9px] font-black text-[#143A6A] shadow-lg hover:-translate-y-1 transition-all">
                VIEW LIVE MARKETPLACE <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </Reveal>

          <div className="mb-4 grid grid-cols-2 gap-2.5 md:grid-cols-4">
            {[
              { value: '12', label: 'High-trust sectors' },
              { value: '40K+', label: 'Units listed weekly' },
              { value: '28', label: 'Export destinations' },
              { value: '1', label: 'Shared trade workspace' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-[18px] border border-slate-100 bg-white/85 px-3 py-2.5 shadow-md">
                <div className="text-lg font-black text-[#0A2540] md:text-xl">{stat.value}</div>
                <div className="mt-0.5 text-[8px] font-black uppercase tracking-[0.14em] text-slate-400 md:text-[9px]">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {featuredProducts.map((p, i) => (
              <Reveal key={p.id} delay={i * 150} effect="zoom">
                <div className="group relative rounded-[28px] bg-white border border-slate-100 p-3 shadow-[0_18px_45px_rgba(10,37,64,0.08)] hover:shadow-[0_28px_60px_rgba(10,37,64,0.12)] transition-all duration-700 hover:-translate-y-2">
                  <div className="relative aspect-[1/1] overflow-hidden rounded-[22px] bg-slate-50">
                    <img src={p.img} alt={p.name} className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute inset-3 rounded-[18px] border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-[8px] font-black text-[#0A2540] shadow-xl">
                      MIN: {p.moq}
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <button onClick={() => openDealFromProduct(p.id)} className="w-full rounded-xl bg-[#E5A93D] py-2.5 text-[9px] font-black uppercase tracking-widest text-[#0A2540] shadow-lg hover:bg-white transition-all">
                        Open
                      </button>
                    </div>
                  </div>
                  <div className="p-2 pt-4 space-y-4">
                    <div className="space-y-1">
                      <span className="text-[8px] font-black uppercase tracking-[0.18em] text-[#143A6A]/40">{p.category}</span>
                      <h3 className="text-sm font-black text-[#0A2540] tracking-tight group-hover:text-[#143A6A] transition-colors leading-tight">{p.name}</h3>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                      <div className="space-y-0.5">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Price</p>
                        <span className="text-xs font-black text-[#143A6A] tracking-tighter">{p.price}</span>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#143A6A] group-hover:text-white transition-all group-hover:rotate-45">
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* --- SECTION 6: MOVING REVIEWS --- */}
        <section className="relative overflow-hidden rounded-[40px] border border-slate-100 bg-[linear-gradient(135deg,#f8fbff_0%,#eef5ff_45%,#ffffff_100%)] py-14 shadow-[0_24px_72px_rgba(15,23,42,0.06)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,58,106,0.10),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(229,169,61,0.16),transparent_24%)] pointer-events-none" />
          <div className="absolute left-10 top-12 h-32 w-32 rounded-full bg-blue-100/60 blur-3xl pointer-events-none" />
          <div className="absolute right-12 bottom-10 h-40 w-40 rounded-full bg-amber-100/50 blur-3xl pointer-events-none" />
          <Reveal effect="up">
            <div className="relative px-8 lg:px-16">
              <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr] xl:items-end">
                <div className="max-w-2xl space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2 text-[9px] font-black uppercase tracking-[0.24em] text-[#143A6A] shadow-sm">
                    Buyer Confidence
                  </div>
                  <h2 className="text-3xl font-black text-[#0A2540] tracking-tight leading-[0.95] lg:text-4xl">Reviews from teams moving real global deals</h2>
                  <p className="text-sm font-semibold leading-6 text-slate-500">
                    A stronger review section should feel trusted, polished, and anchored in actual product movement. These cards now sit inside a cleaner glass-style testimonial band.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { value: '4.9/5', label: 'Buyer satisfaction' },
                    { value: '92%', label: 'Faster alignment' },
                    { value: '30+', label: 'Trade corridors' }
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-[20px] border border-blue-100/80 bg-white/78 px-3 py-3 shadow-lg backdrop-blur">
                      <div className="text-xl font-black text-[#0A2540]">{stat.value}</div>
                      <div className="mt-1 text-[8px] font-black uppercase tracking-[0.16em] text-slate-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          <div className="relative mt-6 px-4 lg:px-10">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#f5faff] via-[#f5faff] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#f5faff] via-[#f5faff] to-transparent" />
            <div className="rounded-[32px] border border-blue-100/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(240,247,255,0.7))] px-2 py-2 shadow-[0_22px_52px_rgba(30,64,175,0.10),inset_0_1px_0_rgba(255,255,255,0.78)] backdrop-blur-md">
              <Marquee items={reviews} direction="left" speed="normal" className="px-1 py-0" />
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}

export default LandingPage;
