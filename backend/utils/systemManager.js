require('dotenv').config();
const dbService = require('../services/dbService/dbService');
const routerService = require('../services/routerService/routerService');

const POLLING_INTERVAL = 20000;

async function updateSystem(){
    try {
        console.log("Updating database");
        await dbService.databaseUpdate();

        //! UNCOMMENT THIS
        // console.log("Synchronizing MikroTik");
        // await routerService.syncMikroDb();

        console.log("System update completed");

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