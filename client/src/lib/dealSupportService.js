import api from './api';

// Map legacy sectionKeys used by card components to new API categories
const SECTION_TO_CATEGORY = {
  'legal-review': 'legal_document_review',
  'legal-support': 'legal_support',
  'verification': 'tradification',
  'verification-form': 'tradification',
  'tradify-label': 'tradification',
  'credibility-report': 'credibility_report',
  'private-labeling': 'private_labeling',
  'business-growth': 'business_expansion',
};

/**
 * Submit a service request to the backend.
 *
 * Accepts either the new format { category, formData, attachments }
 * or the legacy format { sectionKey, fields } used by existing card components.
 */
export async function submitServiceRequest({ category, formData, attachments, sectionKey, fields }) {
  try {
    // Support legacy card components that still pass sectionKey + fields
    const resolvedCategory = category || SECTION_TO_CATEGORY[sectionKey];
    const resolvedFormData = formData || fields || {};

    if (!resolvedCategory) {
      throw new Error('Unknown service request type.');
    }

    const { data } = await api.post('/service-requests', {
      category: resolvedCategory,
      formData: resolvedFormData,
      attachments: attachments || [],
    });

    if (data.success) return data;
    throw new Error(data.message || 'Failed to submit request.');
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to submit request. Please try again.';
    throw new Error(message);
  }
}

// Keep backward-compatible alias for existing card components
export const submitDealSupportRequest = submitServiceRequest;
