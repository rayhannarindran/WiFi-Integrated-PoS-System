const express = require('express');
const transactionController = require('../controllers/transactionController')

const router = express.Router();

router.get('/get-all-transactions', transactionController.getAllTransactions);
router.post('/print-transaction', transactionController.printTransaction);

module.exports = router;