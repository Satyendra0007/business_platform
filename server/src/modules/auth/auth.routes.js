const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('./auth.controller');
const { registerValidation, loginValidation } = require('./auth.validator');
const { validateRequest } = require('../../middleware/validate.middleware');

router.post('/register', registerValidation, validateRequest, registerUser);
router.post('/login', loginValidation, validateRequest, loginUser);

module.exports = router;
