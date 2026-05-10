import React from 'react';
import { Building2, Mail, Sparkles, ShieldCheck, MessageSquare } from 'lucide-react';
import DealSupportCardShell from '../DealSupportCardShell';
import DealSupportIntakeForm from '../DealSupportIntakeForm';
import { getUser } from '../../../lib/api';

export default function GetLegalSupportCard({ action, compact = false, onOpenForm }) {
  if (!compact) {
    return (
      <DealSupportIntakeForm
        icon={Sparkles}
        sectionKey="legal-support"
        title="Get Legal Support"
        description="Connect with our legal desk for expert assistance and document handling."
        badge="Legal Desk"
        ctaLabel="Submit Request"
        successTitle="Legal support request sent"
        successMessage="Your legal support request has been sent to the legal team for review."
        validationMessage="Please complete the legal support form."
        fields={[
          { name: 'companyName', label: 'Company name', icon: Building2, placeholder: 'Your business name' },
          { name: 'contactName', label: 'Contact name', icon: Sparkles, placeholder: 'Primary contact person' },
          { name: 'contactEmail', label: 'Contact email', icon: Mail, type: 'email', placeholder: 'name@company.com' },
          {
            name: 'supportType',
            label: 'Support type',
            icon: ShieldCheck,
            as: 'select',
            options: [
              { label: 'Select support type', value: '' },
              'General legal guidance',
              'Contract clarification',
              'Compliance check',
              'Dispute support',
              'Other',
            ],
          },
          {
            name: 'details',
            label: 'Request details',
            icon: MessageSquare,
            as: 'textarea',
            fullWidth: true,
            placeholder: 'Describe what you need from the legal desk',
          },
        ]}
        initialValues={{ contactEmail: getUser()?.email || '' }}
      />
    );
  }

  return (
    <DealSupportCardShell
      icon={Sparkles}
      title="Get Legal Support"
      description="Connect with our legal desk for expert assistance and document handling."
      cta="Contact Legal Desk"
      compact={compact}
      action={action}
      onOpenForm={onOpenForm}
    />
  );
}
