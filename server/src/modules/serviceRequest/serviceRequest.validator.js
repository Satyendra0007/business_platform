const { CATEGORIES } = require('./serviceRequest.model');

// International phone: optional leading +, 7–15 digits
const PHONE_RE = /^\+?[1-9]\d{6,14}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
];
const INQUIRY_TYPES = ['help', 'request', 'suggestion'];

// ─── Per-category required-field definitions ──────────────────────────────────

const CATEGORY_RULES = {
  legal_support: {
    required: ['name', 'phoneNumber', 'email', 'preferredDate', 'preferredTime', 'issuePreview'],
    emailFields: ['email'],
  },
  tradification: {
    required: ['name', 'phoneNumber', 'preferredDate', 'preferredTime', 'country', 'businessBranch'],
    emailFields: [],
  },
  credibility_report: {
    required: ['name', 'phoneNumber', 'targetCompanyName', 'reason'],
    emailFields: [],
  },
  legal_document_review: {
    required: ['name', 'phoneNumber', 'documentType'],
    emailFields: [],
  },
  private_labeling: {
    required: ['name', 'phoneNumber', 'inquiryType', 'reason'],
    emailFields: [],
  },
  business_expansion: {
    required: ['name', 'phoneNumber', 'inquiryType', 'reason'],
    emailFields: [],
  },
};

// ─── Validate service request payload ─────────────────────────────────────────

function validateServiceRequest(body) {
  const errors = [];
  const { category, formData, attachments } = body;

  // 1. Category
  if (!category || !CATEGORIES.includes(category)) {
    errors.push(`category must be one of: ${CATEGORIES.join(', ')}.`);
    return errors; // can't validate further without a valid category
  }

  // 2. formData presence
  if (!formData || typeof formData !== 'object') {
    errors.push('formData is required.');
    return errors;
  }

  const rules = CATEGORY_RULES[category];
  if (!rules) {
    errors.push(`No validation rules defined for category '${category}'.`);
    return errors;
  }

  // 3. Required fields
  for (const field of rules.required) {
    const value = formData[field];
    if (value === undefined || value === null || String(value).trim() === '') {
      errors.push(`${field} is required for ${category.replace(/_/g, ' ')} requests.`);
    }
  }

  // 4. Phone validation
  if (formData.phoneNumber && !PHONE_RE.test(formData.phoneNumber.replace(/[\s\-()]/g, ''))) {
    errors.push('Please enter a valid international phone number (e.g. +491234567890).');
  }

  // 5. Email validation
  for (const emailField of rules.emailFields) {
    if (formData[emailField] && !EMAIL_RE.test(formData[emailField])) {
      errors.push(`Please enter a valid email address for ${emailField}.`);
    }
  }

  // 6. Inquiry type validation (private_labeling, business_expansion)
  if (rules.required.includes('inquiryType') && formData.inquiryType) {
    if (!INQUIRY_TYPES.includes(formData.inquiryType)) {
      errors.push(`inquiryType must be one of: ${INQUIRY_TYPES.join(', ')}.`);
    }
  }

  // 7. Attachments validation
  if (attachments && Array.isArray(attachments)) {
    for (let i = 0; i < attachments.length; i++) {
      const att = attachments[i];
      if (!att.url || typeof att.url !== 'string') {
        errors.push(`Attachment ${i + 1}: url is required.`);
      }
      if (att.fileType && !ALLOWED_FILE_TYPES.includes(att.fileType)) {
        errors.push(`Attachment ${i + 1}: only PDF and DOCX files are allowed.`);
      }
    }
  }

  return errors;
}

module.exports = { validateServiceRequest, ALLOWED_FILE_TYPES };
