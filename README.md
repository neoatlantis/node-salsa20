A Salsa20 implementation in pure JavaScript for NodeJS
======================================================

Designed by Daniel J. Bernstein, The Salsa20 is a stream cipher constructed
with a hashing function. This file provides a pure JavaScript implemented
Salsa20 encrypt/decryptor.

This library currently provides a `seek` function for setting counter values.
But whether the seek function is compatible when cutting into the middle of
the stream, is unknown(I've not tested this).

If you decide to use this library, remember that this cipher takes your first
8 bytes of the key as IV and the reset 32(128bit) or 64(256bit) bytes as the
real encryption key. **Stream with such same IV and keys can NOT be safely used
repeatedly!**

This is the version 0.1.1 of this library with a few changes.I've dropped the
use of the buffer in NodeJS. All inputs and outputs are ArrayBuffers. If you
have encountered any incompatible issues, please have a look at `example.js`
again.

**WARNING**: This module is written by someone who have no rich experiences in
programming with JavaScript. The algorithm is partially verified against the
specification, but other security vulnerabilities will possibly exists. The
code is NOT reviewed by any cryptographer! Use this at your own risk, you have
been warned!

_And also note, that this module is licensed under GPLv3._

Known Issues
------------
0. I'm not sure if a stream of 128 bytes generated is equal to 2 64-bytes
   streams, each of which called sequentially on the same instance. In principle
   this should be a feature, but current tests doesn't show this. More
   investigations are needed.

Usage
-----
The `salsa20` is initialized with parameter of rounds(in the specification,
this is 10. You can make it larger, e.g. 14, or 20, this may enhance the
security, but will slow the speed).

All other inputs, namely, the `key`, the `plaintext` or the `ciphertext`
are ArrayBuffers. The processes are always blocking.

The first 8 bytes of the key is taken as nonce, the rest following 16 or 32
bytes are taken as real encryption key. Depending on whether it's 16 or
32 bytes, according to the specification, there will be slightly internal
differences in processing. But you can ignore this.

```javascript
var salsa20 = require('/PATH/TO/THIS/MODULE.js');

// encrypt:
var encryptor = new salsa20(12).key(KEY); // 12 is the round number
var CIPHERTEXT = encryptor.encrypt(PLAINTEXT);

// decrypt:
var decryptor = new salsa20(12).key(KEY); // 12 is the round number
var DECRYPTED = decryptor.decrypt(CIPHERTEXT);
```

You may also want to view the `example.js` for examples, and `test.salsa20.js`
for a test under NodeJS against several test vectors.


References
----------
[1] Another implementation in Javascript at:
     https://gist.github.com/dchest/4582374

[2] Daniel. J. Bernstein, Salsa20 specification, retrived 2014/05/18 from:
     http://cr.yp.to/snuffle/spec.pdf
