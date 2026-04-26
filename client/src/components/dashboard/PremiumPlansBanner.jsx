import React, { useEffect, useState } from 'react';
import { ArrowRight, BriefcaseBusiness, ShieldCheck, Sparkles, Star, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dashboardBanner1 from '../../assets/dashboard-banner-1.png';
import dashboardBanner2 from '../../assets/dashboard-banner-2.png';
import dashboardBanner3 from '../../assets/dashboard-banner-3.png';
import dashboardBanner4 from '../../assets/dashboard-banner-4.png';
import dashboardBanner5 from '../../assets/dashboard-banner-5.png';

const premiumSlides = [
  {
    eyebrow: 'Premium Plans',
    title: 'Priority execution for serious trade teams',
    copy: 'Unlock boosted visibility, stronger support, and a cleaner path to closing more deals.',
    metric: '€99 / month',
    chips: ['Priority support', 'Boosted ranking'],
    icon: Sparkles,
    image: dashboardBanner1,
  },
  {
    eyebrow: 'Trade Negotiation',
    title: 'Close deals with a stronger presentation',
    copy: 'Show buyers and suppliers a polished workspace when the conversation matters most.',
    metric: 'Trust first',
    chips: ['Buyer trust', 'Supplier trust'],
    icon: BriefcaseBusiness,
    image: dashboardBanner2,
  },
  {
    eyebrow: 'Global Trade',
    title: 'A premium view for logistics and commerce',
    copy: 'Use a visual style that feels aligned with international trade, shipping, and execution.',
    metric: 'Global reach',
    chips: ['Shipping', 'Logistics'],
    icon: ShieldCheck,
    image: dashboardBanner3,
  },
  {
    eyebrow: 'Deal Room',
    title: 'Professional trade scenes that feel premium',
    copy: 'Keep the dashboard feeling alive with imagery that matches the work your team is doing.',
    metric: 'Live view',
    chips: ['Deal room', 'Premium flow'],
    icon: TrendingUp,
    image: dashboardBanner4,
  },
  {
    eyebrow: 'Marketplace',
    title: 'A polished banner that rotates like a premium ad',
    copy: 'The banner keeps changing while the background imagery stays elegant and professional.',
    metric: 'Rotating highlight',
    chips: ['Fresh look', 'Professional'],
    icon: Star,
    image: dashboardBanner5,
  },
];

export default function PremiumPlansBanner() {
  const navigate = useNavigate();
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSlideIndex((current) => (current + 1) % premiumSlides.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, []);

  const slide = premiumSlides[slideIndex];
  const SlideIcon = slide.icon;

  return (
    <section className="overflow-hidden rounded-[26px] border border-[#d8e2ef] bg-white shadow-[0_16px_44px_rgba(15,23,42,0.06)]">
      <button
        type="button"
        onClick={() => navigate('/premium-plans')}
        className="group relative flex w-full flex-col overflow-hidden px-4 py-3 text-left transition hover:-translate-y-0.5 sm:px-5 sm:py-4"
      >
        <div className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${slideIndex % 2 === 0 ? 'opacity-100' : 'opacity-95'}`}>
          <img
            src={slide.image}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-center opacity-22 saturate-75"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,14,28,0.94)_0%,rgba(10,28,52,0.85)_48%,rgba(10,28,52,0.52)_78%,rgba(10,28,52,0.28)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(229,169,61,0.16),transparent_26%)]" />
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-[#E5A93D]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/15" />

        <div className="relative grid gap-3 lg:grid-cols-[1.3fr_0.75fr] lg:items-center">
          <div key={slide.title} className="flex min-w-0 items-start gap-3 animate-fade-in-blur">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white shadow-[0_12px_26px_rgba(0,0,0,0.12)] backdrop-blur">
              <SlideIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.22em] text-sky-100 backdrop-blur">
                {slide.eyebrow}
              </div>
              <h2 className="mt-2 text-[1rem] font-black tracking-tight text-white sm:text-[1.08rem] lg:text-[1.1rem]">
                {slide.title}
              </h2>
              <p className="mt-1 max-w-2xl text-[13px] leading-5 text-sky-100/80 sm:text-sm sm:leading-6">
                {slide.copy}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {slide.chips.map((chip) => (
                  <span
                    key={chip}
                    className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-bold text-white/90 backdrop-blur"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-white/10 px-3 py-2 text-white shadow-[0_10px_24px_rgba(0,0,0,0.12)] backdrop-blur lg:justify-end">
            <div className="h-14 w-20 overflow-hidden rounded-[14px] border border-white/10 bg-white/10">
              <img src={slide.image} alt="" aria-hidden="true" className="h-full w-full object-cover object-center opacity-85" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[9px] font-black uppercase tracking-[0.18em] text-sky-100/70">Premium</div>
              <div className="text-sm font-black">{slide.metric}</div>
              <div className="mt-1 truncate text-[11px] text-sky-100/75">{slide.eyebrow}</div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-[#0A2540] shadow-sm transition group-hover:translate-x-0.5">
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </button>

      <div className="flex items-center justify-between gap-3 border-t border-[#e6eef8] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-4 py-2.5">
        <div className="flex items-center gap-2">
          {premiumSlides.map((entry, index) => (
            <button
              key={entry.title}
              type="button"
              onClick={() => setSlideIndex(index)}
              className={`h-2.5 rounded-full transition-all ${index === slideIndex ? 'w-8 bg-[#245c9d]' : 'w-2.5 bg-slate-300 hover:bg-slate-400'}`}
              aria-label={`Show premium banner ${index + 1}`}
            />
          ))}
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          Rotating premium highlights
        </p>
      </div>
    </section>
  );
}
