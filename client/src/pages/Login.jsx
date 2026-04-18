import React, { useState } from 'react';
import {
  ArrowRight, BriefcaseBusiness, Eye, EyeOff, Lock, Mail,
  Package, ShipWheel, Globe, Zap, Shield, AlertCircle, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Reveal } from '../components/ui';
import tradafyLogo from '../assets/Tradafy_logo_comparison_on_navy_backdrops-3-removebg-preview.png';
import { login } from '../lib/authService';
import { useAuth } from '../hooks/useAuth';

const roles = [
  {
    key: 'buyer',
    label: 'Buyer',
    tag: 'Procurement',
    note: 'Browse listings, create RFQs, and convert strong opportunities into deals.',
    accent: 'Source fast',
    icon: BriefcaseBusiness,
  },
  {
    key: 'supplier',
    label: 'Supplier',
    tag: 'Sales',
    note: 'Manage your catalog, respond to incoming RFQs, and deliver with confidence.',
    accent: 'Sell smarter',
    icon: Package,
  },
  {
    key: 'shipping_agent',
    label: 'Shipping Agent',
    tag: 'Logistics',
    note: 'Bid on approved deal lanes, win freight awards, and manage shipment execution visibility.',
    accent: 'Move freight',
    icon: ShipWheel,
  },
];

function LoginPage() {
  const { login: contextLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const userData = await login(email.trim(), password);
      if (!userData || !userData._id) {
        setError('Login failed. Please try again.');
        return;
      }
      // Token is already saved to localStorage by authService.login()
      // contextLogin() sets React state and navigates to /dashboard
      contextLogin(userData);
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }

  };

  return (
    <div className="min-h-screen overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(236,181,58,0.18),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(30,64,175,0.16),transparent_22%),linear-gradient(180deg,#eff4fb_0%,#f8fafc_42%,#edf3fb_100%)] px-3 py-2 sm:px-4 sm:py-3 lg:px-6">
      <div className="mx-auto grid max-w-[1520px] rounded-[28px] border border-white/70 bg-white/70 shadow-[0_32px_100px_rgba(15,23,42,0.16)] backdrop-blur-xl lg:h-[calc(100vh-1rem)] lg:overflow-hidden lg:rounded-[34px] lg:grid-cols-[1.03fr_0.97fr]">

        {/* ─── Left Panel ─── */}
        <section className="relative hidden overflow-hidden bg-[#050E1C] p-10 text-white lg:flex lg:flex-col justify-center">
          {/* Animated Background Mesh */}
          <div className="absolute inset-0 z-0 opacity-20">
            <svg className="h-full w-full" viewBox="0 0 800 800">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              <circle cx="150" cy="150" r="120" className="fill-blue-500/20 blur-3xl animate-float-slow" />
              <circle cx="650" cy="650" r="150" className="fill-amber-500/10 blur-3xl animate-float-slow delay-700" />
            </svg>
          </div>

          <div className="relative z-10">
            <Reveal effect="zoom">
              <button onClick={() => navigate('/')} className="inline-flex items-center gap-4 rounded-[22px] border border-white/10 bg-white/5 px-5 py-3.5 backdrop-blur-md mb-12">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-[0_10px_30px_rgba(15,23,42,0.2)]">
                  <img src={tradafyLogo} alt="Tradafy" className="h-9 w-9 object-contain" />
                </div>
                <div className="text-left">
                  <div className="text-lg font-black tracking-widest text-white uppercase">TRADAFY</div>
                  <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">Global Workspace</div>
                </div>
              </button>
            </Reveal>

            <div className="space-y-6 max-w-lg">
              <Reveal delay={200}>
                <h1 className="text-6xl font-black leading-[0.9] tracking-tight">
                  Serious trade <br />
                  <span className="text-[#E5A93D]">needs serious tools.</span>
                </h1>
              </Reveal>
              <Reveal delay={400}>
                <p className="text-xl text-slate-400 font-medium leading-relaxed">
                  Join a verified ecosystem where procurement meets logistics visibility. One workspace, zero friction.
                </p>
              </Reveal>
            </div>

            <div className="mt-16 grid gap-4">
              {[
                { icon: Shield, title: 'Verified Network', desc: 'Secure deals with 100% vetted participants.' },
                { icon: Zap, title: 'Instant Workspace', desc: 'Convert RFQs to deals in seconds.' },
                { icon: Globe, title: 'Global Execution', desc: 'Track shipments across all major routes.' }
              ].map((item, i) => (
                <Reveal key={i} delay={600 + (i * 150)} effect="right">
                  <div className="group flex items-center gap-6 p-6 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-xl transition hover:bg-white/10 hover:border-white/20">
                    <div className="h-14 w-14 rounded-2xl bg-amber-300/10 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
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
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-[#050E1C] bg-slate-800 flex items-center justify-center text-[10px] font-black">U{i}</div>
                  ))}
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Global active users</p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ─── Right Panel (Form) ─── */}
        <section className="flex min-h-full items-center justify-center bg-white px-6 py-12 lg:h-full lg:overflow-y-auto lg:px-12">
          <div className="w-full max-w-[440px]">
            <div className="mb-8">
              <p className="text-sm font-bold uppercase tracking-widest text-[#245c9d]">Log In</p>
              <h2 className="mt-2 text-3xl font-display font-black tracking-tight text-slate-900">Welcome back.</h2>
              <p className="mt-2 text-sm text-slate-600">Enter your credentials to access your global trade workspace.</p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Email Address</span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 focus-within:border-[#245c9d] focus-within:ring-4 focus-within:ring-[#245c9d]/10 transition-all">
                  <Mail className="h-5 w-5 text-slate-400" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="you@company.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Password</span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 focus-within:border-[#245c9d] focus-within:ring-4 focus-within:ring-[#245c9d]/10 transition-all">
                  <Lock className="h-5 w-5 text-slate-400" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="text-slate-400 transition hover:text-slate-700">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </label>

              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-[#245c9d] focus:ring-[#245c9d]" />
                  <span className="text-sm font-medium text-slate-600">Remember me</span>
                </label>
                <button type="button" className="text-sm font-bold text-[#245c9d] hover:underline">Forgot password?</button>
              </div>

              <div className="pt-2">
                <button
                  id="login-submit"
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0c1f38] px-4 py-4 text-sm font-bold text-white shadow-[0_10px_20px_rgba(12,31,56,0.2)] transition hover:bg-[#153a66] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      Log In to Workspace
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-10 text-center">
              <p className="text-sm text-slate-600">
                New to TRADAFY?{' '}
                <button onClick={() => navigate('/register')} className="font-bold text-[#e5a93d] transition hover:text-[#c48d2b]">
                  Create an account
                </button>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LoginPage;
