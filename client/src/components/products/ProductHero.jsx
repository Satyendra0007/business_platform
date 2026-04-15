/**
 * ProductHero.jsx — Dark banner search & filter header for the products page.
 * Props:
 *  search        string   — controlled search value
 *  onSearch      fn       — called with new string on input change
 *  category      string   — currently active category filter
 *  onCategory    fn       — called with category string (or '' to clear)
 *  total         number   — total products count (for stats bar)
 *  loading       bool     — shows spinner when fetching
 *  categories    string[] — live categories from /api/products/categories
 */
import React from 'react';
import { Search, Loader2 } from 'lucide-react';

export default function ProductHero({
  search, onSearch,
  category, onCategory,
  total, loading,
  categories = [],
}) {
  // Show at most 6 category pills; fall back to a placeholder if still loading
  const pills = categories.slice(0, 6);

  return (
    <section className="relative overflow-hidden rounded-[30px] border border-slate-300/40 bg-[#0c1f38] p-6 text-white shadow-xl lg:p-8">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&q=80&w=2400"
          alt="Shipping Containers"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1b32] via-[#102a4e]/95 to-[#1c4f8d]/80 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
        {/* Left — title + stats */}
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

          {/* Stats */}
          <div className="flex items-center gap-8">
            <div>
              <div className="text-xl font-bold text-white">
                {loading && total === 0 ? (
                  <span className="opacity-40">…</span>
                ) : (
                  `${total}+`
                )}
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                Verified Listings
              </div>
            </div>
            {categories.length > 0 && (
              <div>
                <div className="text-xl font-bold text-white">{categories.length}</div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                  Categories
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right — search + category pills */}
        <div className="w-full xl:w-[480px] xl:shrink-0">
          <div className="rounded-[20px] border border-white/5 bg-white/5 p-3 shadow-inner backdrop-blur-sm">
            {/* Search */}
            <label className="flex items-center gap-2.5 rounded-[14px] bg-[#071120]/50 px-4 py-3 ring-1 ring-white/10 transition-all focus-within:ring-sky-500/50">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Search products, category, origin…"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
              {loading && search && (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-slate-400" />
              )}
            </label>

            {/* Category pills — from live DB */}
            {pills.length > 0 ? (
              <div className="mt-3 flex flex-wrap items-center gap-2 px-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Filter:
                </span>
                {pills.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => onCategory(cat === category ? '' : cat)}
                    className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold tracking-wide transition ${
                      category === cat
                        ? 'bg-sky-500 text-white'
                        : 'bg-white/5 text-slate-300 hover:bg-white/15'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
                {category && (
                  <button
                    onClick={() => onCategory('')}
                    className="rounded-lg bg-rose-500/20 px-2.5 py-1 text-[10px] font-semibold text-rose-300 transition hover:bg-rose-500/30"
                  >
                    ✕ Clear
                  </button>
                )}
              </div>
            ) : (
              // Still loading categories — show placeholder pills
              <div className="mt-3 flex items-center gap-2 px-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Filter:
                </span>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-6 w-20 animate-pulse rounded-lg bg-white/10" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
