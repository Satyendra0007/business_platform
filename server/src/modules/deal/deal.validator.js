const { check } = require('express-validator');

const DEAL_STAGES = ['inquiry', 'negotiation', 'agreement', 'payment', 'production', 'shipping', 'delivery', 'closed'];

// Create Deal validation
const createDealValidation = [
  check('supplierCompanyId', 'supplierCompanyId is required').notEmpty().isMongoId(),
  check('buyerUserId').optional().isMongoId(),
  check('supplierUserId').optional().isMongoId(),
  check('productId').optional().isMongoId(),
  check('quantity').optional().isNumeric(),
  check('price').optional().isNumeric(),
  check('incoterm').optional().trim().toUpperCase()
];

// Update Deal validation
const updateDealValidation = [
  check('quantity').optional().isNumeric(),
  check('price').optional().isNumeric(),
  check('paymentTerms').optional().trim(),
  check('incoterm').optional().trim().toUpperCase()
];

// Status update validation
const updateStatusValidation = [
  check('status', `Status must be one of: ${DEAL_STAGES.join(', ')}`)
    .notEmpty()
    .isIn(DEAL_STAGES),
  check('notes').optional().trim()
];

module.exports = { createDealValidation, updateDealValidation, updateStatusValidation };
