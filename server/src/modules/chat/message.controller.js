const mongoose = require('mongoose');
const Message = require('./message.model');
const Deal    = require('../deal/deal.model');
const { getIO } = require('../../socket');
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

const getAttachmentType = (url = '', explicitType = '') => {
  const value = `${explicitType || url}`.toLowerCase();
  if (value.endsWith('.pdf')) return 'pdf';
  if (value.endsWith('.doc') || value.endsWith('.docx')) return 'doc';
  if (value.endsWith('.xls') || value.endsWith('.xlsx')) return 'xls';
  return explicitType || 'file';
};

const getAttachmentName = (url = '', index = 0) => {
  try {
    const parsed = new URL(url);
    const fileName = parsed.pathname.split('/').filter(Boolean).pop();
    if (fileName) return decodeURIComponent(fileName);
  } catch {
    // fall through
  }
  return `Attachment ${index + 1}`;
};

const normalizeAttachmentUrl = (url = '') => {
  const value = String(url || '').trim();
  if (!value) return '';
  return /^https?:\/\//i.test(value) ? value : `https://${value.replace(/^\/+/, '')}`;
};

const safeFilename = (value = 'attachment') => String(value)
  .replace(/["\r\n]/g, '_')
  .replace(/[<>]/g, '_');

const getContentTypeFromName = (name = '') => {
  const lower = String(name).toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.doc')) return 'application/msword';
  if (lower.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  return 'application/octet-stream';
};

const resolveAttachmentUrl = (url = '') => {
  const normalized = normalizeAttachmentUrl(url);
  if (!normalized) return '';
  const candidates = [normalized];
  if (/\/image\/upload\//i.test(normalized) && /\.(pdf|docx?|xlsx?)($|\?)/i.test(normalized)) {
    candidates.push(normalized.replace('/image/upload/', '/raw/upload/'));
  }
  return candidates;
};

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

    const normalizedAttachments = Array.isArray(attachments)
      ? attachments.map((attachment, index) => {
          if (typeof attachment === 'string') {
            return {
              url: attachment,
              type: getAttachmentType(attachment),
              name: getAttachmentName(attachment, index)
            };
          }

          if (attachment && typeof attachment === 'object' && attachment.url) {
            return {
              url: attachment.url,
              type: getAttachmentType(attachment.url, attachment.type),
              name: attachment.name || getAttachmentName(attachment.url, index)
            };
          }

          return null;
        }).filter(Boolean)
      : [];

    const message = await Message.create({
      dealId,
      senderId:   req.user._id,
      receiverId: receiverId || undefined,
      text:       text || undefined,
      type:       type || 'text',
      attachments: normalizedAttachments,
      // Sender is marked as read from the moment they send
      readBy: [req.user._id]
    });

    await message.populate('senderId', senderSelect);

    try {
      const io = getIO();
      io.to(`deal_${dealId}`).emit('chat:new_message', message);
    } catch (socketErr) {
      console.error('[Socket emit error chat:new_message]', socketErr);
    }

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

// ─── DOWNLOAD ATTACHMENT ────────────────────────────────────────────────────
// @route   GET /api/messages/:messageId/attachments/:attachmentIndex/download
// @access  Private (Deal participants only)
const downloadAttachment = async (req, res) => {
  try {
    if (isShippingAgentUser(req.user)) {
      return res.status(403).json({ success: false, message: 'Shipping agents cannot access commercial deal chat.' });
    }

    const { messageId, attachmentIndex } = req.params;
    const index = Number.parseInt(attachmentIndex, 10);
    if (!isValidId(messageId) || Number.isNaN(index)) {
      return res.status(400).json({ success: false, message: 'Invalid download request.' });
    }

    const message = await Message.findById(messageId).lean();
    if (!message || message.isDeleted) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }

    const deal = await Deal.findById(message.dealId).lean();
    if (!deal || deal.isDeleted) {
      return res.status(404).json({ success: false, message: 'Deal not found.' });
    }
    if (!isDealParticipant(deal, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized to download attachments in this Deal.' });
    }

    const attachment = Array.isArray(message.attachments) ? message.attachments[index] : null;
    if (!attachment?.url) {
      return res.status(404).json({ success: false, message: 'Attachment not found.' });
    }

    const candidates = resolveAttachmentUrl(attachment.url);
    let upstreamResponse = null;
    let selectedUrl = '';
    for (const candidate of candidates) {
      try {
        upstreamResponse = await fetch(candidate);
        selectedUrl = candidate;
        if (upstreamResponse.ok) break;
      } catch (error) {
        upstreamResponse = null;
      }
    }

    if (!upstreamResponse || !upstreamResponse.ok) {
      return res.status(502).json({ success: false, message: 'Unable to fetch attachment from storage.' });
    }

    const contentType = upstreamResponse.headers.get('content-type') || getContentTypeFromName(attachment.name || selectedUrl);
    const buffer = Buffer.from(await upstreamResponse.arrayBuffer());
    const filename = safeFilename(attachment.name || getAttachmentName(selectedUrl, index));

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(buffer);
  } catch (error) {
    console.error('[downloadAttachment]', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { sendMessage, getMessages, downloadAttachment };
