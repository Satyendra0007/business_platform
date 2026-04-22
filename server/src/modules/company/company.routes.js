const express = require('express');
const router  = express.Router();
const { createCompany, getCompanyById, updateCompany, getCompanies } = require('./company.controller');
const { createCompanyValidation, updateCompanyValidation } = require('./company.validator');
const { validateRequest } = require('../../middleware/validate.middleware');
const { protect }         = require('../../middleware/auth.middleware');
const { requirePhoneVerified } = require('../../middleware/otp.middleware');
const { checkDocumentLimit } = require('../../middleware/plan.middleware');

// Public: any visitor can browse & discover verified companies
router.get('/',    getCompanies);
router.get('/:id', getCompanyById);

// Protected: must be authenticated AND phone-verified to create or update a company
router.post('/',    protect, requirePhoneVerified, createCompanyValidation, validateRequest, createCompany);
router.put('/:id',  protect, checkDocumentLimit, updateCompanyValidation, validateRequest, updateCompany);

module.exports = router;
