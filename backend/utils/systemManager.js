require('dotenv').config();
const dbService = require('../services/dbService/dbService');
const routerService = require('../services/routerService/routerService');

async function updateSystem(){
    try {
        console.log("Updating database");
        await dbService.databaseUpdate();

        console.log("Synchronizing MikroTik");
        await routerService.syncMikroDb();

        console.log("System update completed");

    } catch (error) {
        console.error("Error during system update:", error.message);
    }
}

(async () => {
    try {
        await updateSystem();
        // console.log("Update completed successfully!");
    } catch (error) {
        // console.error("Failed to complete update:", error.message);
    }
})();

module.exports = {
    updateSystem,
};