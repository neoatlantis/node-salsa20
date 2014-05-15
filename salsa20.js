module.exports = function(){
    return new _Salsa20();
};

function _Salsa20(rounds){    
    var self = this;
    var __buffer = require('buffer');
    if(!rounds || rounds < 12) rounds = 12;

    var sigma = [0x61707865, 0x3320646e, 0x79622d32, 0x6b206574];

    function R(a, b){return (((a) << (b)) | ((a) >>> (32 - (b))));};
    function coreFunc(ina){
        // Salsa20 Core Word Specification
        var i, ret = new Uint32Array(16);
        var x = new Uint32Array(16);
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

        for(i=0; i<16; i++){
            ret.set(i, x[i] + ina[i]);
        };

        var retArray = new Array(64);
        for(i=0; i<64; i++) retArray[i] = ret.buffer[i];

        return retArray;
    };

    //////////////////////////////////////////////////////////////////////

    var key = new Uint32Array(8),
        nonce = new Uint32Array(2),
        counter = new Uint32Array(2);

    function _salsa20Block(){
        var input = new Uint32Array(16);

        input[0] = sigma[0];
        input[1] = key[0];
        input[2] = key[1];
        input[3] = key[2];
        input[4] = key[3];
        input[5] = sigma[1];
        input[6] = nonce[0];
        input[7] = nonce[1];
        input[8] = counter[0];
        input[9] = counter[1];
        input[10] = sigma[2];
        input[11] = key[4];
        input[12] = key[5];
        input[13] = key[6];
        input[14] = key[7];
        input[15] = sigma[3];

        return coreFunc(input);
    };

    function _counterReset(){counter[0] = 0; counter[1] = 0;};
    function _counterInc(){
        counter[0] += 1;
        if(0 == counter[0]) counter[1] += 1;
    };

    //////////////////////////////////////////////////////////////////////

    this.key = function(bufKey){
        // buffer typed bufKey, first 40 bytes will be used. among them, the
        // first 8 bytes will be taken as nonce. the rest will be the key.
        if(bufKey.length < 40) throw new Error('invalid-key');
        for(var i=0; i<2; i++)
            nonce[i] = bufKey.readUInt32LE(i);
        for(var i=2; i<10; i++)
            key[i] = bufKey.readUInt32LE(i);
        self.encrypt = _xorBuf;
        self.decrypt = _xorBuf;
        delete self.key;
        return self;
    };

    function _getStream(blockCount){
        _counterReset();
        var blocks = [], block, blockBuf, i, j;
        for(i=0; i<blockCount; i++){
            blocks = blocks.concat(_salsa20Block());
            _counterInc();
        };
        return blocks;
    };

    function _xorBuf(dataBuf){
        var stream = _getStream(Math.ceil(dataBuf.length / 64));
        stream = stream.slice(0, dataBuf.length);
        for(var i=0; i<stream.length; i++){
            stream[i] ^= dataBuf[i];
        };
        return new __buffer.Buffer(stream);
    };

    return this;
};
