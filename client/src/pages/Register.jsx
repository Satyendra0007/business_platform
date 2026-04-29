import React, { useRef, useState } from 'react';
import {
  ArrowRight, Building2, CheckCircle2, Eye, EyeOff, Lock, Mail,
  Phone, UserRound, Globe, Zap, Shield, AlertCircle, Loader2, ImagePlus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Reveal } from '../components/ui';
import tradafyLogo from '../assets/Tradafy_logo_comparison_on_navy_backdrops-3-removebg-preview.png';
import { register } from '../lib/authService';

const roles = [
  { key: 'buyer', label: 'Buyer', tag: 'Procurement', note: 'Source products, create RFQs, and secure global trade deals.' },
  { key: 'supplier', label: 'Supplier', tag: 'Sales', note: 'List your catalog, respond to RFQs, and scale your exports.' },
  { key: 'shipping_agent', label: 'Shipping Agent', tag: 'Logistics', note: 'Bid on transport lanes, win freight awards, and manage shipment execution.' },
];

function RegisterPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('buyer');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted] = useState(false);

  // ── Profile image (optional Cloudinary upload) ──────────────────────────────
  const [profileImage, setProfileImage]       = useState('');   // final HTTPS URL
  const [imagePreview, setImagePreview]       = useState('');   // local blob for preview
  const [imageUploading, setImageUploading]   = useState(false);
  const [imageError, setImageError]           = useState('');
  const fileInputRef = useRef(null);

  const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview immediately
    setImagePreview(URL.createObjectURL(file));
    setImageError('');
    setImageUploading(true);

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: fd }
      );
      if (!res.ok) throw new Error('Upload failed');
      const json = await res.json();
      setProfileImage(json.secure_url);   // HTTPS URL stored for submission
    } catch {
      setImageError('Image upload failed. You can still register without a photo.');
      setProfileImage('');
    } finally {
      setImageUploading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const { firstName, lastName, email, password, confirmPassword, phone } = formData;

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password || !phone.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!/^\+[1-9]\d{6,14}$/.test(phone.trim())) {
      setError('Phone must be in E.164 format (e.g. +919876543210). Include country code.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await register({
        firstName: firstName.trim(),
        lastName:  lastName.trim(),
        email:     email.trim(),
        password,
        role:      selectedRole,
        phone:     phone.trim(),
        ...(profileImage ? { profileImage } : {}),
      });

      // Both new users and existing-unverified users land here.
      // result.phone is the canonical phone saved in the DB.
      if (result.token && result.user) {
        sessionStorage.setItem(
          'tradafy-pending-auth',
          JSON.stringify({ token: result.token, user: result.user })
        );
      }
      const phoneForOtp = result.phone || phone.trim();
      navigate(`/verify-phone?phone=${encodeURIComponent(phoneForOtp)}`);

    } catch (err) {
      // EMAIL_ALREADY_VERIFIED — account exists and is fully active, stay on page
      if (err.code === 'EMAIL_ALREADY_VERIFIED') {
        setError(err.response?.data?.message || err.message || 'This email is already registered. Please log in instead.');
        return;
      }
      // All other errors (network, validation, phone taken, etc.)
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Success Screen ───────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="max-w-md w-full rounded-[38px] border border-slate-200 bg-white p-10 text-center shadow-[0_32px_100px_rgba(15,23,42,0.08)]">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-display font-bold text-slate-900">Account Created!</h2>
          <p className="mt-4 text-slate-600">
            Welcome to TRADAFY, <span className="font-semibold">{formData.firstName}</span>. Your workspace is being prepared. Redirecting to login…
          </p>
          <div className="mt-8 flex justify-center">
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-full origin-left animate-[loading_2.5s_ease-in-out] bg-green-500" />
            </div>
          </div>
        </div>
        <style>{`
          @keyframes loading {
            0% { transform: scaleX(0); }
            100% { transform: scaleX(1); }
          }
        `}</style>
      </div>
    );
  }

  // ─── Registration Form ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(236,181,58,0.18),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(30,64,175,0.16),transparent_22%),linear-gradient(180deg,#eff4fb_0%,#f8fafc_42%,#edf3fb_100%)] px-3 py-2 sm:px-4 sm:py-3 lg:px-8">
      <div className="mx-auto grid max-w-[1520px] rounded-[28px] border border-white/70 bg-white/70 shadow-[0_32px_100px_rgba(15,23,42,0.16)] backdrop-blur-xl lg:h-[calc(100vh-1rem)] lg:rounded-[38px] lg:grid-cols-[1fr_1.1fr]">

        {/* ─── Left Panel ─── */}
        <section className="relative hidden overflow-hidden bg-[#050E1C] p-10 text-white lg:flex lg:flex-col justify-center">
          <div className="absolute inset-0 z-0 opacity-20">
            <svg className="h-full w-full" viewBox="0 0 800 800">
              <defs>
                <pattern id="grid-reg" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-reg)" />
              <circle cx="150" cy="150" r="120" className="fill-amber-500/20 blur-3xl animate-float-slow" />
              <circle cx="650" cy="650" r="150" className="fill-blue-500/10 blur-3xl animate-float-slow delay-700" />
            </svg>
          </div>

          <div className="relative z-10">
            <Reveal effect="zoom">
              <button onClick={() => navigate('/')} className="inline-flex items-center gap-4 rounded-[22px] border border-white/10 bg-white/5 px-5 py-3.5 backdrop-blur-md mb-12 text-left">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-[0_10px_30px_rgba(15,23,42,0.2)]">
                  <img src={tradafyLogo} alt="Tradafy" className="h-9 w-9 object-contain" />
                </div>
                <div>
                  <div className="text-lg font-black tracking-widest text-white uppercase">TRADAFY</div>
                  <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">Global Workspace</div>
                </div>
              </button>
            </Reveal>

            <div className="space-y-6 max-w-lg">
              <Reveal delay={200}>
                <h1 className="text-6xl font-black leading-[0.9] tracking-tight">
                  One account. <br />
                  <span className="text-[#E5A93D]">Unlimited trade.</span>
                </h1>
              </Reveal>
              <Reveal delay={400}>
                <p className="text-xl text-slate-400 font-medium leading-relaxed">
                  Activate your professional profile and start engaging with a global network of verified suppliers.
                </p>
              </Reveal>
            </div>

            <div className="mt-16 grid gap-6">
              {[
                { icon: Shield, title: 'Verified Onboarding', desc: 'Secure access to a curated network of international partners.' },
                { icon: Zap, title: 'Workspace Ready', desc: 'Pre-configured tools for RFQs and deal execution.' },
                { icon: Globe, title: 'Global Compliance', desc: 'Built-in standards for secure digital trade.' }
              ].map((item, i) => (
                <Reveal key={i} delay={600 + (i * 150)} effect="right">
                  <div className="group flex items-center gap-6 p-6 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-xl transition hover:bg-white/10 hover:border-white/20">
                    <div className="h-14 w-14 rounded-2xl bg-blue-400/10 flex items-center justify-center text-blue-300 group-hover:scale-110 transition-transform">
                      <item.icon className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                      <p className="text-sm text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="relative z-10 pt-12 mt-8 border-t border-white/10">
            <Reveal delay={1000}>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/20"
                >
                  Back to Login
                  <ArrowRight className="h-4 w-4" />
                </button>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest italic">Join the future of trade</p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ─── Right Panel (Form) ─── */}
        <section className="flex min-h-full flex-col overflow-y-auto bg-white px-6 py-10 lg:h-full lg:px-12">
          <div className="mx-auto my-auto w-full max-w-[480px]">
            <div className="mb-8">
              <p className="text-sm font-bold uppercase tracking-widest text-[#245c9d]">Create Account</p>
              <h2 className="mt-2 text-3xl font-display font-black tracking-tight text-slate-900">Join the Workspace.</h2>
              <p className="mt-2 text-sm text-slate-600">Select your role and enter your professional credentials.</p>
            </div>

            {/* Role Selector */}
            <div className="mb-8 rounded-[16px] bg-slate-100 p-1">
              <div className="grid grid-cols-3 gap-1">
                {roles.map((role) => {
                  const active = selectedRole === role.key;
                  return (
                    <button
                      key={role.key}
                      type="button"
                      onClick={() => setSelectedRole(role.key)}
                      className={`flex flex-col items-center justify-center rounded-[12px] py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all ${active ? 'bg-white text-[#143a6a] shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                      <UserRound className={`mb-1 h-5 w-5 ${active ? 'text-[#e5a93d]' : 'text-slate-400'}`} />
                      {role.label.replace('Join as ', '')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* First & Last Name */}
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">First Name</span>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 focus-within:border-[#245c9d] focus-within:ring-4 focus-within:ring-[#245c9d]/10 transition-all">
                    <UserRound className="h-5 w-5 text-slate-400" />
                    <input
                      id="reg-firstName"
                      required
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                      placeholder="John"
                      autoComplete="given-name"
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">Last Name</span>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 focus-within:border-[#245c9d] focus-within:ring-4 focus-within:ring-[#245c9d]/10 transition-all">
                    <UserRound className="h-5 w-5 text-slate-400" />
                    <input
                      id="reg-lastName"
                      required
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                      placeholder="Doe"
                      autoComplete="family-name"
                    />
                  </div>
                </label>
              </div>

              {/* Email */}
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Email Address</span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 focus-within:border-[#245c9d] focus-within:ring-4 focus-within:ring-[#245c9d]/10 transition-all">
                  <Mail className="h-5 w-5 text-slate-400" />
                  <input
                    id="reg-email"
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="you@company.com"
                    autoComplete="email"
                  />
                </div>
              </label>

              {/* Phone Number */}
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Phone Number <span className="text-slate-400 font-normal">(with country code)</span>
                </span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 focus-within:border-[#245c9d] focus-within:ring-4 focus-within:ring-[#245c9d]/10 transition-all">
                  <Phone className="h-5 w-5 text-slate-400 shrink-0" />
                  <input
                    id="reg-phone"
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="+919876543210"
                    autoComplete="tel"
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-400">E.164 format — include + and country code (e.g. +91 for India, +1 for USA)</p>
              </label>

              {/* Password */}
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Password <span className="text-slate-400 font-normal">(min. 6 characters)</span></span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 focus-within:border-[#245c9d] focus-within:ring-4 focus-within:ring-[#245c9d]/10 transition-all">
                  <Lock className="h-5 w-5 text-slate-400" />
                  <input
                    id="reg-password"
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    minLength={6}
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-slate-400 transition hover:text-slate-700">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </label>

              {/* Confirm Password */}
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Confirm Password</span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 focus-within:border-[#245c9d] focus-within:ring-4 focus-within:ring-[#245c9d]/10 transition-all">
                  <Lock className="h-5 w-5 text-slate-400" />
                  <input
                    id="reg-confirmPassword"
                    required
                    type={showConfirm ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowConfirm((v) => !v)} className="text-slate-400 transition hover:text-slate-700">
                    {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </label>

              {/* ── Profile Photo (optional) ─────────────────────────────── */}
              <div>
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Profile Photo <span className="text-slate-400 font-normal">(optional)</span>
                </span>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-3.5 transition hover:border-[#245c9d] hover:bg-[#f8fbff]"
                >
                  {/* Preview or placeholder */}
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-[#245c9d]/20"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <ImagePlus className="h-5 w-5" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    {imageUploading ? (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading…
                      </div>
                    ) : profileImage ? (
                      <p className="truncate text-sm font-semibold text-emerald-600">✓ Photo uploaded</p>
                    ) : (
                      <p className="text-sm text-slate-500">Click to choose a photo</p>
                    )}
                    <p className="text-xs text-slate-400 mt-0.5">JPG, PNG or WebP · max 5 MB</p>
                  </div>
                </div>

                {/* Hidden native file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageChange}
                />

                {imageError && (
                  <p className="mt-2 text-xs font-medium text-amber-600">{imageError}</p>
                )}
              </div>

              <div className="pt-4">
                <button
                  id="register-submit"
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0c1f38] px-4 py-4 text-sm font-bold text-white shadow-[0_10px_20px_rgba(12,31,56,0.2)] transition hover:bg-[#153a66] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account…
                    </>
                  ) : (
                    <>
                      Activate {selectedRole === 'shipping_agent' ? 'Shipping Agent' : selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Workspace
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
                <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                  By activating, you agree to the TRADAFY Platform Terms and our data coordination standards.
                </p>
              </div>
            </form>

            <div className="mt-8 text-center border-t border-slate-100 pt-8">
              <p className="text-sm text-slate-600">
                Already have an account?{' '}
                <button onClick={() => navigate('/login')} className="font-bold text-[#e5a93d] transition hover:text-[#c48d2b]">
                  Log In
                </button>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default RegisterPage;
