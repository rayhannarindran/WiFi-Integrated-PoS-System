require('dotenv').config();
const axios = require('axios');

// Base URL for the Python API
const MIKROTIK_PYTHON_API_PORT = process.env.MIKROTIK_PYTHON_API_PORT;
const BASE_URL = `http://localhost:${MIKROTIK_PYTHON_API_PORT}`;
const dbService = require('../dbService/dbService');

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
async function removeDevice(macAddress) {
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
        console.log(`Payload for bandwidth limit:`, payload);
        const response = await axios.post(`${BASE_URL}/set-bandwidth-limit`, payload);
        return response.data;
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
        // AMBIL TOKEN DARI DATABASE
        const tokens = await dbService.findTokensByCriteria({});
        if (!tokens || tokens.length === 0) {
            console.log("No tokens found in the database. Exiting synchronization.");
            return;
        }
        // console.log(tokens);

        // AMBIL DATA MIKROTIK IP BINDINGS
        const mikrotikDevices = await getIpBindings();
        const mikrotikDeviceMap = new Map(
            mikrotikDevices.data.map(device => [device.mac_address, device])
        );

        // PROSES TOKEN UNTUK ADJUST BANDWIDTH MIKROTIK
        for (const token of tokens) {
            console.log(`Processing token: ${token.token} with ${token.devices_connected.length} device connected`);

            if (parseInt(token.devices_connected.length) < 1){
                console.log(`${token.token} doesn't have connected device`)
                continue;
            }

            for (const connectedDevice of token.devices_connected) {
                try {
                    const device = await dbService.findDeviceByID(connectedDevice._id);
                    if (!device) {
                        console.warn(`Device with ID ${connectedDevice._id} not found in database. Skipping...`);
                        continue;
                    }

                    console.log(`Checking device ${device.mac_address} (IP: ${device.ip_address}) against MikroTik...`);
                    const mikrotikDevice = mikrotikDeviceMap.get(device.mac_address);

                    if (!mikrotikDevice) {
                        console.log(`Device ${device.mac_address} not found in MikroTik. Adding...`);
                        console.log(device);
                        await addDevice(device.mac_address);
                        await setBandwidthLimit(device.ip_address, device.bandwidth, device.bandwidth);
                        console.log(`Device ${device.mac_address} added to MikroTik with IP ${device.ip_address} and bandwidth ${device.bandwidth}M.`);
                    }
                    
                    else {
                        const { download_limit, upload_limit } = mikrotikDevice;
                        if (download_limit !== device.bandwidth || upload_limit !== device.bandwidth) {
                            console.log(
                                `Device ${device.mac_address} has mismatched bandwidth in MikroTik. Updating...`
                            );
                            await setBandwidthLimit(
                                device.ip_address,
                                device.bandwidth,
                                device.bandwidth
                            );
                        }
                    }

                    // CHECKIN TOKEN TIDAK EXPIRED
                    if (token.status !== 'valid' || new Date() > new Date(token.valid_until)) {
                        console.log(`Device ${device.mac_address} associated with expired token. Disconnecting...`);
                        await removeDevice(device.mac_address);
                        await dbService.removeDevice(token.token, device.mac_address);
                    }
                } catch (deviceError) {
                    console.warn(`Failed to process device ${connectedDevice.device_id}: ${deviceError.message}`);
                }
            }

            // MARK EXPIRED TOKEN
            if (token.status !== 'valid' || new Date() > new Date(token.valid_until)) {
                console.log(`Marking token ${token.token} as expired.`);
                await dbService.updateTokenRecord(token.token, { status: 'expired' });
            }
        }

        console.log("Synchronization between database and MikroTik completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error during synchronization:", error.message);
        process.exit(1);
    }
}

module.exports = {
    getIpBindings,
    addDevice,
    removeDevice,
    getDeviceStatus,
    setBandwidthLimit,
    syncMikroDb,
};
