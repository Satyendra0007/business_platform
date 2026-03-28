const mongoose = require('mongoose');
const Message = require('./message.model');
const Deal    = require('../deal/deal.model');
const { matchedData } = require('express-validator');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Helper — confirms requesting user belongs to this deal
const isDealParticipant = (deal, user) => {
  const c = user.companyId?.toString();
  return (
    deal.buyerCompanyId?.toString()    === c ||
    deal.supplierCompanyId?.toString() === c ||
    user.roles.includes('admin')
  );
};

// ─── SEND MESSAGE ────────────────────────────────────────────────────────────
// @route   POST /api/messages
// @access  Private (Deal participants only)
const sendMessage = async (req, res) => {
  try {
    const data = matchedData(req, { locations: ['body'] });
    const { dealId, text, receiverId, type, attachments } = data;

    if (!isValidId(dealId)) {
      return res.status(400).json({ success: false, message: 'Invalid dealId.' });
    }

    // Verify the deal exists and the user is a participant
    const deal = await Deal.findById(dealId).lean();
    if (!deal || deal.isDeleted) {
      return res.status(404).json({ success: false, message: 'Deal not found.' });
    }
    if (!isDealParticipant(deal, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized to message in this Deal.' });
    }

    // Closed deals are read-only — no new messages allowed
    if (deal.status === 'closed') {
      return res.status(400).json({ success: false, message: 'Cannot send messages in a closed Deal.' });
    }

    // Guard: at least text or attachments must exist (the pre-validate hook on schema also catches this)
    if (!text?.trim() && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ success: false, message: 'Message must contain text or at least one attachment.' });
    }

    const message = await Message.create({
      dealId,
      senderId:   req.user._id,
      receiverId: receiverId || undefined,
      text:       text || undefined,
      type:       type || 'text',
      attachments: attachments || [],
      // Sender is marked as read from the moment they send
      readBy: [req.user._id]
    });

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error('[sendMessage]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── FETCH MESSAGES ──────────────────────────────────────────────────────────
// @route   GET /api/messages?dealId=...&page=1&limit=20
// @access  Private (Deal participants only)
const getMessages = async (req, res) => {
  try {
    const { dealId, page = 1, limit = 20 } = req.query;

    // dealId is mandatory — messages have no meaning without a deal context
    if (!dealId || !isValidId(dealId)) {
      return res.status(400).json({ success: false, message: 'A valid dealId query param is required.' });
    }

    // Verify deal exists and user participates in it
    const deal = await Deal.findById(dealId).lean();
    if (!deal || deal.isDeleted) {
      return res.status(404).json({ success: false, message: 'Deal not found.' });
    }
    if (!isDealParticipant(deal, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view messages in this Deal.' });
    }

    const limitValue = Math.min(parseInt(limit), 50);
    const pageValue  = Math.max(parseInt(page), 1);
    const skip       = (pageValue - 1) * limitValue;

    // Fetch messages — sorted newest first for chat UX (client reverses for display)
    const [messages, total] = await Promise.all([
      Message.find({ dealId, isDeleted: false })
        .select('-__v -isDeleted')
        .skip(skip)
        .limit(limitValue)
        .sort({ createdAt: -1 })
        .lean(),
      Message.countDocuments({ dealId, isDeleted: false })
    ]);

    // READ RECEIPT: Mark unread messages as read by the current user
    // Using updateMany to avoid N individual saves — operates only on truly unread ones
    await Message.updateMany(
      { dealId, isDeleted: false, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );

    res.json({
      success: true,
      count: messages.length,
      total,
      totalPages: Math.ceil(total / limitValue),
      page: pageValue,
      data: messages
    });
  } catch (error) {
    console.error('[getMessages]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { sendMessage, getMessages };
