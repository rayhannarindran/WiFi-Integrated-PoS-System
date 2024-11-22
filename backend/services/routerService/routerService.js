const axios = require('axios');

// Base URL for the Python API
const BASE_URL = 'http://localhost:4000'; // Replace with your actual API URL

// Utility functions for calling the API

// Get all IP bindings
async function getIpBindings() {
    try {
        const response = await axios.get(`${BASE_URL}/get-ip-binding-ids`);
        return response.data;
    } catch (error) {
        handleError(error);
    }
}

// Add a device to IP bindings
async function addDevice(macAddress) {
    try {
        const response = await axios.post(`${BASE_URL}/add-device`, { mac_address: macAddress });
        return response.data;
    } catch (error) {
        handleError(error);
    }
}

// Remove a device from IP bindings
async function removeDevice(macAddress) {
    try {
        const response = await axios.post(`${BASE_URL}/remove-device`, { mac_address: macAddress });
        return response.data;
    } catch (error) {
        handleError(error);
    }
}

// Get device status
async function getDeviceStatus(macAddress) {
    try {
        const response = await axios.get(`${BASE_URL}/device-status`, {
            params: { mac_address: macAddress }
        });
        return response.data;
    } catch (error) {
        handleError(error);
    }
}

// Set bandwidth limit
async function setBandwidthLimit(ipAddress, downloadLimit = '2M', uploadLimit = '1M') {
    try {
        const response = await axios.post(`${BASE_URL}/set-bandwidth-limit`, {
            ip_address: ipAddress,
            download_limit: downloadLimit,
            upload_limit: uploadLimit
        });
        return response.data;
    } catch (error) {
        handleError(error);
    }
}

// Error handling helper
function handleError(error) {
    if (error.response) {
        console.error(`API Error: ${error.response.data.message}`);
        throw new Error(error.response.data.message);
    } else if (error.request) {
        console.error('No response received from the API');
        throw new Error('No response received from the API');
    } else {
        console.error(`Error: ${error.message}`);
        throw new Error(error.message);
    }
}

module.exports = {
    getIpBindings,
    addDevice,
    removeDevice,
    getDeviceStatus,
    setBandwidthLimit
};
