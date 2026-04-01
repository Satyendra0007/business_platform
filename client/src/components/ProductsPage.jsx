import React, { useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { getAllProducts } from '../lib/tradafyData';
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

  const content = (
    <>
      <section className="rounded-[28px] border border-[#d8e2ef] bg-white p-5 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
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
      </section>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredProducts.map((product) => {
          const visual = getProductVisual(product.id);
          return (
            <article key={product.id} className="overflow-hidden rounded-[28px] border border-[#d8e2ef] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
              <div className={`relative h-56 overflow-hidden bg-gradient-to-br ${visual.accent} p-4`}>
                <img src={visual.image} alt={visual.alt} className="h-full w-full rounded-[24px] object-cover" />
                <div className="absolute left-8 top-8 rounded-full bg-white/92 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">{product.badge}</div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="w-fit rounded-full bg-[#edf5ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#245c9d]">{product.category}</div>
                  <div className="text-sm font-semibold text-[#143a6a]">{product.price}</div>
                </div>
                <h2 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-slate-950">{product.name}</h2>
                <p className="mt-2 text-sm text-slate-500">{product.supplierCompany} • {product.origin}</p>
                <p className="mt-4 text-sm leading-6 text-slate-600">{product.description}</p>
                <div className="mt-5 flex gap-3">
                  <button onClick={() => navigate(`/product/${product.id}`)} className="rounded-2xl bg-[linear-gradient(135deg,#173b67,#245c9d)] px-4 py-2.5 text-sm font-semibold text-white">
                    View Details
                  </button>
                  <button onClick={() => navigate(currentUser ? `/request-quote/${product.id}` : '/login')} className="rounded-2xl border border-[#d8e2ef] px-4 py-2.5 text-sm font-semibold text-slate-700">
                    Request Quote
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
