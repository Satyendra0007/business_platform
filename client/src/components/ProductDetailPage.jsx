import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Loader2, AlertCircle, ArrowLeft, Package,
  Globe, MapPin, Layers, Clock, FileText, ShieldCheck
} from 'lucide-react';
import { getProductById } from '../lib/productService';
import { AppShell, MetricCard, PublicLayout } from './ui';
import { useAuth } from '../hooks/useAuth';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPrice(price, unit) {
  if (price == null) return '—';
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 2,
  }).format(price);
  return unit ? `${formatted} / ${unit}` : formatted;
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] animate-pulse">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6">
        <div className="h-72 rounded-[24px] bg-slate-100" />
        <div className="mt-5 space-y-3 px-2">
          <div className="h-5 w-1/4 rounded-full bg-slate-100" />
          <div className="h-8 w-3/4 rounded-full bg-slate-100" />
          <div className="h-4 w-full rounded-full bg-slate-100" />
          <div className="h-4 w-5/6 rounded-full bg-slate-100" />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-[20px] bg-slate-100" />
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <div className="h-48 rounded-[28px] bg-slate-100" />
        <div className="h-48 rounded-[28px] bg-slate-100" />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function ProductDetailPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { productId } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    getProductById(productId)
      .then((data) => { if (!cancelled) setProduct(data); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [productId]);

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    const Shell = user ? AppShell : ({ children }) => (
      <PublicLayout><section className="mt-10">{children}</section></PublicLayout>
    );
    return (
      <Shell title="Loading…">
        <DetailSkeleton />
      </Shell>
    );
  }

  // ─── Error ─────────────────────────────────────────────────────────────────
  if (error || !product) {
    const msg = error || 'Product not found.';
    const Shell = user ? AppShell : ({ children }) => (
      <PublicLayout><section className="mt-10">{children}</section></PublicLayout>
    );
    return (
      <Shell title="Product">
        <div className="flex flex-col items-center gap-5 rounded-[28px] border border-rose-100 bg-rose-50 py-20 text-center">
          <AlertCircle className="h-12 w-12 text-rose-300" />
          <div>
            <p className="text-lg font-bold text-slate-800">{msg}</p>
            <p className="mt-1 text-sm text-slate-500">The product may have been removed or the link is incorrect.</p>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="mt-2 flex items-center gap-2 rounded-2xl bg-[#0A2540] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#143a6a]"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Products
          </button>
        </div>
      </Shell>
    );
  }

  // ─── Product image / placeholder ──────────────────────────────────────────
  const image = product.images?.[0];

  // ─── Body (shared) ─────────────────────────────────────────────────────────
  const body = (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      {/* Left — image + title */}
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <div className="relative overflow-hidden rounded-[24px] bg-slate-100">
          {image ? (
            <img
              src={image}
              alt={product.title}
              className="h-72 w-full object-cover"
            />
          ) : (
            <div className="flex h-72 items-center justify-center">
              <Package className="h-24 w-24 text-slate-200" />
            </div>
          )}
        </div>

        <div className="mt-5 rounded-[24px] bg-[linear-gradient(135deg,#dbeafe,#f8fafc)] p-6">
          <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
            {product.category || 'Product'}
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-slate-950 lg:text-4xl">
            {product.title}
          </h1>
          {product.description && (
            <p className="mt-3 text-sm leading-7 text-slate-600">{product.description}</p>
          )}
        </div>

        {/* Metric grid */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <MetricCard label="Price" value={fmtPrice(product.price, product.unit)} />
          <MetricCard
            label="Min Order (MOQ)"
            value={product.MOQ ? `${product.MOQ} ${product.unit || 'units'}` : '—'}
          />
          <MetricCard label="Origin" value={product.countryOfOrigin || '—'} />
          <MetricCard label="Lead Time" value={product.leadTime || '—'} />
        </div>
      </div>

      {/* Right — specs & actions */}
      <div className="space-y-5">
        {/* Trade details */}
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Trade Details</p>
          <div className="mt-4 space-y-3">
            {[
              { icon: Globe, label: 'Incoterm', value: product.incoterm || '—' },
              { icon: Layers, label: 'Available Quantity', value: product.availableQuantity ? `${product.availableQuantity} ${product.unit || 'units'}` : '—' },
              { icon: MapPin, label: 'Origin', value: product.countryOfOrigin || '—' },
              { icon: Clock, label: 'Lead Time', value: product.leadTime || '—' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 rounded-[18px] border border-[#e2ebf4] bg-[#f8fbff] px-4 py-3">
                <Icon className="h-4 w-4 shrink-0 text-[#245c9d]" />
                <p className="text-xs font-semibold text-slate-500 w-32 shrink-0">{label}</p>
                <p className="truncate text-sm font-medium text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        {product.certifications?.length > 0 && (
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Certifications</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {product.certifications.map((cert) => (
                <div key={cert} className="flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  <ShieldCheck className="h-3 w-3" /> {cert}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Packaging */}
        {product.packagingDetails && (
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Packaging</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{product.packagingDetails}</p>
          </div>
        )}

        {/* Actions */}
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 mb-4">Actions</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate(user ? `/request-quote/${product._id}` : '/login')}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#0A2540] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#143a6a]"
            >
              <FileText className="h-4 w-4" /> Request Quote
            </button>
            <button
              onClick={() => navigate('/products')}
              className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Public (unauthenticated) ──────────────────────────────────────────────
  if (!user) {
    return (
      <PublicLayout>
        <section className="mt-10">{body}</section>
      </PublicLayout>
    );
  }

  // ─── Authenticated ─────────────────────────────────────────────────────────
  return (
    <AppShell
      title={product.title}
      subtitle="Review commercial terms, packaging details, and start an RFQ when you're ready."
    >
      {body}
    </AppShell>
  );
}

export default ProductDetailPage;
