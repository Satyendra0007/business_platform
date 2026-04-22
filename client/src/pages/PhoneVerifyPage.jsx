/**
 * PhoneVerifyPage.jsx
 *
 * Full-page phone verification flow for existing logged-in users.
 * Mirrors the CompanySetupPage layout: dark sidebar + stepped right panel.
 *
 * Step 0 — Enter phone number
 * Step 1 — Enter OTP code
 * Step 2 — Done ✓
 */
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Phone, ShieldCheck, CheckCircle2, ArrowRight,
  Loader2, AlertCircle, RefreshCw, X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { updatePhone, resendOtp, verifyOtp } from '../lib/authService';
import { saveUser } from '../lib/api';
import tradafyLogo from '../assets/Tradafy_logo_comparison_on_navy_backdrops-3-removebg-preview.png';

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 60;

// ─── Sidebar step dot ────────────────────────────────────────────────────────
function StepDot({ label, index, active, done }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2 text-center">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition ${
          done
            ? 'border-emerald-400 bg-emerald-500 text-white'
            : active
              ? 'border-[#E5A93D] bg-[#E5A93D] text-[#0A2540]'
              : 'border-white/20 bg-white/5 text-white/60'
        }`}
      >
        {done ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
      </div>
      <span className={`text-[11px] font-semibold ${active || done ? 'text-white' : 'text-white/50'}`}>
        {label}
      </span>
    </div>
  );
}

export default function PhoneVerifyPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);

  // Step 0 state
  const [phone, setPhone]         = useState(user?.phone || '');
  const [phoneError, setPhoneError] = useState('');
  const [isSaving, setIsSaving]   = useState(false);

  // Step 1 state
  const [digits, setDigits]           = useState(Array(CODE_LENGTH).fill(''));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending]     = useState(false);
  const [otpError, setOtpError]       = useState('');
  const [countdown, setCountdown]     = useState(0);
  const [confirmedPhone, setConfirmedPhone] = useState('');

  const inputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // If user already has a phone and is not verified, skip to OTP step
  useEffect(() => {
    if (user?.phone && !user?.isPhoneVerified && step === 0) {
      setPhone(user.phone);
      // Pre-fill phone, but don't auto-advance — let them confirm
    }
  }, [user]);

  // ─── Step 0: Submit phone ──────────────────────────────────────────────────
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setPhoneError('');

    const trimmed = phone.trim();
    if (!trimmed) {
      setPhoneError('Phone number is required.');
      return;
    }
    if (!/^\+[1-9]\d{6,14}$/.test(trimmed)) {
      setPhoneError('Must be E.164 format — include + and country code (e.g. +919876543210).');
      return;
    }

    setIsSaving(true);
    try {
      const result = await updatePhone(trimmed);
      setConfirmedPhone(result.phone);
      setCountdown(RESEND_COOLDOWN);
      setStep(1);
      // Focus first OTP input after transition
      setTimeout(() => inputRefs.current[0]?.focus(), 200);
    } catch (err) {
      setPhoneError(err.response?.data?.message || err.message || 'Failed to save phone. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Step 1: OTP digit handlers ───────────────────────────────────────────
  const handleDigitChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setOtpError('');
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) inputRefs.current[index - 1]?.focus();
      const next = [...digits];
      next[index] = '';
      setDigits(next);
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (text.length > 0) {
      const next = [...text.split(''), ...Array(CODE_LENGTH).fill('')].slice(0, CODE_LENGTH);
      setDigits(next);
      inputRefs.current[Math.min(text.length, CODE_LENGTH - 1)]?.focus();
      e.preventDefault();
    }
  };

  const handleResend = async () => {
    setOtpError('');
    setIsSending(true);
    try {
      await resendOtp(confirmedPhone);
      setCountdown(RESEND_COOLDOWN);
      setDigits(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err) {
      setOtpError(err.response?.data?.message || err.message || 'Failed to resend OTP.');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length < CODE_LENGTH) {
      setOtpError('Please enter the complete 6-digit code.');
      return;
    }
    setOtpError('');
    setIsVerifying(true);
    try {
      await verifyOtp(confirmedPhone, code);
      // Update local user state so the banner disappears immediately
      const updatedUser = { ...user, phone: confirmedPhone, isPhoneVerified: true };
      saveUser(updatedUser);
      updateUser(updatedUser);
      setStep(2);
    } catch (err) {
      setOtpError(err.response?.data?.message || err.message || 'Invalid OTP. Please try again.');
      setDigits(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  // Masked phone for display
  const maskedPhone = confirmedPhone
    ? confirmedPhone.slice(0, 3) + '•'.repeat(Math.max(0, confirmedPhone.length - 5)) + confirmedPhone.slice(-2)
    : '';

  const steps = ['Phone Number', 'Verify Code', 'Done'];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">

      {/* ── LEFT: Dark sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-[380px] shrink-0 flex-col justify-between bg-[#0A2540] p-10">
        <div>
          <img src={tradafyLogo} alt="Tradafy" className="h-10 w-auto" />
          <h1 className="mt-10 text-3xl font-black text-white leading-tight tracking-tight">
            Verify your<br />
            <span className="text-[#E5A93D]">phone number.</span>
          </h1>
          <p className="mt-4 text-sm leading-6 text-sky-100/70">
            A verified phone number unlocks full platform access — creating companies, RFQs, and deals all require it.
          </p>

          {/* Step indicators */}
          <div className="mt-14 flex items-start gap-3">
            {steps.map((label, i) => (
              <React.Fragment key={label}>
                <StepDot label={label} index={i} active={step === i} done={step > i} />
                {i < steps.length - 1 && (
                  <div className={`mt-4 flex-1 h-px ${step > i ? 'bg-emerald-500/50' : 'bg-white/10'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Info callouts */}
          <div className="mt-14 space-y-4">
            {[
              { icon: ShieldCheck, text: 'OTP is sent via Twilio — no code is stored in our database.' },
              { icon: CheckCircle2, text: 'International numbers are supported in E.164 format.' },
              { icon: CheckCircle2, text: 'Once verified, you get full access to all trade workflows.' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <p className="text-sm text-sky-100/70">{text}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-white/30">© {new Date().getFullYear()} Tradafy · All rights reserved</p>
      </aside>

      {/* ── RIGHT: Form panel ─────────────────────────────────────────────── */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-16">

        {/* Skip link */}
        {step < 2 && (
          <div className="mb-8 w-full max-w-xl flex justify-end">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-3.5 w-3.5" /> Skip for now
            </button>
          </div>
        )}

        <div className="w-full max-w-xl">

          {/* ── STEP 0: Enter phone ──────────────────────────────────────── */}
          {step === 0 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#245c9d]">Step 1 of 2</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Enter your phone</h2>
                <p className="mt-2 text-sm text-slate-500">
                  We'll send a one-time code to verify your number. International numbers welcome.
                </p>
              </div>

              {/* Phone icon badge */}
              <div className="flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-blue-50 border border-blue-100 shadow-[0_0_40px_rgba(36,92,157,0.1)]">
                  <Phone className="h-9 w-9 text-[#245c9d]" />
                </div>
              </div>

              <form onSubmit={handlePhoneSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-all focus-within:ring-4 focus-within:ring-[#245c9d]/10 ${
                    phoneError
                      ? 'border-rose-300 bg-rose-50 focus-within:border-rose-400'
                      : 'border-slate-200 bg-slate-50 focus-within:border-[#245c9d] focus-within:bg-white'
                  }`}>
                    <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                    <input
                      id="phone-input"
                      type="tel"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); setPhoneError(''); }}
                      placeholder="+919876543210"
                      autoComplete="tel"
                      className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    />
                  </div>
                  {phoneError
                    ? <p className="text-xs font-medium text-rose-500">{phoneError}</p>
                    : <p className="text-xs text-slate-400">E.164 format — include + and country code (e.g. +91 for India, +1 for USA)</p>
                  }
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0A2540] py-4 text-sm font-bold text-white transition hover:bg-[#143a6a] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                >
                  {isSaving ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Sending OTP…</>
                  ) : (
                    <>Send Verification Code <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ── STEP 1: Verify OTP ───────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#245c9d]">Step 2 of 2</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Enter the code</h2>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                  We sent a 6-digit code to{' '}
                  <span className="font-semibold text-slate-700">{maskedPhone}</span>.
                  {' '}Enter it below.
                  <button
                    type="button"
                    onClick={() => { setStep(0); setDigits(Array(CODE_LENGTH).fill('')); setOtpError(''); }}
                    className="ml-2 text-[#245c9d] font-semibold hover:underline"
                  >
                    Change number
                  </button>
                </p>
              </div>

              {otpError && (
                <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5">
                  <AlertCircle className="h-5 w-5 text-rose-500 mt-0.5 shrink-0" />
                  <p className="text-sm font-medium text-rose-700">{otpError}</p>
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-6">
                {/* OTP digit boxes */}
                <div className="flex justify-center gap-3" onPaste={handlePaste}>
                  {digits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (inputRefs.current[i] = el)}
                      id={`otp-digit-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      autoComplete="one-time-code"
                      aria-label={`OTP digit ${i + 1}`}
                      className={`h-16 w-12 rounded-2xl border-2 text-center text-2xl font-bold text-slate-900 outline-none transition-all
                        ${digit
                          ? 'border-[#245c9d] bg-[#f0f6ff] shadow-[0_0_0_4px_rgba(36,92,157,0.08)]'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300 focus:border-[#245c9d] focus:bg-[#f0f6ff] focus:shadow-[0_0_0_4px_rgba(36,92,157,0.08)]'
                        }`}
                    />
                  ))}
                </div>

                {/* Resend */}
                <div className="text-center">
                  {countdown > 0 ? (
                    <p className="text-sm text-slate-500">
                      Resend in <span className="font-bold text-[#245c9d] tabular-nums">{countdown}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isSending}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#245c9d] hover:text-[#0c1f38] transition disabled:opacity-50"
                    >
                      {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                      {isSending ? 'Sending…' : "Didn't receive it? Resend"}
                    </button>
                  )}
                </div>

                <button
                  id="otp-verify-submit"
                  type="submit"
                  disabled={isVerifying || digits.join('').length < CODE_LENGTH}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E5A93D] py-4 text-sm font-black text-[#0A2540] transition hover:bg-[#d49530] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
                >
                  {isVerifying ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Verifying…</>
                  ) : (
                    <><CheckCircle2 className="h-4 w-4" /> Verify Phone Number</>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ── STEP 2: Success ──────────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-8 text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-emerald-50 border border-emerald-100 shadow-[0_0_40px_rgba(16,185,129,0.15)]">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight text-slate-900">Phone Verified!</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600 max-w-sm mx-auto">
                  <span className="font-semibold">{confirmedPhone}</span> has been verified. You now have full access to all Tradafy features.
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
                <ShieldCheck className="mb-0.5 mr-1.5 inline h-4 w-4 text-emerald-600" />
                <strong>Verified</strong> — You can now create companies, RFQs, and deals.
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0A2540] py-4 text-sm font-bold text-white transition hover:bg-[#143a6a]"
              >
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
