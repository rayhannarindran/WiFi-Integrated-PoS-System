const express = require('express');
const os = require('os');

const app = express();
const PORT = 3000;

// Get local network IP
function getLocalNetworkIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Filter out internal (127.0.0.1) and non-IPv4 addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return null;
}

// Endpoint for handling connection
app.post('/connect', (req, res) => {
    const localIP = getLocalNetworkIP(); // Get the local IP from the server
    console.log(`User with IP ${localIP} is attempting to connect...`);

    res.json({ status: 'success', message: `Connected user with IP: ${localIP}` });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
