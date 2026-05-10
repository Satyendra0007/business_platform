import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AppShell } from '../components/ui';
import GetVerifiedCard from '../components/deal-support/cards/GetVerifiedCard';

export default function DealVerificationPage() {
  const navigate = useNavigate();

  return (
    <AppShell title="Deal Support" subtitle="Complete your company verification on a dedicated page.">
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => navigate('/deal-support')}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Deal Support
        </button>

        <section className="rounded-[32px] border border-slate-200/70 bg-[linear-gradient(180deg,#fbfcfe_0%,#f4f7fb_100%)] p-4 shadow-[0_18px_50px_rgba(15,23,42,0.04)] sm:p-6">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#3a6497]">Verification Workspace</p>
              <h1 className="mt-2 text-[2rem] font-black tracking-[-0.05em] text-slate-900 sm:text-[2.4rem]">
                Get Verified
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Use this dedicated form to submit your company verification details in one focused place.
              </p>
            </div>

            <GetVerifiedCard />
          </div>
        </section>
      </div>
    </AppShell>
  );
}
