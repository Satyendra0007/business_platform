const express = require('express');
const router = express.Router();
const { createDeal, getDeals, getDealById, updateDeal, updateDealStatus, updateShipment } = require('./deal.controller');
const { createDealValidation, updateDealValidation, updateStatusValidation } = require('./deal.validator');
const { validateRequest } = require('../../middleware/validate.middleware');
const { protect } = require('../../middleware/auth.middleware');
const { requirePhoneVerified } = require('../../middleware/otp.middleware');
const { checkDealLimit, checkPhaseAccess } = require('../../middleware/plan.middleware');

// All Deal routes require authentication
router.use(protect);

router.post('/', requirePhoneVerified, checkDealLimit, createDealValidation, validateRequest, createDeal);
router.get('/', getDeals);
router.get('/:id', getDealById);
router.put('/:id', updateDealValidation, validateRequest, updateDeal);
// Phase check on timeline/status updates — Free Phase-3 users cannot advance milestones
router.patch('/:id/status', checkPhaseAccess('timeline'), updateStatusValidation, validateRequest, updateDealStatus);
// Shipping agent updates cargo milestone (booking → loaded → in_transit → delivered)
router.patch('/:id/shipment', updateShipment);

module.exports = router;
