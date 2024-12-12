require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const isDocker = () => fs.existsSync('/.dockerenv');

// Base URL for the Python API
const MIKROTIK_PYTHON_API_PORT = process.env.MIKROTIK_PYTHON_API_PORT;
const BASE_URL = isDocker()
    ? `http://python-api:${MIKROTIK_PYTHON_API_PORT}`
    : `http://localhost:${MIKROTIK_PYTHON_API_PORT}`;
const dbService = require('../dbService/dbService');

// console.log(`Using MikroTik Python API at ${BASE_URL}`);

// WHITELISTED MAC ADDRESS
const WHITELISTED_MAC_ADDRESSES = [
    "4C:E1:73:42:25:CE",
    "E0:D4:64:90:B1:DB",
    "3C:06:30:37:8F:12",
    "22:93:DE:14:21:65",
    "CA:4D:C7:32:D2:5B",
    "E0:D4:64:02:81:72",
    "90:61:0C:82:6E:3D",
    "FC:34:97:49:8E:1B",
    "9C:6B:00:36:62:96"
]

// GET IP BINDINGS
async function getIpBindings() {
    try {
        const response = await axios.get(`${BASE_URL}/get-ip-binding-ids`);
        return response.data;
    } catch (error) {
        handleError(error);
    }
}

// ADD DEVICE TO IP BINDINGS
async function addDevice(macAddress) {
    try {
        const response = await axios.post(`${BASE_URL}/add-device`, { mac_address: macAddress });
        return response.data;
    } catch (error) {
        handleError(error);
    }
}

// REMOVE DEVICE
async function removeDevice(macAddress, ipAddress) {
    try {
        const response = await axios.post(`${BASE_URL}/remove-device`, { mac_address: macAddress });
        return response.data;
    } catch (error) {
        handleError(error);
    }
}

// GET DEVICE STATUS
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

async function updateDeviceStatus(macAddress, status) {
    try {
        const response = await axios.post(`${BASE_URL}/update-device-status`, {
            mac_address: macAddress,
            status: status
        });
        return response.data;
    } catch (error) {
        handleError(error);
    }
}

async function getAllBandwidthLimits() {
    try {
        const response = await axios.get(`${BASE_URL}/get-all-bandwidth-limits`);
        return response.data;
    } catch (error) {
        handleError(error);
    }
}

async function getBandwidthLimit(ip_address) {
    try {
        const response = await axios.get(`${BASE_URL}/get-bandwidth-limit`, {
            params: { ip_address: ip_address }
        });
        return response.data;
    } catch (error) {
        handleError(error);
    }
}

// SET BANDWIDTH LIMIT
async function setBandwidthLimit(ip_address, int_download_limit, int_upload_limit) {
    if (!ip_address) {
        throw new Error("IP address is required to set bandwidth limit.");
    }
    if (!int_download_limit || !int_upload_limit) {
        throw new Error("Bandwidth limit is required.");
    }
    try {
        download_limit = `${int_download_limit}M`;
        upload_limit = `${int_upload_limit}M`
        console.log(`Setting bandwidth for ${ip_address} to ${download_limit}/${upload_limit}`);
        const payload = {
            ip_address: ip_address,
            download_limit: download_limit,
            upload_limit: upload_limit
        };
        // console.log(`Payload for bandwidth limit:`, payload);
        const response = await axios.post(`${BASE_URL}/set-bandwidth-limit`, payload);
        return response;
    } catch (error) {
        handleError(error);
    }
}

// ERROR HANDLING
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

async function syncMikroDb() {
    console.log("Starting synchronization between database and MikroTik...");

    try {
        console.log("FETCHING TOKENS FROM DATABASE...");
        const tokens = await dbService.findTokensByCriteria({});
        if (!tokens || tokens.length === 0) {
            console.log("No tokens found in the database. Exiting synchronization.");
            return;
        }

        console.log("\nFETCHING IP BINDINGS FROM MIKROTIK...");
        const mikrotikDevices = await getIpBindings();
        const mikrotikDeviceMap = new Map(
            mikrotikDevices.data.map(device => [device.mac_address, device])
        );
        console.log(`Found ${mikrotikDevices.data.length} devices (bindings) in MikroTik.`);

        console.log("\nPROCESSING TOKENS AND DEVICES...");
        for (const token of tokens) {
            if (!token.devices_connected.length) {
                console.log(`Token ${token.token} has no connected devices.`);
                continue;
            }

            for (const connectedDevice of token.devices_connected) {
                await processDevice(token, connectedDevice, mikrotikDeviceMap);
            }
        }

        await removeInvalidMikrotikDevices(tokens, mikrotikDevices);

        console.log("Synchronization between database and MikroTik completed successfully!");
        await dbService.closeConnection();
    } catch (error) {
        console.error("Error during synchronization:", error.message);
    }
}

async function processDevice(token, connectedDevice, mikrotikDeviceMap) {
    try {
        const device = await dbService.findDeviceByID(connectedDevice._id);
        if (!device) {
            console.warn(`Device with ID ${connectedDevice._id} not found in database. Skipping...`);
            return;
        }

        if (WHITELISTED_MAC_ADDRESSES.includes(device.mac_address)) {
            console.log(`Device ${device.mac_address} is whitelisted. Skipping MikroTik modifications.`);
            return;
        }

        const mikrotikDevice = mikrotikDeviceMap.get(device.mac_address);
        if (!mikrotikDevice) {
            console.log(`Device ${device.mac_address} not found in MikroTik. Adding...`);
            await addDevice(device.mac_address);
            await setBandwidthLimit(device.ip_address, device.bandwidth, device.bandwidth);
            console.log(`Device ${device.mac_address} added with bandwidth ${device.bandwidth}M.`);
        } else {
            await verifyAndUpdateBandwidth(device);
        }

        if (isTokenExpired(token)) {
            console.log(`Token ${token.token} expired. Disconnecting device ${device.mac_address}...`);
            //await removeDevice(device.mac_address);
            await dbService.removeDevice(token.token, device.mac_address);
        }
    } catch (error) {
        console.warn(`Failed to process device ${connectedDevice.id}: ${error.message}`);
    }
}

async function verifyAndUpdateBandwidth(device) {
    const { download_limit, upload_limit } = await getBandwidthLimit(device.ip_address);
    const dlLimit = parseInt(download_limit) / 1000000;
    const ulLimit = parseInt(upload_limit) / 1000000;

    if (dlLimit !== device.bandwidth || ulLimit !== device.bandwidth) {
        console.log(`Device ${device.mac_address} bandwidth mismatch. Updating...`);
        const response = await setBandwidthLimit(device.ip_address, device.bandwidth, device.bandwidth);
        if (response.status === 200) {
            console.log(`Bandwidth for ${device.mac_address} updated to ${device.bandwidth}M.`);
        } else {
            console.error(`Failed to update bandwidth for ${device.mac_address}.`);
        }
    } else {
        console.log(`Device ${device.mac_address} bandwidth is correct.`);
    }
}

function isTokenExpired(token) {
    return token.status !== 'valid' || new Date() > new Date(token.valid_until);
}

async function removeInvalidMikrotikDevices(tokens, mikrotikDevices) {
    const deviceMacInDb = new Set(
        tokens.flatMap(token => token.devices_connected.map(device => device.mac_address))
    );

    for (const mikrotikDevice of mikrotikDevices.data) {
        if (WHITELISTED_MAC_ADDRESSES.includes(mikrotikDevice.mac_address)) {
            console.log(`Device ${mikrotikDevice.mac_address} is whitelisted. Skipping removal.`);
            continue;
        }

        if (!deviceMacInDb.has(mikrotikDevice.mac_address)) {
            console.log(`Device ${mikrotikDevice.mac_address} not found in database. Removing from MikroTik...`);
            if (!mikrotikDevice.mac_address) 
                console.log("MAC ADDRESS NOT FOUND, SKIPPING REMOVAL");
            else{
                await removeDevice(mikrotikDevice.mac_address);
            }
        }
    }
}

module.exports = {
    getIpBindings,
    addDevice,
    removeDevice,
    getDeviceStatus,
    updateDeviceStatus,
    getAllBandwidthLimits,
    getBandwidthLimit,
    setBandwidthLimit,
    syncMikroDb,
};
