/**
 * AdminPage.jsx — Admin control center.
 *
 * Tabs:
 *  Users     → list all users, toggle active/inactive
 *  Companies → list all companies with documents + set verification status
 *  Deals     → read-only monitor of all deals
 *  RFQs      → read-only monitor of all RFQs
 *
 * All data from real API via adminService.js. Zero mock data.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  Users, Building2, Briefcase, FileText,
  Loader2, AlertCircle, CheckCircle2,
  XCircle, ShieldCheck, ShieldX, ShieldAlert, RefreshCcw, ExternalLink, File
} from 'lucide-react';
import { AppShell, MetricCard } from './ui';
import {
  getUsers, toggleUserStatus,
  getCompanies, verifyCompany,
  getAdminDeals, getAdminRFQs
} from '../lib/adminService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  : '—';

const fmtPrice = (p) => p != null
  ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(p)
  : '—';

// ─── Verification badge ───────────────────────────────────────────────────────

function VerifBadge({ status }) {
  const map = {
    draft:     { cls: 'bg-slate-50   text-slate-600  border-slate-200',  icon: FileText,    label: 'Draft' },
    submitted: { cls: 'bg-sky-50     text-sky-700    border-sky-200',     icon: ShieldAlert, label: 'Submitted' },
    pending:   { cls: 'bg-amber-50   text-amber-700  border-amber-100',   icon: ShieldAlert, label: 'Pending' },
    verified:  { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: ShieldCheck,  label: 'Verified' },
    rejected:  { cls: 'bg-rose-50    text-rose-700   border-rose-100',    icon: ShieldX,     label: 'Rejected' },
  };
  const s = map[status] || map.pending;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${s.cls}`}>
      <Icon className="h-3 w-3" /> {s.label}
    </span>
  );
}

// ─── Active badge ─────────────────────────────────────────────────────────────

function ActiveBadge({ active }) {
  return active
    ? <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700"><CheckCircle2 className="h-3 w-3" /> Active</span>
    : <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-100 bg-rose-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-rose-700"><XCircle className="h-3 w-3" /> Inactive</span>;
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Panel({ title, children }) {
  return (
    <div className="rounded-[28px] border border-[#d8e2ef] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
      <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">{title}</p>
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TABS
// ══════════════════════════════════════════════════════════════════════════════

// ─── Users tab ────────────────────────────────────────────────────────────────

function UsersTab() {
  const [users,    setUsers]    = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [toggling, setToggling] = useState(null);
  const [actionErr,setActionErr]= useState({});

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const r = await getUsers({ limit: 50 });
      setUsers(r.users); setTotal(r.total);
    } catch (err) { setError(err.response?.data?.message || err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (id) => {
    setToggling(id); setActionErr((e) => ({ ...e, [id]: '' }));
    try {
      const updated = await toggleUserStatus(id);
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isActive: updated.isActive } : u));
    } catch (err) {
      setActionErr((e) => ({ ...e, [id]: err.response?.data?.message || err.message }));
    } finally { setToggling(null); }
  };

  if (loading) return <div className="flex h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>;
  if (error)   return <div className="flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>;

  return (
    <Panel title={`Users — ${total} total`}>
      <div className="space-y-3">
        {users.map((u) => (
          <div key={u._id} className="flex flex-col gap-2 rounded-[22px] bg-[#f5f9fd] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-900">{u.firstName} {u.lastName}</p>
                <ActiveBadge active={u.isActive} />
              </div>
              <p className="mt-1 text-sm text-slate-500">{u.email}</p>
              <p className="mt-0.5 text-xs text-slate-400">
                Roles: <span className="font-semibold text-slate-600">{u.roles?.join(', ') || '—'}</span>
                {' · '} Joined: {fmtDate(u.createdAt)}
              </p>
              {actionErr[u._id] && <p className="mt-1 text-xs font-medium text-rose-600">{actionErr[u._id]}</p>}
            </div>
            <button
              onClick={() => handleToggle(u._id)}
              disabled={toggling === u._id}
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-2xl px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${u.isActive ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
            >
              {toggling === u._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : u.isActive ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              {u.isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ─── Companies tab ────────────────────────────────────────────────────────────

function CompaniesTab() {
  const [companies, setCompanies] = useState([]);
  const [total,     setTotal]     = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [updating,  setUpdating]  = useState(null);
  const [actionErr, setActionErr] = useState({});

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const r = await getCompanies({ limit: 50 });
      setCompanies(r.companies); setTotal(r.total);
    } catch (err) { setError(err.response?.data?.message || err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleVerify = async (id, newStatus) => {
    setUpdating(id); setActionErr((e) => ({ ...e, [id]: '' }));
    try {
      const updated = await verifyCompany(id, newStatus);
      setCompanies((prev) => prev.map((c) => c._id === id ? { ...c, verificationStatus: updated.verificationStatus } : c));
    } catch (err) {
      setActionErr((e) => ({ ...e, [id]: err.response?.data?.message || err.message }));
    } finally { setUpdating(null); }
  };

  if (loading) return <div className="flex h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>;
  if (error)   return <div className="flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>;

  return (
    <Panel title={`Companies — ${total} total`}>
      <div className="space-y-2">
        {companies.map((c) => (
          <CompanyCard
            key={c._id}
            company={c}
            updating={updating}
            actionErr={actionErr[c._id]}
            onVerify={handleVerify}
          />
        ))}
      </div>
    </Panel>
  );
}

// ─── Expandable company card ──────────────────────────────────────────────────

function CompanyCard({ company: c, updating, actionErr, onVerify }) {
  const [open, setOpen] = useState(false);

  const InfoRow = ({ label, value }) =>
    value ? (
      <div className="min-w-0 pr-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}: </span>
        <span className="text-[11px] text-slate-700 truncate">{value}</span>
      </div>
    ) : null;

  return (
    <div className={`overflow-hidden rounded-[20px] border transition-all ${open ? 'border-[#245c9d]/30 bg-white shadow-md' : 'border-slate-200 bg-[#f5f9fd]'}`}>

      {/* Collapsed header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#173b67,#245c9d)] text-xs font-black text-white">
          {(c.name || '?').slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate font-semibold text-slate-900">{c.name}</p>
          <p className="text-xs text-slate-400">{c.country || '—'}{c.city ? `, ${c.city}` : ''}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <VerifBadge status={c.verificationStatus} />
          <svg className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded body */}
      {open && (
        <div className="border-t border-slate-100 px-4 pb-3 pt-3 space-y-3">
          <div className="flex flex-col sm:flex-row gap-4">
            
            {(c.logo || c.coverImage) && (
              <div className="shrink-0 flex flex-col gap-2">
                {c.logo && <img src={c.logo} alt="Logo" className="h-12 w-12 rounded object-cover border border-slate-200 bg-white" />}
              </div>
            )}

            <div className="flex-1 min-w-0 space-y-2.5">
              {c.description && (
                <p className="text-[11px] text-slate-600 leading-snug">{c.description}</p>
              )}

              {/* Details grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-2 gap-y-1 mt-1">
                <InfoRow label="Type"       value={c.companyType} />
                <InfoRow label="Industry"   value={c.industry} />
                <InfoRow label="Location"   value={[c.city, c.country].filter(Boolean).join(', ')} />
                <InfoRow label="Employees"  value={c.numberOfEmployees} />
                <InfoRow label="Est."       value={c.yearEstablished} />
                <InfoRow label="Registered" value={fmtDate(c.createdAt)} />
                <InfoRow label="Plan"       value={c.subscriptionPlan} />
                {c.website && <InfoRow label="Web" value={<a href={c.website} target="_blank" rel="noreferrer" className="text-[#245c9d] hover:underline decoration-1">{c.website.replace(/^https?:\/\//, '').split('/')[0]}</a>} />}
              </div>

              {/* compact Tags */}
              {(c.mainProducts?.length > 0 || c.exportMarkets?.length > 0) && (
                <div className="text-[10px] leading-tight space-y-0.5">
                  {c.mainProducts?.length > 0 && <p><span className="font-bold text-slate-400 uppercase tracking-wider">Products:</span> <span className="text-slate-600">{c.mainProducts.join(', ')}</span></p>}
                  {c.exportMarkets?.length > 0 && <p><span className="font-bold text-slate-400 uppercase tracking-wider">Markets:</span> <span className="text-slate-600">{c.exportMarkets.join(', ')}</span></p>}
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Verification Documents ({c.documents?.length || 0})
            </p>
            {c.documents?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {c.documents.map((doc, i) => (
                  <a key={i} href={doc.url} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#d8e2ef] bg-[#f4f8fc] px-2.5 py-1 text-[11px] font-semibold text-[#245c9d] hover:bg-[#edf5ff] transition">
                    <File className="h-3 w-3" />
                    {doc.name || `Document ${i + 1}`}
                    <ExternalLink className="h-3 w-3 opacity-50" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No documents uploaded.</p>
            )}
          </div>

          {actionErr && <p className="text-xs font-medium text-rose-600">{actionErr}</p>}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
            {c.verificationStatus !== 'verified' && (
              <button onClick={() => onVerify(c._id, 'verified')} disabled={updating === c._id}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60">
                {updating === c._id ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldCheck className="h-3 w-3" />}
                Verify
              </button>
            )}
            {c.verificationStatus !== 'rejected' && (
              <button onClick={() => onVerify(c._id, 'rejected')} disabled={updating === c._id}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60">
                <ShieldX className="h-3 w-3" /> Reject
              </button>
            )}
            {c.verificationStatus !== 'pending' && (
              <button onClick={() => onVerify(c._id, 'pending')} disabled={updating === c._id}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100 disabled:opacity-60">
                <RefreshCcw className="h-3 w-3" /> Reset to Pending
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


// ─── Deals monitor tab ────────────────────────────────────────────────────────

function DealsTab() {
  const [deals,   setDeals]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    setLoading(true);
    getAdminDeals({ limit: 50 })
      .then((r) => { setDeals(r.deals); setTotal(r.total); })
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>;
  if (error)   return <div className="flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>;

  return (
    <Panel title={`All Deals — ${total} total`}>
      {deals.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">No deals in the system yet.</p>
      ) : (
        <div className="space-y-3">
          {deals.map((d) => (
            <div key={d._id} className="grid gap-2 rounded-[22px] bg-[#f5f9fd] p-4 sm:grid-cols-4">
              <div className="sm:col-span-2">
                <p className="font-semibold text-slate-900">{d.productName || 'Unnamed Deal'}</p>
                <p className="mt-0.5 text-xs text-slate-400">Created: {fmtDate(d.createdAt)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</p>
                <p className="mt-0.5 text-sm font-semibold capitalize text-[#245c9d]">{d.status?.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Price / Qty</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-700">{fmtPrice(d.price)} · {d.quantity ?? '—'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

// ─── RFQ monitor tab ──────────────────────────────────────────────────────────

function RFQsTab() {
  const [rfqs,    setRFQs]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    setLoading(true);
    getAdminRFQs({ limit: 50 })
      .then((r) => { setRFQs(r.rfqs); setTotal(r.total); })
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, []);

  const STATUS_CLR = {
    open:        'text-sky-700',
    in_progress: 'text-amber-700',
    converted:   'text-emerald-700',
    closed:      'text-slate-400',
  };

  if (loading) return <div className="flex h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>;
  if (error)   return <div className="flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>;

  return (
    <Panel title={`All RFQs — ${total} total`}>
      {rfqs.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">No RFQs in the system yet.</p>
      ) : (
        <div className="space-y-3">
          {rfqs.map((r) => (
            <div key={r._id} className="grid gap-2 rounded-[22px] bg-[#f5f9fd] p-4 sm:grid-cols-4">
              <div className="sm:col-span-2">
                <p className="font-semibold text-slate-900">{r.productName || '—'}</p>
                <p className="mt-0.5 text-xs text-slate-400">{r.category || 'No category'} · {fmtDate(r.createdAt)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</p>
                <p className={`mt-0.5 text-sm font-semibold capitalize ${STATUS_CLR[r.status] || 'text-slate-600'}`}>{r.status?.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Qty</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-700">{r.quantity ?? '—'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════════════════════════════════

const TABS = [
  { key: 'users',     label: 'Users',     icon: Users     },
  { key: 'companies', label: 'Companies', icon: Building2 },
  { key: 'deals',     label: 'Deals',     icon: Briefcase },
  { key: 'rfqs',      label: 'RFQs',      icon: FileText  },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users');

  // Summary counts — load once on mount
  const [counts, setCounts] = useState({ users: '—', companies: '—', deals: '—', rfqs: '—' });
  useEffect(() => {
    Promise.all([
      getUsers({ limit: 1 }),
      getCompanies({ limit: 1 }),
      getAdminDeals({ limit: 1 }),
      getAdminRFQs({ limit: 1 }),
    ]).then(([u, c, d, r]) => {
      setCounts({ users: u.total, companies: c.total, deals: d.total, rfqs: r.total });
    }).catch(() => {}); // counts are decorative — fail silently
  }, []);

  return (
    <AppShell
      title="Admin Workspace"
      subtitle="Manage users, verify companies, and monitor every RFQ and deal across the platform."
    >
      <div className="space-y-6">

        {/* ── Summary metrics ─────────────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Users"     value={counts.users} />
          <MetricCard label="Companies"       value={counts.companies} />
          <MetricCard label="Active Deals"    value={counts.deals} />
          <MetricCard label="Total RFQs"      value={counts.rfqs} />
        </div>

        {/* ── Tab bar ─────────────────────────────────────────────────────── */}
        <div className="rounded-[28px] border border-[#d8e2ef] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
          <div className="flex flex-wrap gap-2 border-b border-slate-100 px-6 pt-5 pb-4">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
                    active
                      ? 'bg-[linear-gradient(135deg,#173b67,#245c9d)] text-white shadow-md'
                      : 'bg-[#f4f8fc] text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {counts[tab.key]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="p-6">
            {activeTab === 'users'     && <UsersTab />}
            {activeTab === 'companies' && <CompaniesTab />}
            {activeTab === 'deals'     && <DealsTab />}
            {activeTab === 'rfqs'      && <RFQsTab />}
          </div>
        </div>

      </div>
    </AppShell>
  );
}
