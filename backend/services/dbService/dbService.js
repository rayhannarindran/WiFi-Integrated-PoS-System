require('dotenv').config();
const Token = require('../../models/Token'); // Token model
const Device = require('../../models/Device'); // Device model
const { getConnection, closeConnection } = require('./dbConnection');
const { validateTokenRecord, validateDeviceRecord } = require('./dbValidation');
const { DbServiceError, logger, retryOperation } = require('./dbUtils');


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
            logger.info('Token \'' + token + '\' Found!');
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
            logger.info('Token \'' + token + '\' updated successfully!');
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
      logger.info('Token \'' + token + '\' deleted successfully!');
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
            logger.info(tokens.length + ' Tokens with criteria \'' + JSON.stringify(criteria) + '\' Found!');
            return tokens;
        });
    } catch (error) {
        logger.error('Error finding tokens:', error);
        throw new DbServiceError('Failed to find tokens', 500);
    }
}

async function addDevice(token, device) {
    try {
        return await retryOperation(async () => {
            const dbConnection = await getConnection();
            const tokenRecord = await Token.findOne({ token });

            if (!tokenRecord) {
                throw new DbServiceError('Token not found', 404);
            }
            if (tokenRecord.status !== 'valid') {
                throw new DbServiceError('Token is not valid', 400);
            }
            if (tokenRecord.devices_connected.length >= tokenRecord.max_devices) {
                throw new DbServiceError('Maximum devices limit reached', 400);
            }

            // Create a new device record and adds to database
            const newDevice = new Device(
                {
                    device_id: device.device_id,
                    token_id: tokenRecord._id,
                    ip_address: device.ip_address,
                    mac_address: device.mac_address,
                    connected_at: new Date()
                }
            );
            await newDevice.save();

            // Add the device to the token record
            tokenRecord.devices_connected.push(newDevice._id);
            await tokenRecord.save();
            logger.info('Device \'' + newDevice.device_id + '\' added successfully!');
        });
    } catch (error) {
        logger.error('Error adding device:', error);
        throw error;
    }
}

async function removeDevice(token, device_id) {
    try {
        return await retryOperation(async () => {
            const dbConnection = await getConnection();
            const tokenRecord = await Token.findOne({ token });

            if (!tokenRecord) {
                throw new DbServiceError('Token not found', 404);
            }
            if (tokenRecord.status !== 'valid') {
                throw new DbServiceError('Token is not valid', 400);
            }
            if (tokenRecord.devices_connected.length === 0) {
                throw new DbServiceError('No devices connected', 400);
            }
            
            // Find the device record and remove from database
            const deviceRecord = await Device.findOneAndDelete({ device_id });
            //const deviceRecord = await Device.findOneAndDelete({ device_id });
            if (!deviceRecord) {
                throw new DbServiceError('Device not found', 404);
            }

            // Remove the device from the token record
            const index = tokenRecord.devices_connected.indexOf(deviceRecord._id);
            tokenRecord.devices_connected.splice(index, 1);
            await tokenRecord.save();
            logger.info('Device \'' + device_id + '\' removed successfully!');
            return tokenRecord;
        });
    } catch (error) {
        logger.error('Error removing device:', error);
        throw error;
    }
}

// TESTING FUNCTION
async function runService(function_number = 0) {
    try {
        const test_func = function_number;

        // Replace this with your actual record data
        current_date = new Date();
        const mockRecord = { token: 'exampleToken', status: 'valid', purchase_id: 'examplePurchaseId', 
                             valid_from: current_date, valid_until: new Date(current_date.getTime() + (180 * 60000)),  
                             max_devices: 3, devices_connected: [], time_limit: 180, 
                             created_at: current_date, updated_at: current_date };

        const mockDevice = { device_id: 'exampleDeviceId', ip_address: '192.168.1.1' , mac_address: '00:00:00:00:00:00' };

        // function testing
        switch (test_func) {
            case 0:
                await getConnection();
                await closeConnection();
                break;
            case 1:
                await insertTokenRecord(mockRecord);
                break;
            case 2:
                const record = await findTokenRecord('exampleToken');
                console.log('Found record:\n', record);
                break;
            case 3:
                const update = { max_devices: 5 };
                current_record = await findTokenRecord('exampleToken');
                updated_record = await updateTokenRecord('exampleToken', update);
                console.log('OLD RECORD:\n', current_record, '\nUPDATED RECORD:\n', updated_record);
                break;
            case 4:
                const count = await countTokens();
                console.log('Token count:', count);
                break;
            case 5:
                const criteria = { 'status': 'valid' };
                const records = await findTokensByCriteria(criteria);
                console.log('Found records:\n', records);
                break;
            case 6:
                await addDevice('exampleToken', mockDevice);
                break;
            case 7:
                await removeDevice('exampleToken', 'exampleDeviceId');
                break;
            case 8:
                await deleteTokenRecord('exampleToken');
                break;
            default:
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
    // Test services
    runService(8);
}

module.exports = {
    insertTokenRecord,
    findTokenRecord,
    updateTokenRecord,
    deleteTokenRecord,
    countTokens,
    findTokensByCriteria,
    addDevice,
    removeDevice
};
