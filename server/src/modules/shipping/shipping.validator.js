const { check } = require('express-validator');

// ─── Create Shipping Request ──────────────────────────────────────────────────
const createRequestValidation = [
  check('dealId', 'dealId is required and must be a valid ObjectId').notEmpty().isMongoId(),
  check('origin', 'origin is required').notEmpty().trim(),
  check('destination', 'destination is required').notEmpty().trim(),
  check('cargoDetails').optional().trim(),
  check('quantity').optional().isNumeric().withMessage('quantity must be a number'),
  check('incoterm').optional().trim().toUpperCase()
];

// ─── Submit Shipping Bid ──────────────────────────────────────────────────────
const submitBidValidation = [
  check('shippingRequestId', 'shippingRequestId is required and must be a valid ObjectId')
    .notEmpty()
    .isMongoId(),
  check('price').optional().isNumeric().withMessage('price must be a number'),
  check('transportType')
    .optional()
    .isIn(['sea', 'air', 'land'])
    .withMessage('transportType must be sea, air, or land'),
  check('transitTime').optional().trim(),
  check('services')
    .optional()
    .isArray()
    .withMessage('services must be an array'),
  check('validity')
    .optional()
    .isISO8601()
    .withMessage('validity must be a valid ISO 8601 date'),
  check('notes').optional().trim(),
  check('documents')
    .optional()
    .isArray({ max: 5 })
    .withMessage('documents must be an array with a maximum of 5 URLs'),
  check('documents.*')
    .optional()
    .isURL()
    .withMessage('Each document entry must be a valid URL')
];

module.exports = { createRequestValidation, submitBidValidation };
