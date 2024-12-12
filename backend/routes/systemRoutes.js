const express = require('express');
const systemController = require('../controllers/systemController');

const router = express.Router();

// POST route to restart system
router.post('/restart-system', systemController.restartSystem);

module.exports = router;