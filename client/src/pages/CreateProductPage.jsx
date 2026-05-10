/**
 * CreateProductPage.jsx — Supplier creates a new product listing.
 * POST /api/products (companyId set by server from JWT).
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, AlertCircle, Building2, Loader2 } from 'lucide-react';
import { AppShell } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { getCompanyById } from '../lib/companyService';
import { createProduct } from '../lib/productManagementService';
import ProductForm from '../components/products/ProductForm';

export default function CreateProductPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [done,    setDone]    = useState(false);
  const [company, setCompany] = useState(null);
  const [companyLoading, setCompanyLoading] = useState(Boolean(user?.companyId));

  useEffect(() => {
    let cancelled = false;

    if (!user?.companyId) {
      setCompany(null);
      setCompanyLoading(false);
      return undefined;
    }

    setCompanyLoading(true);
    getCompanyById(user.companyId)
      .then((result) => {
        if (!cancelled) setCompany(result);
      })
      .catch(() => {
        if (!cancelled) setCompany(null);
      })
      .finally(() => {
        if (!cancelled) setCompanyLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.companyId]);

  const handleSubmit = async (data) => {
    setLoading(true); setError('');
    try {
      await createProduct(data);
      setDone(true);
      setTimeout(() => navigate('/supplier/products'), 2200);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
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

  if (companyLoading) {
    return (
      <AppShell title="Create Product" subtitle="Checking your company verification status…">
        <div className="flex h-64 items-center justify-center rounded-[32px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
        </div>
      </AppShell>
    );
  }

  if (!companyLoading && (!user?.companyId || company?.verificationStatus !== 'verified')) {
    const status = company?.verificationStatus || 'no-company';
    return (
      <AppShell
        title="Create Product"
        subtitle="Your company must be verified before you can publish products to the marketplace."
      >
        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">
              <AlertCircle className="h-3.5 w-3.5" />
              Product publishing locked
            </div>
            <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900">
              {status === 'no-company' ? 'Set up your company first.' : 'Verification is still in progress.'}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              {status === 'no-company'
                ? 'Suppliers need a company profile before they can publish products. Start the verification flow and we will keep the handoff clean.'
                : 'Your company profile is on file, but it still needs to reach the verified state before the product form can be used.'}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/company/setup?onboarding=1&next=/supplier/products/create')}
                className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0A2540,#245c9d)] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5"
              >
                <Building2 className="h-4 w-4" />
                {status === 'no-company' ? 'Set Up Company' : 'Continue Verification'}
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Back to Dashboard
              </button>
            </div>
          </section>

          <aside className="space-y-4 rounded-[32px] border border-sky-100 bg-[linear-gradient(180deg,#f8fbff,#eef5ff)] p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-sky-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Publishing checklist
            </div>
            <div className="space-y-3">
              {[
                'Company profile is created and linked to your account.',
                'Verification documents are submitted or approved.',
                'You can then publish products from this page.',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-[22px] border border-white/80 bg-white px-4 py-3 shadow-sm">
                  <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <p className="text-sm leading-6 text-slate-600">{item}</p>
                </div>
              ))}
            </div>
          </aside>
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
