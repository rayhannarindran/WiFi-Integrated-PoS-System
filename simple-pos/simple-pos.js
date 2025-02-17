const readline = require('readline');
const axios = require('axios');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Predefined menu
const menu = [
    { item_name: "Pancong", item_price: 15000, tax_amount: 1500, discount_amount: 1000, gratuity_amount: 0.00 },
    { item_name: "Suprek", item_price: 30000, tax_amount: 3000, discount_amount: 2000, gratuity_amount: 0.00 },
    { item_name: "Warkam", item_price: 50000, tax_amount: 5000, discount_amount: 0.00, gratuity_amount: 0.00 }
];

let cart = [];

// Generate unique ID
function generateTransactionId() {
    return `INV-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(Math.random() * 1000)}`;
}

// Display menu
function displayMenu() {
    console.log("\n=== MENU ===");
    menu.forEach((item, index) => {
        console.log(`${index + 1}. ${item.item_name} - Rp${item.item_price}`);
    });
    console.log("Enter the item number to add to cart, or type 'done' to finish.");
}

// Process the transaction
function processOrder() {
    console.log("\n=== ORDER SUMMARY ===");
    let subtotal = 0, totalTax = 0, totalDiscount = 0, totalGratuity = 0;

    cart.forEach((item, index) => {
        const total_price = (item.item_price + item.tax_amount - item.discount_amount) * item.quantity;
        subtotal += total_price;
        totalTax += item.tax_amount * item.quantity;
        totalDiscount += item.discount_amount * item.quantity;
        totalGratuity += item.gratuity_amount * item.quantity;

        console.log(`${index + 1}. ${item.item_name} x${item.quantity} - Rp${total_price}`);
    });

    const finalTotal = subtotal + totalGratuity;

    console.log(`\nSubtotal: Rp${subtotal}`);
    console.log(`Tax: Rp${totalTax}`);
    console.log(`Discount: -Rp${totalDiscount}`);
    console.log(`Gratuity: +Rp${totalGratuity}`);
    console.log(`Total Payment: Rp${finalTotal}`);

    rl.question("Confirm order? (yes/no): ", (answer) => {
        if (answer.toLowerCase() === 'yes') {
            const transactionData = formatTransactionData(cart, subtotal, totalTax, totalDiscount, totalGratuity);
            sendToApi(transactionData);
        } else {
            console.log("Order cancelled.");
            restartTransaction();
        }
    });
}

// Format transaction data
function formatTransactionData(cart, subtotal, totalTax, totalDiscount, totalGratuity) {
    return {
        id: Math.floor(Math.random() * 1000000).toString(),
        payment_no: generateTransactionId(),
        created_at: new Date().toISOString(),
        discounts: totalDiscount,
        subtotal: subtotal,
        gratuities: totalGratuity,
        taxes: totalTax,
        checkouts: cart.map(item => ({
            item_name: item.item_name,
            tax_amount: item.tax_amount,
            quantity: item.quantity,
            item_price: item.item_price,
            total_price: (item.item_price + item.tax_amount - item.discount_amount) * item.quantity,
            discount_amount: item.discount_amount,
            gratuity_amount: item.gratuity_amount,
            note: null
        }))
    };
}

// Send transaction to API
function sendToApi(transactionData) {
    console.log("\nSending order to API...");

    const API_URL = "http://localhost:3001/api/transaction/process-transaction"; // Replace with actual API

    axios.post(API_URL, transactionData)
        .then(response => {
            console.log("✅ Order successfully sent!", response.data);
            restartTransaction();
        })
        .catch(error => {
            console.error("❌ Error sending order:", error.message);
            restartTransaction();
        });
}

// Start transaction process
function startTransaction() {
    displayMenu();
    rl.question("Choose item number (or 'done' to finish): ", (input) => {
        if (input.toLowerCase() === 'done') {
            if (cart.length === 0) {
                console.log("No items selected. Exiting.");
                rl.close();
            } else {
                processOrder();
            }
            return;
        }

        const selectedItem = menu[parseInt(input) - 1];
        if (!selectedItem) {
            console.log("Invalid selection. Try again.");
            return startTransaction();
        }

        rl.question(`Enter quantity for ${selectedItem.item_name}: `, (qty) => {
            const quantity = parseInt(qty);
            if (isNaN(quantity) || quantity <= 0) {
                console.log("Invalid quantity. Try again.");
                return startTransaction();
            }

            cart.push({ ...selectedItem, quantity });
            console.log(`${selectedItem.item_name} x${quantity} added to cart.`);
            startTransaction();
        });
    });
}

// Restart after each transaction
function restartTransaction() {
    rl.question("\nDo you want to start a new transaction? (yes/no): ", (answer) => {
        if (answer.toLowerCase() === 'yes') {
            cart = [];
            startTransaction();
        } else {
            console.log("Thank you for using the PoS system!");
            rl.close();
        }
    });
}

// Start PoS
console.log("\n📌 Welcome to the Terminal-Based PoS System");
startTransaction();
