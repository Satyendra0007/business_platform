const express = require('express');
const router = express.Router();
const { createRFQ, getRFQs, getRFQById, updateRFQ, closeRFQ, convertRFQtoDeal, assignSupplier } = require('./rfq.controller');
const { createRFQValidation, updateRFQValidation } = require('./rfq.validator');
const { validateRequest } = require('../../middleware/validate.middleware');
const { protect } = require('../../middleware/auth.middleware');
const { requirePhoneVerified } = require('../../middleware/otp.middleware');

// All RFQ routes are protected — no public access
router.use(protect);

router.post('/', requirePhoneVerified, createRFQValidation, validateRequest, createRFQ);
router.get('/', getRFQs);
router.get('/:id', getRFQById);
router.put('/:id', updateRFQValidation, validateRequest, updateRFQ);
router.patch('/:id/close',           closeRFQ);
router.patch('/:id/assign-supplier', assignSupplier);
router.post('/:id/convert',          convertRFQtoDeal);

module.exports = router;
