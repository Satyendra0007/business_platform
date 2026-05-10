import React from 'react';
import { Building2, Phone, Calendar, Clock, Globe, Briefcase, ShieldCheck, ArrowRight } from 'lucide-react';
import DealSupportCardShell from '../DealSupportCardShell';
import DealSupportIntakeForm from '../DealSupportIntakeForm';
import { getUser } from '../../../lib/api';

export default function GetVerifiedCard({ compact = false, onOpenVerification, action, onOpenForm }) {
  if (!compact) {
    const user = getUser();
    return (
      <DealSupportIntakeForm
        icon={ShieldCheck}
        sectionKey="verification-form"
        title="Get Tradified"
        description="Request a Tradafication appointment for your company verification."
        badge="Company Form"
        ctaLabel="Submit Request"
        successTitle="Tradafication request sent"
        successMessage="Your Tradafication request has been submitted. We will contact you shortly."
        validationMessage="Please complete the Tradafication form."
        fields={[
          { name: 'companyName', label: 'Company name', icon: Building2, placeholder: 'Your registered business name' },
          { name: 'name', label: 'Contact name', icon: ShieldCheck, placeholder: 'Your full name' },
          { name: 'phoneNumber', label: 'Phone number', icon: Phone, type: 'tel', placeholder: '+49 123 456 7890' },
          { name: 'preferredDate', label: 'Preferred date', icon: Calendar, type: 'date', placeholder: '' },
          { name: 'preferredTime', label: 'Preferred time', icon: Clock, type: 'time', placeholder: '' },
          { name: 'country', label: 'Country / Location', icon: Globe, placeholder: 'e.g. Germany, Munich' },
          {
            name: 'businessBranch',
            label: 'Business branch',
            icon: Briefcase,
            placeholder: 'e.g. Food & Beverage, Textiles',
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
      icon={ShieldCheck}
      title="Get Tradified"
      description="Request a Tradafication appointment for your company verification."
      cta="Get Tradafication"
      compact={compact}
      action={action}
      onOpenForm={onOpenForm || onOpenVerification}
    />
  );
}
