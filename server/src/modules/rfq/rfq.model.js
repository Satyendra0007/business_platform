const mongoose = require('mongoose');

// Validator: attachments capped at 5
function attachmentLimit(val) {
  return val.length <= 5;
}

const rfqSchema = new mongoose.Schema({
  // COMPANY-FIRST OWNERSHIP — RFQ belongs to the buyer company, not just a user
  buyerCompanyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  buyerUserId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  
  // Target supplier — optional at creation, required before conversion
  supplierCompanyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },

  // DUAL PRODUCT FLOW
  // Path A: Product-based — productId links to a catalogue listing
  // Path B: Manual — productId is omitted, productName is required
  productId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: { type: String },   // auto-filled from Product if productId is present; otherwise required
  category:    { type: String },

  // Trade Info
  quantity:    { type: Number, required: true },
  targetPrice: { type: Number },

  // Logistics
  destinationCountry: { type: String },
  deliveryTimeline:   { type: String },
  incoterm:           { type: String, uppercase: true },

  // Details
  specifications: { type: String },
  remarks:        { type: String },
  attachments: {
    type: [{ type: String }],
    validate: [attachmentLimit, 'Maximum of 5 attachments allowed per RFQ']
  },

  // Status lifecycle
  status: {
    type: String,
    enum: ['open', 'in_progress', 'converted', 'closed'],
    default: 'open'
  },

  // Populated once this RFQ is converted into a Deal — creating a hard link
  dealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },

  // Soft delete — never hard-delete B2B trade records
  isDeleted: { type: Boolean, default: false }

}, { timestamps: true });

// IMPROVEMENT 2: Schema-level guard — every RFQ must reference either a product or name
rfqSchema.pre('validate', function () {
  if (!this.productId && (!this.productName || !this.productName.trim())) {
    throw new Error('An RFQ must include either a productId or a productName.');
  }
});

// INDEXING
rfqSchema.index({ buyerCompanyId: 1 });
rfqSchema.index({ supplierCompanyId: 1 });
rfqSchema.index({ status: 1 });
// IMPROVEMENT 1: Index on createdAt to back the default sort on list queries
rfqSchema.index({ createdAt: -1 });
// Compound index for supplier + status — common admin/supplier dashboard filter
rfqSchema.index({ supplierCompanyId: 1, status: 1 });
// Compound index for buyer + status — powers the buyer's own RFQ dashboard
rfqSchema.index({ buyerCompanyId: 1, status: 1 });

module.exports = mongoose.model('RFQ', rfqSchema);
