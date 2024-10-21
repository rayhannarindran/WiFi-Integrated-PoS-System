require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const dbService = require('./services/dbService/dbService.js');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(bodyParser.json()); 

// Routes

// Insert a new token
app.post('/api/token', async (req, res) => {
    try {
        const tokenData = req.body;
        await dbService.insertTokenRecord(tokenData);
        res.status(201).json({ message: 'Token inserted successfully!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Find a token by ID
app.get('/api/token/:id', async (req, res) => {
    try {
        const token = req.params.id;
        const record = await dbService.findTokenRecord(token);
        res.status(200).json(record);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

// Update a token by ID
app.put('/api/token/:id', async (req, res) => {
    try {
        const token = req.params.id;
        const update = req.body;
        const updatedRecord = await dbService.updateTokenRecord(token, update);
        res.status(200).json(updatedRecord);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

// Delete a token by ID
app.delete('/api/token/:id', async (req, res) => {
    try {
        const token = req.params.id;
        await dbService.deleteTokenRecord(token);
        res.status(200).json({ message: 'Token deleted successfully!' });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

// Add a device to a token
app.post('/api/token/:id/device', async (req, res) => {
    try {
        const token = req.params.id;
        const device = req.body;
        await dbService.addDevice(token, device);
        res.status(201).json({ message: 'Device added successfully!' });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

// Remove a device from a token
app.delete('/api/token/:id/device/:device_id', async (req, res) => {
    try {
        const token = req.params.id;
        const deviceId = req.params.device_id;
        await dbService.removeDevice(token, deviceId);
        res.status(200).json({ message: 'Device removed successfully!' });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});