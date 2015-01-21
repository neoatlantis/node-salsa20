/*
 * Salsa20/10 Test
 *
 * This is a test against vectors I obtained from following URL:
 *   https://github.com/alexwebr/salsa20/blob/master/test_vectors.128
 *   https://github.com/alexwebr/salsa20/blob/master/test_vectors.256
 */

var salsa20 = require('./salsa20.js');

function toHEX(ab){
    var ary = Uint8Array(ab);
    var ret = '';
    for(var i=0; i<ary.length; i++){
        if(ary[i] < 16)
            ret += '0' + (ary[i]).toString(16);
        else
            ret += (ary[i]).toString(16);
    }
    return ret;
}

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
    nonce = toArrayBuffer(nonce);
    key = toArrayBuffer(key);
    assertedStream = toArrayBuffer(assertedStream);

    var nonceAry = new Uint8Array(nonce);
    var keyAry = new Uint8Array(key);
    var input = new Uint8Array(8 + keyAry.length);
    for(var i=0; i<8; i++) input[i] = nonceAry[i];
    for(var i=0; i<keyAry.length; i++) input[i+8] = keyAry[i];

    var cipher = new salsa20(rounds, true).key(input.buffer);

    if(nonce.byteLength > 8){
        var counterAry = new Uint32Array(nonce.slice(8,16));
        cipher.seek(counterAry[0], counterAry[1]);
    };

    var streamBuf = toArrayBuffer(assertedStream);
    var ret = cipher.encrypt(toArrayBuffer(assertedStream));
    return equalArrayBuffer(ret, new Uint8Array(ret.byteLength).buffer);
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


runTest('More vectors from <https://github.com/alexwebr/salsa20/blob/master/test_vectors.256>, Set 1 Vector #0', testExpansion(
    10,
    '0000000000000000',
    '80000000000000000000000000000000' +
    '00000000000000000000000000000000',
    'E3BE8FDD8BECA2E3EA8EF9475B29A6E7003951E1097A5C38D23B7A5FAD9F6844' +
    'B22C97559E2723C7CBBD3FE4FC8D9A0744652A83E72A9C461876AF4D7EF1A117'
));

runTest('More vectors from <https://github.com/alexwebr/salsa20/blob/master/test_vectors.256>, Set 2 Vector #252', testExpansion(
    10,
    '0000000000000000',
    'FCFCFCFCFCFCFCFCFCFCFCFCFCFCFCFC' +
    'FCFCFCFCFCFCFCFCFCFCFCFCFCFCFCFC',
    '356DD71DBC2B216B7A439E07BCC1348F769F7EF482486C92E8FD8EB050224838' +
    'AB1F4DFCD2FB196AFD4C4FFBF51B91246BF45AE8131B8D5CAFA29FC3025A3597'
));

runTest('More vectors from <https://github.com/alexwebr/salsa20/blob/master/test_vectors.256>, Set 6 Vector #0', testExpansion(
    10,
    '0D74DB42A91077DE',
    '0053A6F94C9FF24598EB3E91E4378ADD' +
    '3083D6297CCF2275C81B6EC11467BA0D',
    'F5FAD53F79F9DF58C4AEA0D0ED9A9601F278112CA7180D565B420A48019670EA' +
    'F24CE493A86263F677B46ACE1924773D2BB25571E1AA8593758FC382B1280B71'
));

runTest('More vectors from <https://github.com/alexwebr/salsa20/blob/master/test_vectors.256>, Set 6 Vector #2', testExpansion(
    10,
    '1F86ED54BB2289F0',
    '0A5DB00356A9FC4FA2F5489BEE4194E7' +
    '3A8DE03386D92C7FD22578CB1E71C417',
    '3FE85D5BB1960A82480B5E6F4E965A4460D7A54501664F7D60B54B06100A37FF' +
    'DCF6BDE5CE3F4886BA77DD5B44E95644E40A8AC65801155DB90F02522B644023'
));


runTest('More vectors from <https://github.com/alexwebr/salsa20/blob/master/test_vectors.128>, Set 1 Vector #0', testExpansion(
    10,
    '0000000000000000',
    '80000000000000000000000000000000',
    '4DFA5E481DA23EA09A31022050859936DA52FCEE218005164F267CB65F5CFD7F' +
    '2B4F97E0FF16924A52DF269515110A07F9E460BC65EF95DA58F740B7D1DBB0AA'
));

runTest('More vectors from <https://github.com/alexwebr/salsa20/blob/master/test_vectors.128>, Set 1 Vector #18', testExpansion(
    10,
    '0000000000000000',
    '00002000000000000000000000000000',
    'BACFE4145E6D4182EA4A0F59D4076C7E83FFD17E7540E5B7DE70EEDDF9552006' +
    'B291B214A43E127EED1DA1540F33716D83C3AD7D711CD03251B78B2568F2C844'
));

runTest('More vectors from <https://github.com/alexwebr/salsa20/blob/master/test_vectors.128>, Set 2 Vector #18', testExpansion(
    10,
    '0000000000000000',
    '12121212121212121212121212121212',
    '05835754A1333770BBA8262F8A84D0FD70ABF58CDB83A54172B0C07B6CCA5641' +
    '060E3097D2B19F82E918CB697D0F347DC7DAE05C14355D09B61B47298FE89AEB'
));

runTest('More vectors from <https://github.com/alexwebr/salsa20/blob/master/test_vectors.128>, Set 6 Vector #2', testExpansion(
    10,
    '1F86ED54BB2289F0',
    '0A5DB00356A9FC4FA2F5489BEE4194E7',
    '8B354C8F8384D5591EA0FF23E7960472B494D04B2F787FC87B6569CB9021562F' +
    'F5B1287A4D89FB316B69971E9B861A109CF9204572E3DE7EAB4991F4C7975427'
));


runTest('Streams over more blocks, Set 1 Vector #0', testExpansion(
    10,
    '0000000000000000',
    '80000000000000000000000000000000' +
    '00000000000000000000000000000000',
    'E3BE8FDD8BECA2E3EA8EF9475B29A6E7003951E1097A5C38D23B7A5FAD9F6844' + // 000-031
    'B22C97559E2723C7CBBD3FE4FC8D9A0744652A83E72A9C461876AF4D7EF1A117' + // 032-063
    '8da2b74eef1b6283e7e20166abcae538e9716e4669e2816b6b20c5c356802001' + // 064-095
    'cc1403a9a117d12a2669f456366d6ebb0f1246f1265150f793cdb4b253e348ae' + // 096-127
    '203d89bc025e802a7e0e00621d70aa36b7e07cb1e7d5b38d5e222b8b0e4b8407' + // 128-159
    '0142b1e29504767d76824850320b5368129fdd74e861b498e3be8d16f2d7d169' + // 160-191
    '57BE81F47B17D9AE7C4FF15429A73E10ACF250ED3A90A93C711308A74C6216A9' + // 192-223
    'ED84CD126DA7F28E8ABF8BB63517E1CA98E712F4FB2E1A6AED9FDC73291FAA17' + // 224-255
    '958211C4BA2EBD5838C635EDB81F513A91A294E194F1C039AEEC657DCE40AA7E' + // 256-287
    '7C0AF57CACEFA40C9F14B71A4B3456A63E162EC7D8D10B8FFB1810D71001B618'   // 288-319
));
