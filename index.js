var salsa20 = require('./salsa20.js');
var buffer = require('buffer');

var keyArray = [];
var nonce = []; for (var i = 0; i < 8; i++) keyArray[i] = 0;
keyArray[8] = 0x80;
for (i = 9; i < 40; i++) keyArray[i] = 0;

var key = new buffer.Buffer(keyArray);

encryptor = salsa20().key(key);
console.log(encryptor);
