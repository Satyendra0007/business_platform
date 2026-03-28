const express = require('express');
const router = express.Router();
const { createProduct, getProducts, getProductById, updateProduct, deleteProduct } = require('./product.controller');
const { createProductValidation, updateProductValidation } = require('./product.validator');
const { validateRequest } = require('../../middleware/validate.middleware');
const { protect } = require('../../middleware/auth.middleware');

// Public endpoints natively enabled to assist generic SEO and B2B global lookup platforms
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected endpoints explicitly requiring a valid JWT and an attached B2B Company ownership
router.post('/', protect, createProductValidation, validateRequest, createProduct);
router.put('/:id', protect, updateProductValidation, validateRequest, updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;
