db = db.getSiblingDB('wifi-pos'); // Switch to the wifi-pos database

db.createCollection('tokens');  // Create the tokens collection
db.createCollection('devices'); // Create the devices collection

print('Database and collections created successfully.');