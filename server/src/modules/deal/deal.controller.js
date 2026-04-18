const mongoose = require('mongoose');
const Deal    = require('./deal.model');
const { matchedData } = require('express-validator');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Sequential lifecycle map — each stage only moves forward to the next allowed stage(s)
// Prevents a deal from jumping from 'inquiry' straight to 'closed' etc.
const VALID_TRANSITIONS = {
  inquiry:          ['negotiation',     'closed'],
  negotiation:      ['agreement',       'closed'],
  agreement:        ['payment',         'closed'],
  payment:          ['production',      'closed'],
  production:       ['shipping_request','closed'],  // must raise shipping request next
  shipping_request: ['shipping',        'closed'],  // unlocked when a bid is accepted
  shipping:         ['delivery',        'closed'],
  delivery:         ['closed'],
  closed:           []                              // terminal
};

// Helper — checks if the requesting user is a participant of this deal.
// Accepts: buyer company member, supplier company member,
//          the assigned shipping agent (User._id match), or admin.
const isParticipant = (deal, user) => {
  const c   = user.companyId?.toString();
  const uid = user._id?.toString();
  return (
    deal.buyerCompanyId?.toString()    === c   ||  // buyer company
    deal.supplierCompanyId?.toString() === c   ||  // supplier company
    deal.shippingAgentId?.toString()   === uid ||  // assigned freight agent
    user.roles.includes('admin')
  );
};

const isShippingAgentUser = (user) =>
  user.roles?.includes('shipping_agent') && !user.roles?.includes('admin');

const isAssignedShippingAgent = (deal, user) =>
  deal.shippingAgentId?.toString() === user._id?.toString();

const isCompanyParticipant = (deal, user) => {
  const c = user.companyId?.toString();
  return (
    deal.buyerCompanyId?.toString()    === c ||
    deal.supplierCompanyId?.toString() === c ||
    user.roles.includes('admin')
  );
};

const sanitizeForShippingAgent = (deal) => {
  const shippingRequest = deal.shippingRequestId && typeof deal.shippingRequestId === 'object'
    ? deal.shippingRequestId
    : null;

  return {
    _id: deal._id,
    productName: deal.productName,
    quantity: shippingRequest?.quantity ?? deal.quantity,
    origin: shippingRequest?.origin || null,
    destination: shippingRequest?.destination || null,
    incoterm: shippingRequest?.incoterm || deal.incoterm || null,
    shipment: deal.shipment || {},
    selectedBidId: deal.selectedBidId || null,
    status: deal.status
  };
};

// ─── CREATE DEAL ─────────────────────────────────────────────────────────────
// @route   POST /api/deals
// @access  Private (Company Users)
const createDeal = async (req, res) => {
  try {
    if (!req.user.companyId) {
      return res.status(403).json({ success: false, message: 'You must belong to a Company to create a Deal.' });
    }

    const data = matchedData(req, { locations: ['body'] });

    const deal = await Deal.create({
      ...data,
      buyerCompanyId: req.user.companyId,
      buyerUserId:    req.user._id,
      // Seed the activity log from day one
      activityLog: [{
        action:    'Deal created',
        userId:    req.user._id,
        timestamp: new Date()
      }],
      timeline: [{
        stage:     'inquiry',
        updatedAt: new Date(),
        updatedBy: req.user._id,
        notes:     'Deal opened'
      }]
    });

    res.status(201).json({ success: true, data: deal });
  } catch (error) {
    console.error('[createDeal]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── LIST DEALS ──────────────────────────────────────────────────────────────
// @route   GET /api/deals
// @access  Private (participants see only their deals)
const getDeals = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const shippingAgentView = isShippingAgentUser(req.user);
    const companyId = req.user.companyId;
    const userId = req.user._id;

    const query = shippingAgentView
      ? { isDeleted: false, shippingAgentId: userId }
      : {
          isDeleted: false,
          $or: [
            { buyerCompanyId: companyId },
            { supplierCompanyId: companyId }
          ]
        };

    if (status) query.status = status;

    const limitValue = Math.min(parseInt(limit), 50);
    const pageValue  = Math.max(parseInt(page), 1);
    const skip       = (pageValue - 1) * limitValue;

    const [deals, total] = await Promise.all([
      Deal.find(query)
        .select(
          shippingAgentView
            ? 'productName quantity incoterm status shipment selectedBidId shippingAgentId shippingRequestId'
            : 'buyerCompanyId supplierCompanyId shippingAgentId selectedBidId productName status quantity price shipment createdAt'
        )
        .populate('shippingRequestId', 'origin destination incoterm quantity')
        .skip(skip)
        .limit(limitValue)
        .sort({ createdAt: -1 })
        .lean(),
      Deal.countDocuments(query)
    ]);

    res.json({
      success: true,
      count: deals.length,
      total,
      totalPages: Math.ceil(total / limitValue),
      page: pageValue,
      data: shippingAgentView ? deals.map(sanitizeForShippingAgent) : deals
    });
  } catch (error) {
    console.error('[getDeals]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── GET SINGLE DEAL ─────────────────────────────────────────────────────────
// @route   GET /api/deals/:id
// @access  Private (participants only)
const getDealById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Deal ID.' });
    }

    const shippingAgentView = isShippingAgentUser(req.user);

    const deal = await Deal.findById(req.params.id)
      .select('-__v')
      .populate('shippingRequestId', 'origin destination incoterm quantity')
      .lean();
    if (!deal || deal.isDeleted) {
      return res.status(404).json({ success: false, message: 'Deal not found.' });
    }

    if (shippingAgentView) {
      if (!isAssignedShippingAgent(deal, req.user)) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this Deal.' });
      }
    } else if (!isParticipant(deal, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this Deal.' });
    }

    res.json({ success: true, data: shippingAgentView ? sanitizeForShippingAgent(deal) : deal });
  } catch (error) {
    console.error('[getDealById]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── UPDATE DEAL DETAILS ─────────────────────────────────────────────────────
// @route   PUT /api/deals/:id
// @access  Private (participants only)
// WHITELIST: Only trade fields may be updated here. Shipping references
// (shippingAgentId, selectedBidId) and lifecycle field (status) are
// managed by the shipping workflow only — not by direct PUT payload.
const updateDeal = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Deal ID.' });
    }

    // Strict whitelist — only safe trade fields accepted via PUT /deals/:id
    const ALLOWED_UPDATE_FIELDS = ['quantity', 'price', 'paymentTerms', 'incoterm', 'productName'];
    const raw  = matchedData(req, { locations: ['body'] });
    const data = Object.fromEntries(
      Object.entries(raw).filter(([k]) => ALLOWED_UPDATE_FIELDS.includes(k))
    );

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided for update.' });
    }

    const deal = await Deal.findById(req.params.id).lean();
    if (!deal || deal.isDeleted) {
      return res.status(404).json({ success: false, message: 'Deal not found.' });
    }

    if (!isCompanyParticipant(deal, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this Deal.' });
    }

    if (deal.status === 'closed') {
      return res.status(400).json({ success: false, message: 'A closed Deal cannot be modified.' });
    }

    const updated = await Deal.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true, runValidators: true }
    ).lean();

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('[updateDeal]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── UPDATE STATUS (CRITICAL) ────────────────────────────────────────────────
// @route   PATCH /api/deals/:id/status
// @access  Private (participants only)
// On every status change:
//   1. update deal.status
//   2. push a timeline entry  (auditable stage log)
//   3. push an activityLog entry (general event log)
const updateDealStatus = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Deal ID.' });
    }

    const data = matchedData(req, { locations: ['body'] });
    const { status, notes } = data;

    const deal = await Deal.findById(req.params.id);
    if (!deal || deal.isDeleted) {
      return res.status(404).json({ success: false, message: 'Deal not found.' });
    }

    if (!isCompanyParticipant(deal, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this Deal.' });
    }

    // Role Control Guard: ONLY the Buyer company can progress the core deal lifecycle stages.
    // The logical flow dictates that buyers approve progression. Suppliers do not dictate stage increments.
    if (deal.buyerCompanyId.toString() !== req.user.companyId?.toString()) {
      return res.status(403).json({ success: false, message: 'Only the Buyer can trigger deal progression.' });
    }

    if (deal.status === 'closed') {
      return res.status(400).json({ success: false, message: 'Cannot change status of a closed Deal.' });
    }

    if (deal.status === status) {
      return res.status(400).json({ success: false, message: `Deal is already at status '${status}'.` });
    }

    // Enforce sequential transitions
    const allowed = VALID_TRANSITIONS[deal.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from '${deal.status}' to '${status}'. Allowed next stages: ${allowed.join(', ') || 'none'}.`
      });
    }

    // ── DATA-DRIVEN STATUS GUARDS ────────────────────────────────────────────

    // Guard: shipping_request → shipping requires an accepted bid
    // acceptBid() in the shipping controller sets selectedBidId automatically.
    // Reject any manual attempt to push to 'shipping' without a confirmed bid.
    if (status === 'shipping' && !deal.selectedBidId) {
      return res.status(400).json({
        success: false,
        message: `Cannot advance to 'shipping' until a shipping bid has been accepted (selectedBidId missing).`
      });
    }

    // Guard: shipping → delivery requires agent to confirm physical delivery
    // The shipping agent must call PATCH /deals/:id/shipment with status:'delivered' first.
    if (status === 'delivery' && deal.shipment?.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: `Cannot advance to 'delivery' until shipment status is 'delivered'. Current shipment status: '${deal.shipment?.status || 'not set'}'.`
      });
    }

    // Atomic triple-write: status + timeline + activityLog
    deal.status = status;
    deal.timeline.push({
      stage:     status,
      updatedAt: new Date(),
      updatedBy: req.user._id,
      notes:     notes || ''
    });
    deal.activityLog.push({
      action:    `Status changed to '${status}'`,
      userId:    req.user._id,
      timestamp: new Date()
    });

    // IMPROVEMENT 2: Cap activityLog at 100 entries — drop oldest if exceeded
    if (deal.activityLog.length > 100) {
      deal.activityLog = deal.activityLog.slice(-100);
    }

    await deal.save();

    res.json({ success: true, message: `Deal status updated to '${status}'.`, data: deal });
  } catch (error) {
    console.error('[updateDealStatus]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── UPDATE SHIPMENT STATUS ───────────────────────────────────────────────────
// @route   PATCH /api/deals/:id/shipment
// @access  Private (shipping agent assigned to this deal, or admin)
// Allows the shipping agent to push incremental shipment milestone updates
// (booking → loaded → in_transit → delivered) without touching deal status.
const updateShipment = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Deal ID.' });
    }

    const deal = await Deal.findById(req.params.id);
    if (!deal || deal.isDeleted) {
      return res.status(404).json({ success: false, message: 'Deal not found.' });
    }

    // Only the assigned shipping agent or an admin can update shipment
    const uid = req.user._id?.toString();
    const isAgent = deal.shippingAgentId?.toString() === uid;
    const isAdmin = req.user.roles.includes('admin');

    if (!isAgent && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned shipping agent or an admin can update shipment details.'
      });
    }

    // Deal must be in shipping stage for meaningful shipment updates
    if (!['shipping', 'delivery'].includes(deal.status)) {
      return res.status(400).json({
        success: false,
        message: `Shipment updates are only allowed when deal is in 'shipping' or 'delivery' stage. Current: '${deal.status}'.`
      });
    }

    const SHIPMENT_STATUSES = ['booking', 'loaded', 'in_transit', 'delivered'];
    const { status, notes } = req.body;

    if (status && !SHIPMENT_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid shipment status. Allowed: ${SHIPMENT_STATUSES.join(', ')}.`
      });
    }

    // Build the update payload — only apply provided fields
    const shipmentUpdate = { 'shipment.updatedAt': new Date() };
    if (status) shipmentUpdate['shipment.status'] = status;
    if (notes !== undefined) shipmentUpdate['shipment.notes'] = notes;

    const updated = await Deal.findByIdAndUpdate(
      req.params.id,
      { $set: shipmentUpdate },
      { new: true, runValidators: true }
    ).lean();

    // Log the event in activityLog
    await Deal.findByIdAndUpdate(req.params.id, {
      $push: {
        activityLog: {
          action:    `Shipment status updated to '${status || deal.shipment?.status}'`,
          userId:    req.user._id,
          timestamp: new Date()
        }
      }
    });

    res.json({
      success: true,
      message: `Shipment status updated to '${updated.shipment.status}'.`,
      data: { shipment: updated.shipment }
    });
  } catch (error) {
    console.error('[updateShipment]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { createDeal, getDeals, getDealById, updateDeal, updateDealStatus, updateShipment };
