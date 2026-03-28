const { check } = require('express-validator');

// Register validation rules
const registerValidation = [
  check('firstName', 'First name is required').notEmpty().trim(),
  check('lastName', 'Last name is required').notEmpty().trim(),
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  check('role', 'Role is required').notEmpty()
];

// Login validation rules
const loginValidation = [
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('password', 'Password is required').exists()
];

module.exports = { registerValidation, loginValidation };
