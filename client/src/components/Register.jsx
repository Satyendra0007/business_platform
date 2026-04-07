import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Mail, Phone, ShieldCheck, Sparkles, UserRound, Zap, Shield, Globe, ShipWheel } from 'lucide-react';
import { Reveal } from './ui';
import dashboardReference from '../assets/dashboard-reference.jpeg';

const roles = [
  { key: 'buyer', label: 'Join as Buyer', tag: 'Procurement', note: 'Source products, create RFQs, and secure global trade deals.' },
  { key: 'supplier', label: 'Join as Supplier', tag: 'Sales', note: 'List your catalog, respond to RFQs, and scale your exports.' },
  { key: 'shipping_agent', label: 'Join as Shipping Agent', tag: 'Logistics', note: 'Bid on transport lanes, win freight awards, and manage shipment execution.' },
];

function RegisterPage({ navigate }) {
  const [selectedRole, setSelectedRole] = useState('buyer');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    company: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const selectedMeta = roles.find((role) => role.key === selectedRole);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formData.name || !formData.mobile || !formData.company) {
      alert('Please fill in all required fields (Name, Mobile, and Company).');
      return;
    }
    // Simulation of registration success
    setSubmitted(true);
    setTimeout(() => navigate('/login'), 2500);
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="max-w-md w-full rounded-[38px] border border-slate-200 bg-white p-10 text-center shadow-[0_32px_100px_rgba(15,23,42,0.08)]">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-display font-bold text-slate-900">Account Created!</h2>
          <p className="mt-4 text-slate-600">
            Welcome to TRADAFY, <span className="font-semibold">{formData.name}</span>. Your workspace is being prepared. Redirecting to login...
          </p>
          <div className="mt-8 flex justify-center">
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-full origin-left animate-[loading_2s_ease-in-out] bg-green-500" />
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

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(236,181,58,0.18),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(30,64,175,0.16),transparent_22%),linear-gradient(180deg,#eff4fb_0%,#f8fafc_42%,#edf3fb_100%)] px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid h-[calc(100vh-2rem)] max-w-[1520px] overflow-hidden rounded-[38px] border border-white/70 bg-white/70 shadow-[0_32px_100px_rgba(15,23,42,0.16)] backdrop-blur-xl lg:grid-cols-[1fr_1.1fr]">
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
              <circle cx="150" cy="150" r="120" className="fill-amber-500/20 blur-3xl animate-float-slow" />
              <circle cx="650" cy="650" r="150" className="fill-blue-500/10 blur-3xl animate-float-slow delay-700" />
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

          <div className="absolute bottom-10 left-10 right-10 relative z-10 pt-12">
            <Reveal delay={1000}>
              <div className="pt-8 border-t border-white/10 flex items-center justify-between">
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

        <section className="flex h-full items-center overflow-y-auto bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,250,252,0.96))] px-5 py-5 sm:px-7 lg:px-9">
          <div className="mx-auto w-full max-w-xl">
            <button
              onClick={() => navigate('/login')}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <div className="rounded-[32px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_28px_80px_rgba(15,23,42,0.08)] sm:p-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Fast Enrollment</p>
                <h2 className="mt-2.5 font-display text-[2.7rem] leading-[0.95] tracking-[-0.04em] text-slate-950">Create your workspace account</h2>
                <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">
                  Select your primary role and fill in your professional credentials.
                </p>
              </div>

              <div className="mt-8">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {roles.map((role) => {
                    const active = role.key === selectedRole;
                    return (
                      <button
                        key={role.key}
                        type="button"
                        onClick={() => setSelectedRole(role.key)}
                        className={`rounded-[24px] border p-4 text-left transition ${
                          active
                            ? 'border-slate-900 bg-slate-900 text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)]'
                            : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300 hover:bg-white'
                        }`}
                        >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[15px] font-semibold">{role.label}</p>
                            <p className={`mt-1 text-[10px] font-black uppercase tracking-[0.18em] ${active ? 'text-amber-300' : 'text-slate-500'}`}>{role.tag}</p>
                          </div>
                          <div className={`h-4 w-4 rounded-full border-4 ${active ? 'border-amber-300 bg-amber-400' : 'border-slate-300 bg-transparent'}`} />
                        </div>
                        <div className={`mt-3 inline-flex h-9 w-9 items-center justify-center rounded-2xl ${active ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          {role.key === 'shipping_agent' ? <ShipWheel className="h-4.5 w-4.5" /> : <UserRound className="h-4.5 w-4.5" />}
                        </div>
                        <p className={`mt-3 text-xs leading-5 ${active ? 'text-slate-300' : 'text-slate-500'}`}>{role.note}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">Full Name <span className="text-red-500">*</span></span>
                    <div className="flex items-center gap-3 rounded-[20px] border border-slate-200 bg-slate-50/50 px-4 py-3.5 focus-within:border-slate-400 focus-within:bg-white transition-all">
                      <UserRound className="h-4 w-4 text-slate-400" />
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                        placeholder="e.g. John Doe"
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">Email Address (Optional)</span>
                    <div className="flex items-center gap-3 rounded-[20px] border border-slate-200 bg-slate-50/50 px-4 py-3.5 focus-within:border-slate-400 focus-within:bg-white transition-all">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                        placeholder="john@company.com"
                      />
                    </div>
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-700">Mobile Number <span className="text-red-500">*</span></span>
                      <div className="flex items-center gap-3 rounded-[20px] border border-slate-200 bg-slate-50/50 px-4 py-3.5 focus-within:border-slate-400 focus-within:bg-white transition-all">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <input
                          required
                          type="tel"
                          value={formData.mobile}
                          onChange={(e) => handleInputChange('mobile', e.target.value)}
                          className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-700">Company Name <span className="text-red-500">*</span></span>
                      <div className="flex items-center gap-3 rounded-[20px] border border-slate-200 bg-slate-50/50 px-4 py-3.5 focus-within:border-slate-400 focus-within:bg-white transition-all">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        <input
                          required
                          type="text"
                          value={formData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                          placeholder="Organization name"
                        />
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-[22px] bg-[linear-gradient(135deg,#0f223f,#1d4d86)] px-5 py-4 text-base font-semibold text-white shadow-[0_20px_45px_rgba(15,23,42,0.22)] transition-all hover:translate-y-[-2px] hover:shadow-[0_25px_50px_rgba(15,23,42,0.28)]"
                  >
                    Activate {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Workspace
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                    By activating, you agree to the TRADAFY Platform Terms and our data coordination standards.
                  </p>
                </div>
              </form>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-white/40 py-4 backdrop-blur-sm">
               <span className="text-sm text-slate-600">Already a verified user?</span>
               <button onClick={() => navigate('/login')} className="text-sm font-bold text-slate-900 underline underline-offset-4 decoration-amber-400 hover:text-blue-900 transition-colors">
                 Log in here
               </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default RegisterPage;
