import React from 'react';
import { BadgeCheck, Building2, Phone, Calendar, Clock, Globe, Briefcase } from 'lucide-react';
import DealSupportCardShell from '../DealSupportCardShell';
import DealSupportIntakeForm from '../DealSupportIntakeForm';
import { getUser } from '../../../lib/api';
import { usePlan } from '../../../hooks/usePlan';
import { useUpgradeModal } from '../../../hooks/useUpgradeModal';

export default function GetVerifiedTradifyLabelCard({ compact = false, action, onOpenForm }) {
  const { plan, subscriptionStatus } = usePlan();
  const { openUpgradeModal } = useUpgradeModal();
  const isPremium = plan === 'premium' && subscriptionStatus === 'active';

  if (!compact) {
    const user = getUser();
    
    if (!isPremium) {
      return (
        <article className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_16px_36px_rgba(15,23,42,0.06)]">
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 p-6 text-center backdrop-blur-[2px]">
            <BadgeCheck className="mb-3 h-10 w-10 text-slate-400" />
            <h3 className="text-lg font-bold text-slate-900">Premium Feature</h3>
            <p className="mt-2 max-w-[280px] text-sm text-slate-600">
              Tradification requires an active Premium plan. Upgrade your workspace to access this service.
            </p>
            <button
              onClick={() => openUpgradeModal('premium', 'Upgrade to access Tradification')}
              className="mt-5 rounded-2xl bg-[#245c9d] px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Upgrade to Premium
            </button>
          </div>
          
          {/* Blurred background form to make it look like a soft-lock */}
          <div className="pointer-events-none opacity-30 blur-sm blur-filter">
            <DealSupportIntakeForm
              icon={BadgeCheck}
              sectionKey="tradify-label"
              title="Get Tradified — Tradafy Label"
              description="Apply for the Tradafy Label with a verification appointment request."
              badge="Premium"
              ctaLabel="Apply for Label"
              fields={[]}
            />
          </div>
        </article>
      );
    }

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
