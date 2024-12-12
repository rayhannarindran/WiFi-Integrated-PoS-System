import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '.env');
const defaultEnvPath = path.resolve(__dirname, 'default.env');

if (!fs.existsSync(envPath)) {
    console.log('.env file not found. Creating a default .env file...');
    fs.copyFileSync(defaultEnvPath, envPath);
    console.log('Default .env file created successfully.');
} else {
    console.log('.env file already exists. Skipping creation.');
}