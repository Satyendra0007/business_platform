import React from 'react';
import { Sparkles } from 'lucide-react';
import DealSupportCardShell from '../DealSupportCardShell';

export default function GetLegalSupportCard({ action, compact = false, onOpenForm }) {
  return (
    <DealSupportCardShell
      icon={Sparkles}
      title="Get Legal Support"
      description="Connect with our legal desk for expert assistance and document handling."
      cta="Contact Legal Desk"
      compact={compact}
      action={action}
      onOpenForm={onOpenForm}
    />
  );
}
