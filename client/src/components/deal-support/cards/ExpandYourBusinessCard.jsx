import React from 'react';
import { Building2, Users, Phone, MessageSquare, Settings2 } from 'lucide-react';
import DealSupportCardShell from '../DealSupportCardShell';
import DealSupportIntakeForm from '../DealSupportIntakeForm';
import { getUser } from '../../../lib/api';

export default function ExpandYourBusinessCard({ action, compact = false, onOpenForm }) {
  if (!compact) {
    const user = getUser();
    return (
      <DealSupportIntakeForm
        icon={Users}
        sectionKey="business-growth"
        title="Expand Your Business"
        description="Access new markets and partners with a stronger trade presence."
        badge="Growth Plan"
        ctaLabel="Submit Request"
        successTitle="Business expansion request sent"
        successMessage="Your expansion request has been submitted. We will contact you shortly."
        validationMessage="Please complete the business expansion form."
        fields={[
          { name: 'companyName', label: 'Company name', icon: Building2, placeholder: 'Your company name' },
          { name: 'name', label: 'Contact name', icon: Users, placeholder: 'Your full name' },
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
            placeholder: 'Tell us what growth support you need',
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
      icon={Users}
      title="Expand Your Business"
      description="Access new markets and partners with a stronger trade presence."
      cta="Get Started"
      marker="PRO"
      compact={compact}
      action={action}
      onOpenForm={onOpenForm}
    />
  );
}
