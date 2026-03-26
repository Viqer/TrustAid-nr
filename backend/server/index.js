/**
 * Server Entry Point
 * Initializes database connection and starts the server
 */

require('dotenv').config();

const app = require('./app');
const config = require('../config/env');
const { dbConnection } = require('../config/database');

const startServer = async () => {
  try {
    // Connect to MongoDB
    await dbConnection();

    // Start server
    app.listen(config.appPort, config.appHost, () => {
      const serverUrl = `http://${config.appHost}:${config.appPort}`;
      console.log('\n' + '='.repeat(50));
      console.log('✓ Server started successfully');
      console.log(`✓ Server URL: ${serverUrl}`);
      console.log(`✓ API URL: ${serverUrl}/api`);
      console.log(`✓ Environment: ${config.nodeEnv}`);
      console.log('='.repeat(50) + '\n');
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('✗ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('✗ Uncaught Exception:', error);
  process.exit(1);
});

startServer();
