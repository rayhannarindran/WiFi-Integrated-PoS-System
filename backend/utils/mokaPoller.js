const dbService = require('../services/dbService/dbService');
const tokenService = require('../services/tokenService');
const mokaService = require('../services/mokaService');
const printerService = require('../services/printerService');

// Keep track of the last processed transaction
const POLLING_INTERVAL = 15000;

// Function to poll transactions periodically
async function pollMokaTransactions() {
    try {
        console.log("Polling Moka API for new transactions...");
        const data = await mokaService.getMokaTransactions();

        // Get the last transaction ID from the database
        const latest_token_record = await dbService.findLatestTokenRecord();
        const last_transaction_id = latest_token_record?.purchase_id || null;

        if (data?.data?.payments?.length > 0 && data.data.payments[0].id !== last_transaction_id) {
            console.log("New Transactions Found");
             
            //! SEND DATA TO DATABASE
            db_data = mokaService.preprocessDataForDB(data);
            printing_data = mokaService.preprocessDataForPrinting(data);
        
            // Generate and insert token record
            const tokenRecord = tokenService.generateTokenRecord(db_data);
            await dbService.insertTokenRecord(tokenRecord);

            //! SAVING RECEIPT TO DATABASE
            const qrCodeURL = tokenService.generateQrURL(tokenRecord.token);
            await dbService.addTransaction(printing_data, qrCodeURL);

            //! PRINT RECEIPT
            // await printerService.printReceipt(printing_data, qrCodeURL);

            console.log("Token QR Code:", qrCodeURL);

        } else {
            console.log("No new transactions found.");
        }
    } catch (error) {
        console.error('Error in pollMokaTransactions:', error.message);
    }
}

// Function to start polling at regular intervals
function startMokaPolling() {
    console.log("Starting Moka transactions polling...");
    setInterval(() => {
        pollMokaTransactions();
    }, POLLING_INTERVAL);
}

module.exports = {
    startMokaPolling
};