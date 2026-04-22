/**
 * PricingPage.jsx
 *
 * Full-page pricing view accessible at /pricing.
 * Renders the existing PremiumMembershipSection in full (non-compact) mode
 * with a back navigation.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PremiumMembershipSection from '../components/membership/PremiumMembershipSection';

export default function PricingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#071120]">
      {/* Back nav */}
      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </div>

      {/* Pricing section */}
      <div className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <PremiumMembershipSection compact={false} />
      </div>
    </div>
  );
}
