import {
  BarChart3,
  FileText,
  Headphones,
  ShieldCheck,
} from 'lucide-react';
import LegalDocumentReviewCard from './cards/LegalDocumentReviewCard';
import GetLegalSupportCard from './cards/GetLegalSupportCard';
import GetVerifiedCard from './cards/GetVerifiedCard';
import GetVerifiedTradifyLabelCard from './cards/GetVerifiedTradifyLabelCard';
import CustomServiceContactCard from './cards/CustomServiceContactCard';
import CredibilityReportCard from './cards/CredibilityReportCard';
import PrivateLabelingSupportCard from './cards/PrivateLabelingSupportCard';
import ExpandYourBusinessCard from './cards/ExpandYourBusinessCard';

export const dealSupportSections = [
  {
    key: 'legal',
    title: 'Legal & Documents',
    accent: 'from-[#cfe2ff] via-[#dfe9f7] to-[#eef4fb]',
    icon: FileText,
    badge: 'Document Control',
    cards: [
      { component: LegalDocumentReviewCard, actionKey: 'legal-review' },
      { component: GetLegalSupportCard, actionKey: 'legal-support' },
    ],
  },
  {
    key: 'verification',
    title: 'Verification',
    accent: 'from-[#dff1ea] via-[#e8f3f1] to-[#f4f8f6]',
    icon: ShieldCheck,
    badge: 'Trust Layer',
    cards: [
      { component: GetVerifiedCard, actionKey: 'verification-form' },
      { component: GetVerifiedTradifyLabelCard, actionKey: 'tradify-label' },
    ],
  },
  {
    key: 'trade',
    title: 'Trade Support',
    accent: 'from-[#e5edf6] via-[#edf3f8] to-[#f5f8fb]',
    icon: BarChart3,
    badge: 'Service Desk',
    cards: [
      { component: CustomServiceContactCard, actionKey: 'custom-service' },
      { component: CredibilityReportCard, actionKey: 'credibility-report' },
    ],
  },
  {
    key: 'growth',
    title: 'Business Growth',
    accent: 'from-[#f8ecd7] via-[#f8f2e7] to-[#fcf8f1]',
    icon: BarChart3,
    badge: 'Scale & Expand',
    cards: [
      { component: PrivateLabelingSupportCard, actionKey: 'private-labeling' },
      { component: ExpandYourBusinessCard, actionKey: 'business-growth' },
    ],
  },
];

export const proofPills = [
  { label: 'KYC ready', icon: ShieldCheck },
  { label: 'Escalation support', icon: Headphones },
  { label: 'Premium services', icon: BarChart3 },
];

export function getDealSupportAction(actionKey) {
  switch (actionKey) {
    case 'company-setup':
      return {
        label: 'Open company setup',
        kind: 'navigate',
        to: '/company/setup',
      };
    case 'verification-form':
      return {
        label: 'Get verification',
        kind: 'navigate',
        to: '/deal-support/verification',
      };
    case 'business-growth':
      return {
        label: 'Browse products',
        kind: 'navigate',
        to: '/products',
      };
    case 'legal-review':
      return {
        label: 'Open review form',
        kind: 'navigate',
        to: '/deal-support/legal-review',
      };
    case 'legal-support':
      return {
        label: 'Open legal support',
        kind: 'navigate',
        to: '/deal-support/legal-support',
      };
    case 'tradify-label':
      return {
        label: 'Open label form',
        kind: 'navigate',
        to: '/deal-support/tradify-label',
      };
    case 'custom-service':
      return {
        label: 'Open service form',
        kind: 'navigate',
        to: '/deal-support/custom-service',
      };
    case 'credibility-report':
      return {
        label: 'Open report form',
        kind: 'navigate',
        to: '/deal-support/credibility-report',
      };
    case 'private-labeling':
      return {
        label: 'Open support form',
        kind: 'navigate',
        to: '/deal-support/private-labeling',
      };
    default:
      return null;
  }
}
