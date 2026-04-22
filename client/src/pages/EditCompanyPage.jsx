/**
 * EditCompanyPage.jsx — Pre-filled edit form for the owner's company.
 *
 * Route: /company/:id/edit  (authenticated, owner only)
 *
 * - Fetches existing company data and pre-fills all fields
 * - Allows updating all fields including documents
 * - Cloudinary upload for new documents (kept, appended, or removed)
 * - PUT /api/companies/:id
 */
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Building2, Globe, MapPin, Briefcase, Users,
  Link as LinkIcon, FileText, Upload, File, Trash2,
  Loader2, CheckCircle2, ShieldCheck, AlertCircle, Camera
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getCompanyById, updateMyCompany } from '../lib/companyService';
import { AppShell } from '../components/ui';
import { AvatarUploader, DocumentUploader } from '../components/company/CompanyUploaders';

// ─── Cloudinary config ────────────────────────────────────────────────────────
const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// ─── Re-usable form primitives ────────────────────────────────────────────────

function Field({ label, hint, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
        {hint && <span className="ml-2 font-normal normal-case tracking-normal text-slate-400">{hint}</span>}
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

function SelectField({ icon: Icon, options, placeholder, ...props }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-all focus-within:border-[#245c9d] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#245c9d]/10">
      {Icon && <Icon className="h-4 w-4 shrink-0 text-slate-400" />}
      <select className="w-full bg-transparent text-sm text-slate-900 outline-none" {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COMPANY_TYPES   = ['Trading Company','Manufacturer','Importer','Exporter','Distributor','Freight Forwarder','Logistics Provider','Other'];
const INDUSTRIES      = ['Food & Agriculture','Metals & Mining','Energy & Petrochemicals','Industrial Equipment','Electronics & Technology','Textiles & Apparel','Chemicals','Shipping & Logistics','Other'];
const EMPLOYEE_RANGES = ['1–10','11–50','51–200','201–500','500+'];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EditCompanyPage() {
  const { id }   = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [fetching, setFetching] = useState(true);
  const [fetchErr, setFetchErr] = useState('');
  const [saving,   setSaving]   = useState(false);
  const [saveErr,  setSaveErr]  = useState('');
  const [saved,    setSaved]    = useState(false);

  const [form, setForm] = useState({
    name: '', country: '', city: '', companyType: '', industry: '',
    numberOfEmployees: '', website: '', description: '',
    yearEstablished: '', mainProducts: '', exportMarkets: '',
  });
  const [logo,      setLogo]      = useState('');
  const [documents, setDocuments] = useState([]);

  // ── Guard: only owner can edit ──────────────────────────────────────────────
  const isOwner = user?.companyId && user.companyId.toString() === id;

  // ── Load existing company ───────────────────────────────────────────────────
  useEffect(() => {
    setFetching(true);
    getCompanyById(id)
      .then((c) => {
        setForm({
          name:              c.name              || '',
          country:           c.country           || '',
          city:              c.city              || '',
          companyType:       c.companyType       || '',
          industry:          c.industry          || '',
          numberOfEmployees: c.numberOfEmployees || '',
          website:           c.website           || '',
          description:       c.description       || '',
          yearEstablished:   c.yearEstablished   ? String(c.yearEstablished) : '',
          mainProducts:      Array.isArray(c.mainProducts)  ? c.mainProducts.join(', ')  : '',
          exportMarkets:     Array.isArray(c.exportMarkets) ? c.exportMarkets.join(', ') : '',
        });
        setLogo(c.logo || '');
        setDocuments(Array.isArray(c.documents) ? c.documents : []);
      })
      .catch((err) => setFetchErr(err.response?.data?.message || err.message))
      .finally(() => setFetching(false));
  }, [id]);

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setSaveErr('');
    setSaved(false);
    try {
      const payload = {};

      // String fields — trim and omit if empty
      const stringFields = ['name','country','city','companyType','industry','numberOfEmployees','website','description'];
      stringFields.forEach((k) => { if (form[k]?.trim()) payload[k] = form[k].trim(); });

      // yearEstablished — only send if valid integer
      const year = parseInt(form.yearEstablished);
      if (!isNaN(year)) payload.yearEstablished = year;

      // Array fields — split comma-separated strings
      const toArr = (str) => str.split(',').map((s) => s.trim()).filter(Boolean);
      if (form.mainProducts)  payload.mainProducts  = toArr(form.mainProducts);
      if (form.exportMarkets) payload.exportMarkets = toArr(form.exportMarkets);

      if (logo !== undefined) payload.logo = logo;

      // Documents — always send current list (replace/append handled by backend)
      payload.documents = documents;

      await updateMyCompany(id, payload);
      setSaved(true);
      setTimeout(() => navigate(`/company/${id}`), 1200);
    } catch (err) {
      setSaveErr(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  if (!isOwner && !fetching) {
    return (
      <AppShell title="Edit Company" subtitle="">
        <div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          You are not authorized to edit this company.
        </div>
      </AppShell>
    );
  }

  if (fetching) {
    return (
      <AppShell title="Edit Company" subtitle="Loading…">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
        </div>
      </AppShell>
    );
  }

  if (fetchErr) {
    return (
      <AppShell title="Edit Company" subtitle="">
        <div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          <AlertCircle className="h-5 w-5 shrink-0" /> {fetchErr}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Edit Company"
      subtitle="Update your company profile, trade info, and verification documents."
    >
      <div className="max-w-3xl space-y-6">

        {/* ── Basic Info ── */}
        <section className="rounded-[28px] border border-[#d8e2ef] bg-white p-6 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
          <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Basic Information</p>
          
          <div className="mb-6 flex justify-center">
            <AvatarUploader logo={logo} companyName={form.name} onChange={setLogo} />
          </div>

          <div className="space-y-4">
            <Field label="Company Name">
              <Input icon={Building2} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Acme Trading Co." />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Country">
                <Input icon={Globe} value={form.country} onChange={(e) => set('country', e.target.value)} placeholder="United Arab Emirates" />
              </Field>
              <Field label="City">
                <Input icon={MapPin} value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Dubai" />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Company Type">
                <SelectField icon={Briefcase} options={COMPANY_TYPES} placeholder="Select type…" value={form.companyType} onChange={(e) => set('companyType', e.target.value)} />
              </Field>
              <Field label="Industry">
                <SelectField icon={Briefcase} options={INDUSTRIES} placeholder="Select industry…" value={form.industry} onChange={(e) => set('industry', e.target.value)} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Team Size">
                <SelectField icon={Users} options={EMPLOYEE_RANGES} placeholder="Select…" value={form.numberOfEmployees} onChange={(e) => set('numberOfEmployees', e.target.value)} />
              </Field>
              <Field label="Year Est.">
                <Input icon={Building2} value={form.yearEstablished} onChange={(e) => set('yearEstablished', e.target.value)} placeholder="2005" type="number" min="1800" max="2099" />
              </Field>
              <Field label="Website">
                <Input icon={LinkIcon} value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://…" />
              </Field>
            </div>
            <Field label="About">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-[#245c9d] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#245c9d]/10 transition-all">
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <textarea rows={3} className="w-full resize-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    value={form.description} onChange={(e) => set('description', e.target.value)}
                    placeholder="What does your company do, trade, and which markets do you serve?" />
                </div>
              </div>
            </Field>
          </div>
        </section>

        {/* ── Trade Info ── */}
        <section className="rounded-[28px] border border-[#d8e2ef] bg-white p-6 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
          <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Trade Information</p>
          <div className="space-y-4">
            <Field label="Main Products" hint="comma-separated">
              <Input icon={Briefcase} value={form.mainProducts} onChange={(e) => set('mainProducts', e.target.value)} placeholder="e.g. Wheat, Rice, Soybean" />
            </Field>
            <Field label="Export Markets" hint="comma-separated">
              <Input icon={Globe} value={form.exportMarkets} onChange={(e) => set('exportMarkets', e.target.value)} placeholder="e.g. UAE, India, Germany" />
            </Field>
          </div>
        </section>

        {/* ── Documents ── */}
        <section className="rounded-[28px] border border-[#d8e2ef] bg-white p-6 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Verification Documents</p>
            <span className="text-xs text-slate-400">{documents.length}/5 uploaded</span>
          </div>
          <DocumentUploader documents={documents} onChange={setDocuments} />
          {documents.length > 0 && (
            <p className="mt-3 text-xs text-sky-700">
              <ShieldCheck className="mr-1 inline h-3.5 w-3.5" />
              Saving with documents will set status to <strong>Submitted</strong> for admin review.
            </p>
          )}
        </section>

        {/* ── Actions ── */}
        {saveErr && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" /> {saveErr}
          </div>
        )}
        {saved && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" /> Saved! Redirecting…
          </div>
        )}
        <div className="flex gap-3 pb-6">
          <button
            onClick={() => navigate(`/company/${id}`)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" /> Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#173b67,#245c9d)] py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><CheckCircle2 className="h-4 w-4" /> Save Changes</>}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
