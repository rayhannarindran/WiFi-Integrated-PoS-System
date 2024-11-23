require('dotenv').config();
const { Printer, Image } = require("@node-escpos/core");
const USB = require("@node-escpos/usb-adapter");

vendor_id = parseInt(process.env.PRINTER_USB_VENDOR_ID, 16);
product_id = parseInt(process.env.PRNTER_USB_PRODUCT_ID, 16);

async function printReceipt(pos_data, qrCodeURL) {
  const device = new USB(vendor_id, product_id);

  device.open(async function(err){
    if(err){
      // handle error
      return
    }

    // encoding is optional
    const options = { encoding: "GB18030" /* default */ }
    let printer = new Printer(device, options);

    printer
      .font("a")
      .align("ct")
      .style("bu")
      .size(1, 1)
      .text("May the gold fill your pocket")
      // .text("恭喜发财")
      // .barcode(112233445566, "EAN13", { width: 50, height: 50 })
      // .table(["One", "Two", "Three"])
      // .tableCustom(
      //   [
      //     { text: "Left", align: "LEFT", width: 0.33, style: "B" },
      //     { text: "Center", align: "CENTER", width: 0.33 },
      //     { text: "Right", align: "RIGHT", width: 0.33 },
      //   ],
      //   { encoding: "cp857", size: [1, 1] }, // Optional
      // )
      
    // inject qrimage to printer
    printer = await printer.qrimage(qrCodeURL)

    printer
      .cut()
      .close()
  });
}

module.exports = {
  printReceipt,
};