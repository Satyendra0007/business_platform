import React from 'react';
import { Headphones } from 'lucide-react';
import DealSupportCardShell from '../DealSupportCardShell';

export default function CustomServiceContactCard({ action, compact = false, onOpenForm }) {
  return (
    <DealSupportCardShell
      icon={Headphones}
      title="Custom Service Contact"
      description="Assign a dedicated support manager for your deal and shipment flow."
      cta="Assign Manager"
      compact={compact}
      action={action}
      onOpenForm={onOpenForm}
    />
  );
}
