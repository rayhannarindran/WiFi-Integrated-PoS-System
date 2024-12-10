const dbService = require('../services/dbService/dbService');
const tokenService = require('../services/tokenService');
const mokaService = require('../services/mokaService');
const printerService = require('../services/printerService');

// Keep track of the last processed transaction
const POLLING_INTERVAL = 15000;
let last_transaction_id = null;

// Function to poll transactions periodically
async function pollMokaTransactions() {
    try {
        console.log("Polling Moka API for new transactions...");
        const data = await mokaService.getMokaTransactions();

        if (data?.data?.payments?.length > 0 && data.data.payments[0].id !== last_transaction_id) {
            last_transaction_id = data.data.payments[0].id;
            console.log("New Transactions Found");
            
            //! SEND DATA TO DATABASE
            db_data = mokaService.preprocessDataForDB(data);
            printing_data = mokaService.preprocessDataForPrinting(data);
        
            // Generate and insert token record
            const tokenRecord = tokenService.generateTokenRecord(db_data);
            await dbService.insertTokenRecord(tokenRecord);

            //! PRINTING DATA
            const qrCodeURL = tokenService.generateQRCodeURL(tokenRecord.token);
            await printerService.printReceipt(printing_data, qrCodeURL);

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