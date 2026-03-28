const { check } = require('express-validator');

// Create Product validation rules
const createProductValidation = [
  check('title', 'Product title is required and cannot be empty').notEmpty().trim(),
  check('category', 'Category is required to index the product').notEmpty().trim()
];

// Update Product validation rules
const updateProductValidation = [
  check('title', 'Title cannot be strictly empty if provided').optional().notEmpty().trim(),
  check('category', 'Category cannot be strictly empty if provided').optional().notEmpty().trim()
];

module.exports = { createProductValidation, updateProductValidation };
