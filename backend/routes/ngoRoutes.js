/**
 * NGO Routes
 */

const express = require('express');
const router = express.Router();
const Joi = require('joi');

const ngoController = require('../controllers/ngoController');
const auth = require('../middleware/auth');
const allowRoles = require('../middleware/roles');
const validate = require('../middleware/validate');
const asyncHandler = require('../middleware/asyncHandler');

// Validation schemas
const applyNgoSchema = Joi.object({
  organizationName: Joi.string().trim().required(),
  registrationNumber: Joi.string().trim().required(),
  description: Joi.string().trim().required(),
  website: Joi.string().uri().optional(),
  phone: Joi.string().required(),
  address: Joi.object({
    street: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    zipCode: Joi.string().optional(),
    country: Joi.string().optional(),
  }).optional(),
});

const documentSchema = Joi.object({
  documentType: Joi.string().valid('registration', 'taxExemption', 'other').required(),
  fileName: Joi.string().required(),
  fileUrl: Joi.string().uri().required(),
  docType: Joi.string().optional(),
});

const verifyNgoSchema = Joi.object({
  status: Joi.string().valid('VERIFIED', 'REJECTED').required(),
  notes: Joi.string().optional(),
});

// Routes
router.post(
  '/apply',
  auth,
  validate(applyNgoSchema),
  asyncHandler(ngoController.applyAsNgo)
);

router.get(
  '/:ngoId',
  asyncHandler(ngoController.getNgoProfile)
);

router.patch(
  '/:ngoId/documents',
  auth,
  validate(documentSchema),
  asyncHandler(ngoController.uploadDocumentMetadata)
);

router.patch(
  '/:ngoId/verify',
  auth,
  allowRoles('ADMIN'),
  validate(verifyNgoSchema),
  asyncHandler(ngoController.verifyNgo)
);

router.get(
  '/',
  asyncHandler(ngoController.listNgos)
);

module.exports = router;
