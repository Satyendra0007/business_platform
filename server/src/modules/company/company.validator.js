const { check } = require('express-validator');

// Create Company validation rules
const createCompanyValidation = [
  check('name', 'Company name is required').notEmpty().trim(),
  check('country', 'Country specification is required').notEmpty().trim()
];

// Update Company validation rules
const updateCompanyValidation = [
  check('name', 'Company name cannot be empty').optional().notEmpty().trim(),
  check('country', 'Country cannot be empty').optional().notEmpty().trim()
];

module.exports = { createCompanyValidation, updateCompanyValidation };
