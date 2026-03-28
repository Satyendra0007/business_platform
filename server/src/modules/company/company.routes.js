const express = require('express');
const router  = express.Router();
const { createCompany, getCompanyById, updateCompany, getCompanies } = require('./company.controller');
const { createCompanyValidation, updateCompanyValidation } = require('./company.validator');
const { validateRequest } = require('../../middleware/validate.middleware');
const { protect }         = require('../../middleware/auth.middleware');

// Public: any visitor can browse & discover verified companies
router.get('/',    getCompanies);
router.get('/:id', getCompanyById);

// Protected: must be authenticated to create or update a company
router.post('/',    protect, createCompanyValidation, validateRequest, createCompany);
router.put('/:id',  protect, updateCompanyValidation, validateRequest, updateCompany);

module.exports = router;
