/**
 * company.validator.js
 *
 * IMPORTANT: matchedData() in the controller ONLY returns fields that are
 * declared here. Any field omitted from this file is silently dropped before
 * the controller runs — this was causing city, companyType, industry, website,
 * description, yearEstablished, numberOfEmployees, mainProducts, exportMarkets,
 * logo and coverImage to never reach the DB.
 */
const { check } = require('express-validator');

// ─── Shared document sub-document rules ──────────────────────────────────────
const documentRules = [
  check('documents')
    .optional()
    .isArray({ max: 5 })
    .withMessage('documents must be an array with a maximum of 5 items.'),

  check('documents.*.name')
    .optional()
    .trim(),

  check('documents.*.url')
    .if(check('documents').exists({ checkNull: true }))
    .notEmpty()
    .withMessage('Each document must have a url.')
    .trim(),

  check('documents.*.type')
    .optional()
    .trim(),
];

// ─── All optional scalar / array fields shared by create + update ─────────────
// Declaring them here is what makes matchedData() pass them through.
const commonOptionalRules = [
  check('logo')             .optional().trim(),
  check('coverImage')       .optional().trim(),
  check('description')      .optional().trim(),
  check('city')             .optional().trim(),
  check('industry')         .optional().trim(),
  check('companyType')      .optional().trim(),
  check('yearEstablished')  .optional().isInt({ min: 1800, max: 2099 })
                             .withMessage('yearEstablished must be a valid year.'),
  check('numberOfEmployees').optional().trim(),
  check('website')          .optional().trim(),
  check('mainProducts')     .optional().isArray()
                             .withMessage('mainProducts must be an array.'),
  check('exportMarkets')    .optional().isArray()
                             .withMessage('exportMarkets must be an array.'),
  check('subscriptionPlan') .optional().trim(),
];

// ─── Create Company validation rules ─────────────────────────────────────────
const createCompanyValidation = [
  check('name',    'Company name is required').notEmpty().trim(),
  check('country', 'Country specification is required').notEmpty().trim(),
  ...commonOptionalRules,
  ...documentRules,
];

// ─── Update Company validation rules ─────────────────────────────────────────
const updateCompanyValidation = [
  check('name',    'Company name cannot be empty').optional().notEmpty().trim(),
  check('country', 'Country cannot be empty').optional().notEmpty().trim(),
  ...commonOptionalRules,
  ...documentRules,
];

module.exports = { createCompanyValidation, updateCompanyValidation };
