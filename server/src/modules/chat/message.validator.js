const { check } = require('express-validator');

const sendMessageValidation = [
  check('dealId', 'dealId is required and must be a valid ID').notEmpty().isMongoId(),
  check('text').optional().trim(),
  check('receiverId').optional().isMongoId(),
  // Type is optional — defaults to 'text' in schema
  check('type').optional().isIn(['text', 'file', 'system'])
];

module.exports = { sendMessageValidation };
