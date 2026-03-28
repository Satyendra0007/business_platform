const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String },
  coverImage: { type: String },
  description: { type: String },

  // Location
  country: { type: String, required: true },
  city: { type: String },

  // Business Info
  industry: { type: String },
  companyType: { type: String },
  yearEstablished: { type: Number },
  numberOfEmployees: { type: String },
  website: { type: String },

  // Trade Info (Limiting array growth)
  mainProducts: [{ type: String }],
  exportMarkets: [{ type: String }],

  // Verification Workflow ensuring Admins have B2B legal control
  verificationStatus: { 
    type: String, 
    enum: ['draft', 'submitted', 'pending', 'verified', 'rejected'],
    default: 'draft' 
  },
  verifiedAt: { type: Date },

  // Subscription gating for SaaS
  subscriptionPlan: { type: String, default: 'Free' },
  subscriptionStatus: { type: String, default: 'active' },

  // Metadata
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false }

}, { timestamps: true });

// INDEXING: Text index for search functionality, country for filtering, and verificationStatus for admin queries.
companySchema.index({ name: 'text' });
companySchema.index({ country: 1 });
companySchema.index({ verificationStatus: 1 });

module.exports = mongoose.model('Company', companySchema);
