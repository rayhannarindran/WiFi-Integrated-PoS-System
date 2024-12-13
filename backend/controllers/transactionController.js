const { baseModelName } = require('../models/Transaction');
const dbService = require('../services/dbService/dbService');
const printerService = require('../services/printerService/printerService');

async function getAllTransactions(){
    try{
        const transactions = await dbService.getAllTransactions();
        return transactions;
    }
    catch(error){
        console.error('Error getting all transactions: ', error);
        return [];
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