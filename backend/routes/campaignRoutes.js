/**
 * Campaign Routes
 */

const express = require('express');
const router = express.Router();
const Joi = require('joi');

const campaignController = require('../controllers/campaignController');
const auth = require('../middleware/auth');
const allowRoles = require('../middleware/roles');
const validate = require('../middleware/validate');
const asyncHandler = require('../middleware/asyncHandler');

// Validation schemas
const createCampaignSchema = Joi.object({
  title: Joi.string().trim().required(),
  description: Joi.string().trim().required(),
  longDescription: Joi.string().trim().optional(),
  goalAmount: Joi.number().min(1).required(),
  currency: Joi.string().valid('USD', 'EUR', 'GBP', 'INR').optional(),
  category: Joi.string().trim().lowercase().valid('health', 'education', 'disaster-relief', 'environment', 'poverty', 'human-rights', 'arts', 'animal-welfare', 'other').required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().required(),
  beneficiaries: Joi.string().trim().required(),
  image: Joi.string().uri().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
});

const updateCampaignSchema = Joi.object({
  title: Joi.string().trim().optional(),
  description: Joi.string().trim().optional(),
  longDescription: Joi.string().trim().optional(),
  goalAmount: Joi.number().min(1).optional(),
  currency: Joi.string().valid('USD', 'EUR', 'GBP', 'INR').optional(),
  image: Joi.string().uri().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
});

// Routes
router.post(
  '/',
  auth,
  allowRoles('NGO'),
  validate(createCampaignSchema),
  asyncHandler(campaignController.createCampaign)
);

router.get(
  '/',
  asyncHandler(campaignController.listCampaigns)
);

router.get(
  '/:campaignId',
  asyncHandler(campaignController.getCampaign)
);

router.patch(
  '/:campaignId',
  auth,
  allowRoles('NGO'),
  validate(updateCampaignSchema),
  asyncHandler(campaignController.updateCampaign)
);

router.delete(
  '/:campaignId',
  auth,
  allowRoles('NGO'),
  asyncHandler(campaignController.closeCampaign)
);

module.exports = router;
