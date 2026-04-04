const mongoose = require('mongoose');
const User    = require('../user/user.model');
const Company = require('../company/company.model');
const Deal    = require('../deal/deal.model');
const RFQ     = require('../rfq/rfq.model');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Shared pagination helpers
const getPagination = (query) => {
  const page       = Math.max(parseInt(query.page  || 1),  1);
  const limitValue = Math.min(parseInt(query.limit || 20), 50);
  const skip       = (page - 1) * limitValue;
  return { page, limitValue, skip };
};

// ─── USER MANAGEMENT ─────────────────────────────────────────────────────────

// @route   GET /api/admin/users
// @desc    List all users with pagination
const getUsers = async (req, res) => {
  try {
    const { page, limitValue, skip } = getPagination(req.query);
    const { isActive, role } = req.query;

    const query = {};
    // Filter by account status — uses the isActive field (no dedicated index needed, low cardinality)
    if (isActive !== undefined) query.isActive = isActive === 'true';
    // Filter by role — uses the indexed email field as anchor; roles array is small
    if (role) query.roles = role;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .skip(skip)
        .limit(limitValue)
        .sort({ createdAt: -1 })
        .lean(),
      User.countDocuments(query)
    ]);

    res.json({ success: true, count: users.length, total, totalPages: Math.ceil(total / limitValue), page, data: users });
  } catch (error) {
    console.error('[admin.getUsers]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @route   PATCH /api/admin/users/:id/toggle-status
// @desc    Activate or deactivate a user account
const toggleUserStatus = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Guard: admin cannot deactivate their own account accidentally
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Admins cannot toggle their own account status.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User has been ${user.isActive ? 'activated' : 'deactivated'}.`,
      data: { _id: user._id, email: user.email, isActive: user.isActive }
    });
  } catch (error) {
    console.error('[admin.toggleUserStatus]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── COMPANY MANAGEMENT ───────────────────────────────────────────────────────

// @route   GET /api/admin/companies
// @desc    List all companies with pagination
const getCompanies = async (req, res) => {
  try {
    const { page, limitValue, skip } = getPagination(req.query);
    const { status, search } = req.query;

    const query = { isDeleted: false };
    // verificationStatus filter — hits the { verificationStatus: 1 } index defined in company.model.js
    if (status) query.verificationStatus = status;
    // Name search — hits the text index ({ name: 'text' }) defined in company.model.js
    if (search) query.$text = { $search: search };

    const [companies, total] = await Promise.all([
      Company.find(query)
        // Include documents so admin can review uploaded verification files
        .select('name country verificationStatus subscriptionPlan isActive documents createdAt')
        .skip(skip)
        .limit(limitValue)
        .sort({ createdAt: -1 })
        .lean(),
      Company.countDocuments(query)
    ]);

    res.json({ success: true, count: companies.length, total, totalPages: Math.ceil(total / limitValue), page, data: companies });
  } catch (error) {
    console.error('[admin.getCompanies]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @route   PATCH /api/admin/companies/:id/verify
// @desc    Update company verification status (pending / verified / rejected)
const verifyCompany = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid company ID.' });
    }

    console.log('[DEBUG verifyCompany] req.body:', req.body);
    const { verificationStatus } = req.body;
    const ALLOWED = ['pending', 'verified', 'rejected'];

    if (!ALLOWED.includes(verificationStatus)) {
      return res.status(400).json({ success: false, message: `verificationStatus must be one of: ${ALLOWED.join(', ')}.` });
    }

    const company = await Company.findById(req.params.id);
    if (!company || company.isDeleted) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    company.verificationStatus = verificationStatus;
    // Stamp the exact time of approval
    if (verificationStatus === 'verified') company.verifiedAt = new Date();
    await company.save();

    res.json({
      success: true,
      message: `Company verification status set to '${verificationStatus}'.`,
      data: { _id: company._id, name: company.name, verificationStatus: company.verificationStatus }
    });
  } catch (error) {
    console.error('[admin.verifyCompany]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── DEAL MONITORING ─────────────────────────────────────────────────────────

// @route   GET /api/admin/deals
// @desc    List all deals (admin bypass — not scoped to company)
const getDeals = async (req, res) => {
  try {
    const { page, limitValue, skip } = getPagination(req.query);
    const { status } = req.query;

    const query = { isDeleted: false };
    if (status) query.status = status;

    const [deals, total] = await Promise.all([
      Deal.find(query)
        .select('buyerCompanyId supplierCompanyId productName status quantity price createdAt')
        .skip(skip)
        .limit(limitValue)
        .sort({ createdAt: -1 })
        .lean(),
      Deal.countDocuments(query)
    ]);

    res.json({ success: true, count: deals.length, total, totalPages: Math.ceil(total / limitValue), page, data: deals });
  } catch (error) {
    console.error('[admin.getDeals]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @route   GET /api/admin/deals/:id
// @desc    View a single deal in full (admin has no participant restriction)
const getDealById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid deal ID.' });
    }

    const deal = await Deal.findById(req.params.id).select('-__v').lean();
    if (!deal || deal.isDeleted) {
      return res.status(404).json({ success: false, message: 'Deal not found.' });
    }

    res.json({ success: true, data: deal });
  } catch (error) {
    console.error('[admin.getDealById]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── RFQ MONITORING ──────────────────────────────────────────────────────────

// @route   GET /api/admin/rfq
// @desc    List all RFQs (admin bypass — not scoped to company)
const getRFQs = async (req, res) => {
  try {
    const { page, limitValue, skip } = getPagination(req.query);
    const { status } = req.query;

    const query = { isDeleted: false };
    if (status) query.status = status;

    const [rfqs, total] = await Promise.all([
      RFQ.find(query)
        .select('buyerCompanyId supplierCompanyId productName category quantity status createdAt dealId')
        .skip(skip)
        .limit(limitValue)
        .sort({ createdAt: -1 })
        .lean(),
      RFQ.countDocuments(query)
    ]);

    res.json({ success: true, count: rfqs.length, total, totalPages: Math.ceil(total / limitValue), page, data: rfqs });
  } catch (error) {
    console.error('[admin.getRFQs]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @route   GET /api/admin/rfq/:id
// @desc    View full RFQ detail
const getRFQById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid RFQ ID.' });
    }

    const rfq = await RFQ.findById(req.params.id).select('-__v').lean();
    if (!rfq || rfq.isDeleted) {
      return res.status(404).json({ success: false, message: 'RFQ not found.' });
    }

    res.json({ success: true, data: rfq });
  } catch (error) {
    console.error('[admin.getRFQById]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getUsers, toggleUserStatus, getCompanies, verifyCompany, getDeals, getDealById, getRFQs, getRFQById };
