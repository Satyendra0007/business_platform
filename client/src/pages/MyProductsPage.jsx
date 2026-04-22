/**
 * MyProductsPage.jsx — Supplier's product management dashboard.
 *
 * Fetches GET /api/products?companyId=<user.companyId> directly so
 * only the supplier's own products are listed. Falls back to client-
 * side filter if companyId query is unavailable.
 *
 * Access: supplier only (route guarded in App.jsx, and button only
 * appears in nav for supplier role).
 */
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, Plus, Pencil, Trash2, Loader2,
  AlertCircle, CheckCircle2, Eye
} from 'lucide-react';
import { AppShell } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { getProducts } from '../lib/productService';
import { deleteProduct } from '../lib/productManagementService';

const fmtPrice = (p, u) => {
  if (p == null) return '—';
  const f = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(p);
  return u ? `${f} / ${u}` : f;
};

function StatusBadge({ active }) {
  return active
    ? <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">Active</span>
    : <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Inactive</span>;
}

export default function MyProductsPage() {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [deleting, setDeleting] = useState(null);
  const [toast,    setToast]    = useState('');

  const load = useCallback(async () => {
    if (!user?.companyId) return;
    setLoading(true); setError('');
    try {
      // Server supports ?companyId filter — only our products returned
      const { products: list } = await getProducts({ companyId: user.companyId, limit: 50 });
      setProducts(list);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.companyId]);

  useEffect(() => { load(); }, [load]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const handleDelete = async (product) => {
    if (!window.confirm(`Archive "${product.title}"? It will be hidden from buyers.`)) return;
    setDeleting(product._id);
    try {
      await deleteProduct(product._id);
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
      showToast(`"${product.title}" archived successfully.`);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <AppShell
      title="My Products"
      subtitle="Manage your product catalogue. Create, edit, or archive listings visible to buyers."
    >
      <div className="space-y-5">

        {/* Toast */}
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

        {/* Header toolbar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">{products.length} listing{products.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => navigate('/supplier/products/create')}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#0c1f38] px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-[#153a66]"
          >
            <Plus className="h-4 w-4" /> Add New Product
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
          </div>
        ) : !user?.companyId ? (
          <div className="flex flex-col items-center gap-4 rounded-[28px] border border-amber-100 bg-amber-50 py-16 text-center">
            <AlertCircle className="h-10 w-10 text-amber-400" />
            <p className="font-bold text-slate-700">You need a verified company to list products.</p>
            <button onClick={() => navigate('/company/setup')} className="rounded-2xl bg-[#0A2540] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#143a6a] transition">
              Set Up Company
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center gap-5 rounded-[28px] border border-dashed border-slate-200 py-24 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-slate-50">
              <Package className="h-10 w-10 text-slate-200" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-700">No products yet</p>
              <p className="mt-1 max-w-xs text-sm text-slate-400">Create your first listing to start receiving quote requests from buyers.</p>
            </div>
            <button
              onClick={() => navigate('/supplier/products/create')}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#0c1f38] px-6 py-3 text-sm font-bold text-white hover:bg-[#153a66] transition"
            >
              <Plus className="h-4 w-4" /> Create First Product
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[28px] border border-[#d8e2ef] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
            {/* Table header */}
            <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b border-slate-100 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 sm:grid">
              <span>Product</span><span>Category</span><span>Price</span><span>Status</span><span>Actions</span>
            </div>
            {/* Rows */}
            {products.map((product) => (
              <div
                key={product._id}
                className="grid grid-cols-1 gap-4 border-b border-slate-100 px-5 py-4 last:border-0 sm:grid-cols-[2fr_1fr_1fr_1fr_auto] sm:items-center"
              >
                {/* Name + image */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-[12px] bg-slate-100">
                    {product.images?.[0]
                      ? <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                      : <Package className="m-auto mt-2.5 h-5 w-5 text-slate-300" />
                    }
                  </div>
                  <p className="line-clamp-2 text-sm font-semibold text-slate-900">{product.title}</p>
                </div>
                <p className="text-xs text-slate-500">{product.category}</p>
                <p className="text-sm font-semibold text-slate-700">{fmtPrice(product.price, product.unit)}</p>
                <StatusBadge active={product.isActive} />
                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/product/${product._id}`)}
                    title="View listing"
                    className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => navigate(`/supplier/products/edit/${product._id}`)}
                    title="Edit"
                    className="rounded-xl border border-[#dce9f8] bg-[#f0f7ff] p-2 text-[#245c9d] transition hover:bg-[#e0efff]"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    disabled={deleting === product._id}
                    title="Archive"
                    className="rounded-xl border border-rose-100 bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
                  >
                    {deleting === product._id
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <Trash2 className="h-4 w-4" />
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
