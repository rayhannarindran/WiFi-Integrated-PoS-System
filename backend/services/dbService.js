require('dotenv').config();
const Joi = require('joi');
const mongoose = require('mongoose');
const Token = require('../models/Token'); // Import your model

// DATABASE FUNCTIONS
async function getConnection() {
    console.log('Connecting to MongoDB...');
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }
    return mongoose.connect(process.env.MONGODB_URI);
}

async function closeConnection() {
    console.log('Closing MongoDB connection...');
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
    }
}

// JOI SCHEMAS
const tokenSchema = Joi.object({
    token: Joi.string()
        .required()
        .messages({
            'any.required': 'Token is required'
        }),

    status: Joi.string()
        .valid('valid', 'expired', 'revoked')
        .required()
        .default('valid')
        .messages({
            'any.only': 'Status must be one of [valid, expired, revoked]',
        }),

    purchase_id: Joi.string()
        .required()
        .messages({
            'any.required': 'Purchase ID is required'
        }),

    valid_from: Joi.date()
        .required()
        .messages({
            'any.required': 'Valid from date is required'
        }),

    valid_until: Joi.date()
        .required()
        .greater(Joi.ref('valid_from'))
        .messages({
            'any.required': 'Valid until date is required',
            'date.greater': 'Valid until must be after Valid from'
        }),

    max_devices: Joi.number()
        .default(1)
        .min(1)
        .messages({
            'number.min': 'Max devices must be at least 1'
        }),

    devices_connected: Joi.array()
        .items(Joi.object({
            device_id: Joi.string().required(),
            connected_at: Joi.date().required(),
            disconnected_at: Joi.date().allow(null)
        }))
        .max(Joi.ref('max_devices'))
        .messages({
            'array.max': 'You can connect a maximum of {#limit} devices!'
        }),

    time_limit: Joi.number()
        .default(180)
        .min(1)
        .messages({
            'number.min': 'Time limit must be at least 1 minute'
        }),

    created_at: Joi.date().default(() => new Date()),

    updated_at: Joi.date().default(() => new Date())
});

const tokenUpdateSchema = Joi.object({
    status: Joi.string()
        .valid('valid', 'expired', 'revoked')
        .messages({
            'any.only': 'Status must be one of [valid, expired, revoked]',
        }),

        max_devices: Joi.number() // Add this to reference max_devices
        .optional() // Allow it to be optional in updates
        .default(1)
        .min(1)
        .messages({
            'number.min': 'Max devices must be at least 1'
        }),

        devices_connected: Joi.array()
        .items(Joi.object({
            device_id: Joi.string().required(),
            connected_at: Joi.date().required(),
            disconnected_at: Joi.date().allow(null)
        }).unknown(true))
        .when('max_devices', {
            is: Joi.exist(),
            then: Joi.array().max(Joi.ref('max_devices')),
            otherwise: Joi.array()
        })
        .messages({
            'array.max': 'You can connect a maximum of {#limit} devices!'
        }),
});

const deviceSchema = Joi.object({
    device_id: Joi.string().required().messages({
        'any.required': 'Device ID is required'
    })
});

// FUNCTIONS

async function validateTokenRecord(record, update = false) {
    try {
        if (update) {
            const value = await tokenUpdateSchema.validateAsync(record);
            console.log('Updated Record validated!');
            return value;
        } else {
            const value = await tokenSchema.validateAsync(record);
            console.log('New record validated!');
            return value;
        }
    } catch (error) {
        console.error('Validation error:', error);
        throw error;
    }
}

async function insertTokenRecord(record) {
    let conn = null;
    try {
        conn = await getConnection();

        // Validate the record
        await validateTokenRecord(record);

        // Insert the record
        const newToken = new Token(record);
        await newToken.save();
        console.log('Token inserted successfully!');
    } catch (error) {
        console.error('Error inserting token:', error);
        throw error;
    } finally {
        await closeConnection();
    }
}

async function findTokenRecord(token) {
    let conn = null;
    try {
        conn = await getConnection();

        const record = await Token.findOne({ token });
        if (!record) {
            throw new Error('Token not found');
        } else {
            console.log('Record found!');
        }
        return record;
    } catch (error) {
        console.error('Error finding token:', error);
        throw error;
    } finally {
        await closeConnection();
    }
}

async function updateTokenRecord(token, update) {
    let conn = null;
    try {
        conn = await getConnection();
        
        // Validate the update object
        await validateTokenRecord(update, true);  

        // Update the record
        const record = await Token.findOneAndUpdate({ token }, { $set: update }, { new: true });
        if (!record) {
            console.error(`Token not found: ${token}`);
            throw new Error('Token not found');
        }
        
        record.updated_at = new Date();
        console.log('Record updated!');
        return record;
    } catch (error) {
        console.error('Error updating token:', error);
        throw error; // Consider customizing this based on your error handling strategy
    } finally {
        if (conn) {
            await closeConnection();
        }
    }
}

async function deleteTokenRecord(token) {
    let conn = null;
    try {
        conn = await getConnection();
        const result = await Token.deleteOne({ token });
        if (result.deletedCount === 0) {
            throw new Error('Token not found for deletion');
        }
        console.log('Token deleted successfully!');
    } catch (error) {
        console.error('Error deleting token:', error);
        throw error;
    } finally {
        if (conn) {
            await closeConnection();
        }
    }
}

async function countTokens() {
    let conn = null;
    try {
        conn = await getConnection();
        const count = await Token.countDocuments();
        console.log(`Total tokens: ${count}`);
        return count;
    } catch (error) {
        console.error('Error counting tokens:', error);
        throw error;
    } finally {
        if (conn) {
            await closeConnection();
        }
    }
}

async function findTokensByCriteria(criteria) {
    let conn = null;
    try {
        conn = await getConnection();
        
        const tokens = await Token.find(criteria); // Use the passed criteria to find tokens
        if (tokens.length === 0) {
            console.log('No tokens found for the given criteria.');
        } else {
            console.log('Count:', tokens.length);
            console.log('Tokens found:', tokens);
        }
        return tokens;
    } catch (error) {
        console.error('Error finding tokens:', error);
        throw error;
    } finally {
        if (conn) {
            await closeConnection();
        }
    }
}

async function addDeviceToToken(token, device) {
    let conn = null;
    try {
        conn = await getConnection();

        await deviceSchema.validateAsync(device);
        console.log('Device validated!');

        // Find the token record
        const tokenRecord = await Token.findOne({ token });
        if (!tokenRecord) {
            throw new Error('Token not found');
        }

        // Check if the maximum device limit is reached
        if (tokenRecord.devices_connected.length >= tokenRecord.max_devices) {
            throw new Error('Maximum devices limit reached');
        }

        // Add the new device
        tokenRecord.devices_connected.push({
            device_id: device.device_id,
            connected_at: new Date(),
            disconnected_at: null
        })

        const updateData = { devices_connected: tokenRecord.devices_connected };
        const updatedRecord = await updateTokenRecord(token, updateData);
        console.log('Device added successfully!', updatedRecord);
    } catch (error) {
        console.error('Error adding device:', error);
        throw error;
    } finally {
        if (conn) {
            await closeConnection();
        }
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
            await countTokens();
        }
        else if (test_func === 6) {
            const criteria = { 'devices_connected.length': { $gt: 1 } };
            await findTokensByCriteria(criteria);
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
    getConnection,
    closeConnection,
    insertTokenRecord,
    findTokenRecord,
    validateTokenRecord,
    updateTokenRecord,
    deleteTokenRecord,
    countTokens,
    findTokensByCriteria,
    addDeviceToToken
};
