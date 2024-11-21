const express = require('express');
const transactionController = require('../controllers/transactionController');

const router = express.Router();

// POST route to create a new transaction
router.post('/create-transaction', transactionController.createTransaction);

module.exports = router;