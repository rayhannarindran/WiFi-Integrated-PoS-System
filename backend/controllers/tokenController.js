const dbService = require('../services/dbService/dbService');
const routerService = require('../services/routerService/routerService');

async function connectDevice(req, res){
    try{
        const { token, device_id, ip_address, mac_address } = req.body;
    }
}