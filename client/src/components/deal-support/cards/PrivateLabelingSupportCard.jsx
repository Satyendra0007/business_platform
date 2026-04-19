import React from 'react';
import { Package } from 'lucide-react';
import DealSupportCardShell from '../DealSupportCardShell';

export default function PrivateLabelingSupportCard({ action }) {
  return (
    <DealSupportCardShell
      icon={Package}
      title="Private Labeling Support"
      description="Develop your own branded product line with guided execution support."
      cta="Contact Us"
      action={action}
    />
  );
}
