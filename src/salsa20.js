/*
 * A Salsa20 implementation in pure JavaScript for NodeJS
 * ======================================================
 * Please view README.md in the same directory or at
 *   <https://github.com/neoatlantis/node-salsa20/blob/master/salsa20.js>
 * for more information.
 */
(function(){
//////////////////////////////////////////////////////////////////////////////

const inputarray = require("./inputarray");


function determineDoubleRounds(options){
    var doubleRounds = 10;
    if(Number.isInteger(options)){
        console.warn(
            "node-salsa20.js: Deprecated specification of double-rounds. " +
            "For example, please use now `new Salsa20({ rounds: 20 })` or " +
            "`new Salsa20({ doubleRounds: 10 })` for Salsa20/20."
        );
        doubleRounds = options; // backwards compability
    } else {
        if(options.doubleRounds !== undefined && options.rounds !== undefined){
            throw Error("Either specify option.doubleRounds or option.rounds, not both.");
        }
        if(options.doubleRounds) doubleRounds = options.doubleRounds;
        if(options.rounds) doubleRounds = options.rounds / 2;
    }
    if(!Number.isInteger(doubleRounds) || doubleRounds <= 0){
        throw Error("Invalid value of rounds specified.");
    }
    return doubleRounds;
}




function _Salsa20(options){
    var self = this;

    if(undefined === options) options = {};

    // Determine Salsa20 rounds.

    const doubleRounds = determineDoubleRounds(options);
    
    const CoreFunc = require("./core"); 
    const coreFunc = new CoreFunc(doubleRounds);
    
    /* key expansion */

    const keyExpandBuffer_u32 = new Uint32Array(16);

    /* key expansion for 8 words(32 bytes) key */
    function _salsa20BufferFillKey8(nonce2, key8){
        var input = keyExpandBuffer_u32,
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

    function _salsa20ExpansionKey8(ret){
        var input = keyExpandBuffer_u32;

        input[8]  = counter[0];
        input[9]  = counter[1];

        return coreFunc(input, ret);
    };

    /* key expansion for 4 words key(16 bytes) */
    function _salsa20BufferFillKey4(nonce2, key4){
        var input = keyExpandBuffer_u32;
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

    function _salsa20ExpansionKey4(ret){
        var input = keyExpandBuffer_u32;

        input[8]  = counter[0];
        input[9]  = counter[1];

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
            blockGenerator = function(ret){
                _salsa20ExpansionKey8(ret);
                _counterInc();
            };
        } else if(16 == keyBuf.byteLength){
            var key = new Uint32Array(keyBuf);
            _salsa20BufferFillKey4(nonce, key);
            blockGenerator = function(ret){
                _salsa20ExpansionKey4(ret);
                _counterInc();
            };
        } else
            throw new Error('invalid-key-length');
    };

    //////////////////////////////////////////////////////////////////////


    function _xorBuf(dataBuf){
        dataBuf = inputarray(dataBuf);

        var origLength = dataBuf.byteLength,
            blocksCount = Math.floor(origLength / 64) + 1,
            block = new Uint32Array(16);    // holder of new generated block
        var stream = new Uint8Array(dataBuf),
            xorStream = new Uint8Array(stream.length + 64);
        var b=0, i, j;

        for(i=0; i<blocksCount; i++){
            blockGenerator(block);
            for(j=0; j<16; j++){
                xorStream[b++] = (block[j] >> 0) & 0xff;
                xorStream[b++] = (block[j] >> 8) & 0xff;
                xorStream[b++] = (block[j] >> 16) & 0xff;
                xorStream[b++] = (block[j] >> 24) & 0xff;
            };
        };

        for(i=0; i<origLength; i++) stream[i] ^= xorStream[i];
        return stream.buffer;
    };

    function _seek(u32_0, u32_1){
        counter[0] = u32_0;
        counter[1] = u32_1;
    };

    /*
        this.key: set up the key and initialize the inner buffer

        A single buffer is used as argument. It can be either 16 bytes or 32
        bytes for a single key, or (backwards compatible) 24 / 40 bytes where
        the first 8 bytes will be used as a nonce. The latter way is
        deprecated, though. Doing so will result in a warning.
    */

    function _finalizeAndBindMethods(){
        self.encrypt = _xorBuf;
        self.decrypt = _xorBuf;
        self.seek = _seek;
        delete self.key;
        delete self.nonce;
    }

    this.key = function(bufKey){
        bufKey = inputarray(bufKey);

        var nonceBuf = null;

        if(bufKey.byteLength == 24 || bufKey.byteLength == 40){
            console.warn("node-salsa20.js: Deprecated usage in specifying nonce during key() call. Please use `salsa20().key().nonce()`.");
            nonceBuf = bufKey.slice(0, 8);
            bufKey = bufKey.slice(8);
        }
        
        if (!(bufKey.byteLength == 16 || bufKey.byteLength == 32)){
            throw Error("node-salsa20.js: Invalid key length. Should be 16 or 32 bytes. Got " + bufKey.byteLength + " bytes.");
        }

        function setNonce(nonce){
            nonce = inputarray(nonce);
            if(nonce.byteLength != 8 && nonce.byteLength != 16){
                throw Error("node-salsa20.js: Invalid nonce length. Must be 8 or 16 bytes. Got " + nonce.byteLength + " bytes.");
            }
            _initialize(nonce.slice(0, 8), bufKey);
            if(nonce.byteLength == 16){
                const counterVal = new Uint32Array(nonce.slice(8,16));
                _seek(counterVal[0], counterVal[1]);
            }
            _finalizeAndBindMethods();
            return self;
        }

        if(nonceBuf !== null){
            setNonce(nonceBuf);
        } else {
            self.nonce = setNonce;
        }

        delete self.key;
        return self;
    };


    if(true === options.testing){
        console.debug("node-salsa20.js: Testing mode. Core function exposed.");
        self.core = function(inaBuf){
            var ret = new Uint32Array(16);
            coreFunc(new Uint32Array(inaBuf), ret);
            return ret.buffer;
        };
    };


    return this;
};




module.exports = _Salsa20;

//////////////////////////////////////////////////////////////////////////////
})();
