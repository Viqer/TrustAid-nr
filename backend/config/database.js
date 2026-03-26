const mongoose = require('mongoose');
const config = require('./env');

const MAX_RETRIES = 5;
let retryCount = 0;

const dbConnection = async () => {
  try {
    await mongoose.connect(config.mongodbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✓ Connected to MongoDB successfully');
    retryCount = 0; // Reset retry counter on successful connection
    return mongoose.connection;
  } catch (err) {
    retryCount++;
    console.error(`MongoDB connection error (Attempt ${retryCount}/${MAX_RETRIES}):`, err.message);

    if (retryCount < MAX_RETRIES) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff
      console.log(`Retrying in ${delay}ms...`);
      setTimeout(dbConnection, delay);
    } else {
      console.error('Max retries reached. Failed to connect to MongoDB.');
      process.exit(1);
    }
  }
};

module.exports = { dbConnection };
