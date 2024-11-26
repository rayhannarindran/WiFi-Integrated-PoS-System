const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const envFilePath = path.join(__dirname, '../.env');

// Helper to parse .env into JSON
function parseEnvFile(filePath) {
    const envConfig = dotenv.parse(fs.readFileSync(filePath));
    return envConfig;
  }

async function getEnv(req, res){
    try{
        const envFile = fs.readFileSync(envFilePath, 'utf8');
        res.status(200).json({ message: 'Environment file loaded successfully', data: envFile });
    }
    catch(error){
        console.error('Error getting environment file: ', error);
        res.status(500).json({ message: 'Failed to get environment file', error: error.message });
    }
}

async function updateEnv(req, res){
    try {
        const updates = req.body; // Expecting { key: value } pairs in the body
    
        // Read the current .env file
        const envConfig = parseEnvFile(envFilePath);
    
        // Update the values
        Object.keys(updates).forEach((key) => {
          envConfig[key] = updates[key];
        });
    
        // Convert the updated envConfig back to .env format
        const updatedEnv = Object.entries(envConfig)
          .map(([key, value]) => `${key}=${value}`)
          .join('\n');
    
        // Write the updated .env back to the file
        fs.writeFileSync(envFilePath, updatedEnv);
    
        res.status(200).json({ status: 'success', message: 'Environment variables updated successfully' });
      } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to update .env file', error: error.message });
      }
}

module.exports = {
    getEnv,
    updateEnv
};