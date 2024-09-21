const mongoose = require('mongoose');
const { logger } = require('./dbUtils');

let dbConnection = null;

async function getConnection() {
  if (!dbConnection) {
    try {
      dbConnection = await mongoose.connect(process.env.MONGODB_URI);
      logger.info('Connected to MongoDB');
    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }
  return dbConnection;
}

async function closeConnection() {
  if (dbConnection) {
    await mongoose.connection.close();
    dbConnection = null;
    logger.info('Closed MongoDB connection');
  }
}

module.exports = { getConnection, closeConnection };