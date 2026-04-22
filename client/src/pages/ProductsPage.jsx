/**
 * ProductsPage.jsx — Products listing page (public + authenticated).
 *
 * State owned here:
 *  - products, total, totalPages, page (pagination)
 *  - search, debSearch (400ms debounce), category (filters)
 *  - categories (loaded once from /api/products/categories)
 *  - loading, error
 *
 * Sub-components:
 *  ProductHero  → dark banner, search box, live category pills
 *  ProductGrid  → card grid, skeletons, empty/error states
 *  ProductCard  → individual card
 *  Pagination   → always-visible count + page buttons when >1 page
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppShell, PublicLayout } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { getProducts, getCategories } from '../lib/productService';
import ProductHero from '../components/products/ProductHero';
import ProductGrid from '../components/products/ProductGrid';
import Pagination from '../components/common/Pagination';

const LIMIT = 10;

export default function ProductsPage() {
  const { user } = useAuth();

  // ── Products state ─────────────────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  // ── Filter state ───────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [debSearch, setDebSearch] = useState('');  // debounced value actually sent to API

  // ── UI state ───────────────────────────────────────────────────────────────
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const timer = useRef(null);

  // ── Load categories once on mount ──────────────────────────────────────────
  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  // ── Debounce search input ──────────────────────────────────────────────────
  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setDebSearch(search);
      setPage(1);          // reset to page 1 on every new search
    }, 400);
    return () => clearTimeout(timer.current);
  }, [search]);

  // ── Fetch products ─────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: LIMIT };
      if (debSearch) params.search = debSearch;
      if (category) params.category = category;
      const result = await getProducts(params);
      setProducts(result.products);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [page, debSearch, category]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleCategory = (cat) => { setCategory(cat); setPage(1); };
  const handleClear = () => { setSearch(''); setCategory(''); setPage(1); };

  // ── Shared content (used by both public and auth layout) ───────────────────
  const content = (
    <div className="space-y-6">
      <ProductHero
        search={search}
        onSearch={setSearch}
        category={category}
        onCategory={handleCategory}
        total={total}
        loading={loading}
        categories={categories}
      />
      <ProductGrid
        products={products}
        loading={loading}
        error={error}
        onRetry={fetchProducts}
        search={debSearch}
        category={category}
        onClear={handleClear}
      />
      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={LIMIT}
        onPage={setPage}
      />
    </div>
  );

  // ── Public (unauthenticated) layout ───────────────────────────────────────
  if (!user) {
    return (
      <PublicLayout>
        <section className="mt-10 space-y-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Products</p>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-slate-950">
              Global trade catalog
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Browse verified export listings and request quotes — sign in to start a deal.
            </p>
          </div>
          {content}
        </section>
      </PublicLayout>
    );
  }

  // ── Authenticated layout ───────────────────────────────────────────────────
  return (
    <AppShell
      title="Products"
      subtitle="Browse verified listings with search and filters, then start an RFQ directly from the product that fits."
    >
      {content}
    </AppShell>
  );
}
