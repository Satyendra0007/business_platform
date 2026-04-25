/**
 * Sidebar.jsx
 * Right sidebar column — deal milestone tracker + quick access links.
 */
import React from 'react';
import { ArrowRight, BadgeDollarSign, FileText, Package, PackageCheck, ShipWheel, Plus } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// ─── Milestone Tracker ────────────────────────────────────────────────────────

export function MilestoneTracker({ steps, activeStepIndex }) {
  return (
    <section className="rounded-[28px] border border-[#d8e2ef] bg-white p-5 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-100 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Progress Path</p>
        <h3 className="mt-2 text-[1.4rem] font-semibold tracking-[-0.02em] text-[#143a6a]">Deal milestone tracker</h3>
      </div>
      <div className="mt-5 space-y-3">
        {steps.map((step, index) => {
          const active = activeStepIndex >= index;
          return (
            <div
              key={step.key}
              className={`flex items-center gap-3 rounded-[20px] border px-4 py-3 ${
                active ? 'border-[#bcd1e8] bg-[#edf5ff]' : 'border-[#e3ebf4] bg-white'
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  active ? 'bg-[linear-gradient(135deg,#1d4d86,#2b66ad)] text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {index + 1}
              </div>
              <div>
                <p className={`font-semibold ${active ? 'text-[#143a6a]' : 'text-slate-700'}`}>{step.label}</p>
                <p className="text-sm text-slate-500">
                  {active ? 'Active or completed in current workflow' : 'Upcoming stage in the trade flow'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── Quick Access ─────────────────────────────────────────────────────────────

export function QuickAccess() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.roles?.[0] || user?.role;

  const links = [
    // First link: Browse all products for everyone, BUT suppliers also get a 'My Products' management link
    {
      label: role === 'supplier' ? 'My Products' : 'Product Reference',
      icon: role === 'supplier' ? Package : FileText,
      path: role === 'supplier' ? '/supplier/products' : '/products',
      style: { background: 'linear-gradient(135deg,#1d4d86,#2b66ad)' },
    },
    ...(role === 'supplier'
      ? [{
          label: 'Add Product',
          icon: Plus,
          path: '/supplier/products/create',
          style: { background: 'linear-gradient(135deg,#0f2846,#173b67)' },
        }]
      : []),
    {
      label: 'Deal Request',
      icon: ShipWheel,
      path: '/deals',
      style: { background: 'linear-gradient(135deg,#173b67,#245c9d)' },
    },
    {
      label: role === 'shipping_agent' ? 'Bid On Lanes' : 'Transport Bids',
      icon: BadgeDollarSign,
      path: '/transport-bids',
      style: { background: 'linear-gradient(135deg,#295f99,#3f79b8)' },
    },
    {
      label: role === 'supplier' ? 'Review RFQs' : role === 'admin' ? 'Control Center' : 'Deal Support',
      icon: PackageCheck,
      path: role === 'supplier' ? '/incoming-rfqs' : role === 'admin' ? '/admin' : '/deal-support',
      style: { background: 'linear-gradient(135deg,#346aa5,#4b84c2)' },
    },
  ];

  return (
    <section className="rounded-[28px] border border-[#d8e2ef] bg-white p-5 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-100 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Workspace Tools</p>
        <h3 className="mt-2 text-[1.4rem] font-semibold tracking-[-0.02em] text-[#143a6a]">Quick access</h3>
      </div>
      <div className="mt-5 space-y-3">
        {links.map(({ label, icon: Icon, path, style }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            style={style}
            className="flex w-full items-center justify-between rounded-[18px] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <span className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {label}
            </span>
            <ArrowRight className="h-4 w-4 opacity-70" />
          </button>
        ))}
      </div>
    </section>
  );
}
