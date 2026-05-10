import React from 'react';
import { Building2, Mail, MessageSquare, Package, Palette, Sparkles } from 'lucide-react';
import DealSupportCardShell from '../DealSupportCardShell';
import DealSupportIntakeForm from '../DealSupportIntakeForm';
import { getUser } from '../../../lib/api';

export default function PrivateLabelingSupportCard({ action, compact = false, onOpenForm }) {
  if (!compact) {
    return (
      <DealSupportIntakeForm
        icon={Package}
        sectionKey="private-labeling"
        title="Private Labeling Support"
        description="Develop your own branded product line with guided execution support."
        badge="Brand Build"
        ctaLabel="Submit Request"
        successTitle="Private labeling request sent"
        successMessage="Your private labeling request has been sent to the startup team."
        validationMessage="Please complete the private labeling form."
        fields={[
          { name: 'companyName', label: 'Company name', icon: Building2, placeholder: 'Your company name' },
          { name: 'brandName', label: 'Brand name', icon: Palette, placeholder: 'Planned private label brand' },
          { name: 'productCategory', label: 'Product category', icon: Package, placeholder: 'Product line or category' },
          { name: 'contactEmail', label: 'Contact email', icon: Mail, type: 'email', placeholder: 'name@company.com' },
          {
            name: 'notes',
            label: 'Request details',
            icon: MessageSquare,
            as: 'textarea',
            fullWidth: true,
            placeholder: 'Share what you want to build under your own label',
          },
        ]}
        initialValues={{ contactEmail: getUser()?.email || '' }}
      />
    );
  }

  return (
    <DealSupportCardShell
      icon={Package}
      title="Private Labeling Support"
      description="Develop your own branded product line with guided execution support."
      cta="Contact Us"
      compact={compact}
      action={action}
      onOpenForm={onOpenForm}
    />
  );
}
