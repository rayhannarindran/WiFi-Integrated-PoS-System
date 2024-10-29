const express = require('express');
const tokenController = require('../controllers/tokenController');

const router = express.Router();

// POST route to connect device
router.post('/connect-device', tokenController.connectDevice);
router.post('/disconnect-device', tokenController.disconnectDevice);

module.exports = router;