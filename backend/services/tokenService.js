const fs = require('fs'); //file system module
//var qrcode = require('qrcode'); //qrcode creator
const crypto = require('crypto'); //crypto module
require('dotenv').config(); //dotenv module

function generateRandomString(length) {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

// Generate a token based on the purchase data
function generateToken(pos_data) {  
  const token = pos_data.id + '_' + (new Date(pos_data.created_at)).toISOString() + '_' + generateRandomString(10);
  // console.log("Token:", token);

  return token;
}

// Generate a QR code for the token
async function generateQR(token) {
  try {
    // Generate QR code using await
    URL = process.env.MIKROTIK_HOST + "?token=" + token;
    // const uri = await qrcode.toDataURL(URL); // Await the QR code generation
    return URL;  // Return the QR code URL
  } catch (err) {
    console.log("Error:", err);
    throw err;  // Throw the error to be handled by the caller
  }
}

// Generate a token record based on the purchase data
function generateTokenRecord(pos_data) {
  const time_limit = 180; // 3 hours

  const valid_from_date = new Date(pos_data.created_at);
  const valid_until_date = new Date(valid_from_date.getTime() + time_limit * 60 * 1000); // 3 hours

  // Generate token record
  const tokenRecord = {
    token: generateToken(pos_data),
    status: 'valid',
    purchase_id: pos_data.id,
    valid_from: valid_from_date.toISOString(),
    valid_until: valid_until_date.toISOString(),
    max_devices: Math.floor((pos_data.subtotal + pos_data.gratuities + pos_data.taxes)/30000), // For every Rp30,000, the user can connect one device
    max_bandwidth: 10 * Math.floor((pos_data.subtotal + pos_data.gratuities + pos_data.taxes)/30000), // 10 Mbps
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
  generateQR,
  generateTokenRecord
};