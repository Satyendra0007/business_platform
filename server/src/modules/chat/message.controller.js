const mongoose = require('mongoose');
const Message = require('./message.model');
const Deal    = require('../deal/deal.model');
const { matchedData } = require('express-validator');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Helper — confirms requesting user belongs to this deal.
// Includes the assigned shipping agent (populated after bid acceptance)
// so they can participate in deal messaging without holding a company role.
const isDealParticipant = (deal, user) => {
  const c   = user.companyId?.toString();
  const uid = user._id?.toString();
  return (
    deal.buyerCompanyId?.toString()    === c   ||  // buyer company member
    deal.supplierCompanyId?.toString() === c   ||  // supplier company member
    deal.shippingAgentId?.toString()   === uid ||  // assigned freight agent
    user.roles.includes('admin')
  );
};

const isShippingAgentUser = (user) =>
  user.roles?.includes('shipping_agent') && !user.roles?.includes('admin');

const senderSelect = 'firstName lastName email companyId';

// ─── SEND MESSAGE ────────────────────────────────────────────────────────────
// @route   POST /api/messages
// @access  Private (Deal participants only)
const sendMessage = async (req, res) => {
  try {
    if (isShippingAgentUser(req.user)) {
      return res.status(403).json({ success: false, message: 'Shipping agents cannot access commercial deal chat.' });
    }

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

    // Receiver validation: receiverId must belong to one of the deal's user-level participants.
    // This prevents a user from sending a message tagged to an unrelated user.
    // Allowed participant IDs: buyerUserId, supplierUserId, shippingAgentId.
    if (receiverId) {
      const allowedReceiverIds = [
        deal.buyerUserId?.toString(),
        deal.supplierUserId?.toString(),
        deal.shippingAgentId?.toString()
      ].filter(Boolean); // remove undefined/null for deals without all participants yet

      if (!allowedReceiverIds.includes(receiverId.toString())) {
        return res.status(400).json({
          success: false,
          message: 'receiverId must be a participant of this Deal (buyer, supplier, or shipping agent).'
        });
      }
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

    await message.populate('senderId', senderSelect);

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
    if (isShippingAgentUser(req.user)) {
      return res.status(403).json({ success: false, message: 'Shipping agents cannot access commercial deal chat.' });
    }

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
        .populate('senderId', senderSelect)
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
