import React, { useEffect } from 'react';
import { CalendarDays, MapPin, Users, ArrowRight, Video, Clock } from 'lucide-react';
import { PublicLayout } from '../components/ui';

export default function EventsPage() {
  // Ensure the page always starts at the top when navigating here
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const events = [
    {
      id: 1,
      type: 'Summit',
      title: 'Global Bulk Trade Summit 2026',
      date: 'September 14-16, 2026',
      location: 'Dubai, UAE',
      mode: 'In-Person',
      description: 'Join industry leaders, top commodity suppliers, and major shipping lines for three days of networking, panel discussions, and platform masterclasses.',
      attendees: '2,500+',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop',
      tone: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      id: 2,
      type: 'Webinar',
      title: 'Mastering the Live Deal Workspace',
      date: 'June 05, 2026',
      location: 'Online',
      mode: 'Virtual',
      description: 'A deep dive into maximizing efficiency with our newly released Live Deal Workspace. Learn how to centralize your documents, chat, and logistics on one screen.',
      attendees: '1,200+',
      image: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?q=80&w=800&auto=format&fit=crop',
      tone: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      id: 3,
      type: 'Regional Meetup',
      title: 'APAC Traders Networking Gala',
      date: 'July 22, 2026',
      location: 'Singapore',
      mode: 'In-Person',
      description: 'An exclusive evening for verified suppliers and buyers in the Asia-Pacific region to connect, discuss trade corridors, and establish long-term partnerships.',
      attendees: '400+',
      image: 'https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?q=80&w=800&auto=format&fit=crop',
      tone: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      id: 4,
      type: 'Conference',
      title: 'European Agri-Commodities Expo',
      date: 'August 10-12, 2026',
      location: 'Rotterdam, NL',
      mode: 'In-Person',
      description: 'The premier event for European agricultural trade. Meet with top grain and fertilizer suppliers, and learn about the latest EU import regulations.',
      attendees: '3,100+',
      image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=800&auto=format&fit=crop',
      tone: 'text-purple-600 bg-purple-50 border-purple-100',
    },
    {
      id: 5,
      type: 'Webinar',
      title: 'Navigating Cross-Border Payments',
      date: 'June 18, 2026',
      location: 'Online',
      mode: 'Virtual',
      description: 'Learn how to leverage Tradafy\'s secure payment escrow system to minimize risk and accelerate funds transfer across international borders.',
      attendees: '850+',
      image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800&auto=format&fit=crop', // Fixed image link
      tone: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      id: 6,
      type: 'Workshop',
      title: 'Logistics Optimization Bootcamp',
      date: 'October 05, 2026',
      location: 'London, UK',
      mode: 'Hybrid',
      description: 'An intensive workshop for operations managers. Learn how to drastically reduce demurrage and detention fees using our predictive port analytics.',
      attendees: '250+',
      image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop',
      tone: 'text-rose-600 bg-rose-50 border-rose-100',
    }
  ];

  return (
    <PublicLayout>
      <div className="min-h-screen bg-[#F8FAFC]">
        {/* Header Section */}
        <section className="relative overflow-hidden border-b border-slate-200/60 bg-white pt-16 pb-14 lg:pt-24 lg:pb-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(30,64,175,0.06),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(229,169,61,0.05),transparent_50%)] pointer-events-none" />
          <div className="relative mx-auto max-w-[1500px] px-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#cfe0f2] bg-white px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#245c9d] shadow-sm mb-6">
              <CalendarDays className="h-4 w-4 text-[#E5A93D]" />
              Network & Events
            </div>
            <h1 className="text-4xl font-black tracking-tight text-[#0A2540] md:text-5xl lg:text-6xl mb-5 drop-shadow-sm">
              Connect With The Industry
            </h1>
            <p className="mx-auto max-w-2xl text-[17px] text-slate-500 font-medium">
              Join our upcoming summits, virtual webinars, and exclusive networking events designed to bring bulk commodity professionals together.
            </p>
          </div>
        </section>

        {/* Events Grid Section */}
        <section className="mx-auto max-w-[1500px] px-6 py-12 lg:py-16">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const Icon = event.mode === 'Virtual' ? Video : MapPin;
              return (
                <div 
                  key={event.id} 
                  className="group flex flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_8px_30px_rgba(10,37,64,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(10,37,64,0.12)]"
                >
                  {/* Image Header */}
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img src={event.image} alt={event.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md bg-white/90 shadow-sm ${event.tone}`}>
                        {event.type}
                      </span>
                      <div className="flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                        <Users className="h-3.5 w-3.5 text-sky-300" />
                        {event.attendees}
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex flex-1 flex-col p-6 lg:p-8">
                    <h3 className="text-[1.35rem] font-black leading-tight text-[#0A2540] mb-4 transition-colors group-hover:text-blue-600">
                      {event.title}
                    </h3>
                    
                    <div className="space-y-3 mb-5">
                      <div className="flex items-center gap-3 text-[14px] font-medium text-slate-600">
                        <Clock className="h-4.5 w-4.5 text-[#E5A93D]" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[14px] font-medium text-slate-600">
                        <Icon className="h-4.5 w-4.5 text-[#E5A93D]" />
                        <span>{event.location}</span>
                      </div>
                    </div>

                    <p className="text-[14px] leading-relaxed text-slate-500 mb-8 flex-1">
                      {event.description}
                    </p>
                    
                    <button className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-[#0A2540] transition-colors hover:bg-slate-200 group/btn">
                      Register Now
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Call to Action */}
          <div className="mt-16 overflow-hidden rounded-[32px] border border-blue-100 bg-[linear-gradient(135deg,#e0f0ff,#f0f7ff)] px-8 py-12 md:px-16 md:py-16 text-center relative shadow-[0_12px_40px_rgba(36,92,157,0.08)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,64,175,0.05),transparent_60%)] pointer-events-none" />
            <h2 className="relative z-10 text-2xl md:text-3xl font-black text-[#0A2540] mb-4">Host an Event with Tradafy</h2>
            <p className="relative z-10 text-slate-600 max-w-xl mx-auto mb-8 font-medium">
              Are you an industry association or major supplier looking to co-host a verified networking event? Let's collaborate.
            </p>
            <button className="relative z-10 mx-auto inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-[linear-gradient(135deg,#E5A93D,#FF8A00)] px-8 py-3.5 text-[15px] font-black text-[#0A2540] shadow-md transition hover:-translate-y-0.5 hover:shadow-lg">
              Partner With Us
            </button>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
