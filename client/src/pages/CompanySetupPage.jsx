import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Globe, MapPin, Briefcase, Users, FileText,
  Link, ArrowRight, CheckCircle2, Loader2, X, Upload,
  File, Trash2, ShieldCheck, Camera
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import { createCompany } from '../lib/companyService';
import { saveUser } from '../lib/api';
import tradafyLogo from '../assets/Tradafy_logo_comparison_on_navy_backdrops-3-removebg-preview.png';
import { AvatarUploader, DocumentUploader } from '../components/company/CompanyUploaders';

// ─── Data ─────────────────────────────────────────────────────────────────────

const COMPANY_TYPES = [
  'Trading Company', 'Manufacturer', 'Importer', 'Exporter',
  'Distributor', 'Freight Forwarder', 'Logistics Provider', 'Other',
];

const INDUSTRIES = [
  'Food & Agriculture', 'Metals & Mining', 'Energy & Petrochemicals',
  'Industrial Equipment', 'Electronics & Technology', 'Textiles & Apparel',
  'Chemicals', 'Shipping & Logistics', 'Other',
];

const EMPLOYEE_RANGES = ['1–10', '11–50', '51–200', '201–500', '500+'];

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// ─── Main Component ───────────────────────────────────────────────────────────

function Field({ label, required, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
    </div>
  );
}

function Input({ icon: Icon, ...props }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-all focus-within:border-[#245c9d] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#245c9d]/10">
      {Icon && <Icon className="h-4 w-4 shrink-0 text-slate-400" />}
      <input className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" {...props} />
    </div>
  );
}

function Select({ icon: Icon, options, placeholder, ...props }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-all focus-within:border-[#245c9d] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#245c9d]/10">
      {Icon && <Icon className="h-4 w-4 shrink-0 text-slate-400" />}
      <select className="w-full bg-transparent text-sm text-slate-900 outline-none" {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

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

export default function CompanySetupPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0); // 0=basics 1=details 2=documents 3=done
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const [form, setForm] = useState({
    name: '', country: '', city: '', companyType: '',
    industry: '', numberOfEmployees: '', website: '', description: '',
  });
  const [logo, setLogo] = useState('');
  const [documents, setDocuments] = useState([]);
  const [errors, setErrors] = useState({});


  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateStep0 = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Company name is required.';
    if (!form.country.trim()) e.country = 'Country is required.';
    if (!form.companyType) e.companyType = 'Please select a company type.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (step === 0 && !validateStep0()) return;
    setStep((s) => s + 1);
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true);
    setApiError('');
    try {
      // Build payload — skip empty strings, but include arrays directly
      const payload = {};
      Object.entries(form).forEach(([k, v]) => {
        if (typeof v === 'string' && v.trim()) payload[k] = v.trim();
      });
      if (logo) payload.logo = logo;
      if (documents.length > 0) payload.documents = documents;


      const company = await createCompany(payload);
      const updatedUser = { ...user, companyId: company._id };
      saveUser(updatedUser);
      updateUser(updatedUser);
      setStep(3); // success
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Basics', 'Details', 'Documents', 'Done'];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* LEFT — dark sidebar */}
      <aside className="hidden lg:flex w-[380px] shrink-0 flex-col justify-between bg-[#0A2540] p-10">
        <div>
          <img src={tradafyLogo} alt="Tradafy" className="h-10 w-auto" />
          <h1 className="mt-10 text-3xl font-black text-white leading-tight tracking-tight">
            Set up your<br />
            <span className="text-[#E5A93D]">company profile.</span>
          </h1>
          <p className="mt-4 text-sm leading-6 text-sky-100/70">
            Your company profile is the foundation of everything on Tradafy — products, RFQs, deals, and shipping all require a verified business identity.
          </p>

          {/* Step progress */}
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
              { icon: CheckCircle2, text: 'Only required fields are name & country — fill the rest later.' },
              { icon: ShieldCheck, text: 'Upload verification documents to speed up admin review.' },
              { icon: CheckCircle2, text: 'You can update your profile anytime from your dashboard.' },
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

      {/* RIGHT — form */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-16">
        {/* Skip link */}
        {step < 3 && (
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

          {/* ── STEP 0: Basics ── */}
          {step === 0 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#245c9d]">Step 1 of 3</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Company basics</h2>
                <p className="mt-2 text-sm text-slate-500">These fields identify your business on the platform.</p>
              </div>

              <div className="flex justify-center pb-2">
                <AvatarUploader logo={logo} companyName={form.name} onChange={setLogo} />
              </div>

              <div className="space-y-5">
                <Field label="Company Name" required error={errors.name}>
                  <Input icon={Building2} placeholder="e.g. Acme Trading Co." value={form.name} onChange={(e) => set('name', e.target.value)} />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Country" required error={errors.country}>
                    <Input icon={Globe} placeholder="e.g. United Arab Emirates" value={form.country} onChange={(e) => set('country', e.target.value)} />
                  </Field>
                  <Field label="City" error={errors.city}>
                    <Input icon={MapPin} placeholder="e.g. Dubai" value={form.city} onChange={(e) => set('city', e.target.value)} />
                  </Field>
                </div>

                <Field label="Company Type" required error={errors.companyType}>
                  <Select icon={Briefcase} options={COMPANY_TYPES} placeholder="Select type..." value={form.companyType} onChange={(e) => set('companyType', e.target.value)} />
                </Field>

                <Field label="Industry" error={errors.industry}>
                  <Select icon={Briefcase} options={INDUSTRIES} placeholder="Select industry..." value={form.industry} onChange={(e) => set('industry', e.target.value)} />
                </Field>
              </div>

              <button onClick={nextStep} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0A2540] py-4 text-sm font-bold text-white transition hover:bg-[#143a6a] hover:-translate-y-0.5">
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* ── STEP 1: Details ── */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#245c9d]">Step 2 of 3</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">More details</h2>
                <p className="mt-2 text-sm text-slate-500">All optional — you can fill these in from your dashboard later.</p>
              </div>

              <div className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Team Size" error={errors.numberOfEmployees}>
                    <Select icon={Users} options={EMPLOYEE_RANGES} placeholder="Select range..." value={form.numberOfEmployees} onChange={(e) => set('numberOfEmployees', e.target.value)} />
                  </Field>
                  <Field label="Website" error={errors.website}>
                    <Input icon={Link} placeholder="https://yourcompany.com" value={form.website} onChange={(e) => set('website', e.target.value)} />
                  </Field>
                </div>

                <Field label="About Your Company" error={errors.description}>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-all focus-within:border-[#245c9d] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#245c9d]/10">
                    <div className="flex items-start gap-3">
                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <textarea
                        rows={4}
                        placeholder="Briefly describe what your company does, what you trade, and your key markets..."
                        className="w-full resize-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                        value={form.description}
                        onChange={(e) => set('description', e.target.value)}
                      />
                    </div>
                  </div>
                </Field>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="rounded-2xl border border-slate-200 px-6 py-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50">Back</button>
                <button onClick={nextStep} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0A2540] py-4 text-sm font-bold text-white transition hover:bg-[#143a6a] hover:-translate-y-0.5">
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Documents ── */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#245c9d]">Step 3 of 3</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Upload documents</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Optional but recommended — uploading verification documents (business license, trade certificate, etc.) lets admins verify your company faster.
                </p>
              </div>

              <Field label="Verification Documents (max 5)">
                <DocumentUploader documents={documents} onChange={setDocuments} />
              </Field>

              {/* Status note */}
              <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-800">
                {documents.length > 0
                  ? <><ShieldCheck className="mb-0.5 mr-1.5 inline h-4 w-4 text-sky-600" /><strong>Great!</strong> Your company will be marked <strong>Submitted</strong> — admin can review immediately.</>
                  : <>Skipping documents is fine. Your profile will be saved as <strong>Draft</strong> and you can upload them later from your dashboard.</>
                }
              </div>

              {apiError && (
                <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {apiError}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="rounded-2xl border border-slate-200 px-6 py-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50">Back</button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#E5A93D] py-4 text-sm font-black text-[#0A2540] transition hover:bg-[#d49530] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating profile...</>
                    : <><CheckCircle2 className="h-4 w-4" /> Create Company Profile</>
                  }
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Success ── */}
          {step === 3 && (
            <div className="space-y-8 text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-emerald-50 border border-emerald-100 shadow-[0_0_40px_rgba(16,185,129,0.15)]">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight text-slate-900">Company created!</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600 max-w-sm mx-auto">
                  <strong>{form.name}</strong> has been registered.{' '}
                  {documents.length > 0
                    ? 'Your documents have been submitted for admin review.'
                    : 'An admin will review your profile. You can upload documents from your dashboard anytime.'}
                </p>
              </div>
              <div className={`rounded-2xl border px-5 py-4 text-sm ${documents.length > 0 ? 'border-sky-100 bg-sky-50 text-sky-800' : 'border-amber-100 bg-amber-50 text-amber-800'}`}>
                <strong>Status: {documents.length > 0 ? 'Submitted for Review' : 'Draft — Pending Documents'}</strong>
                {' '}— You'll be able to list products once your company is verified.
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
