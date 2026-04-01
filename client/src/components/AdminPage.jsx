import React from 'react';
import { getAdminSnapshot, toggleCompanyVerified, toggleUserActive } from '../lib/tradafyData';
import { AppShell, MetricCard } from './ui';

function AdminPage({ user, navigate, pathname, onLogout, onMutate }) {
  const snapshot = getAdminSnapshot();

  return (
    <AppShell user={user} pathname={pathname} navigate={navigate} onLogout={onLogout} title="Admin Workspace" subtitle="Admin can manage users, verify companies, and review every RFQ and deal from one control center.">
      <div className="space-y-6">
        <section className="rounded-[28px] border border-[#d8e2ef] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Users" value={snapshot.users.length} />
            <MetricCard label="Companies" value={snapshot.companies.length} />
            <MetricCard label="RFQs" value={snapshot.rfqs.length} />
            <MetricCard label="Deals" value={snapshot.deals.length} />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-[28px] border border-[#d8e2ef] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Users</p>
                <h2 className="mt-2 text-2xl font-semibold text-[#143a6a]">User management</h2>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {snapshot.users.map((account) => (
                <div key={account.id} className="flex items-center justify-between gap-4 rounded-[22px] bg-[#f5f9fd] p-4">
                  <div>
                    <p className="font-semibold text-slate-900">{account.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{account.company} • {account.role}</p>
                  </div>
                  <button
                    onClick={() => {
                      toggleUserActive(account.id);
                      onMutate();
                    }}
                    className={`rounded-2xl px-4 py-2 text-sm font-semibold ${account.active ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}
                  >
                    {account.active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-[#d8e2ef] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Companies</p>
                <h2 className="mt-2 text-2xl font-semibold text-[#143a6a]">Verification control</h2>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {snapshot.companies.map((company) => (
                <div key={company.id} className="flex items-center justify-between gap-4 rounded-[22px] bg-[#f5f9fd] p-4">
                  <div>
                    <p className="font-semibold text-slate-900">{company.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{company.location} • {company.role}</p>
                  </div>
                  <button
                    onClick={() => {
                      toggleCompanyVerified(company.id);
                      onMutate();
                    }}
                    className={`rounded-2xl px-4 py-2 text-sm font-semibold ${company.verified ? 'bg-amber-50 text-amber-700' : 'bg-sky-50 text-sky-700'}`}
                  >
                    {company.verified ? 'Unverify' : 'Verify'}
                  </button>
                </div>
              ))}
            </div>
          </section>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-[28px] border border-[#d8e2ef] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">RFQs</p>
            <div className="mt-5 space-y-3">
              {snapshot.rfqs.map((rfq) => (
                <div key={rfq.id} className="rounded-[22px] bg-[#f5f9fd] p-4">
                  <p className="font-semibold text-slate-900">{rfq.productName}</p>
                  <p className="mt-1 text-sm text-slate-500">{rfq.buyerCompany} to {rfq.supplierCompany}</p>
                  <p className="mt-2 text-sm text-[#245c9d]">{rfq.status}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-[#d8e2ef] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Deals</p>
            <div className="mt-5 space-y-3">
              {snapshot.deals.map((deal) => (
                <div key={deal.id} className="rounded-[22px] bg-[#f5f9fd] p-4">
                  <p className="font-semibold text-slate-900">{deal.productName}</p>
                  <p className="mt-1 text-sm text-slate-500">{deal.buyerCompany} with {deal.supplierCompany}</p>
                  <p className="mt-2 text-sm text-[#245c9d] capitalize">{deal.status}</p>
                </div>
              ))}
            </div>
          </section>
        </section>
      </div>
    </AppShell>
  );
}

export default AdminPage;
