import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Rocket, Users2, X } from 'lucide-react';

export default function EarlyAccessPromo({ variant = 'banner' }) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(true);

  const copy = useMemo(() => ({
    banner: {
      eyebrow: 'Early access open',
      title: 'FREE FOR TESTERS',
      subtitle: 'Be among the first to test Tradafy and help shape the future of global trade.',
      cta: 'Register Here',
      note: 'Limited spots available',
    },
    card: {
      eyebrow: 'Early access open',
      title: 'Get free access as a tester',
      subtitle: 'Full platform access · Priority support · Help shape the future',
      cta: 'Register Here',
      benefits: [
        'Be part of our early community',
        'Test all features for free',
        'Provide feedback and get priority access',
      ],
      note: 'Limited spots available',
    },
  }), []);

  if (!visible) return null;

  const handleDismiss = () => {
    if (variant !== 'banner') return;
    setVisible(false);
  };

  if (variant === 'card') {
    return (
      <section className="relative overflow-hidden rounded-[28px] border border-[#12325b] bg-[linear-gradient(135deg,#08162a_0%,#0c2450_48%,#123c7a_100%)] px-4 py-4 text-white shadow-[0_24px_70px_rgba(10,31,56,0.24)] sm:px-5 sm:py-5 lg:px-6 lg:py-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(229,169,61,0.16),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.15),transparent_28%)]" />
        <div className="relative grid gap-4 lg:grid-cols-[1.05fr_0.95fr_0.75fr] lg:items-start">
          <div className="flex items-start gap-3">
            <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#0f2f5a,#163f75)] shadow-[0_16px_30px_rgba(0,0,0,0.22)] ring-1 ring-white/10">
              <Rocket className="h-6.5 w-6.5 text-[#E5A93D]" />
            </div>
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-[7px] font-black uppercase tracking-[0.26em] text-sky-100">
                {copy.card.eyebrow}
              </div>
              <h3 className="mt-2 text-[1.15rem] font-black leading-tight tracking-tight sm:text-[1.35rem] lg:text-[1.45rem]">
                {copy.card.title}
              </h3>
              <p className="mt-1 max-w-lg text-[11px] font-medium leading-5 text-sky-100/78 sm:text-[12px]">
                {copy.card.subtitle}
              </p>
            </div>
          </div>

          <div className="space-y-2 border-t border-white/10 pt-3 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
            {copy.card.benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-2.5 text-[11px] font-semibold text-white/92 sm:text-[12px]">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#E5A93D]" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-stretch gap-2 border-t border-white/10 pt-3 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#E5A93D,#FFB84D)] px-5 py-2.5 text-[12px] font-black uppercase tracking-[0.08em] text-[#0A2540] shadow-[0_12px_30px_rgba(229,169,61,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(229,169,61,0.34)]"
            >
              {copy.card.cta}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <div className="flex items-center gap-2 text-[10px] font-semibold text-sky-100/72">
              <Users2 className="h-3.5 w-3.5 text-sky-200" />
              {copy.card.note}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#07132a_0%,#0a2450_52%,#0d3872_100%)] px-4 py-3 text-white shadow-[0_14px_40px_rgba(10,31,56,0.25)] sm:px-6 sm:py-4 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(229,169,61,0.2),transparent_25%),radial-gradient(circle_at_right,rgba(59,130,246,0.16),transparent_28%)]" />
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#11305b,#1f4a85)] shadow-[0_14px_28px_rgba(0,0,0,0.22)] ring-1 ring-white/10">
            <Rocket className="h-6 w-6 text-[#E5A93D]" />
          </div>
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.28em] text-sky-100/70">
              {copy.banner.eyebrow}
            </div>
            <h2 className="mt-1 text-[1.05rem] font-black uppercase tracking-tight text-[#F6C65B] sm:text-[1.45rem]">
              {copy.banner.title}
            </h2>
            <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-sky-100/82 sm:text-[15px]">
              {copy.banner.subtitle}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end lg:min-w-[320px] lg:justify-end">
          <div className="flex flex-col items-start gap-1 sm:items-end">
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#F6C65B,#FFB84D)] px-5 py-2.5 text-sm font-black uppercase tracking-[0.06em] text-[#081A32] shadow-[0_10px_26px_rgba(246,198,91,0.25)] transition hover:-translate-y-0.5"
            >
              {copy.banner.cta}
              <ArrowRight className="h-4 w-4" />
            </button>
            <div className="text-xs font-medium text-sky-100/78">
              {copy.banner.note}
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/85 transition hover:bg-white/12 hover:text-white sm:ml-0"
            aria-label="Dismiss early access banner"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
