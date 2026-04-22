const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Will use bcryptjs for hashing

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  
  // IMPROVEMENT 2 & 3: Normalize email spacing/casing and firmly index for lookup speed
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    index: true 
  },
  
  // IMPROVEMENT 1: Password field is secured and stripped from default API GET requests
  password: { type: String, required: true, select: false },
  
  // IMPROVEMENT 5: Role is an array to flexibly support "both" (e.g. ['buyer', 'supplier'])
  roles: [{ type: String, enum: ['buyer', 'supplier', 'admin', 'shipping_agent'] }],
  
  // Phone number in E.164 format (e.g. +919876543210)
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },

  // Set to true once user completes Twilio OTP verification
  isPhoneVerified: { type: Boolean, default: false },

  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  isEmailVerified: { type: Boolean, default: false },

  // Profile image — Cloudinary URL supplied by the frontend after direct upload.
  // We store only the URL string; the server never handles raw file bytes.
  profileImage: { type: String },

  // IMPROVEMENT 4: Active status flag to allow Admins to suspend/ban accounts cleanly
  isActive: { type: Boolean, default: true },

  // Subscription plan — controls deal/chat/document limits.
  // ONLY updated by the Stripe webhook — never directly from the frontend.
  plan: {
    type: String,
    enum: ['free', 'business', 'premium'],
    default: 'free'
  },

  // Stripe billing fields — populated by webhook only
  stripeCustomerId:     { type: String, default: null },
  stripeSubscriptionId: { type: String, default: null },
  subscriptionStatus:   {
    type: String,
    enum: ['active', 'canceled', 'past_due', 'trialing', 'unpaid', null],
    default: null
  }
}, { timestamps: true });

// IMPROVEMENT 6: Critical pre-save hook that hashes passwords natively via bcryptjs
userSchema.pre('save', async function() {
  // Only hash the password if it has been modified (or is newly created)
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);
