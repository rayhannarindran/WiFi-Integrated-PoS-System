const express = require('express');
const tokenController = require('../controllers/tokenController');

const router = express.Router();

// POST route to create a new transaction
router.post('/validate-token', tokenController.validateToken);
router.post('/create-transaction', tokenController.createTransaction);

module.exports = router;