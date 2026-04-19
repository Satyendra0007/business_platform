import React from 'react';
import { FileText } from 'lucide-react';
import DealSupportCardShell from '../DealSupportCardShell';

export default function LegalDocumentReviewCard({ action }) {
  return (
    <DealSupportCardShell
      icon={FileText}
      title="Legal Document Review"
      description="Ensure contracts, LOI, and SPA drafts are compliant before execution."
      cta="Request Review"
      action={action}
    />
  );
}
