/*
 * A Salsa20 implementation in pure JavaScript for NodeJS
 * ======================================================
 *
 * Designed by Daniel J. Bernstein, The Salsa20 is a stream cipher constructed
 * with a hashing function. This file provides a pure JavaScript implemented
 * Salsa20 encrypt/decryptor.
 *
 * Although Salsa20 is designed as a stream cipher, the streaming function is
 * NOT included in this implementation. The output ciphertext is the same
 * length as the input, but the counter will be reset to zero each time the
 * encryption/decryption begins.
 *
 * WARNING: This module is wrtten by someone who have no rich experiences in
 * programming with JavaScript. The algorithm is partially verified against the
 * specification, but other security vulnurabilities possible exists. The code
 * is NOT reviewed by any cryptographer!  Use this at your own risk, you have
 * been warned!
 *
 * Usage
 * -----
 * The `salsa20` is initialized with parameter of rounds(in the specification,
 * this is 10. You can make it larger, e.g. 14, or 20, this may enhance the
 * security, but will slow the speed).
 *
 * The first 8 bytes of the key is taken as nonce, the rest following 16 or 32
 * bytes are taken as real encryption key. Depending on whether it's 16 or
 * 32 bytes, according to the specification, there will be slightly internal
 * differences in processing. But you can ignore this.
 *
 *      var salsa20 = require('/PATH/TO/THIS/MODULE.js');
 *
 *      // encrypt:
 *      var encryptor = salsa20(12).key(KEY); // 12 is the round number
 *      var CIPHERTEXT = encryptor.encrypt(PLAINTEXT);
 *
 *      // decrypt:
 *      var decryptor = salsa20(12).key(KEY); // 12 is the round number
 *      var DECRYPTED = decryptor.decrypt(CIPHERTEXT);
 *
 * References
 * ----------
 * [1] Another implementation in Javascript at:
 *      https://gist.github.com/dchest/4582374
 * [2] Daniel. J. Bernstein, Salsa20 specification, retrived 2014/05/18 from:
 *      http://cr.yp.to/snuffle/spec.pdf
 */
(function(){
//////////////////////////////////////////////////////////////////////////////

function _Salsa20(rounds){
    var self = this;
    if(!rounds || rounds < 10) rounds = 10;

    var coreFuncX = new Uint32Array(16);
    function coreFunc(ina, ret){
        function R(a, b){return (((a) << (b)) | ((a) >>> (32 - (b))));};
        // Salsa20 Core Word Specification
        var i; //ret = new Uint32Array(16);
        var x = coreFuncX;
        for (i=0; i<16; i++) x[i] = ina[i];
        for (i=0; i<rounds; i++){
            x[ 4] ^= R(x[ 0]+x[12], 7);  x[ 8] ^= R(x[ 4]+x[ 0], 9);
            x[12] ^= R(x[ 8]+x[ 4],13);  x[ 0] ^= R(x[12]+x[ 8],18);
            x[ 9] ^= R(x[ 5]+x[ 1], 7);  x[13] ^= R(x[ 9]+x[ 5], 9);
            x[ 1] ^= R(x[13]+x[ 9],13);  x[ 5] ^= R(x[ 1]+x[13],18);
            x[14] ^= R(x[10]+x[ 6], 7);  x[ 2] ^= R(x[14]+x[10], 9);
            x[ 6] ^= R(x[ 2]+x[14],13);  x[10] ^= R(x[ 6]+x[ 2],18);
            x[ 3] ^= R(x[15]+x[11], 7);  x[ 7] ^= R(x[ 3]+x[15], 9);
            x[11] ^= R(x[ 7]+x[ 3],13);  x[15] ^= R(x[11]+x[ 7],18);
            x[ 1] ^= R(x[ 0]+x[ 3], 7);  x[ 2] ^= R(x[ 1]+x[ 0], 9);
            x[ 3] ^= R(x[ 2]+x[ 1],13);  x[ 0] ^= R(x[ 3]+x[ 2],18);
            x[ 6] ^= R(x[ 5]+x[ 4], 7);  x[ 7] ^= R(x[ 6]+x[ 5], 9);
            x[ 4] ^= R(x[ 7]+x[ 6],13);  x[ 5] ^= R(x[ 4]+x[ 7],18);
            x[11] ^= R(x[10]+x[ 9], 7);  x[ 8] ^= R(x[11]+x[10], 9);
            x[ 9] ^= R(x[ 8]+x[11],13);  x[10] ^= R(x[ 9]+x[ 8],18);
            x[12] ^= R(x[15]+x[14], 7);  x[13] ^= R(x[12]+x[15], 9);
            x[14] ^= R(x[13]+x[12],13);  x[15] ^= R(x[14]+x[13],18);
        };

        for(i=0; i<16; i++) ret[i] = x[i] + ina[i];
    };

    /* key expansion */

    var _keyExpanBuffer = new Uint32Array(16);

    /* key expansion for 8 words(32 bytes) key */
    function _salsa20BufferFillKey8(nonce2, key8){
        var input = _keyExpanBuffer,
            sigma = new Uint32Array(
                [0x61707865, 0x3320646e, 0x79622d32, 0x6b206574]
            );

        input[0]  = sigma[0];
        input[1]  = key8[0];
        input[2]  = key8[1];
        input[3]  = key8[2];
        input[4]  = key8[3];
        input[5]  = sigma[1];

        input[6]  = nonce2[0];
        input[7]  = nonce2[1];

        input[10] = sigma[2];
        input[11] = key8[4];
        input[12] = key8[5];
        input[13] = key8[6];
        input[14] = key8[7];
        input[15] = sigma[3];
    };

    function _salsa20ExpansionKey8(counter2, ret){
        var input = _keyExpanBuffer;

        input[8]  = counter2[0];
        input[9]  = counter2[1];

        return coreFunc(input, ret);
    };

    /* key expansion for 4 words key(16 bytes) */
    function _salsa20BufferFillKey8(nonce2, key4){
        var input = _keyExpanBuffer;
            tau = new Uint32Array(
                [0x61707865, 0x3120646e, 0x79622d36, 0x6b206574]
            );

        input[0]  = tau[0];
        input[1]  = key4[0];
        input[2]  = key4[1];
        input[3]  = key4[2];
        input[4]  = key4[3];
        input[5]  = tau[1];

        input[6]  = nonce2[0];
        input[7]  = nonce2[1];

        input[10] = tau[2];
        input[11] = key4[0];
        input[12] = key4[1];
        input[13] = key4[2];
        input[14] = key4[3];
        input[15] = tau[3];
    };

    function _salsa20ExpansionKey4(counter2, ret){
        var input = _keyExpanBuffer;

        input[8]  = counter2[0];
        input[9]  = counter2[1];

        return coreFunc(input, ret);
    };

    //////////////////////////////////////////////////////////////////////
    var counter = new Uint32Array(2);
    var blockGenerator;

    function _counterReset(){counter[0] = 0; counter[1] = 0;};
    function _counterInc(){
        counter[0] += 1;
        if(0 == counter[0]) counter[1] += 1;
    };

    function _initialize(nonceBuf, keyBuf){
        var nonce = new Uint32Array(nonceBuf);
        if(32 == keyBuf.byteLength){
            var key = new Uint32Array(keyBuf);
            _salsa20BufferFillKey8(nonce, key);
            blockGenerator = (function(){
                return function(ret){
                    _salsa20ExpansionKey8(counter, ret);
                    _counterInc();
                };
            })();
        } else if(16 == keyBuf.byteLength){
            var key = new Uint32Array(keyBuf);
            _salsa20BufferFillKey4(nonce, key);
            blockGenerator = (function(){
                return function(ret){
                    _salsa20ExpansionKey4(counter, ret);
                    _counterInc();
                };
            })();
        } else
            throw new Error('invalid-key-length');
    };

    //////////////////////////////////////////////////////////////////////

    function isArrayBuffer(v){
        return toString.apply(v) === '[object ArrayBuffer]';
    };

    function _xorBuf(dataBuf){
        if(!isArrayBuffer(dataBuf)) throw new Error('invalid-input');

        var origLength = dataBuf.byteLength,
            blocksCount = Math.ceil(origLength / 64),
            block = new Uint32Array(16);    // holder of new generated block
        var stream = new Uint8Array(dataBuf),
            xorStream = new Uint8Array(stream.length + 64);
        var b=0, i, j;

        _counterReset();
        for(i=0; i<blocksCount; i++){
            blockGenerator(block);
            for(j=0; j<16; j++){
                xorStream[b++] = (block[j] >> 24) & 0xff;
                xorStream[b++] = (block[j] >> 16) & 0xff;
                xorStream[b++] = (block[j] >> 8) & 0xff;
                xorStream[b++] = block[j] & 0xff;
            };
        };

        for(i=0; i<origLength; i++) stream[i] ^= xorStream[i];
        return stream.buffer;
    };

    this.key = function(bufKey){
        if(!isArrayBuffer(bufKey)) throw new Error('invalid-key');
        var keylen = bufKey.byteLength;

        // buffer typed bufKey, first 24 or 40 bytes will be used. among them,
        // the first 8 bytes will be taken as nonce. the rest will be the key.
        if(keylen < 24) throw new Error('invalid-key');

        var nonceBuf = bufKey.slice(0, 8);
        if(keylen < 40)
            _initialize(nonceBuf, bufKey.slice(8, 24));
        else
            _initialize(nonceBuf, bufKey.slice(8, 40));

        self.encrypt = _xorBuf;
        self.decrypt = _xorBuf;
        delete self.key;
        return self;
    };


    return this;
};




/* Now Export the Module */

var exporter = _Salsa20;

/* Export */
if('undefined' != typeof define){
    define([], function(){return exporter;});
} else if('undefined' != typeof module){
    module.exports = exporter;
};

//////////////////////////////////////////////////////////////////////////////
})();
