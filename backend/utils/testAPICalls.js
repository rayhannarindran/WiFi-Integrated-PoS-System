const axios = require('axios');
const dbService = require("../services/dbService/dbService");
const routerService = require("../services/routerService/routerService");

async function testAddIPBinding(){
    const mac_address = "01:01:01:01:01:01";
    await routerService.addDevice(mac_address);
}

async function testConnectDevice(){
    const API_URL = "http://localhost:3001/api/device/connect-device";
    const ip_addr = "192.168.88.111";
    const token = "6f77d111-e5f3-4310-b1fa-424c3186055e_2024-12-14T08:59:42.351Z_ef412528a0";
    const mac_address = "01:01:01:01:01:01";
    const data = { "token": token, "ip_address": ip_addr, "mac_address": mac_address };

    try {
        const response = await axios.post(API_URL, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.status === 200){
            console.log("Adding device to mikrotik success!")
        }
    } catch (error) {
        console.log("Adding device to mikrotik ERROR!")
    }

}

async function testPrint() {
    const API_URL = "http://localhost:3001/api/transaction/print-transaction";
    const data = await dbService.getTransaction('c6c529ce-70f2-4849-8af5-adef63c32143');

    try {
        const response = await axios.post(API_URL, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.status === 200){
            console.log("Printing Success!")
        }
    } catch (error) {
        console.log("PRINTING ERROR!")
    }
    await dbService.closeConnection();
}

testConnectDevice();