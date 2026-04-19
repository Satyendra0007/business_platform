import React from 'react';
import { BarChart3 } from 'lucide-react';
import DealSupportCardShell from '../DealSupportCardShell';

export default function CredibilityReportCard({ action }) {
  return (
    <DealSupportCardShell
      icon={BarChart3}
      title="Credibility Report (COFAS)"
      description="Detailed financial and risk analysis by a leading provider."
      cta="Request Report"
      pricing="From €250"
      marker="COFAS"
      action={action}
    />
  );
}
