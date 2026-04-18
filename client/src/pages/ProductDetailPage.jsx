/**
 * ProductDetailPage.jsx — Displays all backend Product fields.
 *
 * Schema coverage (product.model.js):
 *   title, category, subcategory, description
 *   price, unit, MOQ, incoterm, countryOfOrigin, availableQuantity, leadTime
 *   packagingDetails, certifications[], images[], videoUrl, specSheet
 *   isActive, createdAt
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle, ArrowLeft, Package, Globe, MapPin,
  Clock, FileText, ShieldCheck, Video, ExternalLink,
  DollarSign, Boxes, Tag, CalendarDays, CheckCircle2
} from 'lucide-react';
import { getProductById } from '../lib/productService';
import { AppShell, MetricCard, PublicLayout } from '../components/ui';
import { useAuth } from '../hooks/useAuth';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPrice(price, unit) {
  if (price == null) return '—';
  const f = new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 2,
  }).format(price);
  return unit ? `${f} / ${unit}` : f;
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] animate-pulse">
      <div className="space-y-5">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6">
          <div className="h-72 rounded-[24px] bg-slate-100" />
          <div className="mt-3 flex gap-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-14 w-14 rounded-[14px] bg-slate-100" />)}
          </div>
          <div className="mt-5 space-y-3 px-2">
            <div className="h-5 w-1/4 rounded-full bg-slate-100" />
            <div className="h-8 w-3/4 rounded-full bg-slate-100" />
            <div className="h-4 w-full rounded-full bg-slate-100" />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-[20px] bg-slate-100" />)}
        </div>
      </div>
      <div className="space-y-5">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 rounded-[28px] bg-slate-100" />)}
      </div>
    </div>
  );
}

/** Consistent row inside detail cards */
function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-[18px] border border-[#e2ebf4] bg-[#f8fbff] px-4 py-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#245c9d]" />
      <p className="w-32 shrink-0 text-xs font-semibold text-slate-500">{label}</p>
      <p className="truncate text-sm font-medium text-slate-900">{value ?? '—'}</p>
    </div>
  );
}

/** White card wrapper */
function Card({ title, children }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
      {title && (
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">{title}</p>
      )}
      {children}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function ProductDetailPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { productId } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    getProductById(productId)
      .then((data) => { if (!cancelled) { console.log(data); setProduct(data); setActiveImg(0); } })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [productId]);

  // ─── Loading ─────────────────────────────────────────────────────────────
  if (loading) {
    const Shell = user
      ? AppShell
      : ({ children }) => <PublicLayout><section className="mt-10">{children}</section></PublicLayout>;
    return <Shell title="Loading…"><DetailSkeleton /></Shell>;
  }

  // ─── Error ───────────────────────────────────────────────────────────────
  if (error || !product) {
    const msg = error || 'Product not found.';
    const Shell = user
      ? AppShell
      : ({ children }) => <PublicLayout><section className="mt-10">{children}</section></PublicLayout>;
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

  const images = product.images?.length ? product.images : [];

  // ─── Body ─────────────────────────────────────────────────────────────────
  const body = (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">

      {/* ══════════ LEFT COLUMN ══════════ */}
      <div className="space-y-5">

        {/* Gallery + title */}
        <Card>
          {/* ── Main image ── */}
          <div className="relative overflow-hidden rounded-[20px] bg-slate-100">
            {images.length > 0 ? (
              <img
                src={images[activeImg]}
                alt={product.title}
                className="h-72 w-full object-cover transition duration-300"
              />
            ) : (
              <div className="flex h-72 items-center justify-center">
                <Package className="h-24 w-24 text-slate-200" />
              </div>
            )}

            {/* isActive badge */}
            <div className={`absolute right-3 top-3 flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] shadow-sm ${product.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}>
              <CheckCircle2 className="h-3 w-3" />
              {product.isActive ? 'Active' : 'Inactive'}
            </div>
          </div>

          {/* ── Thumbnails (only when > 1 image) ── */}
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {images.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImg(i)}
                  className={`h-14 w-14 shrink-0 overflow-hidden rounded-[14px] border-2 transition ${i === activeImg
                    ? 'border-[#245c9d]'
                    : 'border-slate-200 opacity-60 hover:opacity-90'
                    }`}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* ── Title block ── */}
          <div className="mt-5 rounded-[20px] bg-[linear-gradient(135deg,#dbeafe,#f8fafc)] p-5">
            {/* Category + Subcategory */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                {product.category || 'Product'}
              </span>
              {product.subcategory && (
                <span className="flex items-center gap-1 rounded-full border border-[#dce9f8] bg-[#edf5ff] px-2.5 py-1 text-[11px] font-medium text-[#245c9d]">
                  <Tag className="h-3 w-3" /> {product.subcategory}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-slate-950 lg:text-4xl">
              {product.title}
            </h1>

            {/* Description */}
            {product.description && (
              <p className="mt-3 text-sm leading-7 text-slate-600">{product.description}</p>
            )}

            {/* Listing date */}
            <p className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-400">
              <CalendarDays className="h-3 w-3" />
              Listed {fmtDate(product.createdAt)}
            </p>
          </div>
        </Card>

        {/* Pricing metrics — 3 columns */}
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricCard label="Unit Price" value={fmtPrice(product.price, product.unit)} />
          <MetricCard label="Min Order (MOQ)" value={product.MOQ ? `${product.MOQ} ${product.unit || 'units'}` : '—'} />
          <MetricCard label="Available Qty" value={product.availableQuantity ? `${product.availableQuantity} ${product.unit || 'units'}` : '—'} />
        </div>
      </div>

      {/* ══════════ RIGHT COLUMN ══════════ */}
      <div className="space-y-5">

        {/* Trade Terms — all trade-related fields */}
        <Card title="Trade Terms">
          <div className="space-y-2.5">
            <DetailRow icon={Globe} label="Incoterm" value={product.incoterm} />
            <DetailRow icon={MapPin} label="Origin" value={product.countryOfOrigin} />
            <DetailRow icon={Clock} label="Lead Time" value={product.leadTime} />
            <DetailRow icon={DollarSign} label="Price" value={fmtPrice(product.price, product.unit)} />
            <DetailRow icon={Boxes} label="Unit" value={product.unit} />
          </div>
        </Card>

        {/* Certifications */}
        {product.certifications?.length > 0 && (
          <Card title="Certifications">
            <div className="flex flex-wrap gap-2">
              {product.certifications.map((cert) => (
                <div
                  key={cert}
                  className="flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
                >
                  <ShieldCheck className="h-3 w-3" /> {cert}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Packaging */}
        {product.packagingDetails && (
          <Card title="Packaging">
            <p className="text-sm leading-6 text-slate-600">{product.packagingDetails}</p>
          </Card>
        )}

        {/* Media & Documents — videoUrl + specSheet */}
        {(product.videoUrl || product.specSheet) && (
          <Card title="Media & Documents">
            <div className="space-y-2.5">
              {product.videoUrl && (
                <a
                  href={product.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-[18px] border border-[#e2ebf4] bg-[#f8fbff] px-4 py-3 transition hover:border-[#245c9d]"
                >
                  <Video className="h-4 w-4 shrink-0 text-[#245c9d]" />
                  <span className="flex-1 truncate text-sm font-medium text-slate-700">Product Video</span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                </a>
              )}
              {product.specSheet && (
                <a
                  href={product.specSheet}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-[18px] border border-[#e2ebf4] bg-[#f8fbff] px-4 py-3 transition hover:border-[#245c9d]"
                >
                  <FileText className="h-4 w-4 shrink-0 text-[#245c9d]" />
                  <span className="flex-1 truncate text-sm font-medium text-slate-700">Spec Sheet / Datasheet</span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                </a>
              )}
            </div>
          </Card>
        )}

        {/* Actions */}
        <Card title="Actions">
          <div className="flex flex-col gap-3">
            {/* Request Quote — buyers and unauthenticated visitors only */}
            {(!user || user.roles?.includes('buyer')) && (
              <button
                onClick={() => navigate(user ? `/request-quote/${product._id}` : '/login')}
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#0A2540] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#143a6a]"
              >
                <FileText className="h-4 w-4" /> Request Quote
              </button>
            )}
            <button
              onClick={() => navigate('/products')}
              className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Products
            </button>
          </div>
        </Card>
      </div>
    </div>
  );

  // ─── Public (unauthenticated) ───────────────────────────────────────────────
  if (!user) {
    return (
      <PublicLayout>
        <section className="mt-10">{body}</section>
      </PublicLayout>
    );
  }

  // ─── Authenticated ──────────────────────────────────────────────────────────
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
