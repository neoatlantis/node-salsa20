/*
 * Salsa20/10 Test
 *
 * This is a test against vectors I obtained from following URL:
 *   https://github.com/alexwebr/salsa20/blob/master/test_vectors.128
 *   https://github.com/alexwebr/salsa20/blob/master/test_vectors.256
 */

var salsa20 = require('./salsa20.js');

function isArrayBuffer(v){
    return toString.apply(v) === '[object ArrayBuffer]';
};

function toArrayBuffer(v){
    if(isArrayBuffer(v)) return v;
    if(0 != v.length % 2) throw new Error('invalid-hex');
    v = v.replace(/[^0-9a-f]/ig, '').toLowerCase();
    var tableHEX = "0123456789abcdef";
    var cbuf = new Uint8Array(v.length / 2);
    for(var i=0; i<cbuf.length; i++)
        cbuf[i] = tableHEX.indexOf(v[2*i]) * 16 + tableHEX.indexOf(v[2*i+1]);
    return cbuf.buffer;
};

function equalArrayBuffer(a, b){
    if(!isArrayBuffer(a) || !isArrayBuffer(b)) return false;
    if(a.byteLength != b.byteLength) return false;
    var l = a.byteLength, x = new Uint8Array(a), y = new Uint8Array(b);
    for(var i=0; i<l; i++) if(x[i] != y[i]) return false;
    return true;
};

function testExpansion(rounds, nonce, key, assertedStream){
    var nonceAry = new Uint8Array(nonce);
    var keyAry = new Uint8Array(key);
    var input = new Uint8Array(8 + keyAry.length);
    for(var i=0; i<8; i++) input[i] = nonceAry[i];
    for(var i=0; i<keyAry.length; i++) input[i+8] = keyAry[i];

    var cipher = new salsa20(rounds, true).key(input.buffer);

    var counterAry = new Uint32Array(nonce.slice(8,16));
    cipher.seek(counterAry[0], counterAry[1]);

    var streamBuf = toArrayBuffer(assertedStream);
    var ret = cipher.encrypt(toArrayBuffer(assertedStream));
    return equalArrayBuffer(ret, new Uint8Array(64).buffer);
};

function testCore(rounds, input, assertedOutput){
    var inputBuf = toArrayBuffer(input);
    var assertBuf = toArrayBuffer(assertedOutput)
    var cipher = new salsa20(rounds, true);
    var ret = cipher.core(inputBuf);
    return equalArrayBuffer(ret, assertBuf);
};

function runTest(desc, result){
    console.log(desc + '........' + (result?'SUCCESS!':'FAILED!'));
};

///////////////////////////////////////////////////////////////////////////////


runTest('Core function test vector 1', testCore(
    10,
    new Uint8Array([
        211,159, 13,115, 76, 55, 82,183, 3,117,222, 37,191,187,234,136,
        49,237,179, 48, 1,106,178,219,175,199,166, 48, 86, 16,179,207,
        31,240, 32, 63, 15, 83, 93,161,116,147, 48,113,238, 55,204, 36,
        79,201,235, 79, 3, 81,156, 47,203, 26,244,243, 88,118,104, 54
    ]).buffer,
    new Uint8Array([
        109, 42,178,168,156,240,248,238,168,196,190,203, 26,110,170,154,
        29, 29,150, 26,150, 30,235,249,190,163,251, 48, 69,144, 51, 57,
        118, 40,152,157,180, 57, 27, 94,107, 42,236, 35, 27,111,114,114,
        219,236,232,135,111,155,110, 18, 24,232, 95,158,179, 19, 48,202
    ]).buffer
));


runTest('Core function test vector 2', testCore(
    10,
    new Uint8Array([
        88,118,104, 54, 79,201,235, 79, 3, 81,156, 47,203, 26,244,243,
        191,187,234,136,211,159, 13,115, 76, 55, 82,183, 3,117,222, 37,
        86, 16,179,207, 49,237,179, 48, 1,106,178,219,175,199,166, 48,
        238, 55,204, 36, 31,240, 32, 63, 15, 83, 93,161,116,147, 48,113
    ]).buffer,
    new Uint8Array([
        179, 19, 48,202,219,236,232,135,111,155,110, 18, 24,232, 95,158,
        26,110,170,154,109, 42,178,168,156,240,248,238,168,196,190,203,
        69,144, 51, 57, 29, 29,150, 26,150, 30,235,249,190,163,251, 48,
        27,111,114,114,118, 40,152,157,180, 57, 27, 94,107, 42,236, 35
    ]).buffer
));

runTest('Expansion generation with 256-bit key', testExpansion(
    10,
    new Uint8Array([
        101, 102, 103, 104, 105, 106, 107, 108,
        109, 110, 111, 112, 113, 114, 115, 116
    ]).buffer,
    new Uint8Array([
        1, 2, 3, 4, 5, 6, 7, 8,
        9, 10, 11, 12, 13, 14, 15, 16,
        201, 202, 203, 204, 205, 206, 207, 208,
        209, 210, 211, 212, 213, 214, 215, 216,
    ]).buffer,
    new Uint8Array([
        69, 37, 68, 39, 41, 15,107,193,255,139,122, 6,170,233,217, 98,
        89,144,182,106, 21, 51,200, 65,239, 49,222, 34,215,114, 40,126,
        104,197, 7,225,197,153, 31, 2,102, 78, 76,176, 84,245,246,184,
        177,160,133,130, 6, 72,149,119,192,195,132,236,234,103,246, 74
    ]).buffer
));

runTest('Expansion generation with 128-bit key', testExpansion(
    10,
    new Uint8Array([
        101, 102, 103, 104, 105, 106, 107, 108,
        109, 110, 111, 112, 113, 114, 115, 116
    ]).buffer,
    new Uint8Array([
        1, 2, 3, 4, 5, 6, 7, 8,
        9, 10, 11, 12, 13, 14, 15, 16,
    ]).buffer,
    new Uint8Array([
        39,173, 46,248, 30,200, 82, 17, 48, 67,254,239, 37, 18, 13,247,
        241,200, 61,144, 10, 55, 50,185, 6, 47,246,253,143, 86,187,225,
        134, 85,110,246,161,163, 43,235,231, 94,171, 51,145,214,112, 29,
        14,232, 5, 16,151,140,183,141,171, 9,122,181,104,182,177,193
    ]).buffer
));
