import React from 'react';
import { Building2, Globe, Mail, MessageSquare, TrendingUp, Users } from 'lucide-react';
import DealSupportCardShell from '../DealSupportCardShell';
import DealSupportIntakeForm from '../DealSupportIntakeForm';
import { getUser } from '../../../lib/api';

export default function ExpandYourBusinessCard({ action, compact = false, onOpenForm }) {
  if (!compact) {
    return (
      <DealSupportIntakeForm
        icon={Users}
        sectionKey="business-growth"
        title="Expand Your Business"
        description="Access new markets and partners with a stronger trade presence."
        badge="Growth Plan"
        ctaLabel="Submit Request"
        successTitle="Business growth request sent"
        successMessage="Your expansion request has been sent to the startup team."
        validationMessage="Please complete the business growth form."
        fields={[
          { name: 'companyName', label: 'Company name', icon: Building2, placeholder: 'Your company name' },
          { name: 'currentMarkets', label: 'Current markets', icon: Globe, placeholder: 'Where you already operate' },
          { name: 'targetMarkets', label: 'Target markets', icon: TrendingUp, placeholder: 'Where you want to grow next' },
          { name: 'contactEmail', label: 'Contact email', icon: Mail, type: 'email', placeholder: 'name@company.com' },
          {
            name: 'details',
            label: 'Growth goals',
            icon: MessageSquare,
            as: 'textarea',
            fullWidth: true,
            placeholder: 'Tell us what growth support you need',
          },
        ]}
        initialValues={{ contactEmail: getUser()?.email || '' }}
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
