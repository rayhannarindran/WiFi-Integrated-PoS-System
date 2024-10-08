const winston = require('winston');
const { promisify } = require('util');

class DbServiceError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'DbServiceError';
    this.statusCode = statusCode;
  }
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'db-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

const sleep = promisify(setTimeout);

async function retryOperation(operation, maxRetries = 3, delay = 1000) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      logger.warn(`Operation failed, retrying (${i + 1}/${maxRetries})`, { error });
      await sleep(delay);
    }
  }
  throw lastError;
}

module.exports = {
  DbServiceError,
  logger,
  retryOperation
};