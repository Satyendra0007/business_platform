import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  FileText,
  Globe,
  Handshake,
  Headphones,
  LayoutDashboard,
  MessageSquare,
  Scale,
  Search,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react';
import banner1 from '../../assets/tradafy-banner-1.jpeg';
import banner2 from '../../assets/tradafy-banner-2.jpeg';
import banner3 from '../../assets/tradafy-banner-3.jpeg';
import banner4 from '../../assets/tradafy-banner-4.jpeg';
import banner5 from '../../assets/tradafy-banner-5.jpeg';
import banner6 from '../../assets/tradafy-banner-6.jpeg';
import banner7 from '../../assets/tradafy-banner-7.jpeg';
import banner8 from '../../assets/tradafy-banner-8.jpeg';

const SLIDES = [
  {
    id: 'verified-companies',
    theme: 'dark',
    accent: '#f0ab1c',
    eyebrow: 'TRADAFICATION™',
    title: ['Verified companies', 'close deals faster'],
    subtitle: 'Apply for Tradafication today and boost trust, visibility and business opportunities worldwide.',
    cta: 'Apply today',
    image: banner1,
    focus: '52% 50%',
    chips: ['Trusted verification', 'More visibility', 'Global reach'],
    rightBullets: ['Verified partners', 'Global reach'],
  },
  {
    id: 'strategic-partner',
    theme: 'light',
    accent: '#f0ab1c',
    eyebrow: 'Join our network',
    title: ['Become a strategic', 'partner from Tradafy'],
    subtitle: 'Join our global network, create value and earn attractive commissions.',
    cta: 'Join today',
    image: banner2,
    focus: '56% 50%',
    chips: ['Join your network', 'Create value', 'Commissions'],
    rightBullets: ['Network growth', 'Commissions'],
  },
  {
    id: 'chat-possibility',
    theme: 'dark',
    accent: '#6ca7ff',
    eyebrow: 'Smart communication',
    title: ['Chat', 'possibility'],
    subtitle: 'Connect instantly with buyers, suppliers and partners worldwide.',
    cta: 'Open chat',
    image: banner3,
    focus: '50% 50%',
    chips: ['Real-time messaging', 'Group chats', 'Docs in chat'],
    rightBullets: ['Instant messaging', 'Docs in chat'],
  },
  {
    id: 'legal-documents',
    theme: 'dark',
    accent: '#f0ab1c',
    eyebrow: 'Legal document setup',
    title: ['Legal document', 'set up'],
    subtitle: 'Create, manage and customize all your legal documents with ease.',
    cta: 'Create documents',
    image: banner4,
    focus: '55% 50%',
    chips: ['Document creation', 'Compliance', 'Secure storage'],
    rightBullets: ['Document workflows', 'Compliance ready'],
  },
  {
    id: 'credibility-report',
    theme: 'light',
    accent: '#2f6be7',
    eyebrow: 'Risk insight',
    title: ['Know your partner', 'trade with confidence'],
    subtitle: 'In-depth credibility reports and risk analysis to help you make smarter, safer trade decisions.',
    cta: 'Run analysis',
    image: banner5,
    focus: '58% 50%',
    chips: ['In-depth analysis', 'Risk identification', 'Credibility scoring'],
    rightBullets: ['Risk scoring', 'Actionable insights'],
  },
  {
    id: 'workspace',
    theme: 'light',
    accent: '#2f6be7',
    eyebrow: 'Own workspace / CRM system',
    title: ['All in one', 'deal - work - succeed'],
    subtitle: 'Manage your deals, clients, documents and conversations in your own smart workspace.',
    cta: 'Create workspace',
    image: banner6,
    focus: '56% 50%',
    chips: ['Client CRM', 'Deal management', 'Document center'],
    rightBullets: ['Client CRM', 'Document center'],
  },
  {
    id: 'offer-dark',
    theme: 'dark',
    accent: '#f0ab1c',
    eyebrow: 'Limited time offer',
    title: ['Trade smarter', 'save more'],
    subtitle: 'Your all-in-one platform for deals, compliance and global success.',
    cta: 'Use code 20DEAL',
    image: banner7,
    focus: '56% 50%',
    chips: ['Trusted network', 'Secure deals', 'Live support'],
    rightBullets: ['Trusted network', 'Live support'],
  },
  {
    id: 'offer-light',
    theme: 'light',
    accent: '#f0ab1c',
    eyebrow: 'Limited time offer',
    title: ['Trade smarter', 'save more'],
    subtitle: 'Your all-in-one platform for deals, compliance and global success.',
    cta: 'Use code 20DEAL',
    image: banner8,
    focus: '56% 50%',
    chips: ['Trusted network', 'Secure deals', 'Live support'],
    rightBullets: ['Trusted network', 'Live support'],
  },
];

function BannerShell({ theme, accent, children }) {
  const dark = theme === 'dark';

  return (
    <section
      className={[
        'relative h-[220px] w-full overflow-hidden border shadow-[0_18px_45px_rgba(15,23,42,0.14)]',
        'rounded-[28px]',
        dark ? 'border-[#0f1d38] bg-[#061127] text-white' : 'border-slate-200 bg-white text-[#0B2145]',
      ].join(' ')}
      style={{
        backgroundImage: dark
          ? `radial-gradient(circle at 18% 15%, ${accent}22, transparent 18%), radial-gradient(circle at 84% 18%, rgba(82,132,255,0.20), transparent 22%), linear-gradient(135deg, rgba(5,11,23,0.98), rgba(9,16,34,0.95))`
          : `radial-gradient(circle at 18% 15%, rgba(47,107,231,0.10), transparent 18%), radial-gradient(circle at 84% 18%, ${accent}22, transparent 22%), linear-gradient(135deg, rgba(255,255,255,0.98), rgba(242,247,255,0.96))`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 left-1/2 w-[32%] -translate-x-1/2 rounded-[30px] blur-3xl"
        style={{
          background:
            dark
              ? 'radial-gradient(circle, rgba(96,142,255,0.20) 0%, rgba(96,142,255,0.08) 38%, transparent 72%)'
              : 'radial-gradient(circle, rgba(47,107,231,0.10) 0%, rgba(47,107,231,0.04) 38%, transparent 72%)',
        }}
      />
      {children}
    </section>
  );
}

function FeatureStrip({ theme, accent, features }) {
  const dark = theme === 'dark';
  const items = {
    'Trusted verification': Globe,
    'More visibility': TrendingUp,
    'Global reach': Handshake,
    'Join your network': Users,
    'Create value': ArrowRight,
    'Commissions': BadgeCheck,
    'Real-time messaging': MessageSquare,
    'Group chats': Users,
    'Docs in chat': FileText,
    'Document creation': FileText,
    'Compliance': Scale,
    'Secure storage': ShieldCheck,
    'In-depth analysis': Search,
    'Risk identification': ShieldCheck,
    'Credibility scoring': BadgeCheck,
    'Client CRM': Users,
    'Deal management': LayoutDashboard,
    'Document center': FileText,
    'Trusted network': ShieldCheck,
    'Secure deals': ShieldCheck,
    'Live support': Headphones,
    'Global opportunities': Handshake,
  };

  return (
    <div className="flex flex-wrap gap-2">
      {features.slice(0, 2).map((text) => {
        const Icon = items[text] || BadgeCheck;
        return (
          <div
            key={text}
            className={[
              'flex items-center gap-1.5 rounded-full border px-2.5 py-[5px] text-[9.5px] font-semibold backdrop-blur',
              dark ? 'border-white/10 bg-white/6' : 'border-slate-200 bg-white/82',
            ].join(' ')}
          >
            <Icon className="h-3.5 w-3.5" style={{ color: accent }} />
            <span className="whitespace-nowrap">{text}</span>
          </div>
        );
      })}
    </div>
  );
}

function PhotoPanel({ slide }) {
  const dark = slide.theme === 'dark';

  return (
    <div
      className={[
        'relative h-[196px] w-full overflow-hidden rounded-[30px] border shadow-[0_18px_30px_rgba(15,23,42,0.16)]',
        dark ? 'border-white/10 bg-[#0b1731]' : 'border-slate-200 bg-white',
      ].join(' ')}
    >
      <img
        src={slide.image}
        alt={slide.eyebrow}
        className="absolute inset-0 h-full w-full select-none object-cover"
        style={{ objectPosition: slide.focus }}
        draggable="false"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,10,20,0.08)_0%,rgba(5,10,20,0.00)_42%,rgba(5,10,20,0.14)_100%)]" />
      <div
        className={[
          'absolute left-3 top-3 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em]',
          dark ? 'bg-white/10 text-white ring-1 ring-white/10' : 'bg-white/78 text-[#0B2145] ring-1 ring-slate-200',
        ].join(' ')}
      >
        {slide.eyebrow}
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/20 via-black/5 to-transparent"
      />
    </div>
  );
}

function SlideFrame({ slide, index, total, onPrev, onNext, compact }) {
  const dark = slide.theme === 'dark';

  return (
    <section
      className={[
        'relative h-[220px] w-full overflow-visible border shadow-[0_18px_40px_rgba(15,23,42,0.12)]',
        compact ? 'rounded-[24px]' : 'rounded-[28px]',
        dark ? 'border-[#12223f]' : 'border-slate-200',
      ].join(' ')}
    >
      <BannerShell theme={slide.theme} accent={slide.accent}>
        <div className="absolute inset-0 grid grid-cols-[1.18fr_1.52fr_0.30fr] items-center gap-2 px-4 py-3.5">
          <div className="min-w-0 pl-2">
            <div className="max-w-[94%]">
              <div
                className={[
                  'inline-flex rounded-full px-3 py-1 text-[8.5px] font-black uppercase tracking-[0.22em]',
                  dark ? 'bg-white/10 text-white ring-1 ring-white/10' : 'bg-white/80 text-[#0B2145] ring-1 ring-slate-200',
                ].join(' ')}
              >
                {slide.eyebrow}
              </div>

              <h2 className="mt-2 text-[22px] font-black leading-[0.86] tracking-[-0.06em] lg:text-[24px]">
                {slide.title.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h2>

              <p className={['mt-1.5 max-w-[292px] text-[9px] leading-snug', dark ? 'text-white/74' : 'text-slate-600'].join(' ')}>
                {slide.subtitle}
              </p>
            </div>

            <div className="mt-2">
              <FeatureStrip theme={slide.theme} accent={slide.accent} features={slide.chips} />
            </div>
          </div>

          <div className="flex justify-start -ml-3">
            <PhotoPanel slide={slide} />
          </div>

          <div className="flex min-w-0 flex-col justify-center pr-2">
            <div
              className={[
                'inline-flex w-fit rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-[0.22em]',
                dark ? 'bg-white/10 text-white ring-1 ring-white/10' : 'bg-white/80 text-[#0B2145] ring-1 ring-slate-200',
              ].join(' ')}
            >
              Premium highlights
            </div>

            <div className="mt-3 max-w-[92%]">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Why it stands out</div>
              <div className="mt-2 space-y-2.5">
                {slide.rightBullets.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <div
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[8.5px] font-black"
                      style={{
                        color: slide.accent,
                        backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.86)',
                      }}
                    >
                      ✓
                    </div>
                    <span className={['text-[9.5px] font-semibold leading-tight', dark ? 'text-white/78' : 'text-slate-600'].join(' ')}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              className={[
                'mt-3 inline-flex w-fit items-center gap-2 rounded-full px-3.5 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] transition',
                dark ? 'bg-[#f0ab1c] text-[#061127] hover:brightness-105' : 'bg-[#f0ab1c] text-[#061127] hover:brightness-105',
              ].join(' ')}
            >
              {slide.cta}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </BannerShell>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onPrev();
        }}
        className="absolute left-0 top-1/2 z-20 flex -translate-x-[72%] -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/92 p-1.5 text-[#0B2145] shadow-[0_10px_28px_rgba(15,23,42,0.18)] transition hover:bg-white"
        aria-label="Previous banner"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onNext();
        }}
        className="absolute right-0 top-1/2 z-20 flex translate-x-[72%] -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/92 p-1.5 text-[#0B2145] shadow-[0_10px_28px_rgba(15,23,42,0.18)] transition hover:bg-white"
        aria-label="Next banner"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-white/78 px-2.5 py-1.5 backdrop-blur">
        {SLIDES.map((entry, slideIndex) => (
          <button
            key={entry.id}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onNext(slideIndex);
            }}
            className={`h-2 rounded-full transition-all ${
              slideIndex === index ? 'w-7 bg-[#245c9d]' : 'w-2 bg-slate-300 hover:bg-slate-400'
            }`}
            aria-label={`Show banner ${slideIndex + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export default function TradeBannerSlideshow({ variant = 'banner', navigateTo = '/register' }) {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, []);

  const slide = SLIDES[index];
  const compact = variant === 'card';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(navigateTo)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') navigate(navigateTo);
      }}
      className="relative block w-full cursor-pointer text-left transition hover:-translate-y-0.5"
    >
      <SlideFrame
        slide={slide}
        index={index}
        total={SLIDES.length}
        onPrev={() => setIndex((current) => (current - 1 + SLIDES.length) % SLIDES.length)}
        onNext={(target) => {
          if (typeof target === 'number') {
            setIndex(target);
            return;
          }
          setIndex((current) => (current + 1) % SLIDES.length);
        }}
        compact={compact}
      />
    </div>
  );
}
