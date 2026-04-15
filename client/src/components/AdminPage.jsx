/**
 * AdminPage.jsx — Admin control center.
 *
 * Tabs:
 *  Users     → list all users, toggle active/inactive
 *  Companies → list all companies, set verification status
 *  Deals     → read-only monitor of all deals
 *  RFQs      → read-only monitor of all RFQs
 *
 * All data from real API via adminService.js. Zero mock data.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  Users, Building2, Briefcase, FileText,
  Loader2, AlertCircle, CheckCircle2,
  XCircle, ShieldCheck, ShieldX, ShieldAlert, RefreshCcw
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
    verified: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: ShieldCheck,  label: 'Verified' },
    pending:  { cls: 'bg-amber-50  text-amber-700  border-amber-100',    icon: ShieldAlert, label: 'Pending' },
    rejected: { cls: 'bg-rose-50   text-rose-700   border-rose-100',     icon: ShieldX,     label: 'Rejected' },
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
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (id) => {
    setToggling(id); setActionErr((e) => ({ ...e, [id]: '' }));
    try {
      const updated = await toggleUserStatus(id);
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isActive: updated.isActive } : u));
    } catch (err) {
      setActionErr((e) => ({ ...e, [id]: err.message }));
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
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleVerify = async (id, newStatus) => {
    setUpdating(id); setActionErr((e) => ({ ...e, [id]: '' }));
    try {
      const updated = await verifyCompany(id, newStatus);
      setCompanies((prev) => prev.map((c) => c._id === id ? { ...c, verificationStatus: updated.verificationStatus } : c));
    } catch (err) {
      setActionErr((e) => ({ ...e, [id]: err.message }));
    } finally { setUpdating(null); }
  };

  if (loading) return <div className="flex h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>;
  if (error)   return <div className="flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>;

  return (
    <Panel title={`Companies — ${total} total`}>
      <div className="space-y-3">
        {companies.map((c) => (
          <div key={c._id} className="rounded-[22px] bg-[#f5f9fd] p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-900">{c.name}</p>
                  <VerifBadge status={c.verificationStatus} />
                </div>
                <p className="mt-1 text-sm text-slate-500">{c.country || '—'}</p>
                <p className="mt-0.5 text-xs text-slate-400">Registered: {fmtDate(c.createdAt)}</p>
                {actionErr[c._id] && <p className="mt-1 text-xs font-medium text-rose-600">{actionErr[c._id]}</p>}
              </div>
              {/* Verification actions */}
              <div className="flex shrink-0 flex-wrap gap-2">
                {c.verificationStatus !== 'verified' && (
                  <button
                    onClick={() => handleVerify(c._id, 'verified')}
                    disabled={updating === c._id}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60"
                  >
                    {updating === c._id ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldCheck className="h-3 w-3" />}
                    Verify
                  </button>
                )}
                {c.verificationStatus !== 'rejected' && (
                  <button
                    onClick={() => handleVerify(c._id, 'rejected')}
                    disabled={updating === c._id}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                  >
                    <ShieldX className="h-3 w-3" /> Reject
                  </button>
                )}
                {c.verificationStatus !== 'pending' && (
                  <button
                    onClick={() => handleVerify(c._id, 'pending')}
                    disabled={updating === c._id}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100 disabled:opacity-60"
                  >
                    <RefreshCcw className="h-3 w-3" /> Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
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
      .catch((err) => setError(err.message))
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
      .catch((err) => setError(err.message))
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
