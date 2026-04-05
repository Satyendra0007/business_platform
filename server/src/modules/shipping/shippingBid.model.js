const mongoose = require('mongoose');

// ShippingBid — submitted by a shipping_agent in response to an open ShippingRequest.
// When a bid is accepted: deal.selectedBidId and deal.shippingAgentId are populated,
// deal status transitions to 'shipping', and all other bids on the request are rejected.
const shippingBidSchema = new mongoose.Schema({

  // ── REQUEST LINK ──────────────────────────────────────────────────────────
  shippingRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'ShippingRequest',
    required: true,
    index: true
  },

  // ── AGENT ─────────────────────────────────────────────────────────────────
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User',
    required: true,
    index: true
  },

  // ── BID DETAILS ───────────────────────────────────────────────────────────
  price:         { type: Number },       // quoted freight price
  transportType: {
    type: String,
    enum: ['sea', 'air', 'land']
  },
  transitTime:   { type: String },       // e.g. "14-18 days"
  services:      [{ type: String }],     // e.g. ["customs", "door-to-door"]
  validity:      { type: Date },         // bid expiry date
  notes:         { type: String },       // free-text remarks from agent
  documents:     [{ type: String }],     // URLs to supporting docs (max enforced in validator)

  // ── STATUS LIFECYCLE ──────────────────────────────────────────────────────
  // pending  → default, awaiting buyer/supplier decision
  // accepted → buyer/supplier chose this bid; deal moves to 'shipping'
  // rejected → buyer chose another bid OR request was closed without this bid winning
  status: {
    type:    String,
    enum:    ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },

  isDeleted: { type: Boolean, default: false }

}, { timestamps: true });

// Compound: fast lookup of all pending bids for a specific request (buyer/supplier view)
shippingBidSchema.index({ shippingRequestId: 1, status: 1 });
// Compound: agent dashboard — "show me all my bids, newest first"
shippingBidSchema.index({ agentId: 1, createdAt: -1 });

module.exports = mongoose.model('ShippingBid', shippingBidSchema);
