/**
 * Response Helper Functions
 * Standardized response formatting
 */

const success = (data, message = 'Success') => ({
  success: true,
  message,
  data,
});

const error = (message = 'Error', errors = null) => ({
  success: false,
  message,
  ...(errors && { errors }),
});

const pagination = (items, page, limit, total) => ({
  items,
  pagination: {
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / limit),
    total,
    limit,
  },
});

module.exports = {
  success,
  error,
  pagination,
};
