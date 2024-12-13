const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define Transaction Schema
const TransactionSchema = new mongoose.Schema({
    order: {
        type: Object, // JSON of the POS order
        required: true,
    },
    qrUrl: {
        type: String, // URL for the QR code
        required: true,
        unique: true,
    },
    created_at: {
        type: Date,
        default: Date.now, // Automatically set to current time
    },
    updated_at: {
        type: Date,
        default: Date.now, // Automatically set to current time
    },
});

// Middleware to update `updated_at` field before saving
TransactionSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

module.exports = mongoose.model('Transaction', TransactionSchema);