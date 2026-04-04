const { check } = require('express-validator');

// ─── Shared document sub-document rules ──────────────────────────────────────
// Applied to both create and update so the same rules are never duplicated.
const documentRules = [
  check('documents')
    .optional()
    .isArray({ max: 5 })
    .withMessage('documents must be an array with a maximum of 5 items.'),

  check('documents.*.name')
    .if(check('documents').exists())
    .notEmpty()
    .withMessage('Each document must have a name.')
    .trim(),

  check('documents.*.url')
    .if(check('documents').exists())
    .notEmpty()
    .withMessage('Each document must have a url.')
    .trim(),

  check('documents.*.type')
    .optional()
    .trim()
];

// ─── Create Company validation rules ─────────────────────────────────────────
const createCompanyValidation = [
  check('name', 'Company name is required').notEmpty().trim(),
  check('country', 'Country specification is required').notEmpty().trim(),
  ...documentRules
];

// ─── Update Company validation rules ─────────────────────────────────────────
const updateCompanyValidation = [
  check('name', 'Company name cannot be empty').optional().notEmpty().trim(),
  check('country', 'Country cannot be empty').optional().notEmpty().trim(),
  ...documentRules
];

module.exports = { createCompanyValidation, updateCompanyValidation };
