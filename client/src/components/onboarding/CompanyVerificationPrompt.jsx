import React from 'react';
import { ArrowRight, Building2, Package, ShieldCheck } from 'lucide-react';

export default function CompanyVerificationPrompt({
  open,
  onClose,
  onPrimary,
  role = 'supplier',
}) {
  if (!open) return null;

  const isSupplier = role === 'supplier';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-[32px] border border-white/20 bg-[linear-gradient(180deg,#ffffff_0%,#f6f9fd_100%)] shadow-[0_32px_120px_rgba(15,23,42,0.28)]">
        <div className="h-1.5 w-full bg-[linear-gradient(90deg,#0A2540_0%,#245c9d_55%,#E5A93D_100%)]" />

        <div className="p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-sky-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Company verification
          </div>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-xl">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-[2rem]">
                {isSupplier
                  ? 'Verify your company before publishing products.'
                  : 'Complete your company profile to unlock the workspace.'}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {isSupplier
                  ? 'Suppliers need a verified business profile before they can add products. Finish verification first, and we will take you straight to the product creation screen.'
                  : 'A verified company profile keeps your account professional, trusted, and ready for trade activity.'}
              </p>
            </div>

            <div className="grid shrink-0 gap-3 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:w-[240px]">
              <div className="flex items-center gap-3 rounded-2xl bg-[#edf5ff] px-3 py-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#143a6a] text-white">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Step 1</div>
                  <div className="text-sm font-bold text-slate-900">Company verification</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-[#f7fbf5] px-3 py-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Step 2</div>
                  <div className="text-sm font-bold text-slate-900">Add your product</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Continue phone verification
            </button>
            <button
              type="button"
              onClick={onPrimary}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0A2540,#245c9d)] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(20,58,106,0.24)] transition hover:-translate-y-0.5"
            >
              Start company verification
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
