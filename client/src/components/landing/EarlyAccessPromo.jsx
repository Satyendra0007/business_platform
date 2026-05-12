import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EarlyAccessPromo() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-4 border-b border-slate-200/60 bg-white px-4 py-3 text-slate-900 sm:px-5 lg:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0A2540] text-white">
          <Sparkles className="h-4.5 w-4.5" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#0A2540]">Launch your workspace with a clear starting point</p>
          <p className="text-xs text-slate-500">No slideshow, just a direct path to trading and deal management.</p>
        </div>
      </div>

      <button
        onClick={() => navigate('/login')}
        className="inline-flex items-center gap-2 rounded-2xl bg-[#E5A93D] px-4 py-2 text-sm font-black text-[#0A2540] transition hover:bg-[#FF8A00]"
      >
        Start Trading
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
