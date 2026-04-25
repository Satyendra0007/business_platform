import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { AppShell } from './ui';
import DealSupportIllustration from './deal-support/DealSupportIllustration';
import DealSupportFooter from './deal-support/DealSupportFooter';
import { dealSupportSections, proofPills } from './deal-support/dealSupportData';
import DealSupportSection from './deal-support/DealSupportSection';
import { ShieldCheck, FileText, Clock3 } from 'lucide-react';
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

export default function DealSupportPage() {
  const [activeForm, setActiveForm] = useState(null);

  const ActiveForm = useMemo(() => (activeForm ? formRegistry[activeForm] : null), [activeForm]);

  return (
    <AppShell title="Deal Support" subtitle="Structured services for legal review, compliance verification, and trade execution support.">
      <div className="relative space-y-6">
        <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-[#dce9fb]/70 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-14 h-48 w-48 rounded-full bg-[#f0e4c9]/60 blur-3xl" />

        <section className="relative overflow-hidden rounded-[32px] border border-slate-200/70 bg-[linear-gradient(180deg,#fbfcfe_0%,#f4f7fb_100%)] px-5 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.04)] sm:px-6 sm:py-6">
          <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr] xl:items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#c8d8ee] bg-[#f3f8ff] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3a6497]">
                Active Workspace
              </div>
              <h1 className="mt-3 text-[2.15rem] font-black tracking-[-0.05em] text-slate-900 sm:text-[2.6rem]">
                Deal Support
              </h1>
              <p className="mt-3 max-w-2xl text-[0.95rem] leading-7 text-slate-500">
                Use professional support flows to review documents, request verification, and keep your trade execution clean and compliant.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  { icon: FileText, label: 'Legal review', copy: 'Contracts, LOIs, and SPAs' },
                  { icon: ShieldCheck, label: 'Verification', copy: 'Company trust and labels' },
                  { icon: Clock3, label: 'Response ready', copy: 'Track requests in one place' },
                ].map(({ icon, label, copy }) => (
                  <div key={label} className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#edf5ff] text-[#245c9d]">
                        {React.createElement(icon, { className: 'h-5 w-5' })}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{label}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{copy}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full">
              <div className="rounded-[28px] border border-slate-200/80 bg-white/90 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
                <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
                  <div className="order-2 lg:order-1">
                    <h2 className="text-[1.05rem] font-semibold tracking-[-0.04em] text-slate-800 sm:text-[1.15rem]">
                      Legal, verification, and service workflows
                    </h2>
                    <p className="mt-1 max-w-md text-[0.82rem] leading-6 text-slate-600">
                      Fill out the forms below to send a clean, review-ready request.
                    </p>
                  </div>
                  <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
                    <DealSupportIllustration />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          {dealSupportSections.map((section) => (
            <DealSupportSection key={section.key} section={section} onLaunch={setActiveForm} />
          ))}
        </section>

        <DealSupportFooter pills={proofPills} />

        {ActiveForm ? (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
            <div className="relative max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-[32px] border border-white/60 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.28)]">
              <button
                type="button"
                onClick={() => setActiveForm(null)}
                className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
                aria-label="Close form"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="bg-[linear-gradient(180deg,#0f2846_0%,#173b67_52%,#245c9d_100%)] p-6 text-white sm:p-8">
                  <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-sky-100">
                    Deal Support Request
                  </div>
                  <h2 className="mt-4 text-3xl font-black tracking-[-0.05em]">
                    Professional intake
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-sky-100/85">
                    Complete the form on the right. We keep the experience focused so the request is clean and review-ready.
                  </p>
                  <div className="mt-6 grid gap-3">
                    {[
                      'Single screen workflow',
                      'Clean intake for support review',
                      'Built to feel formal and polished',
                    ].map((item) => (
                      <div key={item} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="max-h-[92vh] overflow-y-auto p-4 sm:p-6">
                  <ActiveForm compact={false} />
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
