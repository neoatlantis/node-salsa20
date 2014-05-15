var salsa20 = require('./salsa20.js');
var buffer = require('buffer');

var key = new buffer.Buffer('The key for Salsa20 should never be less than 32 bytes.');

encryptor = salsa20().key(key);
console.log(encryptor);
