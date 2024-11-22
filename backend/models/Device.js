require('dotenv').config();
const mongoose = require('mongoose');
const { Schema } = mongoose;

BANDWIDTH_PER_DEVICE = parseInt(process.env.MAX_SYSTEM_BANDWIDTH) / parseInt(process.env.MAX_SYSTEM_DEVICES);

const DeviceSchema = new mongoose.Schema({
    token_id: { type: Schema.Types.ObjectId, ref: 'Token', required: true }, // Token associated with the device
    ip_address: { type: String, required: true }, // IP address of the device,
    mac_address: { type: String, required: true }, // MAC address of the device,
    bandwidth: { type: Number, default: BANDWIDTH_PER_DEVICE }, // Bandwidth for the device
    connected_at: { type: Date, default: Date.now }, // Timestamp for when the device connected
    disconnected_at: { type: Date, default: null }, // Timestamp for when the device disconnected
    created_at: { type: Date, default: Date.now }, // Timestamp for when the device was created
    updated_at: { type: Date, default: Date.now }, // Timestamp for when the device was last updated
});

DeviceSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

module.exports = mongoose.model('Device', DeviceSchema);