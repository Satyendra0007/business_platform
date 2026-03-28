const { validationResult } = require('express-validator');

// Centralized middleware to check for express-validator errors
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Log validation failures for backend debugging (Architecture Rule: Optional logging)
    console.error(`[Validation Failed] on ${req.method} ${req.originalUrl}:`, errors.array());

    // Cleanly map the raw express-validator objects into a clear { field, message } format
    const extractedErrors = errors.array().map(err => ({
      field: err.path || err.param, // 'path' is preferred in express-validator v7+
      message: err.msg
    }));

    // Return 400 immediately, protecting the controller completely from bad payloads
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed',
      errors: extractedErrors 
    });
  }
  next();
};

module.exports = { validateRequest };
