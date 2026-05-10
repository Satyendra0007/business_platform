import React from 'react';
import { BadgeCheck, Building2, Phone, Calendar, Clock, Globe, Briefcase } from 'lucide-react';
import DealSupportCardShell from '../DealSupportCardShell';
import DealSupportIntakeForm from '../DealSupportIntakeForm';
import { getUser } from '../../../lib/api';

export default function GetVerifiedTradifyLabelCard({ compact = false, action, onOpenForm }) {
  if (!compact) {
    const user = getUser();
    return (
      <DealSupportIntakeForm
        icon={BadgeCheck}
        sectionKey="tradify-label"
        title="Get Tradified — Tradafy Label"
        description="Apply for the Tradafy Label with a verification appointment request."
        badge="Premium"
        ctaLabel="Apply for Label"
        successTitle="Tradafy Label request submitted"
        successMessage="Your label application has been submitted. We will contact you shortly."
        validationMessage="Please complete the Tradafy Label form."
        fields={[
          { name: 'companyName', label: 'Company name', icon: Building2, placeholder: 'Registered company name' },
          { name: 'name', label: 'Contact name', icon: BadgeCheck, placeholder: 'Your full name' },
          { name: 'phoneNumber', label: 'Phone number', icon: Phone, type: 'tel', placeholder: '+49 123 456 7890' },
          { name: 'preferredDate', label: 'Preferred date', icon: Calendar, type: 'date', placeholder: '' },
          { name: 'preferredTime', label: 'Preferred time', icon: Clock, type: 'time', placeholder: '' },
          { name: 'country', label: 'Country / Location', icon: Globe, placeholder: 'e.g. Germany, Munich' },
          { name: 'businessBranch', label: 'Business branch', icon: Briefcase, placeholder: 'e.g. Private label cosmetics' },
        ]}
        initialValues={{
          phoneNumber: user?.phone || '',
        }}
      />
    );
  }

  return (
    <DealSupportCardShell
      icon={BadgeCheck}
      title="Get Tradified — Tradafy Label"
      description="Apply for the Tradafy Label with a verification appointment request."
      cta="Open form"
      marker="Premium"
      compact={compact}
      action={action}
      onOpenForm={onOpenForm}
    />
  );
}
