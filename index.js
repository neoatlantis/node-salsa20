var salsa20 = require('./salsa20.js');
var buffer = require('buffer');

var keyArray = [];
var nonce = []; for (var i = 0; i < 8; i++) keyArray[i] = 0;
keyArray[8] = 0x80;
for (i = 9; i < 40; i++) keyArray[i] = 0;

var key = new buffer.Buffer(keyArray);

encryptor = salsa20(14).key(key);
decryptor = salsa20(14).key(key);

//var plaintext = new buffer.Buffer(10240000);
var plaintext = new buffer.Buffer('sakkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkdfjksafdjksafjkdsakfsa', 'ascii');

var s,e;
s = process.hrtime();
var ciphertext = encryptor.encrypt(plaintext);
e = process.hrtime();
console.log(plaintext.length / (e[0] + e[1]/1000000000 - s[0] - s[1]/1000000000));

var newPlaintext = decryptor.decrypt(ciphertext);
console.log(newPlaintext.toString());
