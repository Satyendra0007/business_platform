import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Phone, Loader2, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import tradafyLogo from '../assets/Tradafy_logo_comparison_on_navy_backdrops-3-removebg-preview.png';
import { useAuth } from '../hooks/useAuth';
import { saveToken, saveUser } from '../lib/api';
import { sendOtp, resendOtp, verifyOtp } from '../lib/authService';

const RESEND_COOLDOWN = 60; // seconds
const CODE_LENGTH = 6;

export default function VerifyPhonePage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const phone = decodeURIComponent(searchParams.get('phone') || '');

  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(''));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending]     = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState(false);
  const [countdown, setCountdown]     = useState(0);

  const inputRefs = useRef([]);

  // Auto-send OTP on mount (Twilio Verify will send SMS)
  useEffect(() => {
    if (!phone) return;
    handleSendOtp(true);  // isInitial = true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async (isInitial = false) => {
    if (!phone) {
      setError('No phone number found. Please register again.');
      return;
    }
    setError('');
    setIsSending(true);
    try {
      // Initial send on mount uses sendOtp; manual resend uses resendOtp (unverified-only guard)
      if (isInitial) {
        await sendOtp(phone);
      } else {
        await resendOtp(phone);
      }
      setCountdown(RESEND_COOLDOWN);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleDigitChange = (index, value) => {
    // Allow only single digit
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError('');

    // Auto-advance focus
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
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
      const focusIdx = Math.min(text.length, CODE_LENGTH - 1);
      inputRefs.current[focusIdx]?.focus();
      e.preventDefault();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length < CODE_LENGTH) {
      setError('Please enter the complete 6-digit code.');
      return;
    }
    setError('');
    setIsVerifying(true);
    try {
      await verifyOtp(phone, code);
      setSuccess(true);
      sessionStorage.removeItem('tradafy-pending-auth');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid OTP. Please try again.');
      setDigits(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSkip = () => {
    const pendingAuthRaw = sessionStorage.getItem('tradafy-pending-auth');
    if (pendingAuthRaw) {
      try {
        const pendingAuth = JSON.parse(pendingAuthRaw);
        if (pendingAuth?.token && pendingAuth?.user) {
          const userToSave = { ...pendingAuth.user, token: pendingAuth.token };
          saveToken(pendingAuth.token);
          saveUser(userToSave);
          sessionStorage.removeItem('tradafy-pending-auth');
          login(userToSave);
          return;
        }
      } catch {
        sessionStorage.removeItem('tradafy-pending-auth');
      }
    }

    // Fallback: send them to login if no pending session is available.
    navigate('/login', { replace: true });
  };

  // Mask phone: show first 3 and last 2 digits
  const maskedPhone = phone
    ? phone.slice(0, 3) + '•'.repeat(Math.max(0, phone.length - 5)) + phone.slice(-2)
    : '';

  // ─── Success Screen ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="max-w-md w-full rounded-[38px] border border-slate-200 bg-white p-10 text-center shadow-[0_32px_100px_rgba(15,23,42,0.08)]">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Phone Verified!</h2>
          <p className="mt-4 text-slate-600">
            Your phone number has been verified. Redirecting to login…
          </p>
          <div className="mt-8 flex justify-center">
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-full origin-left animate-[loading_2.5s_ease-in-out] bg-green-500" />
            </div>
          </div>
        </div>
        <style>{`
          @keyframes loading {
            0%   { transform: scaleX(0); }
            100% { transform: scaleX(1); }
          }
        `}</style>
      </div>
    );
  }

  // ─── OTP Screen ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(236,181,58,0.18),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(30,64,175,0.16),transparent_22%),linear-gradient(180deg,#eff4fb_0%,#f8fafc_42%,#edf3fb_100%)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="rounded-[32px] border border-white/70 bg-white shadow-[0_32px_100px_rgba(15,23,42,0.14)] backdrop-blur-xl p-8 sm:p-10">

          {/* Logo */}
          <button onClick={() => navigate('/')} className="inline-flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#050E1C] shadow-md">
              <img src={tradafyLogo} alt="Tradafy" className="h-7 w-7 object-contain" />
            </div>
            <span className="text-sm font-black tracking-widest text-[#050E1C] uppercase">TRADAFY</span>
          </button>

          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#245c9d]">
              <Phone className="h-7 w-7" />
            </div>
            <p className="text-sm font-bold uppercase tracking-widest text-[#245c9d]">Phone Verification</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Enter the code</h1>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              We sent a 6-digit code to{' '}
              <span className="font-semibold text-slate-700">{maskedPhone}</span>.
              Enter it below to verify your account.
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleVerify}>
            {/* OTP digit boxes */}
            <div className="mb-8 flex justify-center gap-2.5" onPaste={handlePaste}>
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`h-14 w-12 rounded-2xl border-2 text-center text-xl font-bold text-slate-900 outline-none transition-all
                    ${digit
                      ? 'border-[#245c9d] bg-[#f0f6ff] shadow-[0_0_0_4px_rgba(36,92,157,0.08)]'
                      : 'border-slate-200 bg-white hover:border-slate-300 focus:border-[#245c9d] focus:bg-[#f0f6ff] focus:shadow-[0_0_0_4px_rgba(36,92,157,0.08)]'
                    }`}
                  autoComplete="one-time-code"
                  aria-label={`OTP digit ${i + 1}`}
                />
              ))}
            </div>

            {/* Verify button */}
            <button
              id="otp-verify-btn"
              type="submit"
              disabled={isVerifying || digits.join('').length < CODE_LENGTH}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0c1f38] px-4 py-4 text-sm font-bold text-white shadow-[0_10px_20px_rgba(12,31,56,0.2)] transition hover:bg-[#153a66] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                <>
                  Verify Phone
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <button
              id="otp-skip-btn"
              type="button"
              onClick={handleSkip}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 sm:w-auto sm:px-6"
            >
              Skip for now
            </button>
          </form>

          {/* Resend section */}
          <div className="mt-6 text-center">
            {countdown > 0 ? (
              <p className="text-sm text-slate-500">
                Resend code in{' '}
                <span className="font-bold text-[#245c9d] tabular-nums">{countdown}s</span>
              </p>
            ) : (
              <button
                type="button"
                id="otp-resend-btn"
                onClick={() => handleSendOtp(false)}
                disabled={isSending}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#245c9d] transition hover:text-[#0c1f38] disabled:opacity-50"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {isSending ? 'Sending…' : "Didn't receive it? Resend"}
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 border-t border-slate-100 pt-6 text-center">
            <p className="text-xs text-slate-400">
              Wrong number?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="font-semibold text-[#e5a93d] transition hover:text-[#c48d2b]"
              >
                Go back to register
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
