/**
 * product.validator.js
 *
 * IMPORTANT: express-validator's matchedData() in the controller
 * ONLY returns fields that have explicit check() rules here.
 * Every field that should be saved to MongoDB MUST have a rule,
 * even if the rule is just .optional().
 *
 * Required : title, category
 * Optional : subcategory, description, unit, price, MOQ, incoterm,
 *            countryOfOrigin, availableQuantity, leadTime,
 *            packagingDetails, certifications[], images[], videoUrl, specSheet
 */
const { check } = require('express-validator');

// ─── Shared optional field rules (used in both create & update) ──────────────

const optionalFields = [
  check('subcategory').optional({ nullable: true, checkFalsy: true }).trim(),
  check('description').optional({ nullable: true, checkFalsy: true }).trim(),

  // Trade info
  check('price').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Price must be a non-negative number').toFloat(),
  check('unit').optional({ nullable: true, checkFalsy: true }).trim(),
  check('MOQ').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('MOQ must be a non-negative number').toFloat(),
  check('incoterm').optional({ nullable: true, checkFalsy: true }).trim().toUpperCase(),
  check('countryOfOrigin').optional({ nullable: true, checkFalsy: true }).trim(),
  check('availableQuantity').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Available quantity must be a non-negative number').toFloat(),
  check('leadTime').optional({ nullable: true, checkFalsy: true }).trim(),

  // Additional
  check('packagingDetails').optional({ nullable: true, checkFalsy: true }).trim(),

  // Arrays
  check('certifications')
    .optional({ nullable: true })
    .isArray({ max: 5 })
    .withMessage('Certifications must be an array with at most 5 entries'),
  check('certifications.*').optional().isString().trim(),

  check('images')
    .optional({ nullable: true })
    .isArray({ max: 5 })
    .withMessage('Images must be an array with at most 5 URLs'),
  check('images.*')
    .optional()
    .isURL({ protocols: ['https'], require_protocol: true })
    .withMessage('Each image must be a valid HTTPS URL'),

  // Media
  check('videoUrl')
    .optional({ nullable: true, checkFalsy: true })
    .isURL({ require_protocol: true })
    .withMessage('videoUrl must be a valid URL'),
  check('specSheet')
    .optional({ nullable: true, checkFalsy: true })
    .isURL({ require_protocol: true })
    .withMessage('specSheet must be a valid URL'),
];

// ─── Create — title + category required, everything else optional ────────────

const createProductValidation = [
  check('title', 'Product title is required and cannot be empty').notEmpty().trim(),
  check('category', 'Category is required to index the product').notEmpty().trim(),
  ...optionalFields,
];

// ─── Update — ALL fields optional (partial updates supported) ────────────────

const updateProductValidation = [
  check('title').optional().notEmpty().withMessage('Title cannot be empty if provided').trim(),
  check('category').optional().notEmpty().withMessage('Category cannot be empty if provided').trim(),
  ...optionalFields,
];

module.exports = { createProductValidation, updateProductValidation };
