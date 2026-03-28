const mongoose = require('mongoose');

function arrayLimit(val) {
  return val.length <= 5;
}

const productSchema = new mongoose.Schema({
  // Products belong to Companies — never to individual users
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: { type: String },
  description: { type: String },

  // Trade Info
  price: { type: Number },
  unit: { type: String },
  MOQ: { type: Number },
  incoterm: { type: String, uppercase: true },
  countryOfOrigin: { type: String },
  availableQuantity: { type: Number },
  leadTime: { type: String },

  // Additional
  packagingDetails: { type: String },
  certifications: {
    type: [{ type: String }],
    validate: [arrayLimit, 'Exceeds the permitted limit of 5 certifications']
  },

  // Media — store URLs only (Cloudinary/S3)
  images: {
    type: [{ type: String }],
    validate: [arrayLimit, 'Exceeds the limit of 5 image URLs per product']
  },
  videoUrl: { type: String },
  specSheet: { type: String },

  // Metadata
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false }

}, { timestamps: true });

// OPTIMIZED INDEXES
productSchema.index({ companyId: 1 });
productSchema.index({ category: 1 });
// Compound text index covering title AND description for richer search relevance
productSchema.index({ title: 'text', description: 'text' });
// Price index enables fast range filtering ($gte, $lte)
productSchema.index({ price: 1 });
// IMPROVEMENT 3: createdAt index to prevent full-scan on default sort
productSchema.index({ createdAt: -1 });
// IMPROVEMENT 5: Compound index for category + price range filtering (common B2B use case)
productSchema.index({ category: 1, price: 1 });

module.exports = mongoose.model('Product', productSchema);
