import React from 'react';
import { getProductById } from '../lib/tradafyData';
import { getProductVisual } from '../lib/productVisuals';
import { AppShell, MetricCard, PublicLayout } from './ui';

function ProductDetailPage({ currentUser, navigate, user, pathname, onLogout, productId }) {
  const product = getProductById(productId);
  if (!product) return null;
  const visual = getProductVisual(product.id);

  const body = (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <div className={`rounded-[28px] bg-gradient-to-br ${visual.accent} p-5`}>
          <img src={visual.image} alt={visual.alt} className="h-72 w-full rounded-[24px] object-cover shadow-[0_18px_40px_rgba(15,23,42,0.14)]" />
        </div>
        <div className="mt-5 rounded-[28px] bg-[linear-gradient(135deg,#dbeafe,#f8fafc)] p-8">
          <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">{product.category}</div>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-[-0.03em] text-slate-950">{product.name}</h1>
          <p className="mt-3 text-base leading-7 text-slate-600">{product.description}</p>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <MetricCard label="Supplier" value={product.supplierCompany} />
          <MetricCard label="Origin" value={product.origin} />
          <MetricCard label="Price" value={product.price} />
          <MetricCard label="Minimum Order" value={product.minOrder} />
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Product Specs</p>
          <div className="mt-5 space-y-3">
            {product.specs.map((spec) => (
              <div key={spec} className="rounded-[20px] bg-slate-50 px-4 py-3 text-sm text-slate-700">{spec}</div>
            ))}
          </div>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Commercial Snapshot</p>
          <div className="mt-5 grid gap-3">
            <div className="rounded-[20px] bg-slate-50 px-4 py-3 text-sm text-slate-700">Lead time: {product.leadTime}</div>
            <div className="rounded-[20px] bg-slate-50 px-4 py-3 text-sm text-slate-700">Shipment support available with verified logistics coordination.</div>
          </div>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <div className="mt-5 flex gap-3">
            <button onClick={() => navigate(currentUser ? `/request-quote/${product.id}` : '/login')} className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white">
              Request Quote
            </button>
            <button onClick={() => navigate('/products')} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
              Back to Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!currentUser) {
    return (
      <PublicLayout currentUser={null} navigate={navigate}>
        <section className="mt-10">{body}</section>
      </PublicLayout>
    );
  }

  return (
    <AppShell user={user} pathname={pathname} navigate={navigate} onLogout={onLogout} title={product.name} subtitle="Review commercial terms and start the RFQ process when you're ready.">
      {body}
    </AppShell>
  );
}

export default ProductDetailPage;
