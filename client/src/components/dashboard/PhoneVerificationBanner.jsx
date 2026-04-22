/**
 * PhoneVerificationBanner.jsx
 *
 * Shows a prominent CTA on the dashboard when the user's phone is not verified.
 * Mirrors the CompanyBanner pattern — hidden for admins, gone once verified.
 */
import React from 'react';
import { Phone, ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function PhoneVerificationBanner() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Admins are exempt
  if (user?.roles?.includes('admin')) return null;

  // Already verified — nothing to show
  if (user?.isPhoneVerified) return null;

  // Not verified — show the banner
  const hasPhone = Boolean(user?.phone);

  return (
    <div className="flex flex-col gap-4 overflow-hidden rounded-[26px] border border-blue-200 bg-[linear-gradient(135deg,#f0f8ff,#e8f4fd)] p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-[#245c9d]">
          <Phone className="h-5 w-5" />
        </div>
        <div>
          <p className="font-bold text-slate-900">
            {hasPhone ? 'Phone verification pending' : 'Add your phone number'}
          </p>
          <p className="mt-0.5 text-sm text-slate-600">
            {hasPhone
              ? `${user.phone} is not verified yet. Verify now to unlock all features.`
              : 'A verified phone is required to create companies, RFQs, and deals.'}
          </p>
        </div>
      </div>
      <button
        onClick={() => navigate('/phone/verify')}
        className="inline-flex shrink-0 items-center gap-2 self-start rounded-2xl bg-[#245c9d] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#1a4580] sm:self-center"
      >
        <ShieldCheck className="h-4 w-4" />
        {hasPhone ? 'Verify Now' : 'Add & Verify Phone'}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
