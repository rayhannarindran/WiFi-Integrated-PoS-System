const mongoose = require('mongoose');
const { logger } = require('./dbUtils');
const fs = require('fs');
const isDocker = process.env.IS_DOCKER === 'true';

const MONGODB_URI = isDocker ? 'mongodb://mongodb:27017/wifi-pos' : process.env.MONGODB_URI;
let dbConnection = null;

//console.log(MONGODB_URI);

async function getConnection() {
  if (!dbConnection) {
    try {
      dbConnection = await mongoose.connect(MONGODB_URI);
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