const fs = require('fs');
var qrcode = require('qrcode'); //qrcode creator
const crypto = require('crypto'); //crypto module

function generateRandomString(length) {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

function generateToken(data) {
  // Parse file to JSON
  const pos_data = JSON.parse(data);

  // Use payment number to generate token
  const token = pos_data.id + '-' + pos_data.created_at + '-' + generateRandomString(10);
  console.log("Token:", token);

  return token;
}

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

// Get Token Testing
const data_example = fs.readFileSync('./backend/data_example/pos_data.json');
const token = generateToken(data_example);
(async () => {
  try {
    const qr_uri = await generateQR(token);
    console.log("QR URI:", qr_uri);
  } catch (err) {
    console.log("Error:", err);
  }
} )();