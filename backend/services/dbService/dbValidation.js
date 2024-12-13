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
  max_bandwidth: Joi.number().default(10).min(1).messages({
    'number.min': 'Max bandwidth must be at least 10'
  }),
  devices_connected: Joi.array().items(Joi.object({
    device_id: Joi.string().required()
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
  max_bandwidth: Joi.number().optional().default(10).min(1).messages({
    'number.min': 'Max bandwidth must be at least 1'
  }),
  devices_connected: Joi.array().items(Joi.object({
    device_id: Joi.string().required()
  }).unknown(true)).when('max_devices', {
    is: Joi.exist(),
    then: Joi.array().max(Joi.ref('max_devices')),
    otherwise: Joi.array()
  }).messages({
    'array.max': 'You can connect a maximum of {#limit} devices!'
  }),
});

const deviceSchema = Joi.object({
  token_id: Joi.any().required().messages({
    'any.required': 'Token ID is required'
  }),
  ip_address: Joi.string().required().messages({
    'any.required': 'IP address is required'
  }),
  mac_address: Joi.string().required().messages({
    'any.required': 'MAC address is required'
  }),
  bandwidth: Joi.number().default(10).min(1).messages({
    'number.min': 'Bandwidth must be at least 1'
  }),
  connected_at: Joi.date().default(() => new Date()),
  disconnected_at: Joi.date().default(null).allow(null),
  created_at: Joi.date().default(() => new Date()),
  updated_at: Joi.date().default(() => new Date())
});

const deviceUpdateSchema = Joi.object({
  ip_address: Joi.string().optional(),
  mac_address: Joi.string().optional(),
  bandwidth: Joi.number().optional().min(1).messages({
    'number.min': 'Bandwidth must be at least 1'
  }),
  connected_at: Joi.date().optional(),
  disconnected_at: Joi.date().optional()
});

const transactionSchema = Joi.object({
  order: Joi.object().required().messages({
      'any.required': 'Order is required and must be a valid JSON object',
  }),
  qrUrl: Joi.string().uri().required().messages({
      'any.required': 'QR URL is required',
      'string.uri': 'QR URL must be a valid URI',
  }),
  created_at: Joi.date().default(() => new Date()),
  updated_at: Joi.date().default(() => new Date()),
});

// VALIDATION FUNCTIONS

async function validateTokenRecord(record, update = false) {
  try {
    const schema = update ? tokenUpdateSchema : tokenSchema;
    const value = await schema.validateAsync(record);
    return value;
  } catch (error) {
    throw new Error(`Validation error: ${error.message}`);
  }
}

async function validateDeviceRecord(record, update = false) {
  try {
    const schema = update ? deviceUpdateSchema : deviceSchema;
    const value = await schema.validateAsync(record);
    return value;
  } catch (error) {
    throw new Error(`Validation error: ${error.message}`);
  }
}

async function validateTransactionRecord(record) {
  try {
      const value = await transactionSchema.validateAsync(record);
      return value;
  } catch (error) {
      throw new Error(`Validation error: ${error.message}`);
  }
}

module.exports = { validateTokenRecord, validateDeviceRecord, validateTransactionRecord };