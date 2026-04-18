/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting requests per IP
 */

const rateLimit = require('express-rate-limit');

const isProduction = process.env.NODE_ENV === 'production';

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Login endpoint limiter - strict in production, relaxed in development.
const loginLimiter = rateLimit({
  windowMs: toNumber(process.env.AUTH_LOGIN_WINDOW_MS, 15 * 60 * 1000),
  max: toNumber(process.env.AUTH_LOGIN_MAX, isProduction ? 10 : 100),
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.',
  },
});

// Registration limiter - higher than login to avoid blocking legitimate signups.
const registerLimiter = rateLimit({
  windowMs: toNumber(process.env.AUTH_REGISTER_WINDOW_MS, 15 * 60 * 1000),
  max: toNumber(process.env.AUTH_REGISTER_MAX, isProduction ? 20 : 100),
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many registration attempts, please try again later.',
  },
});

module.exports = { apiLimiter, loginLimiter, registerLimiter };
