require('dotenv').config();
const dbService = require('../services/dbService/dbService');
const routerService = require('../services/routerService/routerService');

const POLLING_INTERVAL = 20000;

async function updateSystem(){
    try {
        console.log("SYNCING DATABASE");
        await dbService.databaseUpdate();

        console.log("\n\nSYNCING MIKROTIK");
        await routerService.syncMikroDb();

        console.log("\n\nSYSTEM UPDATE COMPLETE!!!");
    } catch (error) {
        console.error("Error during system update:", error.message);
    }
}

function startSystemUpdatePolling() {
    console.log("Starting system update polling...");
    setInterval(() => {
        updateSystem();
    }, POLLING_INTERVAL);
}

module.exports = {
    updateSystem,
    startSystemUpdatePolling
};