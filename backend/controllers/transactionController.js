const { baseModelName } = require('../models/Transaction');
const dbService = require('../services/dbService/dbService');
const printerService = require('../services/printerService');

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

module.exports = {
    getAllTransactions,
    printTransaction
};
