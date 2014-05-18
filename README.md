A Salsa20 implementation in pure JavaScript for NodeJS
======================================================

Designed by Daniel J. Bernstein, The Salsa20 is a stream cipher constructed
with a hashing function. This file provides a pure JavaScript implemented
Salsa20 encrypt/decryptor.

Although Salsa20 is designed as a stream cipher, the streaming function is
NOT included in this implementation. The output ciphertext is the same
length as the input, but the counter will be reset to zero each time the
encryption/decryption begins.

**WARNING**: This module is wrtten by someone who have no rich experiences in
programming with JavaScript. The algorithm is partially verified against the
specification, but other security vulnurabilities possible exists. The code
is NOT reviewed by any cryptographer!  Use this at your own risk, you have
been warned!

Usage
-----
The `salsa20` is initialized with parameter of rounds(in the specification,
this is 10. You can make it larger, e.g. 14, or 20, this may enhance the
security, but will slow the speed).

All other inputs, namely, the `key`, the `plaintext` or the `ciphertext`
are NodeJS Buffers. The processes are always blocking.

The first 8 bytes of the key is taken as nonce, the rest following 16 or 32
bytes are taken as real encryption key. Depending on whether it's 16 or
32 bytes, according to the specification, there will be slightly internal
differences in processing. But you can ignore this.
     
```javascript
var salsa20 = require('/PATH/TO/THIS/MODULE.js');

// encrypt:
var encryptor = salsa20(12).key(KEY); // 12 is the round number
var CIPHERTEXT = encryptor.encrypt(PLAINTEXT);

// decrypt:
var decryptor = salsa20(12).key(KEY); // 12 is the round number
var DECRYPTED = decryptor.decrypt(CIPHERTEXT);
```

References
----------
[1] Another implementation in Javascript at:
     https://gist.github.com/dchest/4582374

[2] Daniel. J. Bernstein, Salsa20 specification, retrived 2014/05/18 from:
     http://cr.yp.to/snuffle/spec.pdf
