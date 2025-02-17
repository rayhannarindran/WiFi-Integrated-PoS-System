const { baseModelName } = require('../models/Transaction');
const dbService = require('../services/dbService/dbService');
const printerService = require('../services/printerService');
const tokenService = require('../services/tokenService');

async function getAllTransactions(req, res){
    try{
        const transactions = await dbService.getAllTransactions();
        res.status(200).json({ message: 'All DB Transactions', data: { transactions } });
    }
    catch(error){
        console.error('Error getting all transactions: ', error);
        res.status(500).json({ message: 'Failed to get all transactions', error: error.message });
    }
}

async function printTransaction(req, res){
    try{
        const transaction = req.body;
        const order = transaction.order;
        const qrCodeURL = transaction.qrUrl;
        await printerService.printReceipt(order, qrCodeURL);
        res.status(200).json({ message: 'Transaction printed' });
    }
    catch(error){
        console.error('Error printing transaction: ', error);
        res.status(500).json({ message: 'Failed to print transaction', error: error.message });
    }
}

async function processTransaction(req, res){
    try {
        const transaction = req.body;

        const db_data = {
            id: transaction.id,
            payment_no: transaction.payment_no,
            created_at: transaction.created_at,
            discounts: transaction.discounts,  
            subtotal: transaction.subtotal,
            gratuities: transaction.gratuities,
            taxes: transaction.taxes,
        }

        console.log("Processing transaction...");

        // Get the last transaction ID from the database
        const latest_token_record = await dbService.findLatestTokenRecord();
        const last_transaction_id = latest_token_record?.purchase_id || null;

        if (db_data.id !== last_transaction_id) {        
            // Generate and insert token record
            const tokenRecord = tokenService.generateTokenRecord(db_data);
            await dbService.insertTokenRecord(tokenRecord);

            //! SAVING RECEIPT TO DATABASE
            const qrCodeURL = tokenService.generateQrURL(tokenRecord.token);
            await dbService.addTransaction(transaction, qrCodeURL);

            //! PRINT RECEIPT
            await printerService.printReceipt(transaction, qrCodeURL);

            console.log("Token QR Code:", qrCodeURL);
            res.status(201).json({ message: "Transaction processed successfully." })
        } else {
            console.log("No new transactions found.");
            res.status(500).json({ message: "No new transactions found" })
        }
    } catch (error) {
        console.error('Error in pollMokaTransactions:', error.message);
        res.status(500).json({ message: 'Failed to process transaction', error: error.message })
    }
}

module.exports = {
    getAllTransactions,
    printTransaction,
    processTransaction
};
