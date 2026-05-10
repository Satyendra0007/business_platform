import React from 'react';
import { Building2, Package, Phone, MessageSquare, Settings2 } from 'lucide-react';
import DealSupportCardShell from '../DealSupportCardShell';
import DealSupportIntakeForm from '../DealSupportIntakeForm';
import { getUser } from '../../../lib/api';

export default function PrivateLabelingSupportCard({ action, compact = false, onOpenForm }) {
  if (!compact) {
    const user = getUser();
    return (
      <DealSupportIntakeForm
        icon={Package}
        sectionKey="private-labeling"
        title="Private Labeling Support"
        description="Develop your own branded product line with guided execution support."
        badge="Brand Build"
        ctaLabel="Submit Request"
        successTitle="Private labeling request sent"
        successMessage="Your private labeling request has been submitted. We will contact you shortly."
        validationMessage="Please complete the private labeling form."
        fields={[
          { name: 'companyName', label: 'Company name', icon: Building2, placeholder: 'Your company name' },
          { name: 'name', label: 'Contact name', icon: Package, placeholder: 'Your full name' },
          { name: 'phoneNumber', label: 'Phone number', icon: Phone, type: 'tel', placeholder: '+49 123 456 7890' },
          {
            name: 'inquiryType',
            label: 'Inquiry type',
            icon: Settings2,
            as: 'select',
            options: [
              { label: 'Select type', value: '' },
              { label: 'Help', value: 'help' },
              { label: 'Request', value: 'request' },
              { label: 'Suggestion', value: 'suggestion' },
            ],
          },
          {
            name: 'reason',
            label: 'Reason',
            icon: MessageSquare,
            as: 'textarea',
            fullWidth: true,
            rows: 3,
            placeholder: 'Describe what you need for private labeling',
          },
        ]}
        initialValues={{
          phoneNumber: user?.phone || '',
        }}
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
