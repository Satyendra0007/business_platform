/**
 * dashboard.routes.js
 * GET /api/dashboard/stats  — protected, any authenticated role
 */
const express    = require('express');
const router     = express.Router();
const { protect } = require('../../middleware/auth.middleware');
const { getDashboardStats } = require('./dashboard.controller');

router.get('/stats', protect, getDashboardStats);

module.exports = router;

