const express = require('express');
const router = express.Router();
const { createProduct, getProducts, getManagedProducts, getProductById, updateProduct, deleteProduct, getCategories } = require('./product.controller');
const { createProductValidation, updateProductValidation } = require('./product.validator');
const { validateRequest } = require('../../middleware/validate.middleware');
const { protect } = require('../../middleware/auth.middleware');

// Public endpoints
router.get('/', getProducts);
router.get('/manage', protect, getManagedProducts);
router.get('/categories', getCategories);   // MUST be before /:id
router.get('/:id', getProductById);

// Protected endpoints explicitly requiring a valid JWT and an attached B2B Company ownership
router.post('/', protect, createProductValidation, validateRequest, createProduct);
router.put('/:id', protect, updateProductValidation, validateRequest, updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;
