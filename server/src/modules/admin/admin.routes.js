const express = require('express');
const router  = express.Router();
const { protect }      = require('../../middleware/auth.middleware');
const { requireAdmin } = require('../../middleware/admin.middleware');
const {
  getUsers, toggleUserStatus,
  getCompanies, verifyCompany,
  getDeals, getDealById,
  getRFQs, getRFQById,
  getProducts
} = require('./admin.controller');

// All admin routes: must be authenticated AND have admin role
router.use(protect, requireAdmin);

// User Management
router.get('/users',                  getUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);

// Company Management
router.get('/companies',              getCompanies);
router.patch('/companies/:id/verify', verifyCompany);

// Product Management
router.get('/products', getProducts);

// Deal Monitoring
router.get('/deals',      getDeals);
router.get('/deals/:id',  getDealById);

// RFQ Monitoring
router.get('/rfq',        getRFQs);
router.get('/rfq/:id',    getRFQById);

module.exports = router;
