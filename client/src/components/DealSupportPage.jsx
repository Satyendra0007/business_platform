import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Crown,
  FileText,
  Headphones,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from './ui';
import tradafyLogo from '../assets/Tradafy_logo_comparison_on_navy_backdrops-3-removebg-preview.png';
import LegalDocumentReviewCard from './deal-support/cards/LegalDocumentReviewCard';
import GetLegalSupportCard from './deal-support/cards/GetLegalSupportCard';
import GetVerifiedCard from './deal-support/cards/GetVerifiedCard';
import GetVerifiedTradifyLabelCard from './deal-support/cards/GetVerifiedTradifyLabelCard';
import CustomServiceContactCard from './deal-support/cards/CustomServiceContactCard';
import CredibilityReportCard from './deal-support/cards/CredibilityReportCard';
import PrivateLabelingSupportCard from './deal-support/cards/PrivateLabelingSupportCard';
import ExpandYourBusinessCard from './deal-support/cards/ExpandYourBusinessCard';

const formRegistry = {
  'legal-review': LegalDocumentReviewCard,
  'legal-support': GetLegalSupportCard,
  verification: GetVerifiedCard,
  'tradify-label': GetVerifiedTradifyLabelCard,
  'custom-service': CustomServiceContactCard,
  'credibility-report': CredibilityReportCard,
  'private-labeling': PrivateLabelingSupportCard,
  'business-growth': ExpandYourBusinessCard,
};

const heroFeatures = [
  {
    icon: ShieldCheck,
    title: 'Reduce Risk',
    copy: 'Verify partners and protect your deals',
  },
  {
    icon: Clock3,
    title: 'Save Time',
    copy: 'Get expert support when you need it',
  },
  {
    icon: Truck,
    title: 'Close Faster',
    copy: 'Structured workflows that keep deals moving',
  },
];

const heroStats = [
  { value: '2,500+', label: 'Deals Supported' },
  { value: '99%', label: 'Client Satisfaction' },
  { value: '24h', label: 'Avg. Response Time' },
  { value: '$2B+', label: 'Trade Value Secured' },
];

const supportCardItems = [
  { key: 'legal-review', Component: LegalDocumentReviewCard },
  { key: 'verification', Component: GetVerifiedCard },
  { key: 'credibility-report', Component: CredibilityReportCard },
  { key: 'legal-support', Component: GetLegalSupportCard },
  { key: 'private-labeling', Component: PrivateLabelingSupportCard },
  { key: 'business-growth', Component: ExpandYourBusinessCard },
];

const workflowSteps = [
  {
    icon: FileText,
    title: 'Submit your request',
    copy: 'Choose the service you need and submit the required details.',
  },
  {
    icon: ShieldCheck,
    title: 'Our experts review',
    copy: 'Our specialists analyze and prepare your report.',
  },
  {
    icon: Clock3,
    title: 'Get results fast',
    copy: 'Receive clear insights and recommendations.',
  },
  {
    icon: Sparkles,
    title: 'Move your deal forward',
    copy: 'Use the insights to close deals with confidence.',
  },
];

const whySupport = [
  'Expert professionals with trade experience',
  'Fast turnaround and clear deliverables',
  'Secure and confidential process',
  'Built for international trade',
  'Trusted by 2500+ traders worldwide',
];

const testimonial = {
  quote:
    'The Tradafycation process helped us avoid a risky partner. The badge gave our buyer complete confidence.',
  name: 'Ahmed K.',
  role: 'Import Manager, Germany',
  avatar:
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
};

function InfoCard({ title, children, className = '' }) {
  return (
    <section className={`overflow-hidden rounded-[22px] border border-slate-200/70 bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.05)] ${className}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">{title}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function WorkflowStep({ index, step }) {
  const Icon = step.icon;

  return (
    <div className="grid grid-cols-[28px_1fr] gap-4">
      <div className="relative flex flex-col items-center">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#183d6b] text-[12px] font-black text-white shadow-sm">
          {index + 1}
        </div>
        {index < workflowSteps.length - 1 ? <div className="mt-2 h-full w-px flex-1 bg-slate-200" /> : null}
      </div>
      <div className="flex gap-3 pb-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-[#16345c]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-[15px] font-bold tracking-[-0.02em] text-slate-900">{step.title}</h4>
          <p className="mt-1 text-sm leading-6 text-slate-500">{step.copy}</p>
        </div>
      </div>
    </div>
  );
}

function RailBullet({ children }) {
  return (
    <li className="flex items-start gap-2.5 text-[14px] leading-6 text-slate-600">
      <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-600" />
      <span>{children}</span>
    </li>
  );
}

export default function DealSupportPage() {
  const navigate = useNavigate();
  const [activeForm, setActiveForm] = useState(null);
  const ActiveForm = useMemo(() => (activeForm ? formRegistry[activeForm] : null), [activeForm]);

  const openForm = (key) => setActiveForm(key);

  return (
    <AppShell
      title="Deal Support"
      subtitle="End-to-end support for safer deals, smoother execution, and complete peace of mind."
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="space-y-6">
          <section className="grid gap-5 xl:grid-cols-[minmax(0,0.96fr)_minmax(420px,1.04fr)] xl:items-start">
            <div className="rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-[0_18px_48px_rgba(15,23,42,0.05)] backdrop-blur sm:p-5">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#18447f]">Deal Support</p>
              <h1 className="mt-2.5 max-w-[21ch] text-[2.15rem] font-black leading-[0.92] tracking-[-0.08em] text-[#0a1630] sm:max-w-[22ch] sm:text-[2.5rem] lg:text-[2.55rem] xl:text-[2.75rem]">
                We support your deals.
                <span className="block text-[#1f57c7]">You focus on growing.</span>
              </h1>
              <p className="mt-3.5 max-w-md text-[15px] leading-6.5 text-slate-600">
                End-to-end support for safer deals, smoother execution, and complete peace of mind.
              </p>

              <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
                {heroFeatures.map(({ icon, title, copy }) => (
                  <div key={title} className="rounded-[20px] border border-slate-200/75 bg-white px-3.5 py-3 shadow-[0_10px_22px_rgba(15,23,42,0.04)]">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef3ff] text-[#314f9a] ring-1 ring-[#d8e3fb]">
                        {React.createElement(icon, { className: 'h-5 w-5' })}
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-slate-900">{title}</p>
                        <p className="mt-1 text-[12px] leading-5 text-slate-500">{copy}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#3a475f] bg-[linear-gradient(180deg,#18243a_0%,#121a2c_100%)] p-4 text-white shadow-[0_20px_54px_rgba(15,23,42,0.18)] sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex rounded-full bg-white/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-slate-100/80">
                  Our core feature
                </div>
                <div className="inline-flex items-center gap-1 rounded-full border border-[#d9a21d]/75 bg-[linear-gradient(135deg,#f2bb47,#f8d97a)] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#3a2a00]">
                  <Star className="h-3.5 w-3.5 fill-[#3a2a00] text-[#3a2a00]" />
                  Priority
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-center">
                <div className="flex items-center justify-center rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,#fff9e8_0%,#ffe08a_100%)] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.16)]">
                  <img src={tradafyLogo} alt="Tradafy logo" className="h-[120px] w-full object-contain" />
                </div>

                <div className="min-w-0">
                  <h2 className="text-[1.24rem] font-black tracking-[-0.05em] text-white sm:text-[1.42rem] lg:text-[1.55rem]">
                    Tradafycation Badge
                  </h2>
                  <p className="mt-2.5 max-w-md text-[14px] leading-6 text-slate-200/88">
                    Every deal with the Tradafycation Badge is verified, structured, and protected.
                  </p>
                  <ul className="mt-3.5 grid gap-2 text-[13px] leading-5 text-slate-100/90 sm:grid-cols-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#f2c24c]" />
                      Offline verification & due diligence
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#f2c24c]" />
                      Trust & compliance validated
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#f2c24c]" />
                      Priority visibility on the platform
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#f2c24c]" />
                      Higher trust. More successful deals.
                    </li>
                  </ul>

                  <button
                    type="button"
                    onClick={() => openForm('verification')}
                    className="mt-4 inline-flex items-center gap-3 rounded-2xl bg-[linear-gradient(135deg,#f3be49,#ffd86b)] px-5 py-2.5 text-[14px] font-black text-[#2f2302] shadow-[0_12px_24px_rgba(243,190,73,0.24)] transition hover:-translate-y-0.5"
                  >
                    Get Tradafycation
                    <ArrowRight className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 rounded-[22px] border border-slate-200/70 bg-white px-4 py-4 shadow-[0_18px_44px_rgba(15,23,42,0.05)] sm:grid-cols-4 sm:px-5">
            {heroStats.map((stat) => (
              <div key={stat.label} className="rounded-[16px] px-2 py-1 sm:border-r sm:border-slate-100 last:sm:border-r-0">
                <div className="text-[1.55rem] font-black tracking-[-0.04em] text-[#0a1630]">{stat.value}</div>
                <div className="mt-1 text-[12px] leading-5 text-slate-500">{stat.label}</div>
              </div>
            ))}
          </section>

          <section className="space-y-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#16345c]">Our core services</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {supportCardItems.map(({ key, Component }) =>
                React.createElement(Component, {
                  key,
                  compact: true,
                  onOpenForm: () => openForm(key),
                  onOpenVerification: () => openForm(key === 'verification' ? 'verification' : key),
                })
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-[22px] bg-[linear-gradient(135deg,#132746_0%,#173b67_48%,#0f2340_100%)] px-5 py-4 text-white shadow-[0_22px_56px_rgba(15,23,42,0.18)]">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#f2c24c]">
                  <Crown className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-[1.35rem] font-black tracking-[-0.04em] text-white">
                    Unlock full potential with Premium
                  </h3>
                  <p className="mt-1 text-[14px] leading-6 text-slate-200/90">
                    Get unlimited support, priority response, and advanced services.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/premium-plans')}
                className="inline-flex items-center gap-3 rounded-2xl bg-[linear-gradient(135deg,#f5bd47,#efc15a)] px-5 py-3 text-[14px] font-black text-[#1d2a44] shadow-[0_14px_28px_rgba(245,189,71,0.26)] transition hover:-translate-y-0.5"
              >
                View Premium Plans
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <InfoCard title="How it works">
            <div className="space-y-4">
              {workflowSteps.map((step, index) => (
                <WorkflowStep key={step.title} index={index} step={step} />
              ))}
            </div>
            <div className="mt-2 border-t border-slate-100 pt-4 text-[14px] text-[#18447f]">
              <span className="inline-flex items-center gap-2">
                <Clock3 className="h-4.5 w-4.5" />
                Average response time: <strong>24h</strong>
              </span>
            </div>
          </InfoCard>

          <InfoCard title="Why Tradafy Deal Support?">
            <ul className="space-y-3">
              {whySupport.map((item) => (
                <RailBullet key={item}>{item}</RailBullet>
              ))}
            </ul>
          </InfoCard>

          <InfoCard title="Trusted by traders">
            <p className="text-[15px] leading-7 text-slate-600">{testimonial.quote}</p>
            <div className="mt-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img src={testimonial.avatar} alt={testimonial.name} className="h-12 w-12 rounded-full object-cover ring-1 ring-slate-200" />
                <div>
                  <p className="font-bold text-slate-900">{testimonial.name}</p>
                  <p className="text-[12px] text-slate-500">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[#f1b51f]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-4.5 w-4.5 fill-current" />
                ))}
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Need custom support?">
            <p className="text-[15px] leading-7 text-slate-600">
              Can&apos;t find what you need? Our team is ready to help with custom requests.
            </p>
            <button
              type="button"
              onClick={() => openForm('custom-service')}
              className="mt-5 inline-flex items-center gap-3 rounded-xl border border-[#d7e2f2] bg-[linear-gradient(135deg,#f2f6ff,#e8effe)] px-4 py-3 text-[14px] font-black text-[#18447f] transition hover:-translate-y-0.5"
            >
              <Headphones className="h-4.5 w-4.5" />
              Contact Support Team
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          </InfoCard>
        </aside>
      </div>

      {ActiveForm ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
          <div className="relative max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-[32px] border border-white/60 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.28)]">
            <button
              type="button"
              onClick={() => setActiveForm(null)}
              className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/95 text-slate-600 shadow-sm transition hover:bg-slate-50"
              aria-label="Close form"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="relative overflow-hidden bg-[linear-gradient(180deg,#0f2846_0%,#173b67_52%,#245c9d_100%)] p-6 text-white sm:p-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(229,169,61,0.12),transparent_28%)]" />
                <div className="relative inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-sky-100">
                  Deal Support Request
                </div>
                <h2 className="relative mt-4 text-3xl font-black tracking-[-0.05em]">
                  Professional intake
                </h2>
                <p className="relative mt-3 text-sm leading-6 text-sky-100/85">
                  Complete the form on the right. We keep the experience focused so the request is clean and review-ready.
                </p>
                <div className="relative mt-6 grid gap-3">
                  {['Single screen workflow', 'Clean intake for support review', 'Built to feel formal and polished'].map((item) => (
                    <div key={item} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm backdrop-blur">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="max-h-[92vh] overflow-y-auto bg-[#fbfcfe] p-4 sm:p-6">
                <ActiveForm compact={false} />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
