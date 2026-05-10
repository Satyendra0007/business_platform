import React from 'react';
import { Building2, Headphones, Mail, MessageSquare, Settings2, Sparkles } from 'lucide-react';
import DealSupportCardShell from '../DealSupportCardShell';
import DealSupportIntakeForm from '../DealSupportIntakeForm';
import { getUser } from '../../../lib/api';

export default function CustomServiceContactCard({ action, compact = false, onOpenForm }) {
  if (!compact) {
    return (
      <DealSupportIntakeForm
        icon={Headphones}
        sectionKey="custom-service"
        title="Custom Service Contact"
        description="Assign a dedicated support manager for your deal and shipment flow."
        badge="Service Desk"
        ctaLabel="Submit Request"
        successTitle="Custom service request sent"
        successMessage="Your custom service request has been sent to the support team."
        validationMessage="Please complete the custom service form."
        fields={[
          { name: 'companyName', label: 'Company name', icon: Building2, placeholder: 'Your company name' },
          { name: 'contactName', label: 'Contact name', icon: Sparkles, placeholder: 'Primary contact person' },
          { name: 'contactEmail', label: 'Contact email', icon: Mail, type: 'email', placeholder: 'name@company.com' },
          {
            name: 'serviceNeed',
            label: 'Service need',
            icon: Settings2,
            as: 'select',
            options: [
              { label: 'Select service need', value: '' },
              'Dedicated manager',
              'Shipment coordination',
              'Trade follow-up',
              'General support',
            ],
          },
          {
            name: 'details',
            label: 'Request details',
            icon: MessageSquare,
            as: 'textarea',
            fullWidth: true,
            placeholder: 'Tell us how we can support this request',
          },
        ]}
        initialValues={{ contactEmail: getUser()?.email || '' }}
      />
    );
  }

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
