const { check } = require('express-validator');

// Create RFQ validation
const createRFQValidation = [
  check('quantity', 'Quantity is required and must be a positive number').isNumeric().notEmpty(),
  check('productId').optional().isMongoId(),
  check('productName').optional().trim(),
  check('targetPrice').optional().isNumeric(),
  check('incoterm').optional().trim().toUpperCase(),
  check('supplierCompanyId').optional().isMongoId()
];

// Update RFQ validation
const updateRFQValidation = [
  check('quantity', 'Quantity must be a positive number').optional().isNumeric(),
  check('targetPrice').optional().isNumeric(),
  check('productName').optional().trim()
];

module.exports = { createRFQValidation, updateRFQValidation };
