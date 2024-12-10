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
    receipt += `--------------------------------\n`;

    // Format bagian non-bold (kuantitas dan total harga)
    const itemsDetails = checkouts.map((item) => {
        const quantityAndPrice = `   ${item.quantity}x${item.item_price.toFixed(0)}= ${item.total_price.toFixed(0)}`;
        return quantityAndPrice;
    });

    return { receipt, itemsDetails };
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

        // Nama kafe dicetak dengan bold dan rata tengah
        const cafeName = "Cafe Protelolet";
        printer
            .align("ct") // Rata tengah
            .style("bold") // Bold
            .size(1, 1) // Ukuran normal
            .text(cafeName);

        // Format receipt
        const { receipt, itemsDetails } = formatReceipt(pos_data);

        // Cetak header struk (non-bold)
        printer
            .style("normal")
            .align("lt") // Rata kiri
            .text(receipt);

        // Cetak nama barang (bold) dan detail harga (non-bold)
        pos_data.checkouts.forEach((item, index) => {
            // Nama barang (bold)
            printer.style("bold").text(item.item_name);

            // Kuantitas dan total harga (non-bold)
            const quantityAndPrice = `   ${item.quantity}x${item.item_price.toFixed(0)}= ${item.total_price.toFixed(0)}`;
            printer.style("normal").text(quantityAndPrice);
        });

        // Footer
        printer.text(`--------------------------------`);
        printer.text(`Subtotal:`.padEnd(20) + `${pos_data.subtotal.toFixed(0).padStart(12)}`);
        printer.text(`Discounts:`.padEnd(20) + `-${pos_data.discounts.toFixed(0).padStart(11)}`);
        printer.text(`Taxes:`.padEnd(20) + `${pos_data.taxes.toFixed(0).padStart(12)}`);
        printer.text(`Gratuities:`.padEnd(20) + `${pos_data.gratuities.toFixed(0).padStart(12)}`);
        printer.text(`--------------------------------`);
        printer.text(`Total:`.padEnd(20) + `${(pos_data.subtotal + pos_data.taxes + pos_data.gratuities - pos_data.discounts).toFixed(0).padStart(12)}`);

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
    discounts: 3000,
    subtotal: 95000,
    gratuities: 5000,
    taxes: 9500,
    checkouts: [
        {
            item_name: "pancong",
            tax_amount: 1500,
            quantity: 1,
            item_price: 15000,
            total_price: 13500,
            discount_amount: 1000,
            gratuity_amount: 0.00,
            note: null,
        },
        {
            item_name: "suprek",
            tax_amount: 3000,
            quantity: 1,
            item_price: 30000,
            total_price: 27000,
            discount_amount: 2000,
            gratuity_amount: 0.00,
            note: null,
        },
        {
            item_name: "warkam",
            tax_amount: 5000,
            quantity: 2,
            item_price: 50000,
            total_price: 45000,
            discount_amount: 0.00,
            gratuity_amount: 0.00,
            note: null,
        },
    ]
};

// URL QR Dummy
const dummyQrCodeURL = "http://hotspot.wifipos.id/login?token=63428a08-86a8-4f64-915a-d2fd2c6e076a_2022-10-20T08:09:59.496Z_14cac7715d";

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
