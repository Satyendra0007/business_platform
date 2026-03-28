const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  dealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional for global deal chat
  
  // IMPROVEMENT 2: Added message type for future extensibility (system, file, text)
  type: { type: String, enum: ['text', 'file', 'system'], default: 'text' },
  
  // IMPROVEMENT 1: Trim whitespace from text to prevent empty/whitespace-only messages
  text: { type: String, trim: true },
  
  // IMPROVEMENT 3: Structured attachments — capped at 5 to prevent unbounded array growth
  attachments: {
    type: [{
      url:  { type: String, required: true },
      type: { type: String },
      name: { type: String }
    }],
    validate: {
      validator: (val) => val.length <= 5,
      message: 'A message cannot have more than 5 attachments.'
    }
  },
  
  // Future-ready placeholder for read receipts
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Soft delete — never hard-delete B2B communications
  isDeleted: { type: Boolean, default: false }

}, { timestamps: true });

// IMPROVEMENT 4: Validating that a message must contain either text or an attachment
messageSchema.pre('validate', function() {
  const hasText = this.text && this.text.trim().length > 0;
  const hasAttachments = this.attachments && this.attachments.length > 0;
  
  if (!hasText && !hasAttachments) {
    throw new Error('A message must contain either text or an attachment.');
  }
});

// Compound index for paginated chat history (most common query)
messageSchema.index({ dealId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
// Index to efficiently find unread messages for a user in a deal
messageSchema.index({ dealId: 1, readBy: 1 });

module.exports = mongoose.model('Message', messageSchema);
