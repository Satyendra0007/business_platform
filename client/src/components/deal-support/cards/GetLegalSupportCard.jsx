import React from 'react';
import { Sparkles } from 'lucide-react';
import DealSupportCardShell from '../DealSupportCardShell';

export default function GetLegalSupportCard({ action }) {
  return (
    <DealSupportCardShell
      icon={Sparkles}
      title="Get Legal Support"
      description="Connect with our legal desk for expert assistance and document handling."
      cta="Contact Legal Desk"
      action={action}
    />
  );
}
