const { check } = require('express-validator');

// Register validation rules
const registerValidation = [
  check('firstName', 'First name is required').notEmpty().trim(),
  check('lastName', 'Last name is required').notEmpty().trim(),
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  check('role', 'Role is required').notEmpty(),
  // Phone must be in E.164 format: +<country_code><number>, e.g. +919876543210
  check('phone', 'Phone number is required')
    .notEmpty()
    .matches(/^\+[1-9]\d{6,14}$/)
    .withMessage('Phone must be in E.164 format (e.g. +919876543210)'),
  // profileImage is a Cloudinary URL sent by the frontend after direct upload.
  // It is fully optional; omitting it causes no validation error.
  check('profileImage')
    .optional({ nullable: true, checkFalsy: true })
    .isURL({ protocols: ['https'], require_protocol: true })
    .withMessage('profileImage must be a valid HTTPS URL')
];


// Login validation rules
const loginValidation = [
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('password', 'Password is required').exists()
];

module.exports = { registerValidation, loginValidation };
