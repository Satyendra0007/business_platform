import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Mail, Phone, ShieldCheck, Sparkles, UserRound, Zap, Shield, Globe, ShipWheel } from 'lucide-react';
import { Reveal } from './ui';
import tradafyLogo from '../assets/tradafy_logo_official.png';
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
    <div className="min-h-screen overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(236,181,58,0.18),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(30,64,175,0.16),transparent_22%),linear-gradient(180deg,#eff4fb_0%,#f8fafc_42%,#edf3fb_100%)] px-3 py-2 sm:px-4 sm:py-3 lg:px-8">
      <div className="mx-auto grid max-w-[1520px] rounded-[28px] border border-white/70 bg-white/70 shadow-[0_32px_100px_rgba(15,23,42,0.16)] backdrop-blur-xl lg:h-[calc(100vh-1rem)] lg:overflow-hidden lg:rounded-[38px] lg:grid-cols-[1fr_1.1fr]">
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
              <button onClick={() => navigate('/')} className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md mb-12 text-left">
                <div className="flex items-center justify-center">
                  <img src={tradafyLogo} alt="Tradafy" className="h-11 w-11 object-contain brightness-0 invert" />
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

        <section className="flex min-h-full items-center justify-center bg-white px-6 py-12 lg:h-full lg:overflow-y-auto lg:px-12">
          <div className="w-full max-w-[480px]">
            <div className="mb-8">
              <p className="text-sm font-bold uppercase tracking-widest text-[#245c9d]">Create Account</p>
              <h2 className="mt-2 text-3xl font-display font-black tracking-tight text-slate-900">Join the Workspace.</h2>
              <p className="mt-2 text-sm text-slate-600">Select your role and enter your professional credentials.</p>
            </div>

            <div className="mb-8 rounded-[16px] bg-slate-100 p-1">
              <div className="grid grid-cols-3 gap-1">
                {roles.map((role) => {
                  const active = selectedRole === role.key;
                  return (
                    <button
                      key={role.key}
                      onClick={() => setSelectedRole(role.key)}
                      className={`flex flex-col items-center justify-center rounded-[12px] py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all ${
                        active ? 'bg-white text-[#143a6a] shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <UserRound className={`mb-1 h-5 w-5 ${active ? 'text-[#e5a93d]' : 'text-slate-400'}`} />
                      {role.label.replace('Join as ', '')}
                    </button>
                  );
                })}
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">Full Name</span>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 focus-within:border-[#245c9d] focus-within:ring-4 focus-within:ring-[#245c9d]/10 transition-all">
                    <UserRound className="h-5 w-5 text-slate-400" />
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                      placeholder="John Doe"
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">Company Name</span>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 focus-within:border-[#245c9d] focus-within:ring-4 focus-within:ring-[#245c9d]/10 transition-all">
                    <Building2 className="h-5 w-5 text-slate-400" />
                    <input
                      required
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                      placeholder="Organization"
                    />
                  </div>
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Email Address</span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 focus-within:border-[#245c9d] focus-within:ring-4 focus-within:ring-[#245c9d]/10 transition-all">
                  <Mail className="h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="you@company.com"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Mobile Number</span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 focus-within:border-[#245c9d] focus-within:ring-4 focus-within:ring-[#245c9d]/10 transition-all">
                  <Phone className="h-5 w-5 text-slate-400" />
                  <input
                    required
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </label>

              <div className="pt-4">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0c1f38] px-4 py-4 text-sm font-bold text-white shadow-[0_10px_20px_rgba(12,31,56,0.2)] transition hover:bg-[#153a66]"
                >
                  Activate {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Workspace
                  <ArrowRight className="h-4 w-4" />
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
