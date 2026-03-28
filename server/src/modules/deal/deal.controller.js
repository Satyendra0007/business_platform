const mongoose = require('mongoose');
const Deal    = require('./deal.model');
const { matchedData } = require('express-validator');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Sequential lifecycle map — each stage only moves forward to the next allowed stage(s)
// Prevents a deal from jumping from 'inquiry' straight to 'closed' etc.
const VALID_TRANSITIONS = {
  inquiry:     ['negotiation', 'closed'],
  negotiation: ['agreement',   'closed'],
  agreement:   ['payment',     'closed'],
  payment:     ['production',  'closed'],
  production:  ['shipping',    'closed'],
  shipping:    ['delivery',    'closed'],
  delivery:    ['closed'],
  closed:      [] // Terminal state
};

// Helper — checks if the requesting user is a participant of this deal
const isParticipant = (deal, user) => {
  const c = user.companyId?.toString();
  return (
    deal.buyerCompanyId?.toString()    === c ||
    deal.supplierCompanyId?.toString() === c ||
    user.roles.includes('admin')
  );
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

    // Participants see deals where they are buyer or supplier company
    const companyId = req.user.companyId;
    const query = {
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
        .select('buyerCompanyId supplierCompanyId productName status quantity price createdAt')
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
      data: deals
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

    const deal = await Deal.findById(req.params.id).select('-__v').lean();
    if (!deal || deal.isDeleted) {
      return res.status(404).json({ success: false, message: 'Deal not found.' });
    }

    if (!isParticipant(deal, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this Deal.' });
    }

    res.json({ success: true, data: deal });
  } catch (error) {
    console.error('[getDealById]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── UPDATE DEAL DETAILS ─────────────────────────────────────────────────────
// @route   PUT /api/deals/:id
// @access  Private (participants only)
const updateDeal = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Deal ID.' });
    }

    const data = matchedData(req, { locations: ['body'] });
    if (Object.keys(data).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided for update.' });
    }

    const deal = await Deal.findById(req.params.id).lean();
    if (!deal || deal.isDeleted) {
      return res.status(404).json({ success: false, message: 'Deal not found.' });
    }

    if (!isParticipant(deal, req.user)) {
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

    if (!isParticipant(deal, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this Deal.' });
    }

    if (deal.status === 'closed') {
      return res.status(400).json({ success: false, message: 'Cannot change status of a closed Deal.' });
    }

    if (deal.status === status) {
      return res.status(400).json({ success: false, message: `Deal is already at status '${status}'.` });
    }

    // IMPROVEMENT 1: Enforce sequential transitions — prevent invalid stage jumps
    const allowed = VALID_TRANSITIONS[deal.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from '${deal.status}' to '${status}'. Allowed next stages: ${allowed.join(', ') || 'none'}.`
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

module.exports = { createDeal, getDeals, getDealById, updateDeal, updateDealStatus };
