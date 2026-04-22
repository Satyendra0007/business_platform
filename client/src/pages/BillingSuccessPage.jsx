/**
 * BillingSuccessPage.jsx
 *
 * Shown at /billing/success after a successful Stripe Checkout.
 *
 * What it does:
 *  1. Fetches the latest billing status from the server (which the webhook already updated).
 *  2. Re-fetches the full user profile and syncs it into AuthContext + localStorage.
 *  3. Redirects to /dashboard after a short celebration delay.
 *
 * Security: plan state comes from the SERVER — we never trust the URL params.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, Star, ArrowRight } from 'lucide-react';
import api from '../lib/api';
import { getBillingStatus } from '../lib/billingService';
import { useAuth } from '../hooks/useAuth';

export default function BillingSuccessPage() {
  const navigate  = useNavigate();
  const { fetchUser } = useAuth();

  const [status, setStatus]   = useState('loading'); // 'loading' | 'success' | 'pending'
  const [planName, setPlanName] = useState('');

  useEffect(() => {
    let cancelled = false;

    const syncUserData = async () => {
      try {
        // 1. Poll billing status — webhook may arrive slightly after redirect
        let billing = null;
        for (let attempt = 0; attempt < 10; attempt++) {
          billing = await getBillingStatus();
          if (billing.subscriptionStatus === 'active') break;
          // Wait 2 s between polls (max ~20 s total)
          await new Promise((r) => setTimeout(r, 2000));
        }

        // 2. Re-fetch full user profile so in-memory state reflects new plan
        if (!cancelled) {
          await fetchUser();
          setPlanName(billing?.plan || 'premium');
          setStatus('success');
        }
      } catch (err) {
        console.error('[BillingSuccess] Error syncing user data:', err.response?.data?.message || err.message);
        if (!cancelled) setStatus('success'); // still redirect on error
      }
    };

    syncUserData();
    return () => { cancelled = true; };
  }, [fetchUser]);

  // Auto-redirect to dashboard after 4 s once confirmed
  useEffect(() => {
    if (status !== 'success') return;
    const t = setTimeout(() => navigate('/dashboard', { replace: true }), 4000);
    return () => clearTimeout(t);
  }, [status, navigate]);

  return (
    <div className="min-h-screen bg-[#071120] flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute left-1/3 top-1/4 h-72 w-72 rounded-full bg-[#245c9d]/15 blur-[100px]" />
        <div className="absolute right-1/4 bottom-1/3 h-64 w-64 rounded-full bg-[#E5A93D]/10 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,#0d1f35_0%,#081628_100%)] shadow-[0_40px_120px_rgba(3,7,20,0.6)]">
          {/* Top gradient bar */}
          <div className="h-1.5 w-full bg-[linear-gradient(90deg,#0A2540_0%,#245c9d_50%,#E5A93D_100%)]" />

          <div className="flex flex-col items-center px-8 py-10 text-center">
            {status === 'loading' ? (
              <>
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <Loader2 className="h-9 w-9 animate-spin text-[#E5A93D]" />
                </div>
                <h1 className="mt-6 text-2xl font-black tracking-tight text-white">
                  Activating your plan…
                </h1>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  Confirming your subscription with Stripe. This takes just a moment.
                </p>
              </>
            ) : (
              <>
                {/* Success icon */}
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 ring-4 ring-emerald-400/10">
                  <CheckCircle className="h-10 w-10 text-emerald-400" />
                  <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#E5A93D]">
                    <Star className="h-3 w-3 text-[#0A2540]" />
                  </div>
                </div>

                <h1 className="mt-6 text-2xl font-black tracking-tight text-white">
                  You're all set! 🎉
                </h1>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                  Your{' '}
                  <span className="font-black uppercase text-[#E5A93D]">
                    {planName}
                  </span>{' '}
                  plan is now active. All features have been unlocked.
                </p>

                {/* Plan badge */}
                <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                  ✓ Subscription Active
                </div>

                {/* Redirect notice */}
                <p className="mt-6 text-xs text-slate-500">
                  Redirecting to your dashboard in a moment…
                </p>

                {/* Manual CTA */}
                <button
                  id="billing-success-go-to-dashboard"
                  onClick={() => navigate('/dashboard', { replace: true })}
                  className="mt-4 flex items-center gap-2 rounded-2xl bg-[#E5A93D] px-6 py-3 text-sm font-black text-[#0A2540] transition hover:bg-[#d49530] hover:-translate-y-0.5 active:translate-y-0"
                >
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
