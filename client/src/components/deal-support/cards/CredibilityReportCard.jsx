import React from 'react';
import { BarChart3, Building2, Mail, MessageSquare, ShieldCheck } from 'lucide-react';
import DealSupportCardShell from '../DealSupportCardShell';
import DealSupportIntakeForm from '../DealSupportIntakeForm';
import { getUser } from '../../../lib/api';

export default function CredibilityReportCard({ action, compact = false, onOpenForm }) {
  if (!compact) {
    return (
      <DealSupportIntakeForm
        icon={BarChart3}
        sectionKey="credibility-report"
        title="Credibility Report (COFAS)"
        description="Detailed financial and risk analysis by a leading provider."
        badge="COFAS"
        ctaLabel="Request Report"
        successTitle="Credibility report request sent"
        successMessage="Your COFAS credibility report request has been sent to the legal team."
        validationMessage="Please complete the credibility report form."
        fields={[
          { name: 'companyName', label: 'Company name', icon: Building2, placeholder: 'Your company name' },
          { name: 'contactEmail', label: 'Contact email', icon: Mail, type: 'email', placeholder: 'name@company.com' },
          { name: 'targetCompany', label: 'Target company', icon: ShieldCheck, placeholder: 'Company to be reviewed' },
          {
            name: 'reportScope',
            label: 'Report scope',
            icon: BarChart3,
            as: 'select',
            options: [
              { label: 'Select report scope', value: '' },
              'Financial check',
              'Trade history',
              'Risk overview',
              'Full report',
            ],
          },
          {
            name: 'notes',
            label: 'Request details',
            icon: MessageSquare,
            as: 'textarea',
            fullWidth: true,
            placeholder: 'Tell us what should be included in the report',
          },
        ]}
        initialValues={{ contactEmail: getUser()?.email || '' }}
      />
    );
  }

  return (
    <DealSupportCardShell
      icon={BarChart3}
      title="Credibility Report (COFAS)"
      description="Detailed financial and risk analysis by a leading provider."
      cta="Request Report"
      marker="COFAS"
      compact={compact}
      action={action}
      onOpenForm={onOpenForm}
    />
  );
}
