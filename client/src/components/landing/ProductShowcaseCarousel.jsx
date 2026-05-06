import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Clock3,
  Globe,
  Package,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../../lib/productService';

const PAGE_SIZE = 50;

const fmtPrice = (value, unit) => {
  if (value == null || value === '') return 'On request';
  const amount = Number(value);
  if (Number.isNaN(amount)) return 'On request';
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
  return `$${formatted}${unit ? ` / ${unit}` : ''}`;
};

const fmtDate = (value) => {
  if (!value) return 'Recently listed';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently listed';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

const freshnessLabel = (value) => {
  if (!value) return 'Live listing';
  const ageDays = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86400000));
  if (ageDays <= 14) return 'New arrival';
  if (ageDays <= 120) return 'Active listing';
  return 'Established';
};

const getFallbackTone = (category = '') => {
  const value = category.toLowerCase();
  if (value.includes('food') || value.includes('agri') || value.includes('agriculture')) return 'from-emerald-500/20 via-white to-amber-400/10';
  if (value.includes('metal') || value.includes('mining')) return 'from-slate-500/20 via-white to-slate-400/10';
  if (value.includes('chem')) return 'from-cyan-500/20 via-white to-blue-500/10';
  if (value.includes('electronic')) return 'from-blue-500/20 via-white to-cyan-500/10';
  if (value.includes('apparel') || value.includes('textile')) return 'from-fuchsia-500/20 via-white to-rose-500/10';
  if (value.includes('shipping')) return 'from-sky-500/20 via-white to-indigo-500/10';
  return 'from-[#143a6a]/20 via-white to-[#245c9d]/10';
};

const getInitials = (title = '') => title.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('');

function ProductTile({ product, onSelect, onHover }) {
  return (
    <button
      type="button"
      onMouseEnter={() => onHover?.(product._id)}
      onFocus={() => onHover?.(product._id)}
      onClick={() => onSelect(product._id)}
      className="group flex h-full w-[16rem] flex-none flex-col overflow-hidden rounded-[24px] border border-white/10 bg-white/8 text-left shadow-[0_16px_40px_rgba(5,14,28,0.22)] transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/12 sm:w-[18rem]"
    >
      <div className={`relative h-36 overflow-hidden bg-gradient-to-br ${getFallbackTone(product.category)}`}>
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-[20px] border border-white/40 bg-white/65 text-xl font-black text-[#143a6a] shadow-[0_20px_50px_rgba(255,255,255,0.24)]">
              {getInitials(product.title) || <Package className="h-6 w-6" />}
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,14,28,0.04)_0%,rgba(5,14,28,0.1)_38%,rgba(5,14,28,0.76)_100%)]" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/20 bg-white/90 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-[#143a6a] shadow-sm">
            {product.category || 'Product'}
          </span>
          <span className="rounded-full border border-white/20 bg-white/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-white">
            {freshnessLabel(product.createdAt)}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3.5">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-sky-100/80">
            Listed {fmtDate(product.createdAt)}
          </p>
          <h4 className="mt-1 line-clamp-2 text-[1.1rem] font-black leading-tight tracking-tight text-white">
            {product.title}
          </h4>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf5ff] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#245c9d]">
            <Globe className="h-3.5 w-3.5" />
            {product.countryOfOrigin || 'Global supply'}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-600">
            <Clock3 className="h-3.5 w-3.5" />
            {product.leadTime || 'Ready to quote'}
          </span>
        </div>

        <p className="line-clamp-2 text-[12px] leading-5 text-slate-500">
          Live product listing from the catalog, shown in motion so buyers can scan quickly and act sooner.
        </p>

        <div className="mt-auto flex items-end justify-between gap-3">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Price</div>
            <div className="mt-0.5 text-sm font-black text-slate-900">{fmtPrice(product.price, product.unit)}</div>
          </div>
          <div className="rounded-2xl bg-[#f0f7ff] px-2.5 py-1.5 text-right">
            <div className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400">MOQ</div>
            <div className="mt-0.5 text-[11px] font-black text-[#143a6a]">{product.MOQ || '—'}</div>
          </div>
        </div>

        <div className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0A2540,#245c9d)] px-3 py-2 text-xs font-bold text-white transition group-hover:shadow-[0_10px_24px_rgba(20,58,106,0.24)]">
          Open Listing
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </button>
  );
}

function ProductSkeleton() {
  return (
    <div className="flex h-full w-[16rem] flex-none flex-col overflow-hidden rounded-[24px] border border-white/10 bg-white/8 shadow-[0_16px_40px_rgba(5,14,28,0.22)] sm:w-[18rem]">
      <div className="h-36 animate-pulse bg-white/10" />
      <div className="flex flex-1 flex-col gap-3 p-3.5">
        <div className="h-5 w-24 animate-pulse rounded-full bg-white/10" />
        <div className="h-4 w-5/6 animate-pulse rounded-full bg-white/10" />
        <div className="h-4 w-2/3 animate-pulse rounded-full bg-white/10" />
        <div className="mt-auto h-6 w-full animate-pulse rounded-2xl bg-white/10" />
      </div>
    </div>
  );
}

export default function ProductShowcaseCarousel() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredProductId, setHoveredProductId] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadAllProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const firstPage = await getProducts({ page: 1, limit: PAGE_SIZE });
        const allProducts = [...(firstPage.products || [])];

        const restPages = [];
        for (let page = 2; page <= (firstPage.totalPages || 1); page += 1) {
          restPages.push(getProducts({ page, limit: PAGE_SIZE }));
        }

        if (restPages.length) {
          const rest = await Promise.all(restPages);
          rest.forEach((pageResult) => {
            allProducts.push(...(pageResult.products || []));
          });
        }

        if (!cancelled) {
          const sorted = allProducts
            .filter(Boolean)
            .slice()
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          setProducts(sorted);
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || 'Failed to load product showcase.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadAllProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const totalProducts = products.length;
  const categoryCount = new Set(products.map((product) => product.category).filter(Boolean)).size;
  const newestListing = products[0];
  const repeatedProducts = [...products, ...products];
  const marqueeDuration = Math.max(24, products.length * 2.5);
  const featuredProduct = products.find((product) => product._id === hoveredProductId) || newestListing;

  const handleSelect = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(145deg,#07111f,#102a4e_56%,#143a6a_100%)] px-4 py-4 text-white shadow-[0_24px_70px_rgba(10,37,64,0.32)] sm:px-5 sm:py-5 lg:h-[calc(100vh-9rem)] lg:min-h-[720px] lg:px-5 lg:py-5">
      <style>{`
        @keyframes product-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(229,169,61,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.14),transparent_28%)]" />
      <div className="absolute -right-24 -top-20 h-64 w-64 rounded-full bg-white/10 blur-[90px]" />
      <div className="absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-[#E5A93D]/10 blur-[80px]" />

      <div className="relative flex h-full min-h-0 flex-col gap-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-sky-100 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-[#E5A93D]" />
              Live Product Showcase
            </div>
            <h3 className="mt-3 text-[1.6rem] font-black tracking-tight text-white sm:text-[2.15rem]">
              Products that move. Listings that sell.
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-sky-100/75">
              Live catalog cards glide from right to left so buyers can browse fast, spot the newest stock, and open any listing in one click.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-[18px] border border-white/10 bg-white/8 px-4 py-3">
              <div className="text-[9px] font-black uppercase tracking-[0.18em] text-sky-100/70">Products</div>
              <div className="mt-1 text-[1.1rem] font-black text-white">{totalProducts}</div>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-white/8 px-4 py-3">
              <div className="text-[9px] font-black uppercase tracking-[0.18em] text-sky-100/70">Categories</div>
              <div className="mt-1 text-[1.1rem] font-black text-white">{categoryCount}</div>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-white/8 px-4 py-3">
              <div className="text-[9px] font-black uppercase tracking-[0.18em] text-sky-100/70">Newest</div>
              <div className="mt-1 max-w-[7rem] truncate text-sm font-semibold text-white">{newestListing?.title || '—'}</div>
            </div>
          </div>
        </div>

        <div className="relative mt-2 flex min-h-0 flex-1 flex-col gap-3 overflow-hidden rounded-[26px] border border-white/10 bg-white/7 p-3 backdrop-blur">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#07111f] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#143a6a] to-transparent" />

          <div className="relative z-10 grid min-h-0 flex-1 gap-3 lg:grid-cols-[16rem_minmax(0,1fr)]">
            {loading ? (
              <div className="space-y-3">
                <div className="h-[clamp(120px,18vh,180px)] animate-pulse rounded-[24px] bg-white/10" />
                <div className="grid gap-3 sm:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-24 animate-pulse rounded-[18px] bg-white/10" />
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="flex h-full min-h-[220px] items-center justify-center rounded-[22px] border border-rose-200/30 bg-rose-500/10 px-5 py-6 text-sm text-rose-100">
                {error}
              </div>
            ) : totalProducts > 0 ? (
              <>
                <article className="relative flex h-full max-w-[16rem] flex-col overflow-hidden rounded-[22px] border border-white/10 bg-white/5">
                  <div className="relative h-[clamp(120px,18vh,180px)] overflow-hidden">
                    {featuredProduct?.images?.[0] ? (
                      <img
                        src={featuredProduct.images[0]}
                        alt={featuredProduct.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${getFallbackTone(featuredProduct?.category)}`}>
                        <div className="flex h-24 w-24 items-center justify-center rounded-[26px] border border-white/40 bg-white/65 text-3xl font-black text-[#143a6a] shadow-[0_20px_50px_rgba(255,255,255,0.24)]">
                          {getInitials(featuredProduct?.title || '') || <Package className="h-10 w-10" />}
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,14,28,0.02)_0%,rgba(5,14,28,0.1)_34%,rgba(5,14,28,0.82)_100%)]" />
                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/20 bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#143a6a]">
                        {featuredProduct?.category || 'Product'}
                      </span>
                      <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white">
                        {freshnessLabel(featuredProduct?.createdAt)}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-100/80">
                        Hover preview
                      </p>
                      <h4 className="mt-1 line-clamp-2 text-[1rem] font-black tracking-tight text-white">
                        {featuredProduct?.title}
                      </h4>
                      <p className="mt-1.5 line-clamp-2 max-w-xl text-[11px] leading-4.5 text-slate-200">
                        {featuredProduct?.description || 'Hover over any card below to expand it here as a polished featured product view.'}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-2.5 p-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-[16px] bg-white/8 px-2.5 py-2">
                        <div className="text-[9px] font-black uppercase tracking-[0.16em] text-sky-100/70">Price</div>
                        <div className="mt-1 text-[0.9rem] font-black text-white">
                          {fmtPrice(featuredProduct?.price, featuredProduct?.unit)}
                        </div>
                      </div>
                      <div className="rounded-[16px] bg-white/8 px-2.5 py-2">
                        <div className="text-[9px] font-black uppercase tracking-[0.16em] text-sky-100/70">MOQ</div>
                        <div className="mt-1 text-[0.9rem] font-black text-white">{featuredProduct?.MOQ || '—'}</div>
                      </div>
                      <div className="rounded-[16px] bg-white/8 px-2.5 py-2">
                        <div className="text-[9px] font-black uppercase tracking-[0.16em] text-sky-100/70">Origin</div>
                        <div className="mt-1 text-[12px] font-semibold text-white">
                          {featuredProduct?.countryOfOrigin || 'Global supply'}
                        </div>
                      </div>
                      <div className="rounded-[16px] bg-white/8 px-2.5 py-2">
                        <div className="text-[9px] font-black uppercase tracking-[0.16em] text-sky-100/70">Listed</div>
                        <div className="mt-1 text-[12px] font-semibold text-white">{fmtDate(featuredProduct?.createdAt)}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelect(featuredProduct?._id)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#E5A93D,#FFB545)] px-3 py-2 text-[11px] font-black text-[#0A2540] transition hover:-translate-y-0.5"
                    >
                      Open product page
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </article>

                <div className="relative flex min-h-[260px] items-center overflow-hidden rounded-[22px] border border-white/10 bg-white/5 px-3 py-3">
                  <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#07111f] to-transparent" />
                  <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#143a6a] to-transparent" />
                  <div className="flex h-full w-max gap-3 pr-4 will-change-transform" style={{ animation: `product-marquee ${marqueeDuration}s linear infinite` }}>
                    {repeatedProducts.map((product, index) => (
                      <ProductTile
                        key={`${product._id}-${index}`}
                        product={product}
                        onHover={(productId) => setHoveredProductId(productId)}
                        onSelect={(productId) => {
                          setHoveredProductId(productId);
                          handleSelect(productId);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-full min-h-[220px] items-center justify-center rounded-[22px] border border-white/10 bg-white/5 px-5 py-6 text-sm text-slate-200">
                No products are listed yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
