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
      <section className="overflow-hidden rounded-[32px] border border-[#d8e2ef] bg-[linear-gradient(135deg,#0e2746_0%,#163c6b_52%,#245c9d_100%)] p-6 text-white shadow-[0_28px_70px_rgba(15,23,42,0.12)]">
        <div className="grid gap-8 xl:grid-cols-[0.85fr_1.15fr] xl:items-end">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-sky-100">
              Live Marketplace
            </div>
            <h2 className="text-3xl font-black tracking-tight lg:text-4xl">Source verified products with deal-ready context</h2>
            <p className="max-w-xl text-sm leading-7 text-sky-100/85">
              Search trusted export listings, filter by sector and origin, and open a live deal workspace the moment a product fits.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: `${products.length}+`, label: 'Visible listings' },
                { value: `${categories.length - 1}`, label: 'Categories' },
                { value: `${origins.length - 1}`, label: 'Origins' },
              ].map((item) => (
                <div key={item.label} className="rounded-[22px] border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
                  <div className="text-2xl font-black text-white">{item.value}</div>
                  <div className="mt-1 text-[9px] font-black uppercase tracking-[0.18em] text-sky-100/70">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur-md">
            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <label className="flex items-center gap-3 rounded-[20px] border border-[#d8e2ef] bg-[#f8fbff] px-4 py-3">
            <Search className="h-4 w-4 text-[#245c9d]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products, suppliers, or descriptions"
              className="w-full bg-transparent text-sm text-slate-700 outline-none"
            />
          </label>

          <label className="flex items-center gap-3 rounded-[20px] border border-[#d8e2ef] bg-[#f8fbff] px-4 py-3">
            <SlidersHorizontal className="h-4 w-4 text-[#245c9d]" />
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full bg-transparent text-sm text-slate-700 outline-none">
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === 'all' ? 'All Categories' : item}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-3 rounded-[20px] border border-[#d8e2ef] bg-[#f8fbff] px-4 py-3">
            <SlidersHorizontal className="h-4 w-4 text-[#245c9d]" />
            <select value={origin} onChange={(event) => setOrigin(event.target.value)} className="w-full bg-transparent text-sm text-slate-700 outline-none">
              {origins.map((item) => (
                <option key={item} value={item}>
                  {item === 'all' ? 'All Origins' : item}
                </option>
              ))}
            </select>
          </label>
        </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.slice(1, 6).map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] transition ${
                    category === item ? 'bg-white text-[#143a6a]' : 'bg-white/10 text-white'
                  }`}
                >
                  {item}
                </button>
              ))}
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
