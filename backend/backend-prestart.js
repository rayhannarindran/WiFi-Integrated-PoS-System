const fs = require('fs');
const path = require('path');

// Check if .env file exists, if not, create a default .env file
const envPath = path.resolve(__dirname, '.env');
const defaultEnvPath = path.resolve(__dirname, 'default.env');

if (!fs.existsSync(envPath)) {
    console.log('.env file not found. Creating a default .env file...');
    fs.copyFileSync(defaultEnvPath, envPath);
    console.log('Default .env file created successfully.');
} else {
    console.log('.env file already exists. Skipping creation.');
}