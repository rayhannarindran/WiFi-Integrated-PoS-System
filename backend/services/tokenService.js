const fs = require('fs');

var qrcode = require('qrcode'); //qrcode creator
const crypto = require('crypto'); //crypto module

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
    const uri = await qrcode.toDataURL(token); // Await the QR code generation
    return uri;  // Return the QR code URL
  } catch (err) {
    console.log("Error:", err);
    throw err;  // Throw the error to be handled by the caller
  }
}

// Generate a token record based on the purchase data
function generateTokenRecord(pos_data) {
  time_limit = 180; // 3 hours

  valid_from_date = new Date(pos_data.created_at);
  valid_until_date = new Date(valid_from_date.getTime() + time_limit * 60 * 1000); // 3 hours

  // Generate token record
  const tokenRecord = {
    token: generateToken(pos_data),
    status: 'valid',
    purchase_id: pos_data.id,
    valid_from: valid_from_date.toISOString(),
    valid_until: valid_until_date.toISOString(),
    max_devices: Math.floor((pos_data.subtotal + pos_data.gratuities + pos_data.taxes)/30000), // 30,000 is threshold for device increase
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

// TESTING
// const data_file = fs.readFileSync('./backend/data_example/pos_data.json');
// const pos_data = JSON.parse(data_file);

// const token = generateToken(pos_data);
// (async () => {
//   try {
//     const qr_uri = await generateQR(token);
//     console.log("QR URI:", qr_uri);
//   } catch (err) {
//     console.log("Error:", err);
//   }
// } )();
// const tokenRecord = generateTokenRecord(token, pos_data);
// console.log("Token Record:", tokenRecord);