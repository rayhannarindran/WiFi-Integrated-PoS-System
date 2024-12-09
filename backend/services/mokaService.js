// Define the API URL and access token
const axios = require('axios');
const API_URL = "https://api.mokapos.com/v3/outlets/1042820/reports/get_latest_transactions";
const ACCESS_TOKEN = "89f905736a339143964ea0209f04a913b858a9c898844254d4cf09e6f729392e";
const REQUEST_TIMEOUT = 10000;
const MAX_RETRIES = 3;

// Make the API request
async function getMokaTransactions(retryCount = 0) {
    try {
        const response = await axios({
            method: 'GET',
            url: API_URL,
            headers: {
                "Authorization": `Bearer ${ACCESS_TOKEN}`,
                "Content-Type": "application/json"
            },
            timeout: REQUEST_TIMEOUT
        });

        return response.data;
    } catch (error) {
        if (retryCount < MAX_RETRIES) {
            console.log(`Retrying request (${retryCount + 1}/${MAX_RETRIES})...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return getMokaTransactions(retryCount + 1);
        }
        throw new Error(`Failed to fetch transactions: ${error.message}`);
    }
}

function preprocessDataForDB(api_data) {
    payments = api_data?.data?.payments || [];
    if (payments.length > 0) {
        // Extract the relevant fields
        latest_payment = payments[0];
        const processedData = {
            id: latest_payment.id,
            payment_no: latest_payment.payment_no,
            created_at: latest_payment.created_at,
            discounts: latest_payment.discounts,  
            subtotal: latest_payment.subtotal,
            gratuities: latest_payment.gratuities,
            taxes: latest_payment.taxes,
        }

        return processedData;
    } else {
        console.log("No transactions found.");
        return [];
    }
}

function preprocessDataForPrinting(api_data) {
    payments = api_data?.data?.payments || [];
    if (payments.length > 0) {
        // Extract the relevant fields
        latest_payment = payments[0];
        const processedData = {
            id: latest_payment.id,
            payment_no: latest_payment.payment_no,
            created_at: latest_payment.created_at,
            discounts: latest_payment.discounts,  
            subtotal: latest_payment.subtotal,
            gratuities: latest_payment.gratuities,
            taxes: latest_payment.taxes,
            checkouts: latest_payment.checkouts,
        }
        return processedData;
    } else {
        console.log("No transactions found.");
        return [];
    }
}

module.exports = {
    getMokaTransactions,
    preprocessDataForDB,
    preprocessDataForPrinting
};