const axios = require('axios');
const dbService = require("../services/dbService/dbService")

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

testPrint();