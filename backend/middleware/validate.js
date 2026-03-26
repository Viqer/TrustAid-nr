/**
 * Request Validation Middleware
 * Uses Joi for schema validation
 */

const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessages = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error.',
        errors: errorMessages,
      });
    }

    req.validatedData = value;
    next();
  };
};

module.exports = validate;
