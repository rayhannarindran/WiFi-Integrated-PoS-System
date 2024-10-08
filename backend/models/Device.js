const mongoose = require('mongoose');
const { Schema } = mongoose;

const DeviceSchema = new mongoose.Schema({
    device_id: { type: String, required: true, unique: true }, // Unique identifier for the device
    token_id: { type: Schema.Types.ObjectId, ref: 'Token', required: true }, // Token associated with the device
    ip_address: { type: String, required: true }, // IP address of the device,
    mac_address: { type: String, required: true }, // MAC address of the device,
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