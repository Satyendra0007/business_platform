import React, { useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { createDealFromProduct, getAllProducts } from '../lib/tradafyData';
import { getProductVisual } from '../lib/productVisuals';
import { AppShell, PublicLayout } from './ui';

function ProductsPage({ currentUser, navigate, user, pathname, onLogout }) {
  const products = getAllProducts();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [origin, setOrigin] = useState('all');

  const categories = useMemo(() => ['all', ...new Set(products.map((product) => product.category))], [products]);
  const origins = useMemo(() => ['all', ...new Set(products.map((product) => product.origin))], [products]);

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesSearch =
          product.name.toLowerCase().includes(search.toLowerCase()) ||
          product.supplierCompany.toLowerCase().includes(search.toLowerCase()) ||
          product.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === 'all' || product.category === category;
        const matchesOrigin = origin === 'all' || product.origin === origin;
        return matchesSearch && matchesCategory && matchesOrigin;
      }),
    [products, search, category, origin]
  );

  const openDealFromProduct = (productId) => {
    const activeUser = currentUser || user;
    if (!activeUser) {
      navigate('/login');
      return;
    }
    const deal = createDealFromProduct(productId, activeUser);
    if (deal) navigate(`/deal/${deal.id}`);
  };

  const content = (
    <>
      <section className="relative overflow-hidden rounded-[30px] border border-slate-300/40 bg-[#0c1f38] p-6 text-white shadow-xl lg:p-8">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&q=80&w=2400" alt="Shipping Containers" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1b32] via-[#102a4e]/95 to-[#1c4f8d]/80 backdrop-blur-[2px]" />
        </div>
        
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
          <div className="space-y-4 xl:max-w-xl">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#245c9d]/40 bg-[#245c9d]/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-sky-200">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-400"></span>
                </span>
                Live Marketplace
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-white lg:text-3xl">Products With Deal-Ready Context</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Search trusted export listings, filter by sector and origin, and open a live deal workspace instantly.
              </p>
            </div>
            
            <div className="flex items-center gap-8">
              {[
                { value: `${products.length}+`, label: 'Verified Listings' },
                { value: `${categories.length - 1}`, label: 'Categories' },
                { value: `${origins.length - 1}`, label: 'Origins' },
              ].map((item) => (
                <div key={item.label} className="flex flex-col">
                  <div className="text-xl font-bold text-white">{item.value}</div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full xl:w-[480px] shrink-0">
            <div className="rounded-[20px] border border-white/5 bg-white/5 p-3 backdrop-blur-sm shadow-inner">
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2.5 rounded-[14px] bg-[#071120]/50 px-4 py-3 ring-1 ring-white/10 transition-all focus-within:ring-sky-500/50">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search products, suppliers, or keywords..."
                    className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none"
                  />
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2.5 rounded-[14px] bg-[#071120]/50 px-4 py-3 ring-1 ring-white/10 transition-all focus-within:ring-sky-500/50">
                    <SlidersHorizontal className="h-4 w-4 text-slate-400 shrink-0" />
                    <select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full bg-transparent text-sm text-white outline-none cursor-pointer">
                      {categories.map((item) => (
                        <option key={item} value={item} className="text-slate-900">
                          {item === 'all' ? 'All Categories' : item}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex items-center gap-2.5 rounded-[14px] bg-[#071120]/50 px-4 py-3 ring-1 ring-white/10 transition-all focus-within:ring-sky-500/50">
                    <SlidersHorizontal className="h-4 w-4 text-slate-400 shrink-0" />
                    <select value={origin} onChange={(event) => setOrigin(event.target.value)} className="w-full bg-transparent text-sm text-white outline-none cursor-pointer">
                      {origins.map((item) => (
                        <option key={item} value={item} className="text-slate-900">
                          {item === 'all' ? 'All Origins' : item}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 px-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Quick:</span>
                {categories.slice(1, 4).map((item) => (
                  <button
                    key={item}
                    onClick={() => setCategory(item)}
                    className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold tracking-wide transition ${
                      category === item ? 'bg-sky-500 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/15'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
        {filteredProducts.map((product) => {
          const visual = getProductVisual(product.id);
          return (
            <article key={product.id} className="group overflow-hidden rounded-[26px] border border-[#d8e2ef] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)] transition hover:-translate-y-1.5 hover:shadow-[0_24px_56px_rgba(15,23,42,0.12)]">
              <div className={`relative h-36 overflow-hidden bg-gradient-to-br ${visual.accent} p-3`}>
                <img src={visual.image} alt={visual.alt} className="h-full w-full rounded-[18px] object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute left-5 top-5 rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-700 shadow-sm">{product.badge}</div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="w-fit rounded-full bg-[#edf5ff] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#245c9d]">{product.category}</div>
                  <div className="text-xs font-semibold text-[#143a6a]">{product.price}</div>
                </div>
                <h2 className="mt-3 text-lg font-semibold leading-6 tracking-[-0.02em] text-slate-950">{product.name}</h2>
                <p className="mt-1 text-xs text-slate-500">{product.supplierCompany}</p>
                <p className="mt-2 text-[11px] leading-5 text-slate-500">{product.origin} • Min {product.minOrder}</p>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => openDealFromProduct(product.id)} className="rounded-xl bg-[linear-gradient(135deg,#173b67,#245c9d)] px-3 py-2 text-xs font-semibold text-white">
                    Open
                  </button>
                  <button onClick={() => navigate(currentUser ? `/request-quote/${product.id}` : '/login')} className="rounded-xl border border-[#d8e2ef] px-3 py-2 text-xs font-semibold text-slate-700">
                    Quote
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );

  if (!currentUser) {
    return (
      <PublicLayout currentUser={null} navigate={navigate}>
        <section className="mt-10 space-y-6">
          <div className="mb-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Products</p>
            <h1 className="font-display mt-2 text-4xl font-semibold tracking-[-0.03em] text-slate-950">Public catalog before login</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Browse polished product previews, compare verified suppliers, and move into quote requests only when you are ready.</p>
          </div>
          {content}
        </section>
      </PublicLayout>
    );
  }

  return (
    <AppShell user={user} pathname={pathname} navigate={navigate} onLogout={onLogout} title="Products" subtitle="Browse verified listings with search and filters, then start an RFQ directly from the product that fits.">
      <div className="space-y-6">{content}</div>
    </AppShell>
  );
}

export default ProductsPage;
