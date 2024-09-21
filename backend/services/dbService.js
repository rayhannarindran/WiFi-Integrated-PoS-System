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

// TOKENS FUNCTIONS
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
            disconnected_at: Joi.date()
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

    devices_connected: Joi.array()
        .items(Joi.object({
            device_id: Joi.string().required(),
            connected_at: Joi.date().required(),
            disconnected_at: Joi.date()
        }))
        .max(Joi.ref('max_devices'))
        .messages({
            'array.max': 'You can connect a maximum of {#limit} devices!'
        }),

    updated_at: Joi.date().default(() => new Date())
});

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

// TESTING FUNCTION
async function runService() {
    try {
        // Set this to:
        // 0 to test connections
        // 1 to insert a record
        // 2 to find a record
        // 3 to update a record
        const test_func = 3;

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
            const update = { status: 'revoked', updated_at: new Date() };
            current_record = await findTokenRecord(mockRecord.token);
            updated_record = await updateTokenRecord(mockRecord.token, update);
            console.log('OLD RECORD:\n', current_record, '\nUPDATED RECORD:\n', updated_record);
        } else {
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
};
