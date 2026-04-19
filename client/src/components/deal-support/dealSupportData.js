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
      { component: GetVerifiedCard, actionKey: 'company-setup' },
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
    case 'business-growth':
      return {
        label: 'Browse products',
        kind: 'navigate',
        to: '/products',
      };
    case 'legal-review':
      return {
        label: 'Request review',
        kind: 'mailto',
        subject: 'Legal document review request',
        body: 'Hi Tradify team,\n\nI would like to request a legal document review for an active deal.',
      };
    case 'legal-support':
      return {
        label: 'Contact legal desk',
        kind: 'mailto',
        subject: 'Legal support request',
        body: 'Hi Tradify team,\n\nI need legal support for an active trade workflow.',
      };
    case 'tradify-label':
      return {
        label: 'Start verification',
        kind: 'mailto',
        subject: 'Tradify label verification request',
        body: 'Hi Tradify team,\n\nI would like to start Tradify label verification for my company.',
      };
    case 'custom-service':
      return {
        label: 'Assign manager',
        kind: 'mailto',
        subject: 'Custom service contact request',
        body: 'Hi Tradify team,\n\nI would like a dedicated service manager for an active deal.',
      };
    case 'credibility-report':
      return {
        label: 'Request report',
        kind: 'mailto',
        subject: 'Credibility report request',
        body: 'Hi Tradify team,\n\nI would like to request a credibility report for an active deal.',
      };
    case 'private-labeling':
      return {
        label: 'Contact us',
        kind: 'mailto',
        subject: 'Private labeling support request',
        body: 'Hi Tradify team,\n\nI would like to explore private labeling support for my business.',
      };
    default:
      return null;
  }
}
