const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Python API Base URL
const PYTHON_API_URL = 'http://localhost:4000';

// Add device to MikroTik Hotspot
app.post('/add-device', async (req, res) => {
    const { mac_address } = req.body;

    try {
        const response = await axios.post(`${PYTHON_API_URL}/add-device`, {
            mac_address: mac_address,
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error adding device:', error.response ? error.response.data : error.message);
        res.status(500).json({ status: 'error', message: error.response ? error.response.data.message : 'Failed to add device' });
    }
});

// Remove device from MikroTik Hotspot
app.post('/remove-device', async (req, res) => {
    const { mac_address } = req.body;

    try {
        const response = await axios.post(`${PYTHON_API_URL}/remove-device`, {
            mac_address: mac_address
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error removing device:', error.response ? error.response.data : error.message);
        res.status(500).json({ status: 'error', message: error.response ? error.response.data.message : 'Failed to remove device' });
    }
});

// Check the connection status of a device
app.get('/device-status', async (req, res) => {
    const { mac_address } = req.query;

    try {
        const response = await axios.get(`${PYTHON_API_URL}/device-status`, {
            params: { mac_address: mac_address }
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error checking device status:', error.response ? error.response.data : error.message);
        // Tambahkan logging lebih rinci
        console.error('Full error response:', error);
        res.status(500).json({ status: 'error', message: error.response ? error.response.data.message : 'Failed to check device status' });
    }
});


// Set bandwidth limit for a device
app.post('/set-bandwidth-limit', async (req, res) => {
    const { ip_address, download_limit, upload_limit } = req.body;

    try {
        const response = await axios.post(`${PYTHON_API_URL}/set-bandwidth-limit`, {
            ip_address: ip_address,
            download_limit: download_limit || '2M',
            upload_limit: upload_limit || '1M'
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error setting bandwidth limit:', error.response ? error.response.data : error.message);
        res.status(500).json({ status: 'error', message: error.response ? error.response.data.message : 'Failed to set bandwidth limit' });
    }
});

// Set connection time limit for a device
app.post('/set-time-limit', async (req, res) => {
    const { mac_address, time_limit } = req.body;

    try {
        const response = await axios.post(`${PYTHON_API_URL}/set-time-limit`, {
            mac_address: mac_address,
            time_limit: time_limit || '1h'
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error setting time limit:', error.response ? error.response.data : error.message);
        res.status(500).json({ status: 'error', message: error.response ? error.response.data.message : 'Failed to set time limit' });
    }
});

// Change connection type (blocked, bypass, regular)
app.post('/change-connection-type', async (req, res) => {
    const { mac_address, connection_type } = req.body;

    try {
        const response = await axios.post(`${PYTHON_API_URL}/change-connection-type`, {
            mac_address: mac_address,
            connection_type: connection_type
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error changing connection type:', error.response ? error.response.data : error.message);
        res.status(500).json({ status: 'error', message: error.response ? error.response.data.message : 'Failed to change connection type' });
    }
});

// Start the Node.js server
app.listen(3000, () => {
    console.log('Node.js server running on port 3000');
});
