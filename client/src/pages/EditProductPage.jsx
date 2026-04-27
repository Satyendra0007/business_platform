/**
 * EditProductPage.jsx — Supplier edits an existing product.
 * GET /api/products/:id → pre-fill → PUT /api/products/:id
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AppShell } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { getProductById } from '../lib/productService';
import { updateProduct } from '../lib/productManagementService';
import ProductForm from '../components/products/ProductForm';

export default function EditProductPage() {
  const { productId } = useParams();
  const navigate      = useNavigate();
  const { user }      = useAuth();

  const [product,  setProduct]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const [done,     setDone]     = useState(false);

  // Load product and verify ownership
  useEffect(() => {
    setLoading(true);
    getProductById(productId)
      .then((data) => {
        // Client-side ownership guard — backend enforces this too
        if (data.companyId && user?.companyId &&
            data.companyId.toString() !== user.companyId.toString()) {
          setError('You do not own this product.');
        } else {
          setProduct(data);
        }
      })
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, [productId, user?.companyId]);

  const handleSubmit = async (data) => {
    setSaving(true); setError('');
    try {
      await updateProduct(productId, data);
      setDone(true);
      const backPath = user?.roles?.includes('admin') ? '/admin' : '/supplier/products';
      setTimeout(() => navigate(backPath), 2200);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppShell title="Edit Product">
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
        </div>
      </AppShell>
    );
  }

  if (error && !product) {
    return (
      <AppShell title="Edit Product">
        <div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          <AlertCircle className="h-5 w-5 shrink-0" /> {error}
        </div>
      </AppShell>
    );
  }

  if (done) {
    return (
      <AppShell title="Product Updated">
        <div className="flex flex-col items-center gap-5 rounded-[28px] border border-emerald-200 bg-emerald-50 py-24 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">Product updated!</p>
            <p className="mt-2 text-sm text-slate-500">Redirecting to your catalogue…</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={`Edit: ${product?.title || 'Product'}`}
      subtitle="Update the details below. Only changed fields are sent to the server."
    >
      <div className="mx-auto max-w-2xl">
        <ProductForm
          initial={product}
          onSubmit={handleSubmit}
          isLoading={saving}
          submitLabel="Save Changes"
          error={error}
        />
      </div>
    </AppShell>
  );
}
