const mongoose  = require('mongoose');
const Deal            = require('../deal/deal.model');
const ShippingRequest = require('./shippingRequest.model');
const ShippingBid     = require('./shippingBid.model');
const { matchedData } = require('express-validator');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ─── Helper: verify deal participant ─────────────────────────────────────────
// Returns true if the requesting user belongs to the buyer or supplier company,
// OR is the assigned shipping agent on this deal (after bid acceptance),
// OR is an admin.
const isDealParticipant = (deal, user) => {
  const c  = user.companyId?.toString();
  const uid = user._id?.toString();
  return (
    deal.buyerCompanyId?.toString()    === c   ||  // buyer company member
    deal.supplierCompanyId?.toString() === c   ||  // supplier company member
    deal.shippingAgentId?.toString()   === uid ||  // assigned freight agent
    user.roles.includes('admin')
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// BUYER / SUPPLIER ACTIONS
// ══════════════════════════════════════════════════════════════════════════════

// ─── CREATE SHIPPING REQUEST ──────────────────────────────────────────────────
// @route   POST /api/shipping/request
// @access  Private — deal participant (buyer / supplier)
const createShippingRequest = async (req, res) => {
  try {
    const data = matchedData(req, { locations: ['body'] });
    const { dealId } = data;

    // Validate deal exists and user is a participant
    const deal = await Deal.findById(dealId).lean();
    if (!deal || deal.isDeleted) {
      return res.status(404).json({ success: false, message: 'Deal not found.' });
    }
    if (!isDealParticipant(deal, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized to raise a shipping request on this Deal.' });
    }

    // Deal must be at 'shipping_request' stage before a freight request can be raised
    if (deal.status !== 'shipping_request') {
      return res.status(400).json({
        success: false,
        message: `Deal must be in 'shipping_request' status to raise a freight request. Current status: '${deal.status}'.`
      });
    }

    // Prevent duplicate requests on the same deal
    const existing = await ShippingRequest.findOne({ dealId, isDeleted: false }).lean();
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A shipping request already exists for this Deal.',
        shippingRequestId: existing._id
      });
    }

    // Determine caller role for record-keeping
    const createdByRole =
      deal.buyerCompanyId?.toString() === req.user.companyId?.toString()
        ? 'buyer'
        : 'supplier';

    const shippingRequest = await ShippingRequest.create({
      ...data,
      createdBy:     req.user._id,
      createdByRole
    });

    // Link the request back to the deal
    await Deal.findByIdAndUpdate(dealId, { shippingRequestId: shippingRequest._id });

    res.status(201).json({ success: true, data: shippingRequest });
  } catch (error) {
    console.error('[createShippingRequest]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── GET SHIPPING REQUEST BY DEAL ─────────────────────────────────────────────
// @route   GET /api/shipping/request/:dealId
// @access  Private — deal participant (buyer / supplier)
const getShippingRequest = async (req, res) => {
  try {
    if (!isValidId(req.params.dealId)) {
      return res.status(400).json({ success: false, message: 'Invalid dealId.' });
    }

    const deal = await Deal.findById(req.params.dealId).lean();
    if (!deal || deal.isDeleted) {
      return res.status(404).json({ success: false, message: 'Deal not found.' });
    }
    if (!isDealParticipant(deal, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const request = await ShippingRequest.findOne({ dealId: req.params.dealId, isDeleted: false }).lean();
    if (!request) {
      return res.status(404).json({ success: false, message: 'No shipping request found for this Deal.' });
    }

    res.json({ success: true, data: request });
  } catch (error) {
    console.error('[getShippingRequest]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── GET BIDS FOR A REQUEST (PAGINATED) ──────────────────────────────────────
// @route   GET /api/shipping/bids/:requestId?page=1&limit=20
// @access  Private — deal participant (buyer / supplier)
const getShippingBids = async (req, res) => {
  try {
    if (!isValidId(req.params.requestId)) {
      return res.status(400).json({ success: false, message: 'Invalid requestId.' });
    }

    const shippingRequest = await ShippingRequest.findById(req.params.requestId).lean();
    if (!shippingRequest || shippingRequest.isDeleted) {
      return res.status(404).json({ success: false, message: 'Shipping request not found.' });
    }

    // Verify deal participation or agent role
    const deal = await Deal.findById(shippingRequest.dealId).lean();
    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal not found.' });
    }
    const isParticipant = isDealParticipant(deal, req.user);
    const isAgentUser = req.user.roles?.includes('shipping_agent');

    if (!isParticipant && !isAgentUser) {
      return res.status(403).json({ success: false, message: 'Not authorized to view bids on this request.' });
    }

    const { page = 1, limit = 20 } = req.query;
    const limitValue = Math.min(parseInt(limit), 50);
    const pageValue  = Math.max(parseInt(page), 1);
    const skip       = (pageValue - 1) * limitValue;

    const query = { shippingRequestId: req.params.requestId, isDeleted: false };

    const [bids, total] = await Promise.all([
      ShippingBid.find(query)
        .select('-__v')
        .populate('agentId', 'firstName lastName email')
        .skip(skip)
        .limit(limitValue)
        .sort({ createdAt: 1 })
        .lean(),
      ShippingBid.countDocuments(query)
    ]);

    res.json({
      success: true,
      count: bids.length,
      total,
      totalPages: Math.ceil(total / limitValue),
      page: pageValue,
      data: bids
    });
  } catch (error) {
    console.error('[getShippingBids]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── ACCEPT BID (TRANSACTIONAL) ───────────────────────────────────────────────
// @route   POST /api/shipping/bid/:id/accept
// @access  Private — deal participant (buyer / supplier)
// All writes are wrapped in a MongoDB multi-document transaction so that if any
// step fails, every change is rolled back atomically — no partial state persisted.
const acceptBid = async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid bid ID.' });
  }

  // Start a client session for the transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // ── PRE-FLIGHT READS (outside transaction — read-only guards) ────────────
    const bid = await ShippingBid.findById(req.params.id).session(session);
    if (!bid || bid.isDeleted) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Shipping bid not found.' });
    }
    if (bid.status !== 'pending') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: `Bid is already '${bid.status}' and cannot be accepted.` });
    }

    const shippingRequest = await ShippingRequest.findById(bid.shippingRequestId).session(session);
    if (!shippingRequest || shippingRequest.isDeleted) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Associated shipping request not found.' });
    }
    if (shippingRequest.status === 'closed') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: 'This shipping request is already closed.' });
    }

    const deal = await Deal.findById(shippingRequest.dealId).session(session);
    if (!deal || deal.isDeleted) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Associated deal not found.' });
    }
    if (!isDealParticipant(deal, req.user)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ success: false, message: 'Not authorized to accept bids on this Deal.' });
    }

    // ── TRANSACTIONAL WRITES ────────────────────────────────────────────────

    // 1. Accept the winning bid
    bid.status = 'accepted';
    await bid.save({ session });

    // 2. Reject all other pending bids for this request in one query
    await ShippingBid.updateMany(
      { shippingRequestId: shippingRequest._id, _id: { $ne: bid._id }, status: 'pending' },
      { status: 'rejected' },
      { session }
    );

    // 3. Close the shipping request
    shippingRequest.status = 'closed';
    await shippingRequest.save({ session });

    // 4 & 5. Update deal — link agent, auto-advance status, log event
    deal.selectedBidId   = bid._id;
    deal.shippingAgentId = bid.agentId;
    deal.status          = 'shipping';
    deal.timeline.push({
      stage:     'shipping',
      updatedAt: new Date(),
      updatedBy: req.user._id,
      notes:     'Shipping bid accepted — freight agent confirmed.'
    });
    deal.activityLog.push({
      action:    `Shipping bid accepted. Agent assigned: ${bid.agentId}`,
      userId:    req.user._id,
      timestamp: new Date()
    });
    // Cap activityLog at 100 entries (same rule as deal.controller.js)
    if (deal.activityLog.length > 100) deal.activityLog = deal.activityLog.slice(-100);
    await deal.save({ session });

    // ── COMMIT ──────────────────────────────────────────────────────────────
    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: 'Bid accepted. Deal has moved to shipping stage.',
      data: {
        bid,
        deal: { _id: deal._id, status: deal.status, shippingAgentId: deal.shippingAgentId }
      }
    });
  } catch (error) {
    // Roll back everything if any write fails
    await session.abortTransaction();
    session.endSession();
    console.error('[acceptBid]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// SHIPPING AGENT ACTIONS
// ══════════════════════════════════════════════════════════════════════════════

// ─── LIST OPEN SHIPPING REQUESTS ─────────────────────────────────────────────
// @route   GET /api/shipping/requests
// @access  Private — shipping_agent only
// SECURITY: Only returns cargo-level fields for the request. The deal itself
//           (pricing, payment terms, buyer/supplier identities) is NOT populated
//           to preserve commercial confidentiality.
const listOpenRequests = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const limitValue = Math.min(parseInt(limit), 50);
    const pageValue  = Math.max(parseInt(page), 1);
    const skip       = (pageValue - 1) * limitValue;

    const [requests, total] = await Promise.all([
      ShippingRequest.find({ status: 'open', isDeleted: false })
        // Deliberately select ONLY cargo fields — no deal pricing or company identifiers
        .select('origin destination cargoDetails quantity incoterm createdAt')
        .skip(skip)
        .limit(limitValue)
        .sort({ createdAt: -1 })
        .lean(),
      ShippingRequest.countDocuments({ status: 'open', isDeleted: false })
    ]);

    res.json({
      success: true,
      count: requests.length,
      total,
      totalPages: Math.ceil(total / limitValue),
      page: pageValue,
      data: requests
    });
  } catch (error) {
    console.error('[listOpenRequests]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── SUBMIT SHIPPING BID ──────────────────────────────────────────────────────
// @route   POST /api/shipping/bid
// @access  Private — shipping_agent only
const submitBid = async (req, res) => {
  try {
    const data = matchedData(req, { locations: ['body'] });
    const { shippingRequestId } = data;

    const shippingRequest = await ShippingRequest.findById(shippingRequestId).lean();
    if (!shippingRequest || shippingRequest.isDeleted) {
      return res.status(404).json({ success: false, message: 'Shipping request not found.' });
    }
    if (shippingRequest.status !== 'open') {
      return res.status(400).json({ success: false, message: 'This shipping request is no longer accepting bids.' });
    }

    // Prevent duplicate bids from the same agent on the same request
    const duplicateBid = await ShippingBid.findOne({
      shippingRequestId,
      agentId: req.user._id,
      isDeleted: false
    }).lean();
    if (duplicateBid) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a bid for this shipping request.',
        bidId: duplicateBid._id
      });
    }

    const bid = await ShippingBid.create({
      ...data,
      agentId: req.user._id
    });

    res.status(201).json({ success: true, data: bid });
  } catch (error) {
    console.error('[submitBid]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  createShippingRequest,
  getShippingRequest,
  getShippingBids,
  acceptBid,
  listOpenRequests,
  submitBid
};
