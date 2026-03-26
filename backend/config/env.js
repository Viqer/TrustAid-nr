/**
 * Environment Configuration Module
 * Validates and exports all required environment variables
 */

const validateEnv = () => {
  const requiredVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'NODE_ENV',
    'APP_PORT',
  ];

  const missingVars = requiredVars.filter((variable) => !process.env[variable]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }

  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    mongodbUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiry: process.env.JWT_EXPIRY || '7d',
    appPort: parseInt(process.env.APP_PORT, 10) || 5000,
    appHost: process.env.APP_HOST || 'localhost',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
    logLevel: process.env.LOG_LEVEL || 'debug',
  };
};

module.exports = validateEnv();
