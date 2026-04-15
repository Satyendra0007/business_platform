/**
 * CompanyBanner.jsx
 *
 * Shows the appropriate company status banner at the top of the dashboard:
 *  - Admins → hidden
 *  - No company → amber CTA to set up
 *  - Company pending → amber "Pending Review" badge
 *  - Company verified → green "Verified" badge  ← was always stuck on "Pending"
 *  - Company rejected → red "Rejected" badge with re-submit hint
 *
 * FIXED: fetches live company data from API on mount so that admin approval
 * is reflected immediately without requiring the user to log out and back in.
 */
import React, { useEffect, useState } from 'react';
import { ArrowRight, Building2, ShieldCheck, ShieldX, Clock, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getCompanyById } from '../../lib/companyService';

export default function CompanyBanner() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [company,  setCompany]  = useState(null);
  const [loading,  setLoading]  = useState(false);

  // Fetch the real company whenever companyId is present
  useEffect(() => {
    if (!user?.companyId) return;
    setLoading(true);
    getCompanyById(user.companyId)
      .then(setCompany)
      .catch(() => setCompany(null))   // fail silently — banner hides gracefully
      .finally(() => setLoading(false));
  }, [user?.companyId]);

  // Admins don't need a company
  if (user?.roles?.includes('admin')) return null;

  // ── No company yet — primary setup CTA ───────────────────────────────────────
  if (!user?.companyId) {
    return (
      <div className="flex flex-col gap-4 overflow-hidden rounded-[26px] border border-amber-200 bg-[linear-gradient(135deg,#fffbf0,#fff8e6)] p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-slate-900">Your company profile is not set up yet</p>
            <p className="mt-0.5 text-sm text-slate-600">
              You need a company profile to list products, send RFQs, and participate in deals.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/company/setup')}
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-2xl bg-[#0A2540] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#143a6a] sm:self-center"
        >
          Set Up Company <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // ── Company linked — show live verification status ────────────────────────────
  // While fetching, show a skeleton-style banner
  if (loading || !company) {
    return (
      <div className="flex items-center gap-4 overflow-hidden rounded-[26px] border border-slate-100 bg-[#f8fbff] px-5 py-3.5 shadow-sm">
        <div className="flex h-9 w-9 shrink-0 animate-pulse items-center justify-center rounded-xl bg-slate-100" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-32 animate-pulse rounded-full bg-slate-200" />
          <div className="h-2.5 w-48 animate-pulse rounded-full bg-slate-100" />
        </div>
        <Loader2 className="h-4 w-4 animate-spin text-slate-300" />
      </div>
    );
  }

  const status = company.verificationStatus || 'pending';

  // ── Verified ──────────────────────────────────────────────────────────────────
  if (status === 'verified') {
    return (
      <div className="flex items-center gap-4 overflow-hidden rounded-[26px] border border-emerald-200 bg-[linear-gradient(135deg,#f0fdf4,#ecfdf5)] px-5 py-3.5 shadow-sm">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-800">{company.name}</p>
          <p className="text-xs text-slate-500">Your company is verified and fully active on Tradafy.</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
          <ShieldCheck className="h-3 w-3" /> Verified
        </div>
      </div>
    );
  }

  // ── Rejected ──────────────────────────────────────────────────────────────────
  if (status === 'rejected') {
    return (
      <div className="flex flex-col gap-4 overflow-hidden rounded-[26px] border border-rose-200 bg-[linear-gradient(135deg,#fff5f5,#fef2f2)] p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <ShieldX className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-slate-900">{company.name} — Verification Rejected</p>
            <p className="mt-0.5 text-sm text-slate-600">
              Your company verification was rejected. Please contact support or resubmit with correct documents.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
          <ShieldX className="h-3 w-3" /> Rejected
        </div>
      </div>
    );
  }

  // ── Pending (default) ─────────────────────────────────────────────────────────
  return (
    <div className="flex items-center gap-4 overflow-hidden rounded-[26px] border border-sky-100 bg-[linear-gradient(135deg,#f0f8ff,#e8f4fd)] px-5 py-3.5 shadow-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
        <ShieldCheck className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-slate-800">{company.name}</p>
        <p className="text-xs text-slate-500">Admin will verify your company. Verification unlocks product listings.</p>
      </div>
      <div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
        <Clock className="h-3 w-3" /> Pending
      </div>
    </div>
  );
}
