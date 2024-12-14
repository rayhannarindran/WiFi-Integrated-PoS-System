// Define the API URL and access token
const axios = require('axios');
const API_URL = `https://api.mokapos.com/v3/outlets/${process.env.MOKA_MERCHANT_ID}/reports/get_latest_transactions`;
const ACCESS_TOKEN = process.env.MOKA_ACCESS_TOKEN;
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
    const payments = api_data?.data?.payments || [];
    if (payments.length > 0) {
        const latest_payment = payments[0];

        // Checkouts field 
        const checkouts = latest_payment.checkouts?.map(item => ({
            item_name: item.item_name || null,
            tax_amount: item.tax_amount || null,
            quantity: item.quantity || null,
            item_price: item.item_price || null,
            total_price: item.total_price || null,
            discount_amount: item.discount_amount || null,
            gratuity_amount: item.gratuity_amount || null,
            note: item.note || null,
        })) || [];

        // Extract the relevant fields
        const processedData = {
            id: latest_payment.id,
            payment_no: latest_payment.payment_no,
            created_at: latest_payment.created_at,
            discounts: latest_payment.discounts,
            subtotal: latest_payment.subtotal,
            gratuities: latest_payment.gratuities,
            taxes: latest_payment.taxes,
            checkouts: checkouts,
        };

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