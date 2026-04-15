import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Search, SlidersHorizontal, Loader2, AlertCircle,
  ChevronLeft, ChevronRight, Package, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../lib/productService';
import { AppShell, PublicLayout } from './ui';
import { useAuth } from '../hooks/useAuth';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Format a raw price number as USD string. */
function fmtPrice(price, unit) {
  if (price == null) return '—';
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 2,
  }).format(price);
  return unit ? `${formatted} / ${unit}` : formatted;
}

/** Pick a gradient accent based on category. */
function categoryAccent(category = '') {
  const map = {
    'Food & Agriculture': 'from-emerald-400/20 to-emerald-600/10',
    'Metals & Mining': 'from-slate-400/20 to-slate-600/10',
    'Energy & Petrochemicals': 'from-amber-400/20 to-amber-600/10',
    'Industrial Equipment': 'from-sky-400/20 to-sky-600/10',
    'Electronics & Technology': 'from-violet-400/20 to-violet-600/10',
    'Textiles & Apparel': 'from-pink-400/20 to-pink-600/10',
    'Chemicals': 'from-lime-400/20 to-lime-600/10',
    'Shipping & Logistics': 'from-blue-400/20 to-blue-600/10',
  };
  return map[category] || 'from-slate-300/20 to-slate-400/10';
}

/** Category icon emoji for the badge. */
function categoryBadge(category = '') {
  const map = {
    'Food & Agriculture': '🌾', 'Metals & Mining': '⚙️',
    'Energy & Petrochemicals': '🛢️', 'Industrial Equipment': '🏭',
    'Electronics & Technology': '💡', 'Textiles & Apparel': '🧵',
    'Chemicals': '🧪', 'Shipping & Logistics': '🚢',
  };
  return map[category] || '📦';
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[26px] border border-[#d8e2ef] bg-white animate-pulse">
      <div className="h-36 bg-slate-100" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 rounded-full bg-slate-100" />
        <div className="h-4 w-3/4 rounded-full bg-slate-100" />
        <div className="h-3 w-1/2 rounded-full bg-slate-100" />
        <div className="mt-4 flex gap-2">
          <div className="h-8 w-16 rounded-xl bg-slate-100" />
          <div className="h-8 w-16 rounded-xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product, user, navigate }) {
  const image = product.images?.[0];
  const accent = categoryAccent(product.category);
  const initials = (product.title || '').slice(0, 2).toUpperCase();

  return (
    <article className="group overflow-hidden rounded-[26px] border border-[#d8e2ef] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)] transition hover:-translate-y-1.5 hover:shadow-[0_24px_56px_rgba(15,23,42,0.12)]">
      {/* Image / placeholder */}
      <div className={`relative h-36 overflow-hidden bg-gradient-to-br ${accent} p-3`}>
        {image ? (
          <img
            src={image}
            alt={product.title}
            className="h-full w-full rounded-[18px] object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-[18px] bg-white/40">
            <span className="text-4xl font-black text-slate-300/60">{initials}</span>
          </div>
        )}
        <div className="absolute left-5 top-5 rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-700 shadow-sm">
          {categoryBadge(product.category)} {product.category || 'Product'}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="w-fit rounded-full bg-[#edf5ff] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#245c9d]">
            {product.category || '—'}
          </div>
          <div className="text-xs font-semibold text-[#143a6a]">
            {fmtPrice(product.price, product.unit)}
          </div>
        </div>

        <h2 className="mt-3 text-base font-semibold leading-5 tracking-[-0.02em] text-slate-950 line-clamp-2">
          {product.title}
        </h2>
        <p className="mt-1 text-xs text-slate-500 truncate">
          {product.countryOfOrigin ? `Origin: ${product.countryOfOrigin}` : 'Tradafy Verified Supplier'}
        </p>
        {product.MOQ && (
          <p className="mt-1 text-[11px] leading-5 text-slate-500">
            Min order: {product.MOQ} {product.unit || 'units'}
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => navigate(`/product/${product._id}`)}
            className="rounded-xl bg-[linear-gradient(135deg,#173b67,#245c9d)] px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
          >
            View
          </button>
          <button
            onClick={() => navigate(user ? `/request-quote/${product._id}` : '/login')}
            className="rounded-xl border border-[#d8e2ef] px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Quote
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const CATEGORIES = [
  'Food & Agriculture', 'Metals & Mining', 'Energy & Petrochemicals',
  'Industrial Equipment', 'Electronics & Technology', 'Textiles & Apparel',
  'Chemicals', 'Shipping & Logistics',
];

const LIMIT = 20;

function ProductsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const debounceTimer = useRef(null);

  // ── Debounce search ────────────────────────────────────────────────────────
  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(debounceTimer.current);
  }, [search]);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: LIMIT };
      if (debouncedSearch) params.search = debouncedSearch;
      if (category) params.category = category;
      const result = await getProducts(params);
      setProducts(result.products);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ── Reset page on filter change ────────────────────────────────────────────
  const handleCategory = (cat) => {
    setCategory(cat === category ? '' : cat);
    setPage(1);
  };

  // ─── Header section (shared between public & auth layout) ─────────────────
  const header = (
    <section className="relative overflow-hidden rounded-[30px] border border-slate-300/40 bg-[#0c1f38] p-6 text-white shadow-xl lg:p-8">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&q=80&w=2400"
          alt="Shipping Containers"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1b32] via-[#102a4e]/95 to-[#1c4f8d]/80 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
        <div className="space-y-4 xl:max-w-xl">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#245c9d]/40 bg-[#245c9d]/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-sky-200">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-400" />
              </span>
              Live Marketplace
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white lg:text-3xl">
              Products With Deal-Ready Context
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Search trusted export listings, filter by sector, and start an RFQ instantly.
            </p>
          </div>

          <div className="flex items-center gap-8">
            {[
              { value: loading ? '…' : `${total}+`, label: 'Verified Listings' },
              { value: CATEGORIES.length, label: 'Categories' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col">
                <div className="text-xl font-bold text-white">{item.value}</div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Search box */}
        <div className="w-full xl:w-[480px] shrink-0">
          <div className="rounded-[20px] border border-white/5 bg-white/5 p-3 backdrop-blur-sm shadow-inner">
            <label className="flex items-center gap-2.5 rounded-[14px] bg-[#071120]/50 px-4 py-3 ring-1 ring-white/10 transition-all focus-within:ring-sky-500/50">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products or keywords…"
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none"
              />
              {loading && debouncedSearch && (
                <Loader2 className="h-4 w-4 animate-spin text-slate-400 shrink-0" />
              )}
            </label>

            {/* Category quick filters */}
            <div className="mt-3 flex flex-wrap items-center gap-2 px-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Filter:</span>
              {CATEGORIES.slice(0, 5).map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategory(cat)}
                  className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold tracking-wide transition ${
                    category === cat ? 'bg-sky-500 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/15'
                  }`}
                >
                  {cat}
                </button>
              ))}
              {category && (
                <button
                  onClick={() => handleCategory('')}
                  className="rounded-lg bg-rose-500/20 px-2.5 py-1 text-[10px] font-semibold text-rose-300 hover:bg-rose-500/30 transition"
                >
                  ✕ Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // ─── Product grid ──────────────────────────────────────────────────────────
  const grid = (
    <div className="space-y-6">
      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
          {error}
          <button onClick={fetchProducts} className="ml-auto text-xs underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : products.length > 0
          ? products.map((product) => (
              <ProductCard key={product._id} product={product} user={user} navigate={navigate} />
            ))
          : !error && (
              <div className="col-span-full flex flex-col items-center gap-4 rounded-[28px] border border-dashed border-slate-200 py-20 text-center">
                <Package className="h-12 w-12 text-slate-200" />
                <div>
                  <p className="text-lg font-bold text-slate-700">No products found</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {debouncedSearch || category
                      ? 'Try removing your filters.'
                      : 'No products have been listed yet.'}
                  </p>
                </div>
                {(debouncedSearch || category) && (
                  <button
                    onClick={() => { setSearch(''); setCategory(''); }}
                    className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-6">
          <p className="text-sm text-slate-500">
            Showing {Math.min((page - 1) * LIMIT + 1, total)}–{Math.min(page * LIMIT, total)} of {total} products
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold transition ${
                    p === page
                      ? 'bg-[#0A2540] text-white shadow'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // ─── Public layout (unauthenticated) ──────────────────────────────────────
  if (!user) {
    return (
      <PublicLayout>
        <section className="mt-10 space-y-6">
          <div className="mb-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Products</p>
            <h1 className="font-display mt-2 text-4xl font-semibold tracking-[-0.03em] text-slate-950">
              Global trade catalog
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Browse verified export listings and request quotes — sign in to start a deal.
            </p>
          </div>
          {header}
          {grid}
        </section>
      </PublicLayout>
    );
  }

  // ─── Authenticated layout ─────────────────────────────────────────────────
  return (
    <AppShell
      title="Products"
      subtitle="Browse verified listings with search and filters, then start an RFQ directly from the product that fits."
    >
      <div className="space-y-6">
        {header}
        {grid}
      </div>
    </AppShell>
  );
}

export default ProductsPage;
