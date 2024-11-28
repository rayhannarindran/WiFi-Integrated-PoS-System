const express = require('express');
const tokenController = require('../controllers/tokenController');

const router = express.Router();

// POST route to create a new transaction
router.post('/validate-token', tokenController.validateToken);
router.get('/find-all-tokens', tokenController.findAllTokens);
router.get('/find-token', tokenController.findToken);
router.post('/create-transaction', tokenController.createTransaction);

module.exports = router;