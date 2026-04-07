import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Lock, Mail, ShieldCheck, ShipWheel, Sparkles, UserRound, Globe, Zap, Shield } from 'lucide-react';
import { Reveal } from './ui';
import dashboardReference from '../assets/dashboard-reference.jpeg';

const roles = [
  { key: 'buyer', label: 'Buyer', tag: 'Procurement', note: 'Browse listings, create RFQs, and convert strong opportunities into deals.' },
  { key: 'supplier', label: 'Supplier', tag: 'Sales', note: 'Manage your catalog, respond to incoming RFQs, and deliver with confidence.' },
  { key: 'shipping_agent', label: 'Shipping Agent', tag: 'Logistics', note: 'Bid on approved deal lanes, win freight awards, and manage shipment execution visibility.' },
  { key: 'admin', label: 'Admin', tag: 'Operations', note: 'Monitor the entire platform from a single oversight workspace.' },
];

function LoginPage({ navigate, onLogin }) {
  const [selectedRole, setSelectedRole] = useState('buyer');
  const [email, setEmail] = useState('buyer@tradafy.app');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);

  const selectedMeta = roles.find((role) => role.key === selectedRole);

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(236,181,58,0.18),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(30,64,175,0.16),transparent_22%),linear-gradient(180deg,#eff4fb_0%,#f8fafc_42%,#edf3fb_100%)] px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid h-[calc(100vh-2rem)] max-w-[1520px] overflow-hidden rounded-[38px] border border-white/70 bg-white/70 shadow-[0_32px_100px_rgba(15,23,42,0.16)] backdrop-blur-xl lg:grid-cols-[1.03fr_0.97fr]">
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
              <button onClick={() => navigate('/')} className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md mb-12">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-orange-400 font-black text-[#0A2540] text-xl shadow-lg">T</div>
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

          <div className="absolute bottom-10 left-10 right-10 relative z-10 pt-12">
            <Reveal delay={1000}>
              <div className="pt-8 border-t border-white/10 flex items-center justify-between">
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

        <section className="flex h-full items-center overflow-y-auto bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,250,252,0.96))] px-5 py-5 sm:px-7 lg:px-9">
          <div className="mx-auto w-full max-w-xl">
            <button
              onClick={() => navigate('/')}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              Back to Home
            </button>

            <div className="rounded-[32px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_28px_80px_rgba(15,23,42,0.08)] sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Workspace Login</p>
                  <h2 className="mt-2.5 font-display text-[2.7rem] leading-[0.95] tracking-[-0.04em] text-slate-950">Access your TRADAFY role</h2>
                  <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">
                    Choose your role, confirm the matching demo identity, and open a workspace tuned to your responsibilities.
                  </p>
                </div>
                <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f223f,#1b4679)] text-white sm:flex">
                  <ShieldCheck className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Select Role</p>
                <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  {roles.map((role) => {
                    const active = role.key === selectedRole;
                    return (
                      <button
                        key={role.key}
                        type="button"
                        onClick={() => {
                          setSelectedRole(role.key);
                          setEmail(`${role.key}@tradafy.app`);
                        }}
                        className={`rounded-[22px] border p-3.5 text-left transition ${
                          active
                            ? 'border-slate-900 bg-slate-900 text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)]'
                            : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[15px] font-semibold">{role.label}</p>
                            <p className={`mt-1 text-xs font-semibold uppercase tracking-[0.18em] ${active ? 'text-amber-300' : 'text-slate-500'}`}>{role.tag}</p>
                          </div>
                          <div className={`h-3.5 w-3.5 rounded-full ${active ? 'bg-amber-300' : 'bg-slate-300'}`} />
                        </div>
                        <p className={`mt-2 text-sm leading-5 ${active ? 'text-slate-300' : 'text-slate-600'}`}>{role.note}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <form
                className="mt-6 space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  onLogin(selectedRole);
                }}
              >
                <div className="rounded-[22px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                      {selectedRole === 'shipping_agent' ? <ShipWheel className="h-5 w-5" /> : selectedRole === 'admin' ? <ShieldCheck className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{selectedMeta.label} Workspace</p>
                      <p className="text-sm text-slate-500">Professional access configured for {selectedMeta.tag.toLowerCase()} workflows.</p>
                    </div>
                  </div>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Email</span>
                  <div className="flex items-center gap-3 rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-slate-400">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                      placeholder="you@company.com"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Password</span>
                  <div className="flex items-center gap-3 rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-slate-400">
                    <Lock className="h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                      placeholder="Enter your password"
                    />
                    <button type="button" onClick={() => setShowPassword((value) => !value)} className="text-slate-400 transition hover:text-slate-700">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-[22px] bg-[linear-gradient(135deg,#0f223f,#1d4d86)] px-5 py-3.5 text-base font-semibold text-white shadow-[0_20px_45px_rgba(15,23,42,0.22)] transition hover:translate-y-[-1px]"
                >
                  Continue to {selectedMeta.label} Workspace
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <div className="mt-5 grid gap-2.5 rounded-[24px] border border-slate-200 bg-slate-50 p-3.5 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-3 rounded-[16px] bg-white px-4 py-2.5">
                  <span>Recommended demo email</span>
                  <span className="font-semibold text-slate-900">{selectedRole}@tradafy.app</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-[16px] bg-white px-4 py-2.5">
                  <span>Password</span>
                  <span className="font-semibold text-slate-900">password</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col items-center gap-3">
                <div className="h-px w-full bg-slate-200" />
                <p className="text-sm text-slate-600">
                  New to TRADAFY?{' '}
                  <button
                    onClick={() => navigate('/register')}
                    className="font-bold text-slate-900 underline underline-offset-4 decoration-amber-400 hover:text-blue-900 transition-colors"
                  >
                    Create an account
                  </button>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LoginPage;
