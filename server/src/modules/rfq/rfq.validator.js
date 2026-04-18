const { check } = require('express-validator');

// Create RFQ validation
const createRFQValidation = [
  check('quantity', 'Quantity is required and must be a positive number').isNumeric().notEmpty(),
  check('productId').optional().isMongoId(),
  check('productName').optional().trim(),
  check('category').optional().trim(),
  check('targetPrice').optional().isNumeric(),
  check('destinationCountry').optional().trim(),
  check('deliveryTimeline').optional().trim(),
  check('incoterm').optional().trim().toUpperCase(),
  check('specifications').optional().trim(),
  check('remarks').optional().trim(),
  check('attachments').optional().isArray({ max: 5 }),
  check('attachments.*').optional().isString(),
  check('supplierCompanyId').optional().isMongoId()
];

// Update RFQ validation
const updateRFQValidation = [
  check('quantity', 'Quantity must be a positive number').optional().isNumeric(),
  check('targetPrice').optional().isNumeric(),
  check('productName').optional().trim(),
  check('category').optional().trim(),
  check('destinationCountry').optional().trim(),
  check('deliveryTimeline').optional().trim(),
  check('incoterm').optional().trim().toUpperCase(),
  check('specifications').optional().trim(),
  check('remarks').optional().trim(),
  check('attachments').optional().isArray({ max: 5 }),
  check('attachments.*').optional().isString(),
];

module.exports = { createRFQValidation, updateRFQValidation };
