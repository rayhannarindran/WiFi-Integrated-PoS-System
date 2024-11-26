const { baseModelName } = require('../models/Token');
const dbService = require('../services/dbService/dbService');
const routerService = require('../services/routerService/routerService');

async function connectDevice(req, res){
    try{
        const { token, ip_address, mac_address } = req.body;

        // Find and validate token
        const tokenRecord = await dbService.findTokenRecord(token);
        if(!tokenRecord){
            return res.status(404).json({ message: 'Token not found' });
        }

        // Check if token is valid
        if(tokenRecord.status !== 'valid'){
            return res.status(400).json({ message: 'Token is not valid' });
        }

        // Check if maximum devices limit is reached
        if(tokenRecord.devices_connected.length >= tokenRecord.max_devices){
            return res.status(400).json({ message: 'Maximum devices limit reached' });
        }

        // Create a new device record and add to database
        const newDevice = {
            ip_address,
            mac_address
        }
        await dbService.addDevice(token, newDevice);

        // Get updated token record
        const updatedTokenRecord = await dbService.findTokenRecord(token);

        // Calculate and set new bandwidth
        const newBandwidth = { bandwidth: Math.floor(updatedTokenRecord.max_bandwidth / updatedTokenRecord.devices_connected.length) };
        await dbService.updateDevice(token, newDevice.mac_address, newBandwidth);

        for (let connectedDevice of updatedTokenRecord.devices_connected) {
            // Device update are done using mac address, which is stored in the device database
            device = await dbService.findDeviceByID(connectedDevice._id);
            if (device) {
                await dbService.updateDevice(token, device.mac_address, newBandwidth);
            }
        }

        // Update router configuration
        await routerService.addDevice(newDevice.mac_address);

        res.status(200).json({ 
            message: 'Device connected successfully', 
            data: { token, ip_address, mac_address }
        });
    }
    catch(error){
        console.error('Error connecting device: ', error);
        res.status(500).json({ message: 'Failed to connect device', error: error.message });
    }
}

async function disconnectDevice(req, res){
    try{
        const { mac_address } = req.body;

        // Find and validate device
        const deviceRecord = await dbService.findDevice(mac_address);
        if(!deviceRecord){
            return res.status(404).json({ message: 'Device not found' });
        }
        const tokenRecord = await dbService.findTokenRecordByID(deviceRecord.token_id);
        if(!tokenRecord){
            return res.status(404).json({ message: 'Token not found' });
        }
        const token = tokenRecord.token;

        // Remove device from token
        await dbService.removeDevice(token, mac_address);

        const updatedTokenRecord = await dbService.findTokenRecord(token);

        // Check if device was the only one connected
        if (updatedTokenRecord.devices_connected.length === 0) {
            return res.status(200).json({ 
                message: 'Device disconnected successfully', 
                data: { token, mac_address }
            });
        }

        // Calculate and set new bandwidth
        const newBandwidth = { bandwidth: Math.floor(updatedTokenRecord.max_bandwidth / updatedTokenRecord.devices_connected.length) };
        // remove device from tokenRecord variable
        for (let connectedDevice of updatedTokenRecord.devices_connected) {
            // Device update are done using mac address, which is stored in the device database
            device = await dbService.findDeviceByID(connectedDevice._id);
            if (device) {
                await dbService.updateDevice(token, device.mac_address, newBandwidth);
            }
        }

        // Update router configuration
        await routerService.removeDevice(mac_address);

        res.status(200).json({ 
            message: 'Device disconnected successfully', 
            data: { token, mac_address }
        });
    }
    catch(error){
        console.error('Error disconnecting device: ', error);
        res.status(500).json({ message: 'Failed to disconnect device', error: error.message });
    }
}

module.exports = {
    connectDevice,
    disconnectDevice
};