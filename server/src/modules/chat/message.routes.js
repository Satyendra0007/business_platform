const express = require('express');
const router  = express.Router();
const { sendMessage, getMessages } = require('./message.controller');
const { sendMessageValidation }    = require('./message.validator');
const { validateRequest }          = require('../../middleware/validate.middleware');
const { protect }                  = require('../../middleware/auth.middleware');

// All message routes require authentication
router.use(protect);

// POST /api/messages       → send a message to a deal thread
// GET  /api/messages       → fetch paginated messages (?dealId=...&page=1&limit=20)
router.post('/', sendMessageValidation, validateRequest, sendMessage);
router.get('/',  getMessages);

module.exports = router;
