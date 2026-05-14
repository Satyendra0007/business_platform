import React from 'react';
import { BarChart3, Building2, Phone, ShieldCheck, MessageSquare } from 'lucide-react';
import DealSupportCardShell from '../DealSupportCardShell';
import DealSupportIntakeForm from '../DealSupportIntakeForm';
import { getUser } from '../../../lib/api';
import { usePlan } from '../../../hooks/usePlan';

export default function CredibilityReportCard({ action, compact = false, onOpenForm }) {
  if (!compact) {
    const user = getUser();
    const { plan, user: fullUser } = usePlan();
    
    // Calculate pricing display
    let pricingDisplay = 'Activate: $25';
    if (plan === 'premium') {
      const used = fullUser?.credibilityReportsUsed || 0;
      if (used < 3) {
        pricingDisplay = `Premium: Included (${3 - used} of 3 free remaining)`;
      } else {
        pricingDisplay = 'Premium: $12.50';
      }
    }

    return (
      <DealSupportIntakeForm
        icon={BarChart3}
        sectionKey="credibility-report"
        title="Credibility Report (COFAS)"
        description={
          <>
            Request a detailed financial and risk analysis on a target company.
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-[10px] bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                {pricingDisplay}
              </span>
            </div>
          </>
        }
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
