const mongoose = require('mongoose');

// ShippingRequest — raised by a deal participant (buyer or supplier) when the
// deal reaches the 'shipping_request' stage. Shipping agents browse open requests
// and submit bids WITHOUT seeing deal pricing, maintaining rate confidentiality.
const shippingRequestSchema = new mongoose.Schema({

  // ── DEAL LINK ─────────────────────────────────────────────────────────────
  // Every shipping request MUST belong to a deal — no orphaned requests allowed.
  dealId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'Deal',
    required: true,
    index: true
  },

  // ── REQUESTER ─────────────────────────────────────────────────────────────
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdByRole: { type: String, enum: ['buyer', 'supplier'], required: true },

  // ── CARGO DETAILS (exposed to agents — NO pricing) ────────────────────────
  origin:       { type: String, required: true },   // e.g. "Shanghai, CN"
  destination:  { type: String, required: true },   // e.g. "Los Angeles, US"
  cargoDetails: { type: String },                   // description of goods
  quantity:     { type: Number },                   // units / CBM / weight
  incoterm:     { type: String, uppercase: true },  // FOB, CIF, etc.

  // ── STATUS ────────────────────────────────────────────────────────────────
  // 'open'   → accepting bids
  // 'closed' → a bid has been accepted, no new bids processed
  status: {
    type:    String,
    enum:    ['open', 'closed'],
    default: 'open'
  },

  isDeleted: { type: Boolean, default: false }

}, { timestamps: true });

// Compound index: agent dashboard lists open requests sorted by newest
shippingRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('ShippingRequest', shippingRequestSchema);
