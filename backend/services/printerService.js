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
      .text(pos_data)
      
    // inject qrimage to printer
    printer = await printer.qrimage(qrCodeURL, { type: 'png', mode: 'dhdw', size: 4 })

    printer
      .cut()
      .close()
  });
}

// RUN WITH SUDO! OR RUN sudo chmod -R 777 /dev/bus/usb/ TO RUN WITHOUT SUDO!
// printReceipt("tes", "hotspot.wifipos.id/login?token=63428a08-86a8-4f64-915a-d2fd2c6e076a_2022-10-20T08:09:59.496Z_14cac7715d");

module.exports = {
  printReceipt,
};
