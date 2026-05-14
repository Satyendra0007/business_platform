const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth.middleware');
const { requireAdmin } = require('../../middleware/admin.middleware');
const {
  // Users
  getUsers, getUserById, updateUser, toggleUserStatus, updateUserRole, updateUserPlan, verifyUser,
  // Companies
  getCompanies, getCompanyById, updateCompany, verifyCompany, toggleCompanyStatus,
  // Deals
  getDeals, getDealById, updateDealStatus, updateDealShipment, resolveDeal,
  // RFQs
  getRFQs, getRFQById, updateRFQ, closeRFQ, removeRFQ,
  // Products
  getProducts, getProductById, updateProduct, toggleProductStatus, removeProduct,
  // Analytics
  getAnalytics,
} = require('./admin.controller');

// All admin routes: must be authenticated AND have admin role
router.use(protect, requireAdmin);

// ─── Analytics ──────────────────────────────────────────────────────────
router.get('/analytics', getAnalytics);

// ─── User Management ────────────────────────────────────────────────────────
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/plan', updateUserPlan);
router.patch('/users/:id/verify', verifyUser);

// ─── Company Management ─────────────────────────────────────────────────────
router.get('/companies', getCompanies);
router.get('/companies/:id', getCompanyById);
router.put('/companies/:id', updateCompany);
router.patch('/companies/:id/verify', verifyCompany);
router.patch('/companies/:id/toggle-status', toggleCompanyStatus);

// ─── Deal Management ────────────────────────────────────────────────────────
router.get('/deals', getDeals);
router.get('/deals/:id', getDealById);
router.patch('/deals/:id/status', updateDealStatus);
router.patch('/deals/:id/shipment', updateDealShipment);
router.patch('/deals/:id/resolve', resolveDeal);

// ─── RFQ Management ─────────────────────────────────────────────────────────
router.get('/rfq', getRFQs);
router.get('/rfq/:id', getRFQById);
router.put('/rfq/:id', updateRFQ);
router.patch('/rfq/:id/close', closeRFQ);
router.patch('/rfq/:id/remove', removeRFQ);

// ─── Product Management ─────────────────────────────────────────────────────
router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.put('/products/:id', updateProduct);
router.patch('/products/:id/toggle-status', toggleProductStatus);
router.patch('/products/:id/remove', removeProduct);

module.exports = router;
