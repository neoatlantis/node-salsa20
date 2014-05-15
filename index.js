var salsa20 = require('./salsa20.js');
var buffer = require('buffer');

var key = new buffer.Buffer(
    '00000000000000000000000000000000000000000000000000000000000000000000000000000000',
    'hex'
);

encryptor = salsa20().key(key);
console.log(encryptor);
