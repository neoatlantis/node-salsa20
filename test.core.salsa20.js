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

/*var test1 = new Uint32Array(16);
for(var i=0; i<16; i++) test1.set(i, 0x00000000);
console.log(coreFunc(test1).join(','));*/

var test2 = new Uint32Array(16);
var src = [211,159, 13,115, 76, 55, 82,183, 3,117,222, 37,191,187,234,136,
49,237,179, 48, 1,106,178,219,175,199,166, 48, 86, 16,179,207, 31,240, 32, 63,
15, 83, 93,161,116,147, 48,113,238, 55,204, 36, 79,201,235, 79, 3, 81,156,
47,203, 26,244,243, 88,118,104, 54];
for(var i=0; i<64; i++) test2.buffer[i] = src[i];
console.log(coreFunc(test2).join(','));

var test3= new Uint32Array(16);
var src = [88,118,104, 54, 79,201,235, 79, 3, 81,156, 47,203, 26,244,243,
191,187,234,136,211,159, 13,115, 76, 55, 82,183, 3,117,222, 37, 86, 16,179,207,
49,237,179, 48, 1,106,178,219,175,199,166, 48, 238, 55,204, 36, 31,240, 32, 63,
15, 83, 93,161,116,147, 48,113];
for(var i=0; i<64; i++) test3.buffer[i] = src[i];
console.log(coreFunc(test3).join(','));
