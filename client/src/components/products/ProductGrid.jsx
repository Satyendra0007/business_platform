/**
 * ProductGrid.jsx — The main product card grid with loading, empty, and error states.
 * Props: products, loading, error, onRetry, search, category, onClear
 */
import React from 'react';
import { AlertCircle, Package } from 'lucide-react';
import ProductCard, { ProductCardSkeleton } from './ProductCard';

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ search, category, onClear }) {
  const hasFilter = Boolean(search || category);
  return (
    <div className="col-span-full flex flex-col items-center gap-5 rounded-[28px] border border-dashed border-slate-200 py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-slate-50">
        <Package className="h-10 w-10 text-slate-200" />
      </div>
      <div>
        <p className="text-lg font-bold text-slate-700">
          {hasFilter ? 'No matching products' : 'No products listed yet'}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {hasFilter
            ? 'Try adjusting or removing your search filters.'
            : 'Verified suppliers will appear here once they list products.'}
        </p>
      </div>
      {hasFilter && (
        <button
          onClick={onClear}
          className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

// ─── Error banner ─────────────────────────────────────────────────────────────

function ErrorBanner({ message, onRetry }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
      <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
      <span className="flex-1">{message}</span>
      <button onClick={onRetry} className="text-xs font-semibold underline hover:no-underline">
        Retry
      </button>
    </div>
  );
}

// ─── Grid ─────────────────────────────────────────────────────────────────────

export default function ProductGrid({ products, loading, error, onRetry, search, category, onClear }) {
  return (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} onRetry={onRetry} />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
        ) : products.length > 0 ? (
          products.map((product) => <ProductCard key={product._id} product={product} />)
        ) : (
          !error && (
            <EmptyState search={search} category={category} onClear={onClear} />
          )
        )}
      </div>
    </div>
  );
}
