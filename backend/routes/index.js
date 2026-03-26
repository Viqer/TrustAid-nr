/**
 * Main Routes File
 * Delegates to specific route modules in server/app.js
 */

const express = require('express');
const routes = express.Router();

// Placeholder - actual routing is handled in server/app.js
routes.get('/status', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
  });
});

module.exports = routes;