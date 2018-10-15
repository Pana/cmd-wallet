var HID = require('node-hid');
var devices = HID.devices();
var Receiver = require('./receiver');
var hidHelper = require('./hidHelper');


var pid = 2235, vid = 1155;

var device = new HID.HID(vid,pid);
let receiver = new Receiver();

receiver.on('data', function (data) {
    // console.log(data.length);
    console.log('receiver data', data);
    console.log('receiver data', data.publicKey.toString('hex'));
});


device.on("data", function(data) {
    receiver.receive(data);
});


device.on("error", function(err) {
    console.log("error");
});

// device.write(hidHelper.getAddressData(1));

device.write(hidHelper.getPublicKeyData(0));

// let hash = new Buffer('34ff17f2a579746802ba1224d98a312e15cfd31a27d126730fd101c78a847c69', 'hex');
// let hashA = [];
// hash.forEach(i => hashA.push(i));
// let hashData = hidHelper.txSign(hashA);
// device.write(hashData);

