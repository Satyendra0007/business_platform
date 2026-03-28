const mongoose = require('mongoose');

const DEAL_STAGES = ['inquiry', 'negotiation', 'agreement', 'payment', 'production', 'shipping', 'delivery', 'closed'];

const shipmentStatuses = [
  'booking_confirmed', 'loaded', 'departed',
  'in_transit', 'arrived_at_port', 'customs_clearance', 'delivered'
];

const dealSchema = new mongoose.Schema({

  // ── COMPANY-LEVEL OWNERSHIP ──────────────────────────────────────────────
  // Deals survive user changes — ownership is always at company level
  buyerCompanyId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  supplierCompanyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },

  // ── USER-LEVEL PARTICIPATION ──────────────────────────────────────────────
  // Users operate the deal on behalf of their companies
  buyerUserId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  supplierUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // ── PRODUCT REFERENCE ────────────────────────────────────────────────────
  // productId links to catalogue; productName is the fallback for manual deals
  productId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: { type: String },

  // ── TRADE INFO ───────────────────────────────────────────────────────────
  quantity:     { type: Number },
  price:        { type: Number },
  incoterm:     { type: String, uppercase: true },
  paymentTerms: { type: String },

  // ── STATUS LIFECYCLE ─────────────────────────────────────────────────────
  status: {
    type: String,
    enum: DEAL_STAGES,
    default: 'inquiry'
  },

  // ── TIMELINE ─────────────────────────────────────────────────────────────
  // Each status transition is recorded here for full auditability
  timeline: [{
    stage:     { type: String, enum: DEAL_STAGES },
    updatedAt: { type: Date,   default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes:     { type: String }
  }],

  // ── SHIPMENT ─────────────────────────────────────────────────────────────
  // Lightweight placeholder — Phase 2 will expand this with full logistics tracking
  shipment: {
    vesselName:       { type: String },
    containerNumber:  { type: String },
    bookingReference: { type: String },
    originPort:       { type: String },
    destinationPort:  { type: String },
    estimatedDeparture: { type: Date },
    estimatedArrival:   { type: Date },
    status: { type: String, enum: shipmentStatuses }
  },

  // ── ACTIVITY LOG ─────────────────────────────────────────────────────────
  // Auditable log, kept embedded for MVP. Should be migrated to its own
  // collection if it grows beyond 100 entries per deal.
  activityLog: [{
    action:    { type: String, required: true },
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now }
  }],

  // Soft delete for compliance & audit recovery
  isDeleted: { type: Boolean, default: false }

}, { timestamps: true });

// ── INDEXES ──────────────────────────────────────────────────────────────────
dealSchema.index({ buyerCompanyId: 1 });
dealSchema.index({ supplierCompanyId: 1 });
dealSchema.index({ status: 1 });
dealSchema.index({ createdAt: -1 });
// Compound: fast lookup of all deals between two specific companies
dealSchema.index({ buyerCompanyId: 1, supplierCompanyId: 1 });
// Compound: buyer/supplier dashboard filter "show my deals by status"
dealSchema.index({ buyerCompanyId: 1, status: 1 });
dealSchema.index({ supplierCompanyId: 1, status: 1 });

module.exports = mongoose.model('Deal', dealSchema);
