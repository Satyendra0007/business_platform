import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicLayout } from '../components/ui';

function NotFound() {
  const navigate = useNavigate();
  return (
    <PublicLayout>
      <section className="mx-auto mt-16 max-w-2xl rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <h1 className="font-display text-4xl font-semibold text-slate-950">Page not found</h1>
        <button onClick={() => navigate('/')} className="mt-6 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
          Back to Home
        </button>
      </section>
    </PublicLayout>
  );
}

export default NotFound;
