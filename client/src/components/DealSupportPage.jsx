import React from 'react';
import { AppShell } from './ui';
import DealSupportIllustration from './deal-support/DealSupportIllustration';
import DealSupportFooter from './deal-support/DealSupportFooter';
import { dealSupportSections, proofPills } from './deal-support/dealSupportData';
import DealSupportSection from './deal-support/DealSupportSection';

export default function DealSupportPage() {
  return (
    <AppShell title="" subtitle="">
      <div className="relative space-y-4">
        <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-[#dce9fb]/70 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-14 h-48 w-48 rounded-full bg-[#f0e4c9]/60 blur-3xl" />

        <section className="relative overflow-hidden rounded-[30px] border border-slate-200/70 bg-[linear-gradient(180deg,#fbfcfe_0%,#f4f7fb_100%)] px-4 py-2.5 shadow-[0_18px_50px_rgba(15,23,42,0.04)] sm:px-6 sm:py-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#c8d8ee] bg-[#f3f8ff] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3a6497]">
                Active Workspace
              </div>
              <h1 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-slate-900 sm:text-[2.35rem]">
                Deal Support
              </h1>
              <p className="mt-1.5 max-w-2xl text-[0.9rem] leading-6 text-slate-500">
                Enhance security, compliance and execution of your deals with premium services.
              </p>
            </div>

            <div className="w-full max-w-[260px] lg:pt-0">
              <div className="rounded-[24px] border border-slate-200/80 bg-white/80 px-2.5 py-2 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
                <div className="grid gap-1 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
                  <div className="order-2 lg:order-1">
                    <h2 className="text-[1rem] font-semibold tracking-[-0.04em] text-slate-800 sm:text-[1.1rem]">
                      Legal & Documents
                    </h2>
                    <p className="mt-1 max-w-md text-[0.78rem] leading-5 text-slate-600">
                      Enhance security, compliance and execution of your deals.
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

        <section className="-mt-16 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {dealSupportSections.map((section) => (
            <DealSupportSection key={section.key} section={section} />
          ))}
        </section>

        <DealSupportFooter pills={proofPills} />
      </div>
    </AppShell>
  );
}
