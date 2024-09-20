const fs = require('fs');
var qrcode = require('qrcode'); //qrcode creator

function generateToken(data, callback) {
  // parse file to json
  const pos_data = JSON.parse(data);

  // use payment no to generate token
  const token = pos_data.id;

  // generate qr code
  qrcode.toDataURL(token, function (err, url) {
      if (err) {
          console.log("Error: ", err);
          callback(err, null);
      }
      callback(null, url);
    })

}

// get data 
const data_example = fs.readFileSync('./data_example/pos_data.json');

// generates token
generateToken(data_example, (err, url) => {
  if (err) {
    console.log("Error: ", err);
  }
  console.log("URL: ", url);
});