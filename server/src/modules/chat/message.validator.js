const { check } = require('express-validator');

const sendMessageValidation = [
  check('dealId', 'dealId is required and must be a valid ID').notEmpty().isMongoId(),

  check('text').optional().trim(),

  check('receiverId').optional().isMongoId().withMessage('receiverId must be a valid ObjectId'),

  // Type defaults to 'text' in schema — optional here
  check('type').optional().isIn(['text', 'file', 'system']).withMessage('type must be text, file, or system'),

  // Attachments: optional array, max 5 items, each item must be a valid URL
  check('attachments')
    .optional()
    .isArray({ max: 5 })
    .withMessage('attachments must be an array with a maximum of 5 items'),

  check('attachments.*')
    .optional()
    .isURL()
    .withMessage('Each attachment must be a valid URL')
];

module.exports = { sendMessageValidation };
