require('dotenv').config();
const { Printer, Image } = require("@node-escpos/core");
const USB = require("@node-escpos/usb-adapter");

const vendor_id = parseInt(process.env.PRINTER_USB_VENDOR_ID, 16);
const product_id = parseInt(process.env.PRINTER_USB_PRODUCT_ID, 16);

/**
 * Format receipt data for printing
 * @param {Object} pos_data - Processed POS data
 * @returns {String} - Formatted receipt string
 */
function formatReceipt(pos_data) {
    const {
        id,
        payment_no,
        created_at,
        discounts,
        subtotal,
        gratuities,
        taxes,
        checkouts
    } = pos_data;

    let receipt = `Receipt No: ${payment_no}\n`;
    receipt += `Date: ${new Date(created_at).toLocaleString()}\n`;
    receipt += `-----------------------------------\n`;

    // Daftar barang tanpa pajak dan gratuity per item
    checkouts.forEach((item, index) => {
        receipt += `${index + 1}. ${item.item_name}\n`;
        receipt += `   Qty: ${item.quantity} x ${item.item_price.toFixed(2)}\n`;
        receipt += `   Subtotal: ${item.total_price.toFixed(2)}\n`;
        if (item.discount_amount) {
            receipt += `   Discount: -${item.discount_amount.toFixed(2)}\n`;
        }
        if (item.note) {
            receipt += `   Note: ${item.note}\n`;
        }
        receipt += `-----------------------------------\n`;
    });

    // Penjumlahan subtotal dan detail akhir
    receipt += `Subtotal: ${subtotal.toFixed(2)}\n`;
    receipt += `Discounts: -${discounts.toFixed(2)}\n`;
    receipt += `-----------------------------------\n`;
    receipt += `Taxes: ${taxes.toFixed(2)}\n`;
    receipt += `Gratuities: ${gratuities.toFixed(2)}\n`;
    receipt += `-----------------------------------\n`;
    receipt += `Total: ${(subtotal + taxes + gratuities - discounts).toFixed(2)}\n`;

    return receipt;
}

/**
 * Print the receipt
 * @param {Object} pos_data - Processed POS data
 * @param {String} qrCodeURL - URL for QR Code
 */
async function printReceipt(pos_data, qrCodeURL) {
    const device = new USB(vendor_id, product_id);

    device.open(async function (err) {
        if (err) {
            console.error("Printer error:", err);
            return;
        }

        const options = { encoding: "GB18030" /* default */ };
        const printer = new Printer(device, options);

        // Format receipt before printing
        const formattedReceipt = formatReceipt(pos_data);

        // Cetak ke console untuk simulasi
        console.log("=== Simulasi Print Struk ===");
        console.log(formattedReceipt);
        console.log("=== Simulasi QR Code URL ===");
        console.log(qrCodeURL);

        printer
            .font("a")
            .align("ct")
            .style("bu")
            .size(1, 1)
            .text(formattedReceipt);

        if (qrCodeURL) {
            await printer.qrimage(qrCodeURL, { type: 'png', mode: 'dhdw', size: 4 });
        }

        printer.cut().close();
    });
}

// Data Dummy untuk Testing
const dummyData = {
    id: "123456",
    payment_no: "INV-20241210-001",
    created_at: "2024-12-10T12:30:00Z",
    discounts: 10.00,
    subtotal: 100.00,
    gratuities: 5.00,
    taxes: 10.00,
    checkouts: [
        {
            item_name: "Apple",
            tax_amount: 2.00,
            quantity: 2,
            item_price: 10.00,
            total_price: 20.00,
            discount_amount: 1.00,
            gratuity_amount: 0.50,
            note: "Fresh fruit",
        },
        {
            item_name: "Orange",
            tax_amount: 3.00,
            quantity: 1,
            item_price: 15.00,
            total_price: 15.00,
            discount_amount: 0.50,
            gratuity_amount: 0.20,
            note: null,
        },
    ]
};

// URL QR Dummy
const dummyQrCodeURL = "https://example.com/qr-code-for-receipt";

// Panggil printReceipt untuk Testing
printReceipt(dummyData, dummyQrCodeURL);

module.exports = {
    printReceipt,
};

///////////////////////

// require('dotenv').config();
// const { Printer, Image } = require("@node-escpos/core");
// const USB = require("@node-escpos/usb-adapter");

// vendor_id = parseInt(process.env.PRINTER_USB_VENDOR_ID, 16);
// product_id = parseInt(process.env.PRNTER_USB_PRODUCT_ID, 16);

// async function printReceipt(pos_data, qrCodeURL) {
//   const device = new USB(vendor_id, product_id);

//   device.open(async function(err){
//     if(err){
//       // handle error
//       return
//     }
//     // encoding is optional
//     const options = { encoding: "GB18030" /* default */ }
//     let printer = new Printer(device, options);

//     printer
//       .font("a")
//       .align("ct")
//       .style("bu")
//       .size(1, 1)
//       .text(pos_data)
      
//     // inject qrimage to printer
//     printer = await printer.qrimage(qrCodeURL, { type: 'png', mode: 'dhdw', size: 4 })

//     printer
//       .cut()
//       .close()
//   });
// }

// // RUN WITH SUDO! OR RUN sudo chmod -R 777 /dev/bus/usb/ TO RUN WITHOUT SUDO!
// // printReceipt("tes", "hotspot.wifipos.id/login?token=63428a08-86a8-4f64-915a-d2fd2c6e076a_2022-10-20T08:09:59.496Z_14cac7715d");

// module.exports = {
//   printReceipt,
// };
