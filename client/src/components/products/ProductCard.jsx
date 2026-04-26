/**
 * ProductCard.jsx — Single product card for the marketplace grid.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { categoryAccent, categoryEmoji, fmtPrice } from './productCardUtils';

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function ProductCardSkeleton() {
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

// ─── Card ─────────────────────────────────────────────────────────────────────

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const image     = product.images?.[0];
  const accent    = categoryAccent(product.category);
  const initials  = (product.title || '').slice(0, 2).toUpperCase();

  return (
    <article className="group overflow-hidden rounded-[26px] border border-[#d8e2ef] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)] transition hover:-translate-y-1.5 hover:shadow-[0_24px_56px_rgba(15,23,42,0.12)]">
      {/* Thumbnail */}
      <div className={`relative h-36 overflow-hidden bg-gradient-to-br ${accent} p-3 sm:h-36 sm:p-3`}>
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
        <div className="absolute left-3 top-3 max-w-[calc(100%-1.5rem)] rounded-full bg-white/92 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-700 shadow-sm sm:left-5 sm:top-5 sm:max-w-none sm:text-[10px]">
          {categoryEmoji(product.category)} {product.category || 'Product'}
        </div>
      </div>

      {/* Body */}
      <div className="p-3.5 sm:p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-fit rounded-full bg-[#edf5ff] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#245c9d] sm:text-[10px]">
            {product.category || '—'}
          </div>
          <div className="text-xs font-semibold text-[#143a6a] sm:text-right">
            {fmtPrice(product.price, product.unit)}
          </div>
        </div>

        <h2 className="mt-3 line-clamp-2 text-[15px] font-semibold leading-5 tracking-tight text-slate-950 sm:text-base">
          {product.title}
        </h2>

        <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-slate-500 sm:truncate sm:text-xs">
          {product.countryOfOrigin ? `Origin: ${product.countryOfOrigin}` : 'Tradafy Verified Supplier'}
        </p>

        {product.MOQ && (
          <p className="mt-0.5 text-[11px] text-slate-400">
            Min order: {product.MOQ} {product.unit || 'units'}
          </p>
        )}

        {/* Actions */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() => navigate(`/product/${product._id}`)}
            className="w-full rounded-xl bg-[linear-gradient(135deg,#173b67,#245c9d)] px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 sm:w-auto"
          >
            Start Deal
          </button>
          {/* Quote button — buyers only (public visitors shown login redirect) */}
          {(!user || user.roles?.includes('buyer')) && (
            <button
              onClick={() => navigate(user ? `/request-quote/${product._id}` : '/login')}
              className="w-full rounded-xl border border-[#d8e2ef] px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
            >
              Quote
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
