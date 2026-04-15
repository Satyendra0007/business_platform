/**
 * Pagination.jsx — Reusable pagination bar
 * Always renders the "Showing X–Y of Z products" counter.
 * Hides the page buttons when there is only 1 page.
 * Props: page, totalPages, total, limit, onPage(newPage)
 */
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, total, limit, onPage }) {
  // Don't render anything if there are no products at all
  if (!total || total === 0) return null;

  const from = Math.min((page - 1) * limit + 1, total);
  const to   = Math.min(page * limit, total);

  // Smart page-number list with ellipsis for large sets
  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4)             return [1, 2, 3, 4, 5, '…', totalPages];
    if (page >= totalPages - 3) return [1, '…', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '…', page - 1, page, page + 1, '…', totalPages];
  };

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
      {/* Counter — always visible */}
      <p className="text-sm text-slate-500">
        Showing{' '}
        <span className="font-semibold text-slate-700">{from}–{to}</span>
        {' '}of{' '}
        <span className="font-semibold text-slate-700">{total}</span>
        {' '}product{total !== 1 ? 's' : ''}
      </p>

      {/* Page buttons — only when more than one page */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPage(page - 1)}
            disabled={page === 1}
            aria-label="Previous page"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {getPages().map((p, i) =>
            p === '…' ? (
              <span
                key={`ellipsis-${i}`}
                className="flex h-9 w-9 items-center justify-center text-sm text-slate-400"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPage(p)}
                aria-label={`Page ${p}`}
                className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold transition ${
                  p === page
                    ? 'bg-[#0A2540] text-white shadow-md'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => onPage(page + 1)}
            disabled={page === totalPages}
            aria-label="Next page"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
