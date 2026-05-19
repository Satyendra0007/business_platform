import React, { useEffect } from 'react';
import { Newspaper, ChevronRight, ArrowRight, TrendingUp, Globe, ShieldCheck, PlayCircle } from 'lucide-react';
import { PublicLayout } from '../components/ui';

export default function NewsPage() {
  // Ensure the page always starts at the top when navigating here
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const newsItems = [
    {
      id: 1,
      category: 'Video Update',
      date: 'May 12, 2026',
      title: 'Tradafy OS Integrates Live Carrier Bidding',
      excerpt: 'Our new logistics module allows bulk traders to receive real-time bids from over 40 global maritime carriers directly within their Deal Workspace.',
      icon: PlayCircle,
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop',
      isVideo: true,
      tone: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      id: 2,
      category: 'Market Insight',
      date: 'May 08, 2026',
      title: 'Global Agri-Trade Corridors See 15% Efficiency Boost',
      excerpt: 'Recent data from the Tradafy network indicates that bulk grain shipments have accelerated significantly due to our centralized document approval flow.',
      icon: Globe,
      image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=800&auto=format&fit=crop', // Fixed image link
      isVideo: false,
      tone: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      id: 3,
      category: 'Security News',
      date: 'May 02, 2026',
      title: 'Enhanced Supplier Verification Protocol Activated',
      excerpt: 'We have rolled out a strict 4-point verification process for all new commodity suppliers on the platform to ensure maximum trade security and compliance.',
      icon: ShieldCheck,
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800&auto=format&fit=crop',
      isVideo: false,
      tone: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      id: 4,
      category: 'Platform Update',
      date: 'April 28, 2026',
      title: 'Automated Customs Documentation Now Live',
      excerpt: 'Say goodbye to manual paperwork. Tradafy now auto-generates commercial invoices, packing lists, and certificates of origin based on your deal terms.',
      icon: TrendingUp,
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=800&auto=format&fit=crop',
      isVideo: false,
      tone: 'bg-purple-50 text-purple-600 border-purple-100',
    },
    {
      id: 5,
      category: 'Video Update',
      date: 'April 21, 2026',
      title: 'Interview: The Future of Maritime Shipping',
      excerpt: 'We sat down with the VP of Logistics at Maersk to discuss how digital platforms like Tradafy are reducing port congestion and turnaround times.',
      icon: PlayCircle,
      image: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?q=80&w=800&auto=format&fit=crop',
      isVideo: true,
      tone: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      id: 6,
      category: 'Market Insight',
      date: 'April 15, 2026',
      title: 'Q1 2026 Bulk Commodity Trends Report',
      excerpt: 'Our quarterly analysis shows a massive shift towards renewable energy components and sustainable agriculture products in cross-border deals.',
      icon: Newspaper,
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop',
      isVideo: false,
      tone: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    }
  ];

  return (
    <PublicLayout>
      <div className="min-h-screen bg-[#F8FAFC]">
        {/* Header Section */}
        <section className="relative overflow-hidden border-b border-slate-200/60 bg-white pt-16 pb-14 lg:pt-24 lg:pb-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.08),transparent_50%),radial-gradient(circle_at_top_left,rgba(229,169,61,0.05),transparent_50%)] pointer-events-none" />
          <div className="relative mx-auto max-w-[1500px] px-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#cfe0f2] bg-white px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#245c9d] shadow-sm mb-6">
              <Newspaper className="h-4 w-4 text-[#E5A93D]" />
              Tradafy Newsroom
            </div>
            <h1 className="text-4xl font-black tracking-tight text-[#0A2540] md:text-5xl lg:text-6xl mb-5 drop-shadow-sm">
              Platform & Market Updates
            </h1>
            <p className="mx-auto max-w-2xl text-[17px] text-slate-500 font-medium">
              Stay informed with the latest feature releases, global trade insights, and video announcements from the Tradafy network.
            </p>
          </div>
        </section>

        {/* News Grid Section */}
        <section className="mx-auto max-w-[1500px] px-6 py-12 lg:py-16">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {newsItems.map((news) => {
              const Icon = news.icon;
              return (
                <div 
                  key={news.id} 
                  className="group flex flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_8px_30px_rgba(10,37,64,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(10,37,64,0.12)]"
                >
                  {/* Image Header */}
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    <img src={news.image} alt={news.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    {news.isVideo && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-md transition-transform group-hover:scale-110">
                          <PlayCircle className="h-6 w-6 text-blue-600 ml-1" />
                        </div>
                      </div>
                    )}
                    <div className="absolute left-4 top-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${news.tone}`}>
                        <Icon className="h-3 w-3" />
                        {news.category}
                      </span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex flex-1 flex-col p-6 lg:p-8">
                    <div className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
                      {news.date}
                    </div>
                    
                    <h3 className="text-[1.35rem] font-black leading-tight text-[#0A2540] mb-3 line-clamp-2 transition-colors group-hover:text-blue-600">
                      {news.title}
                    </h3>
                    
                    <p className="text-[14px] leading-relaxed text-slate-500 mb-6 flex-1 line-clamp-3">
                      {news.excerpt}
                    </p>
                    
                    <button className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-[#245c9d] transition-colors hover:text-blue-700 group/btn">
                      {news.isVideo ? 'Watch Video' : 'Read full story'}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Newsletter Subscribe */}
          <div className="mt-16 overflow-hidden rounded-[32px] border border-blue-100 bg-[linear-gradient(135deg,#f0f7ff,#e0f0ff)] px-8 py-12 md:px-16 md:py-16 text-center relative shadow-[0_12px_40px_rgba(36,92,157,0.08)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(229,169,61,0.08),transparent_60%)] pointer-events-none" />
            <h2 className="relative z-10 text-2xl md:text-3xl font-black text-[#0A2540] mb-4">Never miss an update.</h2>
            <p className="relative z-10 text-slate-600 max-w-xl mx-auto mb-8 font-medium">
              Join thousands of bulk commodity professionals receiving our weekly digest on platform features and global trade flows.
            </p>
            <div className="relative z-10 mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
              <input 
                type="email" 
                placeholder="Enter your work email" 
                className="flex-1 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button className="whitespace-nowrap rounded-xl bg-[linear-gradient(135deg,#E5A93D,#FF8A00)] px-6 py-3 text-sm font-black text-[#0A2540] shadow-md transition hover:-translate-y-0.5 hover:shadow-lg">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
