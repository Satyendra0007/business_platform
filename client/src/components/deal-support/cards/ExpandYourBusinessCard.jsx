import React from 'react';
import { Users } from 'lucide-react';
import DealSupportCardShell from '../DealSupportCardShell';

export default function ExpandYourBusinessCard({ action, compact = false, onOpenForm }) {
  return (
    <DealSupportCardShell
      icon={Users}
      title="Expand Your Business"
      description="Access new markets and partners with a stronger trade presence."
      cta="Get Started"
      pricing="From €250"
      marker="PRO"
      compact={compact}
      action={action}
      onOpenForm={onOpenForm}
    />
  );
}
