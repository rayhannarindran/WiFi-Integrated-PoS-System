const { db } = require("./backend/models/Token");

db = db.getSiblingDB('wifi-pos'); // Switch to the wifi-pos database

db.createCollection('tokens');  // Create the tokens collection
db.createCollection('devices'); // Create the devices collection
db.createCollection('transactions'); // Create the transactions collection

print('Database and collections created successfully.');