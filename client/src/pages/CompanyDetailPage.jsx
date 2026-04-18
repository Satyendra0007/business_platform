/**
 * CompanyDetailPage.jsx — Full company profile view.
 *
 * Route: /company/:id  (authenticated)
 *
 * Shows all schema fields, documents with clickable links,
 * and an "Edit Company" button visible only to the company owner.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Building2, Globe, MapPin, Briefcase, Users,
  Link as LinkIcon, CalendarDays, Package, FileText,
  ExternalLink, ShieldCheck, ShieldAlert, ShieldX, File,
  Loader2, AlertCircle, Edit3, Clock
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getCompanyById } from '../lib/companyService';
import { AppShell } from '../components/ui';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  : '—';

function StatusBadge({ status }) {
  const map = {
    draft:     { cls: 'border-slate-200  bg-slate-50   text-slate-600',  icon: FileText,    label: 'Draft' },
    submitted: { cls: 'border-sky-200    bg-sky-50     text-sky-700',    icon: ShieldAlert, label: 'Submitted' },
    pending:   { cls: 'border-amber-200  bg-amber-50   text-amber-700',  icon: Clock,       label: 'Pending' },
    verified:  { cls: 'border-emerald-200 bg-emerald-50 text-emerald-700', icon: ShieldCheck, label: 'Verified' },
    rejected:  { cls: 'border-rose-200   bg-rose-50    text-rose-700',   icon: ShieldX,     label: 'Rejected' },
  };
  const s = map[status] || map.pending;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${s.cls}`}>
      <Icon className="h-3.5 w-3.5" /> {s.label}
    </span>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#edf5ff]">
        <Icon className="h-4 w-4 text-[#245c9d]" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function TagList({ label, items }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="rounded-xl border border-[#d8e2ef] bg-[#f4f8fc] px-3 py-1 text-xs font-semibold text-[#245c9d]">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CompanyDetailPage() {
  const { id }   = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    setLoading(true);
    getCompanyById(id)
      .then(setCompany)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const isOwner = user?.companyId && user.companyId.toString() === id;

  if (loading) {
    return (
      <AppShell title="Company" subtitle="Loading company profile…">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
        </div>
      </AppShell>
    );
  }

  if (error || !company) {
    return (
      <AppShell title="Company" subtitle="">
        <div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error || 'Company not found.'}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={company.name} subtitle={`${company.country || ''}${company.city ? `, ${company.city}` : ''}`}>
      <div className="space-y-6">

        {/* ── Header card ── */}
        <div className="relative overflow-hidden rounded-[30px] border border-[#d8e2ef] bg-white p-6 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              {/* Logo or initials */}
              {company.logo ? (
                <img src={company.logo} alt={company.name} className="h-16 w-16 rounded-2xl object-cover border border-slate-100" />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#173b67,#245c9d)] text-2xl font-black text-white">
                  {(company.name || '?').slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">{company.name}</h1>
                <p className="mt-1 text-sm text-slate-500">
                  {[company.companyType, company.industry].filter(Boolean).join(' · ') || 'Company'}
                </p>
                <div className="mt-2">
                  <StatusBadge status={company.verificationStatus} />
                </div>
              </div>
            </div>

            <div className="flex shrink-0 gap-3">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              {isOwner && (
                <button
                  onClick={() => navigate(`/company/${id}/edit`)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#173b67,#245c9d)] px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
                >
                  <Edit3 className="h-4 w-4" /> Edit Company
                </button>
              )}
            </div>
          </div>

          {company.description && (
            <p className="mt-5 border-t border-slate-100 pt-5 text-sm leading-6 text-slate-600">
              {company.description}
            </p>
          )}
        </div>

        {/* ── Details grid ── */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* Company Info */}
          <div className="rounded-[28px] border border-[#d8e2ef] bg-white p-6 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
            <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Company Details</p>
            <div className="space-y-4">
              <InfoRow icon={Globe}        label="Country"           value={company.country} />
              <InfoRow icon={MapPin}       label="City"              value={company.city} />
              <InfoRow icon={Briefcase}    label="Company Type"      value={company.companyType} />
              <InfoRow icon={FileText}     label="Industry"          value={company.industry} />
              <InfoRow icon={Users}        label="Team Size"         value={company.numberOfEmployees} />
              <InfoRow icon={CalendarDays} label="Year Established"  value={company.yearEstablished?.toString()} />
              {company.website && (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#edf5ff]">
                    <LinkIcon className="h-4 w-4 text-[#245c9d]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Website</p>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 inline-flex items-center gap-1 text-sm font-medium text-[#245c9d] hover:underline"
                    >
                      {company.website} <ExternalLink className="h-3 w-3 opacity-60" />
                    </a>
                  </div>
                </div>
              )}
              <InfoRow icon={Building2} label="Registered" value={fmtDate(company.createdAt)} />
            </div>
          </div>

          {/* Trade Info */}
          <div className="space-y-6">
            <div className="rounded-[28px] border border-[#d8e2ef] bg-white p-6 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
              <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Trade Information</p>
              <div className="space-y-5">
                <TagList label="Main Products"  items={company.mainProducts} />
                <TagList label="Export Markets" items={company.exportMarkets} />
                {!company.mainProducts?.length && !company.exportMarkets?.length && (
                  <p className="text-sm text-slate-400">No trade information added yet.</p>
                )}
              </div>
            </div>

            {/* Documents */}
            <div className="rounded-[28px] border border-[#d8e2ef] bg-white p-6 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
              <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">
                Verification Documents
              </p>
              {company.documents?.length > 0 ? (
                <ul className="space-y-2">
                  {company.documents.map((doc, i) => (
                    <li key={i}>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between gap-3 rounded-2xl border border-[#d8e2ef] bg-[#f4f8fc] px-4 py-3 transition hover:bg-[#edf5ff] hover:border-[#245c9d]/30"
                      >
                        <span className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 truncate">
                          <File className="h-4 w-4 shrink-0 text-[#245c9d]" />
                          {doc.name || `Document ${i + 1}`}
                          {doc.type && (
                            <span className="rounded-md bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-500">
                              {doc.type}
                            </span>
                          )}
                        </span>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">
                  No documents uploaded yet.
                  {isOwner && (
                    <button
                      onClick={() => navigate(`/company/${id}/edit`)}
                      className="ml-1 font-semibold text-[#245c9d] hover:underline"
                    >
                      Upload now →
                    </button>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
