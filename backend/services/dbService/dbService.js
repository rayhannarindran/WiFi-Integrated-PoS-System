require('dotenv').config();
const Token = require('../../models/Token'); // Import your model
const { getConnection, closeConnection } = require('./dbConnection');
const { validateTokenRecord, validateDevice } = require('./dbValidation');
const { DbServiceError, logger, retryOperation, sanitizeInput } = require('./dbUtils');


async function insertTokenRecord(record) {
    try {
      await validateTokenRecord(record);
      await retryOperation(async () => {
        const dbConnection = await getConnection();
        const newToken = new Token(record);
        await newToken.save();
      });
      logger.info('Token inserted successfully!');
    } catch (error) {
      logger.error('Error inserting token:', error);
      throw new DbServiceError('Failed to insert token', 500);
    }
  }

async function findTokenRecord(token) {
    try {
        return await retryOperation(async () => {
            const dbConnection = await getConnection();
            const record = await Token.findOne({ token });
            if (!record) {
                throw new DbServiceError('Token not found', 404);
            }
            return record;
        });
    } catch (error) {
        logger.error('Error finding token:', error);
        throw error;
    }
}

async function updateTokenRecord(token, update) {
    try {
        await validateTokenRecord(update, true);
        return await retryOperation(async () => {
            const dbConnection = await getConnection();
            const record = await Token.findOneAndUpdate(
                { token },
                { $set: update },
                { new: true }
            );
            if (!record) {
                throw new DbServiceError('Token not found', 404);
            }
            record.updated_at = new Date();
            await record.save();
            return record;
        });
    } catch (error) {
        logger.error('Error updating token:', error);
        throw error;
    }
}

async function deleteTokenRecord(token) {
    try {
      await retryOperation(async () => {
        const dbConnection = await getConnection();
        const result = await Token.deleteOne({ token });
        if (result.deletedCount === 0) {
            throw new DbServiceError('Token not found for deletion', 404);
        }
      });
      logger.info('Token deleted successfully!');
    } catch (error) {
      logger.error('Error deleting token:', error);
      throw error;
    }
  }

async function countTokens() {
    try {
        return await retryOperation(async () => {
            const dbConnection = await getConnection();
            return await Token.countDocuments();
        });
    } catch (error) {
        logger.error('Error counting tokens:', error);
        throw new DbServiceError('Failed to count tokens', 500);
    }
}

async function findTokensByCriteria(criteria) {
    try {
        return await retryOperation(async () => {
            const dbConnection = await getConnection();
            const tokens = await Token.find(criteria);
            return tokens;
        });
    } catch (error) {
        logger.error('Error finding tokens:', error);
        throw new DbServiceError('Failed to find tokens', 500);
    }
}

async function addDeviceToToken(token, device) {
    try {
        await validateDevice(device);
        return await retryOperation(async () => {
            const dbConnection = await getConnection();
            const tokenRecord = await Token.findOne({ token });
            if (!tokenRecord) {
                throw new DbServiceError('Token not found', 404);
            }
            if (tokenRecord.devices_connected.length >= tokenRecord.max_devices) {
                throw new DbServiceError('Maximum devices limit reached', 400);
            }
            tokenRecord.devices_connected.push({
                device_id: device.device_id,
                connected_at: new Date(),
                disconnected_at: null
            });
            await tokenRecord.save();
            return tokenRecord;
        });
    } catch (error) {
        logger.error('Error adding device:', error);
        throw error;
    }
}


// TESTING FUNCTION
async function runService() {
    try {
        // Set this to:
        // 0 to test connections
        // 1 to insert a record
        // 2 to find a record
        // 3 to update a record
        const test_func = 7;

        // Replace this with your actual record data
        current_date = new Date();
        const mockRecord = { token: 'exampleToken', status: 'valid', purchase_id: 'examplePurchaseId', 
                             valid_from: current_date, valid_until: new Date(current_date.getTime() + (180 * 60000)),  
                             max_devices: 1, devices_connected: [], time_limit: 180, 
                             created_at: current_date, updated_at: current_date };

        // function testing                    
        if (test_func === 0) {
            await getConnection();
            await closeConnection();
        }
        else if (test_func === 1) {
            await insertTokenRecord(mockRecord);
        }
        else if (test_func === 2) {
            record = await findTokenRecord('exampleToken');
            console.log('Found record:\n', record);
        } 
        else if (test_func === 3) {
            const update = { status: 'revoked' };
            current_record = await findTokenRecord('exampleToken');
            updated_record = await updateTokenRecord('exampleToken', update);
            console.log('OLD RECORD:\n', current_record, '\nUPDATED RECORD:\n', updated_record);
        }
        else if (test_func === 4) {
            await deleteTokenRecord('exampleToken');
        }
        else if (test_func === 5) {
            const count = await countTokens();
            console.log('Token count:', count);
        }
        else if (test_func === 6) {
            const criteria = { 'status': 'valid' };
            const records = await findTokensByCriteria(criteria);
            console.log('Found records:\n', records);
        }
        else if (test_func === 7) {
            const device = { device_id: 'exampleDeviceId' };
            await addDeviceToToken('exampleToken', device);
        }
        else {
            console.log('TEST FUNCTION NOT FOUND');
        }
    } catch (error) {
        console.error('Error running service:', error);
    } finally {
        // Ensure the process exits after the operation
        process.exit(0);
    }
}

// If this file is run directly (not imported as a module), execute the service
if (require.main === module) {
    runService();
}

module.exports = {
    insertTokenRecord,
    findTokenRecord,
    updateTokenRecord,
    deleteTokenRecord,
    countTokens,
    findTokensByCriteria,
    addDeviceToToken
};
