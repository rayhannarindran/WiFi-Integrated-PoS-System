const fs = require('fs'); //file system module
//var qrcode = require('qrcode'); //qrcode creator
const crypto = require('crypto'); //crypto module
require('dotenv').config(); //dotenv module

BANDWIDTH_PER_DEVICE = parseInt(process.env.MAX_SYSTEM_BANDWIDTH) / parseInt(process.env.MAX_SYSTEM_DEVICES);
MINIMUM_PAYMENT_PER_DEVICE = parseInt(process.env.MINIMUM_PAYMENT_PER_DEVICE);
TIME_LIMIT_PER_TOKEN = parseInt(process.env.TIME_LIMIT_PER_TOKEN);

function generateRandomString(length) {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

// Generate a token based on the purchase data
function generateToken(pos_data) {  
  const token = pos_data.id + '_' + (new Date(pos_data.created_at)).toISOString() + '_' + generateRandomString(10);
  return token;
}

// Generate a QR code for the token
function generateQrURL(token) {
  try {
    // Generate QR code using await
    qrURL = "hotspot.wifipos.id/login?token=" + token;
    return qrURL;  // Return the QR code URL
  } catch (err) {
    console.log("Error:", err);
    throw err;  // Throw the error to be handled by the caller
  }
}

// Generate a token record based on the purchase data
function generateTokenRecord(pos_data) {
  const time_limit = TIME_LIMIT_PER_TOKEN;

  const valid_from_date = new Date(pos_data.created_at);
  const valid_until_date = new Date(valid_from_date.getTime() + time_limit * 60 * 1000); // 3 hours

  // Generate token record
  const tokenRecord = {
    token: generateToken(pos_data),
    status: 'valid',
    purchase_id: pos_data.id,
    valid_from: valid_from_date.toISOString(),
    valid_until: valid_until_date.toISOString(),
    max_devices: Math.floor((pos_data.subtotal + pos_data.gratuities + pos_data.taxes)/MINIMUM_PAYMENT_PER_DEVICE), // For every Rp30,000, the user can connect one device
    max_bandwidth: BANDWIDTH_PER_DEVICE * Math.floor((pos_data.subtotal + pos_data.gratuities + pos_data.taxes)/MINIMUM_PAYMENT_PER_DEVICE),
    devices_connected: [],
    time_limit: time_limit,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  return tokenRecord;
}

// Export the functions
module.exports = {
  generateToken,
  generateQrURL,
  generateTokenRecord
};