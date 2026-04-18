/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const Joi = require('joi');

const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimit');
const asyncHandler = require('../middleware/asyncHandler');

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().trim().required(),
  lastName: Joi.string().trim().required(),
  role: Joi.string().valid('DONOR', 'NGO').optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const refreshTokenSchema = Joi.object({
  token: Joi.string().required(),
});

// Routes
router.post(
  '/register',
  registerLimiter,
  validate(registerSchema),
  asyncHandler(authController.register)
);

router.post(
  '/login',
  loginLimiter,
  validate(loginSchema),
  asyncHandler(authController.login)
);

router.post(
  '/refresh-token',
  validate(refreshTokenSchema),
  asyncHandler(authController.refreshToken)
);

module.exports = router;
