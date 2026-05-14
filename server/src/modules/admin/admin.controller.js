const mongoose = require('mongoose');
const User = require('../user/user.model');
const Company = require('../company/company.model');
const Deal = require('../deal/deal.model');
const RFQ = require('../rfq/rfq.model');
const Product = require('../product/product.model');
const ServiceRequest = require('../serviceRequest/serviceRequest.model');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Shared pagination helpers
const getPagination = (query) => {
  const page = Math.max(parseInt(query.page || 1), 1);
  const limitValue = Math.min(parseInt(query.limit || 20), 50);
  const skip = (page - 1) * limitValue;
  return { page, limitValue, skip };
};

// ─── ANALYTICS ────────────────────────────────────────────────────────────────

// @route   GET /api/admin/analytics
// @desc    Aggregate platform-wide operational metrics (all queries run in parallel)
const getAnalytics = async (req, res) => {
  try {
    const [
      totalUsers,
      totalSuppliers,
      totalBuyers,
      totalShippingAgents,
      totalCompanies,
      verifiedCompanies,
      pendingVerifications,
      totalProducts,
      activeProducts,
      totalRFQs,
      activeDeals,
      premiumUsers,
      activateUsers,
      credibilityReports,
      legalReviews,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ roles: 'supplier' }),
      User.countDocuments({ roles: 'buyer' }),
      User.countDocuments({ roles: 'shipping_agent' }),
      Company.countDocuments({ isDeleted: false }),
      Company.countDocuments({ isDeleted: false, verificationStatus: 'verified' }),
      Company.countDocuments({ isDeleted: false, verificationStatus: { $in: ['pending', 'submitted'] } }),
      Product.countDocuments({ isDeleted: false }),
      Product.countDocuments({ isDeleted: false, isActive: true }),
      RFQ.countDocuments({}),
      Deal.countDocuments({ status: { $in: ['active', 'open', 'in_progress'] } }),
      User.countDocuments({ plan: 'premium', subscriptionStatus: 'active' }),
      User.countDocuments({ plan: 'business', subscriptionStatus: 'active' }),
      ServiceRequest.countDocuments({ category: 'credibility_report' }),
      ServiceRequest.countDocuments({ category: 'legal_document_review' }),
    ]);

    res.json({
      success: true,
      data: {
        users: { total: totalUsers, suppliers: totalSuppliers, buyers: totalBuyers, shippingAgents: totalShippingAgents },
        companies: { total: totalCompanies, verified: verifiedCompanies, pendingVerification: pendingVerifications },
        products: { total: totalProducts, active: activeProducts },
        deals: { active: activeDeals },
        rfqs: { total: totalRFQs },
        subscriptions: { premium: premiumUsers, activate: activateUsers },
        services: { credibilityReports, legalReviews },
      },
    });
  } catch (error) {
    console.error('[admin.getAnalytics]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
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

// @route   GET /api/admin/users/:id
// @desc    Get full detail of a single user
const getUserById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID.' });
    }
    const user = await User.findById(req.params.id).select('-password').lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('[admin.getUserById]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @route   PUT /api/admin/users/:id
// @desc    Edit user basic info (firstName, lastName, email, phone)
const updateUser = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID.' });
    }
    const ALLOWED = ['firstName', 'lastName', 'email', 'phone'];
    const data = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => ALLOWED.includes(k))
    );
    if (Object.keys(data).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided.' });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    Object.assign(user, data);
    await user.save();
    const result = user.toObject();
    delete result.password;
    res.json({ success: true, message: 'User updated.', data: result });
  } catch (error) {
    console.error('[admin.updateUser]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @route   PATCH /api/admin/users/:id/role
// @desc    Change user roles
const updateUserRole = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID.' });
    }
    const { roles } = req.body;
    const VALID_ROLES = ['buyer', 'supplier', 'admin', 'shipping_agent'];
    if (!Array.isArray(roles) || roles.length === 0 || !roles.every(r => VALID_ROLES.includes(r))) {
      return res.status(400).json({ success: false, message: `roles must be a non-empty array of: ${VALID_ROLES.join(', ')}.` });
    }
    // Self-protection: admin cannot change their own roles
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Admins cannot change their own roles.' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { roles },
      { new: true, runValidators: true }
    ).select('-password').lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, message: 'User roles updated.', data: user });
  } catch (error) {
    console.error('[admin.updateUserRole]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @route   PATCH /api/admin/users/:id/plan
// @desc    Manually override user subscription plan
const updateUserPlan = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID.' });
    }
    const { plan } = req.body;
    const VALID_PLANS = ['free', 'business', 'premium'];
    if (!VALID_PLANS.includes(plan)) {
      return res.status(400).json({ success: false, message: `plan must be one of: ${VALID_PLANS.join(', ')}.` });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { plan },
      { new: true, runValidators: true }
    ).select('-password').lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, message: `Plan updated to '${plan}'.`, data: user });
  } catch (error) {
    console.error('[admin.updateUserPlan]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @route   PATCH /api/admin/users/:id/verify
// @desc    Toggle phone/email verification flags
const verifyUser = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID.' });
    }
    const update = {};
    if (req.body.isPhoneVerified !== undefined) update.isPhoneVerified = !!req.body.isPhoneVerified;
    if (req.body.isEmailVerified !== undefined) update.isEmailVerified = !!req.body.isEmailVerified;
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ success: false, message: 'Provide isPhoneVerified and/or isEmailVerified.' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    ).select('-password').lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, message: 'Verification status updated.', data: user });
  } catch (error) {
    console.error('[admin.verifyUser]', error);
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
        // Include all fields so admin can review full profile including logo and description
        .select('name logo coverImage description country city industry companyType yearEstablished numberOfEmployees website mainProducts exportMarkets documents verificationStatus subscriptionPlan isActive createdAt')
        .skip(skip)
        .limit(limitValue)
        .sort({ createdAt: -1 })
        .lean(),
      Company.countDocuments(query)
    ]);

    const companyIds = companies.map((company) => company._id);
    const [linkedUsers, linkedProducts] = companyIds.length > 0
      ? await Promise.all([
        User.find({ companyId: { $in: companyIds } })
          .select('firstName lastName email phone roles companyId createdAt')
          .sort({ createdAt: 1 })
          .lean(),
        Product.find({ companyId: { $in: companyIds }, isDeleted: false })
          .select('title category price unit MOQ companyId createdAt isActive')
          .sort({ createdAt: -1 })
          .lean(),
      ])
      : [[], []];

    const ownerByCompanyId = new Map();
    linkedUsers.forEach((user) => {
      const key = user.companyId?.toString();
      if (!key || ownerByCompanyId.has(key)) return;

      ownerByCompanyId.set(key, {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        phone: user.phone || null,
        roles: user.roles || [],
        createdAt: user.createdAt,
      });
    });

    const productsByCompanyId = new Map();
    linkedProducts.forEach((product) => {
      const key = product.companyId?.toString();
      if (!key) return;
      if (!productsByCompanyId.has(key)) productsByCompanyId.set(key, []);
      productsByCompanyId.get(key).push(product);
    });

    const enrichedCompanies = companies.map((company) => {
      const key = company._id.toString();
      const products = productsByCompanyId.get(key) || [];
      return {
        ...company,
        registeredBy: ownerByCompanyId.get(key) || null,
        products,
        productCount: products.length,
      };
    });

    res.json({ success: true, count: enrichedCompanies.length, total, totalPages: Math.ceil(total / limitValue), page, data: enrichedCompanies });
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
    if (verificationStatus === 'verified') company.verifiedAt = new Date();

    // Recompute trust score on verification change
    const linkedUser = await User.findOne({ companyId: company._id }).select('plan subscriptionStatus').lean();
    const { computeTrustScore } = require('../../lib/trustScore');
    const { score, visibilityBoost } = computeTrustScore({
      verificationStatus: company.verificationStatus,
      isActive: company.isActive,
      documents: company.documents,
      userPlan: linkedUser?.plan || 'free',
      subscriptionStatus: linkedUser?.subscriptionStatus || null,
    });
    company.trustScore = score;
    company.visibilityBoost = visibilityBoost;

    await company.save();

    res.json({
      success: true,
      message: `Company verification status set to '${verificationStatus}'.`,
      data: { _id: company._id, name: company.name, verificationStatus: company.verificationStatus, trustScore: company.trustScore }
    });
  } catch (error) {
    console.error('[admin.verifyCompany]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


// @route   GET /api/admin/companies/:id
// @desc    Full company detail view (all fields including documents)
const getCompanyById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid company ID.' });
    }
    const company = await Company.findById(req.params.id).select('-__v').lean();
    if (!company || company.isDeleted) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }
    res.json({ success: true, data: company });
  } catch (error) {
    console.error('[admin.getCompanyById]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @route   PUT /api/admin/companies/:id
// @desc    Admin edit company info
const updateCompany = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid company ID.' });
    }
    const ALLOWED = ['name', 'country', 'city', 'industry', 'companyType', 'description', 'yearEstablished', 'numberOfEmployees', 'website', 'mainProducts', 'exportMarkets'];
    const data = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => ALLOWED.includes(k))
    );
    if (Object.keys(data).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided.' });
    }
    const company = await Company.findById(req.params.id);
    if (!company || company.isDeleted) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }
    Object.assign(company, data);
    await company.save();
    res.json({ success: true, message: 'Company updated.', data: company });
  } catch (error) {
    console.error('[admin.updateCompany]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @route   PATCH /api/admin/companies/:id/toggle-status
// @desc    Suspend or reactivate a company
const toggleCompanyStatus = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid company ID.' });
    }
    const company = await Company.findById(req.params.id);
    if (!company || company.isDeleted) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }
    company.isActive = !company.isActive;
    await company.save();
    res.json({
      success: true,
      message: `Company has been ${company.isActive ? 'reactivated' : 'suspended'}.`,
      data: { _id: company._id, name: company.name, isActive: company.isActive }
    });
  } catch (error) {
    console.error('[admin.toggleCompanyStatus]', error);
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
        .select('buyerCompanyId supplierCompanyId productName status quantity price shipment createdAt')
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

// Sequential lifecycle map — admin still respects valid transitions
const VALID_TRANSITIONS = {
  inquiry: ['negotiation', 'closed'],
  negotiation: ['agreement', 'closed'],
  agreement: ['payment', 'closed'],
  payment: ['production', 'closed'],
  production: ['shipping_request', 'closed'],
  shipping_request: ['shipping', 'closed'],
  shipping: ['delivery', 'closed'],
  delivery: ['closed'],
  closed: []
};

const DEAL_STAGES = ['inquiry', 'negotiation', 'agreement', 'payment', 'production', 'shipping_request', 'shipping', 'delivery', 'closed'];

// @route   PATCH /api/admin/deals/:id/status
// @desc    Admin force-update deal status (bypasses buyer-only guard, still validates transitions)
const updateDealStatus = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid deal ID.' });
    }
    const { status, notes } = req.body;
    if (!status || !DEAL_STAGES.includes(status)) {
      return res.status(400).json({ success: false, message: `status must be one of: ${DEAL_STAGES.join(', ')}.` });
    }
    const deal = await Deal.findById(req.params.id);
    if (!deal || deal.isDeleted) {
      return res.status(404).json({ success: false, message: 'Deal not found.' });
    }
    if (deal.status === 'closed') {
      return res.status(400).json({ success: false, message: 'Cannot change status of a closed Deal.' });
    }
    if (deal.status === status) {
      return res.status(400).json({ success: false, message: `Deal is already at status '${status}'.` });
    }
    // Enforce sequential transitions even for admin
    const allowed = VALID_TRANSITIONS[deal.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from '${deal.status}' to '${status}'. Allowed: ${allowed.join(', ') || 'none'}.`
      });
    }

    deal.status = status;
    deal.timeline.push({
      stage: status,
      updatedAt: new Date(),
      updatedBy: req.user._id,
      notes: notes || '[Admin intervention]'
    });
    deal.activityLog.push({
      action: `[Admin] Status changed to '${status}'`,
      userId: req.user._id,
      timestamp: new Date()
    });
    if (deal.activityLog.length > 100) {
      deal.activityLog = deal.activityLog.slice(-100);
    }
    await deal.save();
    res.json({ success: true, message: `Deal status updated to '${status}'.`, data: deal });
  } catch (error) {
    console.error('[admin.updateDealStatus]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @route   PATCH /api/admin/deals/:id/shipment
// @desc    Admin override shipment status (relaxes stage guard)
const updateDealShipment = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid deal ID.' });
    }
    const deal = await Deal.findById(req.params.id);
    if (!deal || deal.isDeleted) {
      return res.status(404).json({ success: false, message: 'Deal not found.' });
    }
    const SHIPMENT_STATUSES = ['booking', 'loaded', 'in_transit', 'delivered'];
    const { status, notes } = req.body;
    if (status && !SHIPMENT_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid shipment status. Allowed: ${SHIPMENT_STATUSES.join(', ')}.` });
    }
    const shipmentUpdate = { 'shipment.updatedAt': new Date() };
    if (status) shipmentUpdate['shipment.status'] = status;
    if (notes !== undefined) shipmentUpdate['shipment.notes'] = notes;

    const updated = await Deal.findByIdAndUpdate(
      req.params.id,
      {
        $set: shipmentUpdate,
        $push: {
          activityLog: {
            action: `[Admin] Shipment status updated to '${status || deal.shipment?.status}'`,
            userId: req.user._id,
            timestamp: new Date()
          }
        }
      },
      { new: true, runValidators: true }
    ).lean();

    res.json({ success: true, message: `Shipment updated.`, data: { shipment: updated.shipment } });
  } catch (error) {
    console.error('[admin.updateDealShipment]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @route   PATCH /api/admin/deals/:id/resolve
// @desc    Force-close a stuck deal with admin notes
const resolveDeal = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid deal ID.' });
    }
    const deal = await Deal.findById(req.params.id);
    if (!deal || deal.isDeleted) {
      return res.status(404).json({ success: false, message: 'Deal not found.' });
    }
    if (deal.status === 'closed') {
      return res.status(400).json({ success: false, message: 'Deal is already closed.' });
    }
    const { notes } = req.body;
    deal.status = 'closed';
    deal.timeline.push({
      stage: 'closed',
      updatedAt: new Date(),
      updatedBy: req.user._id,
      notes: notes || '[Admin resolved — force closed]'
    });
    deal.activityLog.push({
      action: '[Admin] Deal force-resolved/closed',
      userId: req.user._id,
      timestamp: new Date()
    });
    await deal.save();
    res.json({ success: true, message: 'Deal has been resolved and closed.', data: deal });
  } catch (error) {
    console.error('[admin.resolveDeal]', error);
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

// @route   PUT /api/admin/rfq/:id
// @desc    Admin edit RFQ fields
const updateRFQ = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid RFQ ID.' });
    }
    const ALLOWED = ['productName', 'category', 'quantity', 'targetPrice', 'destinationCountry', 'deliveryTimeline', 'incoterm', 'specifications', 'remarks'];
    const data = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => ALLOWED.includes(k))
    );
    if (Object.keys(data).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided.' });
    }
    const rfq = await RFQ.findById(req.params.id).lean();
    if (!rfq || rfq.isDeleted) {
      return res.status(404).json({ success: false, message: 'RFQ not found.' });
    }
    if (rfq.status === 'converted') {
      return res.status(400).json({ success: false, message: 'Cannot edit a converted RFQ.' });
    }
    const updated = await RFQ.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true }).lean();
    res.json({ success: true, message: 'RFQ updated.', data: updated });
  } catch (error) {
    console.error('[admin.updateRFQ]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @route   PATCH /api/admin/rfq/:id/close
// @desc    Admin force-close an RFQ (bypasses buyer-only ownership check)
const closeRFQ = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid RFQ ID.' });
    }
    const rfq = await RFQ.findById(req.params.id);
    if (!rfq || rfq.isDeleted) {
      return res.status(404).json({ success: false, message: 'RFQ not found.' });
    }
    if (rfq.status === 'converted') {
      return res.status(400).json({ success: false, message: 'A converted RFQ cannot be closed.' });
    }
    if (rfq.status === 'closed') {
      return res.status(400).json({ success: false, message: 'RFQ is already closed.' });
    }
    rfq.status = 'closed';
    await rfq.save();
    res.json({ success: true, message: 'RFQ has been closed.', data: rfq });
  } catch (error) {
    console.error('[admin.closeRFQ]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @route   PATCH /api/admin/rfq/:id/remove
// @desc    Soft-delete spam/invalid RFQs
const removeRFQ = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid RFQ ID.' });
    }
    const rfq = await RFQ.findById(req.params.id);
    if (!rfq) {
      return res.status(404).json({ success: false, message: 'RFQ not found.' });
    }
    if (rfq.isDeleted) {
      return res.status(400).json({ success: false, message: 'RFQ is already removed.' });
    }
    rfq.isDeleted = true;
    await rfq.save();
    res.json({ success: true, message: 'RFQ has been removed (soft-deleted).' });
  } catch (error) {
    console.error('[admin.removeRFQ]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
// ══════════════════════════════════════════════════════════════════════════════
// 5. PRODUCT MANAGEMENT
// ══════════════════════════════════════════════════════════════════════════════

// @route   GET /api/admin/products
// @desc    Get all products (with optional search and status filter)
const getProducts = async (req, res) => {
  try {
    const { page, limitValue, skip } = getPagination(req.query);
    const { status, search } = req.query;

    const query = { isDeleted: false };
    if (status) {
      if (status === 'active') query.isActive = true;
      else if (status === 'inactive') query.isActive = false;
    }
    if (search) query.$text = { $search: search };

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('companyId', 'name logo country verificationStatus')
        .skip(skip)
        .limit(limitValue)
        .sort({ createdAt: -1 })
        .lean(),
      Product.countDocuments(query)
    ]);

    res.json({ success: true, count: products.length, total, totalPages: Math.ceil(total / limitValue), page, data: products });
  } catch (error) {
    console.error('[admin.getProducts]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @route   GET /api/admin/products/:id
// @desc    Get a single product by ID
const getProductById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid product ID.' });
    
    const product = await Product.findById(req.params.id)
      .populate('companyId', 'name logo email phone country city verificationStatus subscriptionPlan')
      .lean();
      
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    
    res.json({ success: true, data: product });
  } catch (error) {
    console.error('[admin.getProductById]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @route   PUT /api/admin/products/:id
// @desc    Edit a product (title, category, price, MOQ, etc.)
const updateProduct = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid product ID.' });
    
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    if (product.isDeleted) return res.status(400).json({ success: false, message: 'Cannot edit a deleted product.' });

    const allowedUpdates = ['title', 'category', 'subcategory', 'description', 'price', 'unit', 'MOQ', 'availableQuantity', 'incoterm', 'countryOfOrigin', 'leadTime'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) product[field] = req.body[field];
    });

    await product.save();
    res.json({ success: true, message: 'Product updated successfully.', data: product });
  } catch (error) {
    console.error('[admin.updateProduct]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @route   PATCH /api/admin/products/:id/toggle-status
// @desc    Toggle a product's active status (suspend/reactivate)
const toggleProductStatus = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid product ID.' });
    
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    if (product.isDeleted) return res.status(400).json({ success: false, message: 'Cannot modify a deleted product.' });

    product.isActive = !product.isActive;
    await product.save();
    
    res.json({ success: true, message: `Product ${product.isActive ? 'activated' : 'deactivated'}.`, data: product });
  } catch (error) {
    console.error('[admin.toggleProductStatus]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @route   PATCH /api/admin/products/:id/remove
// @desc    Soft-delete a product
const removeProduct = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid product ID.' });
    
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    if (product.isDeleted) return res.status(400).json({ success: false, message: 'Product is already removed.' });

    product.isDeleted = true;
    product.isActive = false; // also deactivate when removing
    await product.save();
    
    res.json({ success: true, message: 'Product has been removed (soft-deleted).' });
  } catch (error) {
    console.error('[admin.removeProduct]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  // Analytics
  getAnalytics,
  // Users
  getUsers, getUserById, updateUser, toggleUserStatus, updateUserRole, updateUserPlan, verifyUser,
  // Companies
  getCompanies, getCompanyById, updateCompany, verifyCompany, toggleCompanyStatus,
  // Deals
  getDeals, getDealById, updateDealStatus, updateDealShipment, resolveDeal,
  // RFQs
  getRFQs, getRFQById, updateRFQ, closeRFQ, removeRFQ,
  // Products
  getProducts, getProductById, updateProduct, toggleProductStatus, removeProduct
};
