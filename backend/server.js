require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// API Routes
const deviceRoutes = require('./routes/deviceRoutes.js');
const tokenRoutes = require('./routes/tokenRoutes.js');
const envRoutes = require('./routes/envRoutes.js');

// MOKA API
const mokaPoller = require('./utils/mokaPoller.js');

const app = express();
const PORT = parseInt(process.env.BACKEND_SERVER_PORT) || 3001;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Health Check Route
app.get('/health', (req, res) => {
    res.status(200).json({ message: 'Server is healthy' });
});

// Routes
app.use('/api/device', deviceRoutes);
app.use('/api/token', tokenRoutes);
app.use('/api/env', envRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

// Polling MOKA
mokaPoller.startMokaPolling();

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on all interfaces at port ${PORT}`);
});