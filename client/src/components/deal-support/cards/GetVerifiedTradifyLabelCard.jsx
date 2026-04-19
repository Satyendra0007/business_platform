import React from 'react';
import { BadgeCheck } from 'lucide-react';
import DealSupportCardShell from '../DealSupportCardShell';

export default function GetVerifiedTradifyLabelCard({ action }) {
  return (
    <DealSupportCardShell
      icon={BadgeCheck}
      title="Get Verified (Tradify Label)"
      description="Verified label support for premium compliance visibility in live deals."
      cta="Start Verification"
      pricing="From €250"
      marker="ENHANCED"
      action={action}
    />
  );
}
