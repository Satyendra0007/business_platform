import React, { useState } from 'react';
import { createRFQ, getProductById } from '../lib/tradafyData';
import { AppShell } from './ui';

function RequestQuotePage({ user, navigate, pathname, onLogout, productId, onMutate }) {
  const product = getProductById(productId);
  const [form, setForm] = useState({ quantity: '', targetPrice: '', deliveryLocation: '', notes: '' });
  if (!product) return null;

  return (
    <AppShell user={user} pathname={pathname} navigate={navigate} onLogout={onLogout} title="Request Quote" subtitle={`Create an RFQ for ${product.name}. Supplier is selected automatically from the product you opened.`}>
      <div className="mx-auto max-w-4xl rounded-[32px] border border-[#d8e2ef] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[26px] bg-[linear-gradient(135deg,#dbeafe,#f8fafc)] p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#245c9d]">RFQ Start Point</p>
            <h2 className="text-3xl font-semibold text-slate-950">{product.name}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{product.description}</p>
            <div className="mt-5 rounded-[20px] bg-white/80 px-4 py-3 text-sm text-slate-600">
              Supplier auto-selected: <span className="font-semibold text-[#143a6a]">{product.supplierCompany}</span>
            </div>
            <div className="mt-3 rounded-[20px] bg-white/80 px-4 py-3 text-sm text-slate-600">
              This page only creates a request. Chat starts later after you convert the RFQ into a deal.
            </div>
          </div>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              createRFQ(product.id, form, user);
              onMutate();
              navigate('/my-rfqs');
            }}
          >
            {[
              ['quantity', 'Quantity', 'e.g. 2,500 MT'],
              ['targetPrice', 'Target Price (optional)', 'e.g. $820 / MT'],
              ['deliveryLocation', 'Delivery Location', 'e.g. Jebel Ali, UAE'],
            ].map(([key, label, placeholder]) => (
              <label key={key} className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
                <input
                  value={form[key]}
                  onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                  placeholder={placeholder}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                />
              </label>
            ))}
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Notes</span>
              <textarea
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                rows={5}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
              />
            </label>
            <button className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Submit RFQ</button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}

export default RequestQuotePage;
