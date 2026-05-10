const mongoose = require('mongoose');

const CATEGORIES = [
  'legal_document_review',
  'legal_support',
  'tradification',
  'credibility_report',
  'private_labeling',
  'business_expansion',
];

const STATUSES = ['pending', 'contacted', 'completed'];

const attachmentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: '' },
    fileType: { type: String, default: '' },
    originalName: { type: String, default: '' },
  },
  { _id: false }
);

const serviceRequestSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
    },
    category: {
      type: String,
      enum: CATEGORIES,
      required: true,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'pending',
    },
    formData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    attachments: [attachmentSchema],
  },
  { timestamps: true }
);

// Compound index for admin listing & filtering
serviceRequestSchema.index({ category: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.STATUSES = STATUSES;
