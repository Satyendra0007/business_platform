import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AppShell } from '../components/ui';
import CredibilityReportCard from '../components/deal-support/cards/CredibilityReportCard';

export default function DealSupportCredibilityPage() {
  const navigate = useNavigate();
  return (
    <AppShell title="Deal Support" subtitle="Request the COFAS credibility report on a dedicated page.">
      <div className="space-y-5">
        <button type="button" onClick={() => navigate('/deal-support')} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
          <ArrowLeft className="h-4 w-4" />
          Back to Deal Support
        </button>
        <CredibilityReportCard />
      </div>
    </AppShell>
  );
}
