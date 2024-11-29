require('dotenv').config();
const Token = require('../../models/Token'); // Token model
const Device = require('../../models/Device'); // Device model
const { getConnection, closeConnection } = require('./dbConnection');
const { validateTokenRecord, validateDeviceRecord } = require('./dbValidation');
const { DbServiceError, logger, retryOperation } = require('./dbUtils');

// FOR UPDATING THE DATABASE TO SYNC WITH ENV VARIABLES
async function databaseUpdate(){
    try{
        await retryOperation(async () => {
            const dbConnection = await getConnection();
            const tokens = await Token.find();
            for (const token of tokens) {
                // UPDATING VALIDITY
                if (token.valid_until < new Date()) {
                    token.status = 'expired';
                    await token.save();
                }

                if (token.status === 'valid') {
                    // UPDATING MAX BANDWIDTH
                    if (token.max_bandwidth !== (parseInt(process.env.MAX_SYSTEM_BANDWIDTH) / parseInt(process.env.MAX_SYSTEM_DEVICES)) * token.max_devices) {
                        token.max_bandwidth = (parseInt(process.env.MAX_SYSTEM_BANDWIDTH) / parseInt(process.env.MAX_SYSTEM_DEVICES)) * token.max_devices;
                        await token.save();
                    }

                    // UPDATING TIME LIMIT
                    if (token.time_limit !== parseInt(process.env.TIME_LIMIT_PER_TOKEN)) {
                        token.time_limit = parseInt(process.env.TIME_LIMIT_PER_TOKEN);

                        // UPDATING VALID UNTIL
                        token.valid_until = new Date(token.valid_from.getTime() + (token.time_limit * 60000));
                        await token.save();
                    }
                }

                // UPDATING DEVICES
                for (const device_id of token.devices_connected) {
                    const deviceRecord = await Device.findById(device_id);
                    if (deviceRecord) {
                        const newBandwidth = Math.floor(token.max_bandwidth / token.devices_connected.length);
                        if (deviceRecord.bandwidth !== newBandwidth) {
                            deviceRecord.bandwidth = newBandwidth;
                            await deviceRecord.save();
                        }
                    }
                }

            }
            logger.info('Database updated successfully!');
        });
    }
    catch (error) {
        console.log(error);
    }
}

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

async function findTokenRecordByID(token_id) {
    try {
        return await retryOperation(async () => {
            const dbConnection = await getConnection();
            const record = await Token.findById(token_id);
            if (!record) {
                throw new DbServiceError('Token not found', 404);
            }
            logger.info('Token \'' + token_id + '\' Found!');
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
                    token_id: tokenRecord._id,
                    ip_address: device.ip_address,
                    mac_address: device.mac_address,
                    bandwidth: tokenRecord.max_bandwidth,
                    connected_at: new Date()
                }
            );
            await newDevice.save();

            // Add the device to the token record
            tokenRecord.devices_connected.push(newDevice._id);
            await tokenRecord.save();
            logger.info('Device \'' + newDevice.mac_address + '\' added successfully!');
        });
    } catch (error) {
        logger.error('Error adding device:', error);
        throw error;
    }
}

async function removeDevice(token, mac_address) {
    try {
        return await retryOperation(async () => {
            const dbConnection = await getConnection();
            const tokenRecord = await Token.findOne({ token });

            // Previous validation checks remain the same...
            
            // Find the device record first
            const deviceRecord = await Device.findOneAndDelete({ mac_address });
            if (!deviceRecord) {
                throw new DbServiceError('Device not found', 404);
            }

            // More robust device removal
            const initialLength = tokenRecord.devices_connected.length;
            tokenRecord.devices_connected = tokenRecord.devices_connected.filter(
                connectedDeviceId => !connectedDeviceId.equals(deviceRecord._id)
            );

            // Optional: Log if no device was removed
            if (tokenRecord.devices_connected.length === initialLength) {
                logger.warn(`No device ID found for MAC address: ${mac_address}`);
            }

            await tokenRecord.save();
            
            logger.info(`Device '${mac_address}' removed successfully!`);
            return tokenRecord;
        });
    } catch (error) {
        logger.error('Error removing device:', error);
        throw error;
    }
}

async function updateDevice(token, mac_address, update) {
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

            // Find the device record and update in database
            const deviceRecord = await Device.findOneAndUpdate(
                { mac_address },
                { $set: update },
                { new: true }
            );

            if (!deviceRecord) {
                throw new DbServiceError('Device not found', 404);
            }
            deviceRecord.updated_at = new Date();
            await deviceRecord.save();
            logger.info('Device \'' + mac_address + '\' updated successfully!');
            return deviceRecord;
        }
        );
    }
    catch (error) {
        logger.error('Error updating device:', error);
        throw error;
    }
};

async function findDevice(mac_address) {
    try {
        return await retryOperation(async () => {
            const dbConnection = await getConnection();
            const device = await Device.findOne({ mac_address });
            logger.info('Device \'' + mac_address + '\' Found!');
            return device;
        });
    } catch (error) {
        logger.error('Error finding device:', error);
        throw error;
    }
}

async function findDeviceByID(device_id) {
    try {
        return await retryOperation(async () => {
            const dbConnection = await getConnection();
            const device = await Device.findById(device_id);
            if (!device) {
                throw new DbServiceError('Device not found', 404);
            }
            logger.info('Device \'' + device_id + '\' Found!');
            return device;
        });
    } catch (error) {
        logger.error('Error finding device:', error);
        throw error;
    }
}

// TESTING FUNCTION
async function runService(function_number = 0) {
    try {
        const test_func = function_number;

        // Replace this with your actual record data
        current_date = new Date();
        const mockRecord = { token: 'exampleToken3', status: 'valid', purchase_id: 'examplePurchaseId3', 
                             valid_from: current_date, valid_until: new Date(current_date.getTime() + (parseInt(process.env.TIME_LIMIT_PER_TOKEN) * 60000)),  
                             max_devices: 3, max_bandwidth: parseInt(process.env.MAX_SYSTEM_BANDWIDTH/process.env.MAX_SYSTEM_DEVICES)*3, devices_connected: [], time_limit: parseInt(process.env.TIME_LIMIT_PER_TOKEN), 
                             created_at: current_date, updated_at: current_date };

        const mockDevice = { ip_address: '192.168.12.28' , mac_address: '11:11:11:11:00' };

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
                await removeDevice('exampleToken', '00:00:00:00:00:11');
                break;
            case 8:
                const device_update = { bandwidth: 20 };
                await updateDevice('exampleToken', '00:00:00:00:99:99', device_update);
                break;
            case 9:
                device = await findDevice('00:00:00:00:00:11');
                console.log('Found device:\n', device);
                break;
            case 10:
                device = await findDeviceByID('6720ef6cc0264a03def7672b');
                console.log('Found device:\n', device);
                break;
            case 11:
                await deleteTokenRecord('exampleToken');
                break;
            case 12:
                tokenRecord = await findTokenRecordByID('6720ef683e02cf9b3c90fc08');
                console.log('Found record:\n', tokenRecord.token);
                break;
            case 13:
                console.log('TEST RECORD:', mockRecord);
                break;
            case 14:
                await databaseUpdate();
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
    runService(14);
}

module.exports = {
    databaseUpdate,
    insertTokenRecord,
    findTokenRecord,
    findTokenRecordByID,
    updateTokenRecord,
    deleteTokenRecord,
    countTokens,
    findTokensByCriteria,
    addDevice,
    removeDevice,
    updateDevice,
    findDevice,
    findDeviceByID,
};
