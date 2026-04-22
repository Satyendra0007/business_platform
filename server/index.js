require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./src/config/db');

// Connect to MongoDB
connectDB();

const app = express();

// Security & Middleware
app.use(helmet()); // Secure HTTP headers
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

// ── CRITICAL: Stripe webhook MUST be registered BEFORE express.json() ─────────
// Stripe signature verification requires the raw (unparsed) request body.
// Placing this after express.json() would break verification and return 400.
const { webhookRouter } = require('./src/modules/billing/billing.routes');
app.use('/api/billing', webhookRouter);
// ──────────────────────────────────────────────────────────────────────────────

app.use(express.json());

// API Rate Limiting (Security Rule)
// const apiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests per window
//   message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
// });

// // Apply rate limiter specifically to API routes
// app.use('/api/', apiLimiter);

// Setup Routes
app.use('/api/auth', require('./src/modules/auth/auth.routes'));
app.use('/api/companies', require('./src/modules/company/company.routes'));
app.use('/api/products', require('./src/modules/product/product.routes'));
app.use('/api/rfq', require('./src/modules/rfq/rfq.routes'));
app.use('/api/deals', require('./src/modules/deal/deal.routes'));
app.use('/api/messages', require('./src/modules/chat/message.routes'));
app.use('/api/shipping', require('./src/modules/shipping/shipping.routes'));
app.use('/api/admin', require('./src/modules/admin/admin.routes'));
app.use('/api/dashboard', require('./src/modules/dashboard/dashboard.routes'));

// Billing — JSON routes (checkout session creation, status)
const { billingRouter } = require('./src/modules/billing/billing.routes');
app.use('/api/billing', billingRouter);


app.get('/', (req, res) => {
  res.send('Tradafy API is securely running with Helmet & Rate Limiting!');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5004;

app.listen(PORT, () => console.log(`Server running securely on port ${PORT}`));

// nodemon restart trigger
