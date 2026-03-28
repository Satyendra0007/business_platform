const mongoose = require('mongoose');
const RFQ     = require('./rfq.model');
const Deal    = require('../deal/deal.model');
const Product = require('../product/product.model');
const { matchedData } = require('express-validator');

// ─── Helpers ────────────────────────────────────────────────────────────────

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ─── CREATE RFQ ─────────────────────────────────────────────────────────────
// @route   POST /api/rfq
// @access  Private (Buyer Company Users only)
const createRFQ = async (req, res) => {
  try {
    if (!req.user.companyId) {
      return res.status(403).json({ success: false, message: 'You must be linked to a Company to create an RFQ.' });
    }

    const data = matchedData(req, { locations: ['body'] });

    let productName      = data.productName;
    let category         = data.category;
    let supplierCompanyId = data.supplierCompanyId; // may be explicitly passed or auto-resolved below

    // DUAL PRODUCT FLOW — path A: productId was provided
    if (data.productId) {
      if (!isValidId(data.productId)) {
        return res.status(400).json({ success: false, message: 'Invalid productId.' });
      }
      // Include companyId so we can auto-resolve the supplier
      const product = await Product.findById(data.productId).select('title category companyId isDeleted').lean();
      if (!product || product.isDeleted) {
        return res.status(404).json({ success: false, message: 'Referenced product not found.' });
      }
      // Auto-fill name & category from the product catalogue
      productName = productName || product.title;
      category    = category    || product.category;

      // AUTO-ASSIGN SUPPLIER: product.companyId IS the supplier company — no manual step needed
      // Only override if the caller did not explicitly supply one
      if (!supplierCompanyId && product.companyId) {
        supplierCompanyId = product.companyId;
      }
    } else {
      // Path B: manual — productName is then mandatory
      if (!productName || !productName.trim()) {
        return res.status(400).json({
          success: false,
          message: 'productName is required when no productId is provided.'
        });
      }
    }

    const rfq = await RFQ.create({
      ...data,
      productName,
      category,
      supplierCompanyId,            // auto-resolved or caller-supplied
      buyerCompanyId: req.user.companyId,
      buyerUserId:    req.user._id,
      // in_progress whenever a supplier is known (either auto-resolved via productId or manually passed)
      status: supplierCompanyId ? 'in_progress' : 'open'
    });

    res.status(201).json({ success: true, data: rfq });
  } catch (error) {
    console.error('[createRFQ ERROR]', error.message || error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message || error });
  }
};

// ─── LIST RFQs ──────────────────────────────────────────────────────────────
// @route   GET /api/rfq
// @access  Private
const getRFQs = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    // Users only see RFQs belonging to their own company
    const query = {
      isDeleted: false,
      buyerCompanyId: req.user.companyId
    };

    if (status) query.status = status;

    const limitValue = Math.min(parseInt(limit), 50);
    const pageValue  = Math.max(parseInt(page), 1);
    const skip       = (pageValue - 1) * limitValue;

    const [rfqs, total] = await Promise.all([
      RFQ.find(query)
        .select('productName category quantity status createdAt supplierCompanyId dealId')
        .skip(skip)
        .limit(limitValue)
        .sort({ createdAt: -1 })
        .lean(),
      RFQ.countDocuments(query)
    ]);

    res.json({
      success: true,
      count: rfqs.length,
      total,
      totalPages: Math.ceil(total / limitValue),
      page: pageValue,
      data: rfqs
    });
  } catch (error) {
    console.error('[getRFQs]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── GET SINGLE RFQ ─────────────────────────────────────────────────────────
// @route   GET /api/rfq/:id
// @access  Private (Buyer or Supplier participant)
const getRFQById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid RFQ ID.' });
    }

    const rfq = await RFQ.findById(req.params.id).select('-__v').lean();

    if (!rfq || rfq.isDeleted) {
      return res.status(404).json({ success: false, message: 'RFQ not found.' });
    }

    // SECURITY: Only buyer or supplier company users can view this RFQ
    const userCompany    = req.user.companyId?.toString();
    const isBuyer        = rfq.buyerCompanyId?.toString()    === userCompany;
    const isSupplier     = rfq.supplierCompanyId?.toString() === userCompany;
    const isAdmin        = req.user.roles.includes('admin');

    if (!isBuyer && !isSupplier && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this RFQ.' });
    }

    res.json({ success: true, data: rfq });
  } catch (error) {
    console.error('[getRFQById]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── UPDATE RFQ ─────────────────────────────────────────────────────────────
// @route   PUT /api/rfq/:id
// @access  Private (Buyer only, RFQ must be open)
const updateRFQ = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid RFQ ID.' });
    }

    const data = matchedData(req, { locations: ['body'] });
    if (Object.keys(data).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided for update.' });
    }

    const rfq = await RFQ.findById(req.params.id).lean();
    if (!rfq || rfq.isDeleted) {
      return res.status(404).json({ success: false, message: 'RFQ not found.' });
    }

    // Only the buyer company can edit their own RFQ
    if (rfq.buyerCompanyId.toString() !== req.user.companyId?.toString()) {
      return res.status(403).json({ success: false, message: 'Only the buyer can update this RFQ.' });
    }

    // Cannot mutate a converted or closed RFQ
    if (['converted', 'closed'].includes(rfq.status)) {
      return res.status(400).json({ success: false, message: `Cannot update an RFQ with status '${rfq.status}'.` });
    }

    const updated = await RFQ.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true }).lean();
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('[updateRFQ]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── CLOSE RFQ ──────────────────────────────────────────────────────────────
// @route   PATCH /api/rfq/:id/close
// @access  Private (Buyer only)
const closeRFQ = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid RFQ ID.' });
    }

    const rfq = await RFQ.findById(req.params.id);
    if (!rfq || rfq.isDeleted) {
      return res.status(404).json({ success: false, message: 'RFQ not found.' });
    }

    if (rfq.buyerCompanyId.toString() !== req.user.companyId?.toString()) {
      return res.status(403).json({ success: false, message: 'Only the buyer can close this RFQ.' });
    }

    if (rfq.status === 'converted') {
      return res.status(400).json({ success: false, message: 'A converted RFQ cannot be closed manually.' });
    }

    rfq.status = 'closed';
    await rfq.save();

    res.json({ success: true, message: 'RFQ has been closed.', data: rfq });
  } catch (error) {
    console.error('[closeRFQ]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── CONVERT RFQ → DEAL ─────────────────────────────────────────────────────
// @route   POST /api/rfq/:id/convert
// @access  Private (Buyer only)
const convertRFQtoDeal = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid RFQ ID.' });
    }

    const rfq = await RFQ.findById(req.params.id);
    if (!rfq || rfq.isDeleted) {
      return res.status(404).json({ success: false, message: 'RFQ not found.' });
    }

    // Only the buyer company triggers conversion
    if (rfq.buyerCompanyId.toString() !== req.user.companyId?.toString()) {
      return res.status(403).json({ success: false, message: 'Only the buyer can convert this RFQ into a Deal.' });
    }

    if (rfq.status !== 'open' && rfq.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: `RFQ with status '${rfq.status}' cannot be converted.` });
    }

    // IMPROVEMENT 4: Block duplicate conversion — one RFQ can only yield one Deal
    if (rfq.dealId) {
      return res.status(400).json({ success: false, message: 'This RFQ has already been converted into a Deal.', dealId: rfq.dealId });
    }

    // A supplier must be known before a Deal can be created
    if (!rfq.supplierCompanyId) {
      return res.status(400).json({ success: false, message: 'A supplierCompanyId must be set on the RFQ before conversion.' });
    }

    // Resolve optional supplierUserId from request body (caller may pass it)
    const { supplierUserId } = req.body;

    // CREATE DEAL — map RFQ fields directly, preserving both company & user references
    const deal = await Deal.create({
      buyerCompanyId:    rfq.buyerCompanyId,
      supplierCompanyId: rfq.supplierCompanyId,
      buyerUserId:       rfq.buyerUserId,
      supplierUserId:    supplierUserId || undefined,
      productId:         rfq.productId  || undefined,
      quantity:          rfq.quantity,
      price:             rfq.targetPrice,
      incoterm:          rfq.incoterm,
      status:            'inquiry',
      activityLog: [{
        action:    `Deal created from RFQ #${rfq._id}`,
        userId:    req.user._id,
        timestamp: new Date()
      }]
    });

    // Mark RFQ as converted and link to the newly born Deal
    rfq.status = 'converted';
    rfq.dealId = deal._id;
    await rfq.save();

    res.status(201).json({
      success: true,
      message: 'RFQ successfully converted to Deal.',
      data: { rfqId: rfq._id, deal }
    });
  } catch (error) {
    console.error('[convertRFQtoDeal]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── ASSIGN SUPPLIER ──────────────────────────────────────────────
// @route   PATCH /api/rfq/:id/assign-supplier
// @access  Private (Buyer only)
const assignSupplier = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid RFQ ID.' });
    }

    const { supplierCompanyId } = req.body;
    if (!supplierCompanyId || !isValidId(supplierCompanyId)) {
      return res.status(400).json({ success: false, message: 'A valid supplierCompanyId is required.' });
    }

    const rfq = await RFQ.findById(req.params.id);
    if (!rfq || rfq.isDeleted) {
      return res.status(404).json({ success: false, message: 'RFQ not found.' });
    }

    // Only buyer company can assign the target supplier
    if (rfq.buyerCompanyId.toString() !== req.user.companyId?.toString()) {
      return res.status(403).json({ success: false, message: 'Only the buyer can assign a supplier to this RFQ.' });
    }

    if (['converted', 'closed'].includes(rfq.status)) {
      return res.status(400).json({ success: false, message: `Cannot assign a supplier to an RFQ with status '${rfq.status}'.` });
    }

    rfq.supplierCompanyId = supplierCompanyId;
    // Automatically move to in_progress now that a supplier is targeted
    if (rfq.status === 'open') rfq.status = 'in_progress';
    await rfq.save();

    res.json({ success: true, message: 'Supplier assigned successfully.', data: rfq });
  } catch (error) {
    console.error('[assignSupplier]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { createRFQ, getRFQs, getRFQById, updateRFQ, closeRFQ, convertRFQtoDeal, assignSupplier };
