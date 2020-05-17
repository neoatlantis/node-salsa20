Salsa20 in pure JS for Node and Browser
=======================================

Designed by Daniel J. Bernstein, Salsa20 is a stream cipher constructed with a
hashing-alike function. This file provides a pure JavaScript implemented
Salsa20 encrypt/decryptor.

Despite its name, the package currently works both within browser and node.js
thanks `browserify`.

This library currently provides a `seek` function for setting counter values.
It's possible to start stream encryption at any given counter state.

**WARNING**: This module is written by someone who have no rich experiences in
programming with JavaScript. The algorithm is partially verified against the
specification, but other security vulnerabilities will possibly exists. The
code is NOT reviewed by any cryptographer! Use this at your own risk, you have
been warned!

_And also note, that this module is licensed under GPLv3._


Usage
-----

`node-salsa20` is initialized with a parameter on desired double-rounds,
default is 10. If denoted as Salsa20/**20**, there will be 20 rounds, or 10
double-rounds used internally. This paramter is given during initialization:

```javascript
const Salsa20 = require("node-salsa20");

const encryptor1 = new Salsa20({ doubleRounds: 10 }); // or
const encryptor2 = new Salsa20({ rounds: 20 });

// there are other reduced versions, for example:
//   new Salsa20({ rounds: 12 }), effectively the same as 
//   new Salsa20({ doubleRounds: 6 })
```

Due to a limitation by using [the Salsa20 core function published on website](https://cr.yp.to/salsa20.html),
which has 2 rounds in each loop, `node-salsa20` will not attempt to
implement/accept rounds of odd number, e.g. Salsa20/5. This can be achieved if
interests exist.

To set up an instance, first call the `key` method and then `nonce`:

```javascript
encryptor1
    .key(/* Uint8Array of length 16 or 32 bytes */)
    .nonce(/* Uint8Array of length 8 or 16 bytes */)
;
```

A standard nonce should be 8 bytes. If 16 bytes are provided, the latter 8
bytes will be used for the internal 64-bit counter. It's therefore possible to
specify a starting counter value in this way.

It **MUST** be avoided to use the same (key, nonce) combination for any
different messages!

After key and nonce is set, one may use `encryptor.encrypt` or
`encryptor.decrypt` to encrypt/decrypt data. Both methods are in fact the same,
since Salsa20 uses XOR on data and pseudorandom byte stream.

There's a method `encryptor.seek(u32_0, u32_1)` for setting/resetting the
internal counter, which can be called anytime after set-up.

You may also want to view the `example.js` for examples, and `test.salsa20.js`
for a test under NodeJS against several test vectors.



Known Issues
------------
0. Sorry for that, but version 0.0.1 has got some errors rendering it
   incompatible with later versions. This may be a big bad news for you if
   you've encrypted something with this library :(


References
----------
[1] Another implementation in Javascript at:
     https://gist.github.com/dchest/4582374

[2] Daniel. J. Bernstein, Salsa20 specification, retrived 2014/05/18 from:
     http://cr.yp.to/snuffle/spec.pdf
