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
        res.status(500).json({ message: 'Failed to get tokens', error: error.message });
    }
}

// async function printTransaction(req, res){
//     try{
//         const transaction_data = req.body;
//     }
//     catch(error){
//         console.error('Error printing transaction: ', error);
//         res.status(500).json({ message: 'Failed to print transaction', error: error.message });
//     }
// }

module.exports = {
    getAllTransactions,
    // printTransaction
};