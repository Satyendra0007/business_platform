const express = require('express');
const router = express.Router();
const { createDeal, getDeals, getDealById, updateDeal, updateDealStatus, updateShipment } = require('./deal.controller');
const { createDealValidation, updateDealValidation, updateStatusValidation } = require('./deal.validator');
const { validateRequest } = require('../../middleware/validate.middleware');
const { protect } = require('../../middleware/auth.middleware');

// All Deal routes require authentication
router.use(protect);

router.post('/',             createDealValidation,  validateRequest, createDeal);
router.get('/',              getDeals);
router.get('/:id',           getDealById);
router.put('/:id',           updateDealValidation,  validateRequest, updateDeal);
router.patch('/:id/status',  updateStatusValidation, validateRequest, updateDealStatus);
// Shipping agent updates cargo milestone (booking → loaded → in_transit → delivered)
// No validator needed — status is validated inline in the controller
router.patch('/:id/shipment', updateShipment);

module.exports = router;
