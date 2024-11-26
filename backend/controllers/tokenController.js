const tokenService = require('../services/tokenService');
const printerService = require('../services/printerService');
const dbService = require('../services/dbService/dbService');

// Validate token
async function validateToken(req, res) {
    try {
        const token = req.body.token;
        const tokenRecord = await dbService.findTokenRecord(token);
        if (tokenRecord.status != "valid"){
            isValid = false;
        } else {
            isValid = true;
        }
        res.status(200).json({ message: 'Token validation successful', data: { isValid } });
    } catch (error) {
        console.error('Error validating token: ', error);
        res.status(500).json({ message: 'Failed to validate token', error: error.message });
    }
}

// Create a new transaction
async function createTransaction(req, res) {
    try {
        const pos_data = req.body;
    
        // Generate and insert token record
        const tokenRecord = tokenService.generateTokenRecord(pos_data);
        await dbService.insertTokenRecord(tokenRecord);
    
        // Generate QR code for the token
        const qrCodeURL = await tokenService.generateQR(tokenRecord.token);

        // Print receipt
        printerService.printReceipt(pos_data, qrCodeURL);
    
        res.status(200).json({ message: 'Transaction created successfully', data: { tokenRecord, qrCodeURL } });
    } catch (error) {
        console.error('Error creating transaction: ', error);
        res.status(500).json({ message: 'Failed to create transaction', error: error.message });
    }
}

module.exports = {
    validateToken,
    createTransaction,
};
