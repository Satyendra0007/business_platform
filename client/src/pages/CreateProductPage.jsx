/**
 * CreateProductPage.jsx — Supplier creates a new product listing.
 * POST /api/products (companyId set by server from JWT).
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { AppShell } from '../components/ui';
import { createProduct } from '../lib/productManagementService';
import ProductForm from '../components/products/ProductForm';

export default function CreateProductPage() {
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [done,    setDone]    = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true); setError('');
    try {
      await createProduct(data);
      setDone(true);
      setTimeout(() => navigate('/supplier/products'), 2200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <AppShell title="Product Created">
        <div className="flex flex-col items-center gap-5 rounded-[28px] border border-emerald-200 bg-emerald-50 py-24 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">Product listed!</p>
            <p className="mt-2 text-sm text-slate-500">Redirecting to your catalogue…</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Create Product"
      subtitle="Fill in the product details below. Required fields are marked with *."
    >
      <div className="mx-auto max-w-2xl">
        <ProductForm
          onSubmit={handleSubmit}
          isLoading={loading}
          submitLabel="Publish Product"
          error={error}
        />
      </div>
    </AppShell>
  );
}
