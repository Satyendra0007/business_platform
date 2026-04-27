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
import { Plus } from 'lucide-react';
import { AppShell, PublicLayout } from '../components/ui';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getProducts, getCategories } from '../lib/productService';
import { deleteProduct, getManagedProducts } from '../lib/productManagementService';
import { hasRole } from '../lib/userRole';
import ProductHero from '../components/products/ProductHero';
import ProductGrid from '../components/products/ProductGrid';
import Pagination from '../components/common/Pagination';

const LIMIT = 10;

export default function ProductsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

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
  const [deletingProductId, setDeletingProductId] = useState(null);

  const timer = useRef(null);
  const isSupplier = hasRole(user, 'supplier');

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
      const result = isSupplier
        ? await getManagedProducts(params)
        : await getProducts(params);
      setProducts(result.products);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [page, debSearch, category, isSupplier]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleCategory = (cat) => { setCategory(cat); setPage(1); };
  const handleClear = () => { setSearch(''); setCategory(''); setPage(1); };
  const handleEditProduct = (product) => {
    navigate(`/supplier/products/edit/${product._id}`);
  };
  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Archive "${product.title}"? It will be hidden from buyers.`)) return;
    setDeletingProductId(product._id);
    try {
      await deleteProduct(product._id);
      await fetchProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingProductId(null);
    }
  };

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
        management={isSupplier}
        onEditProduct={isSupplier ? handleEditProduct : undefined}
        onDeleteProduct={isSupplier ? handleDeleteProduct : undefined}
        deletingProductId={deletingProductId}
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
      <div className="space-y-5">
        {isSupplier && (
          <div className="flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-[0_16px_44px_rgba(15,23,42,0.05)] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Product tools</p>
              <h2 className="mt-1 text-[1.1rem] font-bold text-[#143a6a]">Create a new product listing</h2>
            </div>
            <button
              onClick={() => navigate('/supplier/products/create')}
              className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0f2846,#245c9d)] px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </button>
          </div>
        )}
        {content}
      </div>
    </AppShell>
  );
}
