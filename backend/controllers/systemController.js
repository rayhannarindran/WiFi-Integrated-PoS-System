const { exec } = require('child_process');

function restartSystem(req, res){
    console.log("Restarting PM2 Processes...");
    try{
        exec('pm2 restart all', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error restarting system: ${error}`);
                res.status(500).json({ message: 'Failed to restart system', error: error.message });
                return;
            }
            console.log(`System restarted: ${stdout}`);
            res.status(200).json({ message: 'System restarted successfully' });
        });
    }
    catch(error){
        console.error('Error restarting system: ', error);
        res.status(500).json({ message: 'Failed to restart system', error: error.message });
    }
}

module.exports = {
    restartSystem
};