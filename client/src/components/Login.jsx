import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Lock, Mail, ShieldCheck, ShipWheel, Sparkles, UserRound } from 'lucide-react';
import dashboardReference from '../assets/dashboard-reference.jpeg';

const roles = [
  { key: 'buyer', label: 'Buyer', tag: 'Procurement', note: 'Browse listings, create RFQs, and convert strong opportunities into deals.' },
  { key: 'supplier', label: 'Supplier', tag: 'Sales', note: 'Manage your catalog, respond to incoming RFQs, and deliver with confidence.' },
  { key: 'shipping_agent', label: 'Shipping Agent', tag: 'Logistics', note: 'Coordinate logistics milestones, shipment updates, and delivery visibility.' },
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
        <section className="relative hidden overflow-hidden bg-[linear-gradient(150deg,#091a30_0%,#102542_40%,#163860_100%)] p-7 text-white lg:flex lg:flex-col">
          <div className="absolute inset-0">
            <img src={dashboardReference} alt="TRADAFY platform workspace preview" className="h-full w-full object-cover opacity-28" />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(5,14,28,0.82),rgba(10,27,50,0.72),rgba(16,37,66,0.9))]" />
          <div className="absolute left-10 top-10 h-44 w-44 rounded-full bg-amber-300/18 blur-3xl" />
          <div className="absolute bottom-12 right-10 h-52 w-52 rounded-full bg-sky-300/16 blur-3xl" />

          <div className="relative z-10 flex items-center justify-between">
            <button onClick={() => navigate('/')} className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-left backdrop-blur">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-400 font-bold text-slate-950">T</div>
              <div>
                <div className="text-lg font-semibold tracking-[0.22em]">TRADAFY</div>
                <div className="text-xs uppercase tracking-[0.18em] text-slate-300">Global Trade Workspace</div>
              </div>
            </button>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-100">
              <Sparkles className="h-3.5 w-3.5" />
              Trusted Network
            </div>
          </div>

          <div className="relative z-10 mt-10 max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200">Professional Access</p>
            <h1 className="mt-4 font-display text-5xl leading-[0.96] tracking-[-0.04em] text-white">
              A sharper login experience for serious global trade teams.
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-200">
              Step into a workspace built for procurement, supplier coordination, logistics visibility, and platform oversight without losing the visual confidence of a modern enterprise product.
            </p>
          </div>

          <div className="relative z-10 mt-8 grid gap-4 xl:grid-cols-3">
            {[
              ['Verified companies', 'Buyers, suppliers, and logistics partners are modeled as trusted platform participants.'],
              ['Live RFQ conversion', 'Move from public discovery into private deal collaboration with clear role access.'],
              ['Shipment visibility', 'Track commercial and logistics milestones in one coordinated workspace.'],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-[26px] border border-white/10 bg-white/10 p-4 backdrop-blur">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                  <CheckCircle2 className="h-5 w-5 text-amber-200" />
                </div>
                <h2 className="mt-3 text-base font-semibold text-white">{title}</h2>
                <p className="mt-2 text-sm leading-5 text-slate-300">{copy}</p>
              </div>
            ))}
          </div>

          <div className="relative z-10 mt-auto grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[28px] border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">What Happens After Login</p>
              <div className="mt-3 grid gap-2.5">
                {[
                  'Buyers review products and create RFQs.',
                  'Suppliers respond to requests and activate deals.',
                  'Shipping agents update live shipment milestones.',
                  'Admins monitor workspace health and platform activity.',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-[18px] bg-white/6 px-4 py-2.5 text-sm text-slate-100">
                    <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-amber-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Demo Credentials</p>
              <div className="mt-3 space-y-2.5 text-sm text-slate-100">
                <div className="rounded-[16px] bg-white/6 px-4 py-2.5">Buyer: `buyer@tradafy.app`</div>
                <div className="rounded-[16px] bg-white/6 px-4 py-2.5">Supplier: `supplier@tradafy.app`</div>
                <div className="rounded-[16px] bg-white/6 px-4 py-2.5">Shipping: `shipping_agent@tradafy.app`</div>
                <div className="rounded-[16px] bg-white/6 px-4 py-2.5">Admin: `admin@tradafy.app`</div>
              </div>
            </div>
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
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LoginPage;
