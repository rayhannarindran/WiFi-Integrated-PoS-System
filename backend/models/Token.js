const mongoose = require('mongoose');
const { Schema } = mongoose;

const TokenSchema = new mongoose.Schema({
    token: { type: String, required: true, unique: true }, // Token generated for the purchase
    status: { type: String, enum: ['valid', 'expired', 'revoked'], default: 'valid' }, // Status of the token
    purchase_id: { type: String, required: true }, // ID of the purchase that generated the token
    valid_from: { type: Date, required: true }, // When the token becomes valid
    valid_until: { type: Date, required: true }, // When the token expires
    max_devices: { type: Number, default: 1 }, // Maximum number of devices that can use this token
    max_bandwidth: { type: Number, default: 10}, // Maximum bandwidth for the token
    devices_connected: { 
        type: [{
            device_id: { type: Schema.Types.ObjectId, ref: 'Device' } // Reference to the device ID
        }],
        validate: {  
            validator: function(v) {
                return v.length <= this.max_devices; // Constraint based on max_devices
            },
            message: props => `You can connect a maximum of ${props.instance.max_devices} devices!` // Correct reference to max_devices
        }
    }, // List of devices connected to the token
    time_limit: { type: Number, default: 180 }, // Time limit for the token in minutes
    created_at: { type: Date, default: Date.now }, // Timestamp for when the token was created
    updated_at: { type: Date, default: Date.now }, // Timestamp for when the token was last updated
});

TokenSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

module.exports = mongoose.model('Token', TokenSchema);