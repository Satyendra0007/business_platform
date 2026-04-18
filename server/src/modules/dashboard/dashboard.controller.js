/**
 * dashboard.controller.js
 *
 * GET /api/dashboard/stats
 *
 * Returns role-specific counts in a single request using parallel
 * countDocuments() queries. Each role only receives exactly what it
 * needs — no over-fetching.
 *
 * Response shape:
 *   { success: true, data: { <role-specific fields> } }
 */
const Product  = require('../product/product.model');
const RFQ      = require('../rfq/rfq.model');
const Deal     = require('../deal/deal.model');
const User     = require('../user/user.model');
const Company  = require('../company/company.model');


const getDashboardStats = async (req, res) => {
  try {
    const user   = req.user;
    const role   = user.roles?.[0] || 'buyer';
    const companyId = user.companyId || null;

    let stats = {};

    // ── BUYER ─────────────────────────────────────────────────────────────────
    if (role === 'buyer') {
      const [
        totalProducts,
        myRFQs,
        myDeals,
        transportTenders,
      ] = await Promise.all([
        Product.countDocuments({ isActive: true, isDeleted: false }),

        // Buyer's own open RFQs
        companyId
          ? RFQ.countDocuments({ buyerCompanyId: companyId, isDeleted: false, status: { $ne: 'closed' } })
          : 0,

        // Buyer's active deals
        companyId
          ? Deal.countDocuments({ buyerCompanyId: companyId, isDeleted: false, status: { $nin: ['closed'] } })
          : 0,

        // Deals in transport-bidding stage (open to shipping agent bids)
        companyId
          ? Deal.countDocuments({ buyerCompanyId: companyId, isDeleted: false, status: 'shipping_request' })
          : 0,
      ]);

      stats = { totalProducts, myRFQs, myDeals, transportTenders };
    }

    // ── SUPPLIER ──────────────────────────────────────────────────────────────
    else if (role === 'supplier') {
      const [
        myProducts,
        incomingRFQs,
        myDeals,
        transportTenders,
      ] = await Promise.all([
        // Supplier's own active products
        companyId
          ? Product.countDocuments({ companyId, isActive: true, isDeleted: false })
          : 0,

        // Open RFQs directed at this supplier's company
        companyId
          ? RFQ.countDocuments({ supplierCompanyId: companyId, isDeleted: false, status: { $in: ['open', 'in_progress'] } })
          : 0,

        // Supplier's active deals
        companyId
          ? Deal.countDocuments({ supplierCompanyId: companyId, isDeleted: false, status: { $nin: ['closed'] } })
          : 0,

        // Deals reaching shipping stage
        companyId
          ? Deal.countDocuments({ supplierCompanyId: companyId, isDeleted: false, status: 'shipping_request' })
          : 0,
      ]);

      stats = { myProducts, incomingRFQs, myDeals, transportTenders };
    }

    // ── SHIPPING AGENT ────────────────────────────────────────────────────────
    else if (role === 'shipping_agent') {
      const [
        openTenders,
        awardedShipments,
        totalProducts,
      ] = await Promise.all([
        // Deals in shipping_request — open for agent bids
        Deal.countDocuments({ isDeleted: false, status: 'shipping_request' }),

        // Deals where this agent was awarded
        Deal.countDocuments({ shippingAgentId: user._id, isDeleted: false, status: 'shipping' }),

        // Platform product reference count
        Product.countDocuments({ isActive: true, isDeleted: false }),
      ]);

      stats = { openTenders, awardedShipments, totalProducts };
    }

    // ── ADMIN ─────────────────────────────────────────────────────────────────
    else if (role === 'admin') {
      const [
        totalUsers,
        totalCompanies,
        totalDeals,
        pendingCompanies,
      ] = await Promise.all([
        User.countDocuments({}),
        Company.countDocuments({}),
        Deal.countDocuments({ isDeleted: false }),
        Company.countDocuments({ approvalStatus: 'pending' }),
      ]);

      stats = { totalUsers, totalCompanies, totalDeals, pendingCompanies };
    }

    return res.json({ success: true, data: stats });
  } catch (err) {
    console.error('[Dashboard Stats Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to load dashboard stats.' });
  }
};

module.exports = { getDashboardStats };
