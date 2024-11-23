const express = require('express');
const envController = require('../controllers/envController');

const router = express.Router();

// GET route to get environment variables
router.get('/get-env', envController.getEnv);
router.post('/update-env', envController.updateEnv);

module.exports = router;