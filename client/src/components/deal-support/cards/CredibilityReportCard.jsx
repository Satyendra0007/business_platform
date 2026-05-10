import React from 'react';
import { BarChart3, Building2, Phone, ShieldCheck, MessageSquare } from 'lucide-react';
import DealSupportCardShell from '../DealSupportCardShell';
import DealSupportIntakeForm from '../DealSupportIntakeForm';
import { getUser } from '../../../lib/api';

export default function CredibilityReportCard({ action, compact = false, onOpenForm }) {
  if (!compact) {
    const user = getUser();
    return (
      <DealSupportIntakeForm
        icon={BarChart3}
        sectionKey="credibility-report"
        title="Credibility Report (COFAS)"
        description="Request a detailed financial and risk analysis on a target company."
        badge="COFAS"
        ctaLabel="Request Report"
        successTitle="Credibility report request sent"
        successMessage="Your credibility report request has been submitted. We will contact you shortly."
        validationMessage="Please complete the credibility report form."
        fields={[
          { name: 'companyName', label: 'Your company', icon: Building2, placeholder: 'Your company name' },
          { name: 'name', label: 'Contact name', icon: ShieldCheck, placeholder: 'Your full name' },
          { name: 'phoneNumber', label: 'Phone number', icon: Phone, type: 'tel', placeholder: '+49 123 456 7890' },
          { name: 'targetCompanyName', label: 'Target company', icon: BarChart3, placeholder: 'Company to be reviewed' },
          {
            name: 'reason',
            label: 'Reason',
            icon: MessageSquare,
            as: 'textarea',
            fullWidth: true,
            rows: 3,
            placeholder: 'Why do you need this report?',
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
      icon={BarChart3}
      title="Credibility Report (COFAS)"
      description="Request a detailed financial and risk analysis on a target company."
      cta="Request Report"
      marker="COFAS"
      compact={compact}
      action={action}
      onOpenForm={onOpenForm}
    />
  );
}
