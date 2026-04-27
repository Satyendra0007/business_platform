/**
 * MyProductsPage.jsx — Supplier's product management dashboard.
 *
 * Uses the management list endpoint so suppliers can see all of their
 * listings, including inactive ones, and manage them from hover actions.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Loader2,
  AlertCircle, CheckCircle2
} from 'lucide-react';
import { AppShell } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { getManagedProducts, deleteProduct } from '../lib/productManagementService';
import ProductGrid from '../components/products/ProductGrid';
import Pagination from '../components/common/Pagination';

const LIMIT = 12;

export default function MyProductsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 3500);
  };

  const load = useCallback(async () => {
    if (!user?.companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await getManagedProducts({ page, limit: LIMIT });
      setProducts(result.products);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, user?.companyId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (product) => {
    if (!window.confirm(`Archive "${product.title}"? It will be hidden from buyers.`)) return;
    setDeleting(product._id);
    try {
      await deleteProduct(product._id);
      await load();
      showToast(`"${product.title}" archived successfully.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (product) => {
    navigate(`/supplier/products/edit/${product._id}`);
  };

  return (
    <AppShell
      title="My Products"
      subtitle="Manage your product catalogue. Create, edit, or archive listings visible to buyers."
    >
      <div className="space-y-5">
        {toast && (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" /> {toast}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">
              {total} listing{total !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => navigate('/supplier/products/create')}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#0c1f38] px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-[#153a66]"
          >
            <Plus className="h-4 w-4" /> Add New Product
          </button>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
          </div>
        ) : !user?.companyId ? (
          <div className="flex flex-col items-center gap-4 rounded-[28px] border border-amber-100 bg-amber-50 py-16 text-center">
            <AlertCircle className="h-10 w-10 text-amber-400" />
            <p className="font-bold text-slate-700">You need a verified company to list products.</p>
            <button
              onClick={() => navigate('/company/setup')}
              className="rounded-2xl bg-[#0A2540] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#143a6a] transition"
            >
              Set Up Company
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <ProductGrid
              products={products}
              loading={false}
              error={''}
              onRetry={load}
              onClear={() => {}}
              management
              onEditProduct={handleEdit}
              onDeleteProduct={handleDelete}
              deletingProductId={deleting}
            />
            {totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                limit={LIMIT}
                onPage={setPage}
              />
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
