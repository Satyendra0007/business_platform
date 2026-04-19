import React from 'react';
import { ShieldCheck } from 'lucide-react';
import DealSupportCardShell from '../DealSupportCardShell';

export default function GetVerifiedCard({ action }) {
  return (
    <DealSupportCardShell
      icon={ShieldCheck}
      title="Get Verified"
      description="Increase trust with a verified status for your workspace and trade profile."
      cta="Start Verification"
      tag="SUPPORTED"
      action={action}
    />
  );
}
