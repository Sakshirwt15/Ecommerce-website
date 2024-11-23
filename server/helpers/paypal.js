const paypal = require("paypal-rest-sdk");

paypal.configure({
  'mode': 'sandbox', // or 'live' depending on your setup
  'client_id': 'YOUR_CLIENT_ID',
  'client_secret': 'YOUR_CLIENT_SECRET'
});


module.exports = paypal;
