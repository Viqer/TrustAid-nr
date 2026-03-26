/**
 * Donation Routes
 */

const express = require('express');
const router = express.Router();
const Joi = require('joi');

const donationController = require('../controllers/donationController');
const auth = require('../middleware/auth');
const allowRoles = require('../middleware/roles');
const validate = require('../middleware/validate');
const asyncHandler = require('../middleware/asyncHandler');

// Validation schemas
const createDonationSchema = Joi.object({
  amount: Joi.number().min(1).required(),
  currency: Joi.string().valid('USD', 'EUR', 'GBP', 'INR').optional(),
  campaignId: Joi.string().required(),
  paymentMethod: Joi.string().valid('CARD', 'BANK_TRANSFER', 'CRYPTO', 'PAYPAL').optional(),
  donorMessage: Joi.string().trim().optional(),
  isAnonymous: Joi.boolean().optional(),
});

const confirmDonationSchema = Joi.object({
  blockchainTxHash: Joi.string().required(),
  blockNumber: Joi.number().optional(),
  network: Joi.string().valid('ETHEREUM', 'POLYGON', 'BINANCE').optional(),
  status: Joi.string().valid('CONFIRMED', 'FAILED').optional(),
});

// Routes
router.post(
  '/',
  auth,
  allowRoles('DONOR'),
  validate(createDonationSchema),
  asyncHandler(donationController.createDonation)
);

router.patch(
  '/:donationId/confirm',
  validate(confirmDonationSchema),
  asyncHandler(donationController.confirmDonation)
);

router.get(
  '/:donationId',
  asyncHandler(donationController.getDonation)
);

router.get(
  '/me/donations',
  auth,
  allowRoles('DONOR'),
  asyncHandler(donationController.getDonorDonations)
);

router.get(
  '/campaign/:campaignId/donations',
  asyncHandler(donationController.getCampaignDonations)
);

module.exports = router;
