const Company = require('../company/company.model');
const { sendMail, hasMailConfig } = require('../../lib/smtpMailer');

const RECIPIENTS = {
  'legal-review': { email: 'legal@tradafy.eu', label: 'Legal Document Review' },
  'legal-support': { email: 'legal@tradafy.eu', label: 'Legal Support' },
  'credibility-report': { email: 'legal@tradafy.eu', label: 'Credibility Report' },
  'custom-service': { email: 'support@tradafy.eu', label: 'Custom Service' },
  verification: { email: 'start@tradafy.eu', label: 'Get Tradafication' },
  'verification-form': { email: 'start@tradafy.eu', label: 'Get Tradafication' },
  'tradify-label': { email: 'start@tradafy.eu', label: 'Tradafy Label' },
  'private-labeling': { email: 'start@tradafy.eu', label: 'Private Labeling Support' },
  'business-growth': { email: 'start@tradafy.eu', label: 'Expand Your Business' },
};

function titleCase(value) {
  return String(value || '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatValue(value) {
  if (value == null || value === '') return '-';
  if (Array.isArray(value)) return value.map(formatValue).join(', ');
  if (typeof value === 'object') {
    return Object.entries(value)
      .map(([key, entryValue]) => `${titleCase(key)}: ${formatValue(entryValue)}`)
      .join('\n');
  }
  return String(value).trim();
}

function buildFieldSection(fields) {
  const entries = Object.entries(fields || {});
  if (!entries.length) return 'No additional form fields were submitted.';

  return entries
    .map(([key, value]) => `${titleCase(key)}: ${formatValue(value)}`)
    .join('\n');
}

function buildMailtoHref({ to, subject, text, replyTo }) {
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (text) params.set('body', text);
  if (replyTo) params.set('replyTo', replyTo);
  return `mailto:${to}?${params.toString()}`;
}

function getSupportMeta(sectionKey) {
  return RECIPIENTS[sectionKey] || null;
}

exports.submitDealSupportRequest = async (req, res) => {
  try {
    const { sectionKey, fields = {} } = req.body || {};
    const meta = getSupportMeta(sectionKey);

    if (!sectionKey || !meta) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported deal support section.',
      });
    }

    const company = req.user?.companyId
      ? await Company.findById(req.user.companyId).select('name country city').lean()
      : null;

    const submitterName = `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || 'Unknown user';
    const submitterEmail = fields.contactEmail || fields.email || req.user?.email || '-';
    const replyTo = fields.contactEmail || fields.email || req.user?.email || undefined;
    const companyName = fields.companyName || company?.name || '-';

    const lines = [
      'A new Deal Support request has been submitted.',
      '',
      `Section: ${meta.label}`,
      `Recipient: ${meta.email}`,
      `Submitted by: ${submitterName}`,
      `Submitter email: ${submitterEmail}`,
      `Company: ${companyName}`,
      `Phone: ${req.user?.phone || '-'}`,
      company?.country ? `Company country: ${company.country}` : null,
      company?.city ? `Company city: ${company.city}` : null,
      `User ID: ${req.user?._id || '-'}`,
      '',
      'Form fields:',
      buildFieldSection(fields),
      '',
      `Submitted at: ${new Date().toISOString()}`,
    ].filter(Boolean);

    const subject = `Tradafy Deal Support - ${meta.label}`;
    const body = lines.join('\n');

    if (!hasMailConfig()) {
      return res.json({
        success: true,
        deliveryMode: 'mailto',
        mailtoHref: buildMailtoHref({
          to: meta.email,
          subject,
          text: body,
          replyTo,
        }),
        message: 'Mail client draft prepared.',
      });
    }

    await sendMail({
      to: meta.email,
      subject,
      text: body,
      replyTo,
    });

    return res.json({
      success: true,
      deliveryMode: 'smtp',
      message: 'Your request has been sent successfully.',
    });
  } catch (error) {
    console.error('[deal-support] submitDealSupportRequest:', error.message);

    const meta = getSupportMeta(req.body?.sectionKey);
    if (meta) {
      const fallbackLines = [
        'A new Deal Support request has been submitted.',
        '',
        `Section: ${meta.label}`,
        '',
        'The server could not send this automatically. Use the draft email button to continue.',
      ];

      return res.json({
        success: true,
        deliveryMode: 'mailto',
        mailtoHref: buildMailtoHref({
          to: meta.email,
          subject: `Tradafy Deal Support - ${meta.label}`,
          text: fallbackLines.join('\n'),
        }),
        message: 'Mail client draft prepared.',
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send your request.',
    });
  }
};
