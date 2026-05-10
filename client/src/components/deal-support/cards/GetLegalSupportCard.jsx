import React from 'react';
import { Building2, Mail, Phone, Calendar, Clock, Sparkles, MessageSquare } from 'lucide-react';
import DealSupportCardShell from '../DealSupportCardShell';
import DealSupportIntakeForm from '../DealSupportIntakeForm';
import { getUser } from '../../../lib/api';

export default function GetLegalSupportCard({ action, compact = false, onOpenForm }) {
  if (!compact) {
    const user = getUser();
    return (
      <DealSupportIntakeForm
        icon={Sparkles}
        sectionKey="legal-support"
        title="Get Legal Support"
        description="Book an appointment with our legal desk for expert assistance."
        badge="Legal Desk"
        ctaLabel="Submit Request"
        successTitle="Legal support request sent"
        successMessage="Your legal support request has been submitted. We will contact you shortly."
        validationMessage="Please complete the legal support form."
        fields={[
          { name: 'companyName', label: 'Company name', icon: Building2, placeholder: 'Your business name' },
          { name: 'name', label: 'Contact name', icon: Sparkles, placeholder: 'Your full name' },
          { name: 'phoneNumber', label: 'Phone number', icon: Phone, type: 'tel', placeholder: '+49 123 456 7890' },
          { name: 'email', label: 'Email', icon: Mail, type: 'email', placeholder: 'name@company.com' },
          { name: 'preferredDate', label: 'Preferred date', icon: Calendar, type: 'date', placeholder: '' },
          { name: 'preferredTime', label: 'Preferred time', icon: Clock, type: 'time', placeholder: '' },
          {
            name: 'issuePreview',
            label: 'Short issue preview',
            icon: MessageSquare,
            as: 'textarea',
            fullWidth: true,
            rows: 3,
            placeholder: 'Briefly describe your legal issue or question',
          },
        ]}
        initialValues={{
          email: user?.email || '',
          phoneNumber: user?.phone || '',
        }}
      />
    );
  }

  return (
    <DealSupportCardShell
      icon={Sparkles}
      title="Get Legal Support"
      description="Book an appointment with our legal desk for expert assistance."
      cta="Contact Legal Desk"
      compact={compact}
      action={action}
      onOpenForm={onOpenForm}
    />
  );
}
