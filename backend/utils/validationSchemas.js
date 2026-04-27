/**
 * Validation Schemas
 * Centralized Joi schemas for all endpoints
 */

const Joi = require('joi');

const schemas = {
  // Auth schemas
  auth: {
    register: Joi.object({
      email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
      password: Joi.string().min(8).required().messages({
        'string.min': 'Password must be at least 8 characters',
        'any.required': 'Password is required',
      }),
      firstName: Joi.string().trim().required().messages({
        'any.required': 'First name is required',
      }),
      lastName: Joi.string().trim().required().messages({
        'any.required': 'Last name is required',
      }),
      role: Joi.string().valid('DONOR', 'NGO').optional(),
    }),

    login: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),

    refreshToken: Joi.object({
      token: Joi.string().required(),
    }),
  },

  // NGO schemas
  ngo: {
    apply: Joi.object({
      organizationName: Joi.string().trim().required(),
      registrationNumber: Joi.string().trim().required(),
      description: Joi.string().trim().required(),
      website: Joi.string().uri().optional().allow(null),
      phone: Joi.string().required(),
      address: Joi.object({
        street: Joi.string().optional(),
        city: Joi.string().optional(),
        state: Joi.string().optional(),
        zipCode: Joi.string().optional(),
        country: Joi.string().optional(),
      }).optional(),
    }),

    uploadDocument: Joi.object({
      documentType: Joi.string().valid('registration', 'taxExemption', 'other').required(),
      fileName: Joi.string().required(),
      fileUrl: Joi.string().uri().required(),
      docType: Joi.string().optional(),
    }),

    verify: Joi.object({
      status: Joi.string().valid('VERIFIED', 'REJECTED').required(),
      notes: Joi.string().optional(),
    }),
  },

  // Campaign schemas
  campaign: {
    create: Joi.object({
      title: Joi.string().trim().required(),
      description: Joi.string().trim().required(),
      longDescription: Joi.string().trim().optional(),
      goalAmount: Joi.number().min(1).required(),
      currency: Joi.string().valid('USD', 'EUR', 'GBP', 'INR').optional(),
      category: Joi.string()
        .trim()
        .lowercase()
        .valid('health', 'education', 'disaster-relief', 'environment', 'poverty', 'human-rights', 'arts', 'animal-welfare', 'other')
        .required(),
      startDate: Joi.date().iso().required(),
      endDate: Joi.date().iso().required(),
      beneficiaries: Joi.string().trim().required(),
      image: Joi.string().uri().optional().allow(null),
      tags: Joi.array().items(Joi.string()).optional(),
    }),

    update: Joi.object({
      title: Joi.string().trim().optional(),
      description: Joi.string().trim().optional(),
      longDescription: Joi.string().trim().optional(),
      goalAmount: Joi.number().min(1).optional(),
      currency: Joi.string().valid('USD', 'EUR', 'GBP', 'INR').optional(),
      image: Joi.string().uri().optional().allow(null),
      tags: Joi.array().items(Joi.string()).optional(),
    }),
  },

  // Donation schemas
  donation: {
    create: Joi.object({
      amount: Joi.number().min(1).required(),
      currency: Joi.string().valid('USD', 'EUR', 'GBP', 'INR').optional(),
      campaignId: Joi.string().required(),
      paymentMethod: Joi.string()
        .valid('CARD', 'BANK_TRANSFER', 'CRYPTO', 'PAYPAL')
        .optional(),
      donorMessage: Joi.string().trim().optional(),
      isAnonymous: Joi.boolean().optional(),
    }),

    confirm: Joi.object({
      blockchainTxHash: Joi.string().required(),
      blockNumber: Joi.number().optional(),
      network: Joi.string().valid('ETHEREUM', 'POLYGON', 'BINANCE').optional(),
      status: Joi.string().valid('CONFIRMED', 'FAILED').optional(),
    }),
  },
};

module.exports = schemas;
