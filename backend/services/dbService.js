const fs = require('fs');
const mongoose = require('mongoose');
const Token = require('../models/Token'); // Import your model
const generateTokenRecord = require('./tokenService').generateTokenRecord;

const mongoURI = 'mongodb://localhost:27017/pos_dummy'; // MongoDB URI

//Insert token record into the database
async function insertTokenRecord(record) {
    try {
        // Connect to the database
        await mongoose.connect(mongoURI);

        // Create a new token document
        const newToken = new Token(record);

        // Save the document to the database
        await newToken.save();
        console.log('Token inserted successfully!');

    } catch (error) {
        console.error('Error inserting token:', error);
    } finally {
        // Close the connection only if it's the last operation
        if (mongoose.connection.readyState === 1) {
            mongoose.connection.close();
        }
    }
}

// Export functions
module.exports = {
    insertTokenRecord
};


// // CHANGE WITH API CALL DATA -----------------------
// const data_file = fs.readFileSync('./data_example/pos_data.json');
// const pos_data = JSON.parse(data_file);
// // -------------------------------------------------

// const tokenRecord = generateTokenRecord(pos_data);

// insertTokenRecord(tokenRecord);