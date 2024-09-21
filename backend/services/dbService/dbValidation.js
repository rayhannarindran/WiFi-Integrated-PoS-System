const Joi = require('joi');

const tokenSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Token is required'
  }),
  status: Joi.string().valid('valid', 'expired', 'revoked').required().default('valid').messages({
    'any.only': 'Status must be one of [valid, expired, revoked]',
  }),
  purchase_id: Joi.string().required().messages({
    'any.required': 'Purchase ID is required'
  }),
  valid_from: Joi.date().required().messages({
    'any.required': 'Valid from date is required'
  }),
  valid_until: Joi.date().required().greater(Joi.ref('valid_from')).messages({
    'any.required': 'Valid until date is required',
    'date.greater': 'Valid until must be after Valid from'
  }),
  max_devices: Joi.number().default(1).min(1).messages({
    'number.min': 'Max devices must be at least 1'
  }),
  devices_connected: Joi.array().items(Joi.object({
    device_id: Joi.string().required(),
    connected_at: Joi.date().required(),
    disconnected_at: Joi.date().allow(null)
  })).max(Joi.ref('max_devices')).messages({
    'array.max': 'You can connect a maximum of {#limit} devices!'
  }),
  time_limit: Joi.number().default(180).min(1).messages({
    'number.min': 'Time limit must be at least 1 minute'
  }),
  created_at: Joi.date().default(() => new Date()),
  updated_at: Joi.date().default(() => new Date())
});

const tokenUpdateSchema = Joi.object({
  status: Joi.string().valid('valid', 'expired', 'revoked').messages({
    'any.only': 'Status must be one of [valid, expired, revoked]',
  }),
  max_devices: Joi.number().optional().default(1).min(1).messages({
    'number.min': 'Max devices must be at least 1'
  }),
  devices_connected: Joi.array().items(Joi.object({
    device_id: Joi.string().required(),
    connected_at: Joi.date().required(),
    disconnected_at: Joi.date().allow(null)
  }).unknown(true)).when('max_devices', {
    is: Joi.exist(),
    then: Joi.array().max(Joi.ref('max_devices')),
    otherwise: Joi.array()
  }).messages({
    'array.max': 'You can connect a maximum of {#limit} devices!'
  }),
});

const deviceSchema = Joi.object({
  device_id: Joi.string().required().messages({
    'any.required': 'Device ID is required'
  })
});

async function validateTokenRecord(record, update = false) {
  try {
    const schema = update ? tokenUpdateSchema : tokenSchema;
    const value = await schema.validateAsync(record);
    return value;
  } catch (error) {
    throw new Error(`Validation error: ${error.message}`);
  }
}

async function validateDevice(device) {
  try {
    const value = await deviceSchema.validateAsync(device);
    return value;
  } catch (error) {
    throw new Error(`Device validation error: ${error.message}`);
  }
}

module.exports = { validateTokenRecord, validateDevice };