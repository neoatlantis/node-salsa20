function R(a, b){return (((a) << (b)) | ((a) >>> (32 - (b))));};
function coreFunc(ina){
    // Salsa20 Core Word Specification
    var i, ret = new Uint32Array(16);
    var x = new Uint32Array(16);
    for (i=0; i<16; i++) x[i] = ina[i];
    for (i=0; i<10; i++){
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

function _salsa20ExpansionKey4(key4, n4){
    var tau = [0x61707865, 0x3120646e, 0x79622d36, 0x6b206574];
    var input = new Uint32Array(16);

    input[0]  = tau[0];
    input[1]  = key4[0];
    input[2]  = key4[1];
    input[3]  = key4[2];
    input[4]  = key4[3];
    input[5]  = tau[1];
    input[6]  = n4[0];
    input[7]  = n4[1];
    input[8]  = n4[2];
    input[9]  = n4[3];
    input[10] = tau[2];
    input[11] = key4[0];
    input[12] = key4[1];
    input[13] = key4[2];
    input[14] = key4[3];
    input[15] = tau[3];

    return coreFunc(input);
};

var key4 = new Uint32Array(4);
var key4src = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
for(var i=0; i<16; i++) key4.buffer[i] = key4src[i];

var n4 = new Uint32Array(4);
var n4src = [101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116];
for(var i=0; i<16; i++) n4.buffer[i] = n4src[i];

console.log(_salsa20ExpansionKey4(key4, n4).join(','));

